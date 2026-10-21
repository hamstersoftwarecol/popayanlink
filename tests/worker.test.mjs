import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {createHmac,generateKeyPairSync,sign} from 'node:crypto';
import worker from '../dist/server/index.js';
function database(){const db=new DatabaseSync(':memory:');db.exec('PRAGMA foreign_keys=ON');for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')))db.exec(readFileSync('drizzle/'+f,'utf8'));function prepared(sql,args=[]){return {bind(...values){return prepared(sql,values)},async all(){return {results:db.prepare(sql).all(...args)}},async first(){return db.prepare(sql).get(...args)||null},_run(){const r=db.prepare(sql).run(...args);return {meta:{changes:r.changes}}},async run(){return this._run()}}}return {prepare:sql=>prepared(sql),async batch(stmts){db.exec('BEGIN');try{const result=[];for(const s of stmts)result.push(s._run());db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;}}};}
function booking(overrides={}){const d=new Date(Date.now()+7*86400000);d.setUTCHours(14,0,0,0);return {kind:'rental',vehicleId:'v1',name:'Cliente de prueba',email:'cliente@example.com',phone:'+573001112233',startAt:d.toISOString(),endAt:new Date(+d+2*86400000).toISOString(),driver:false,delivery:'office',paymentMethod:'store',idempotencyKey:crypto.randomUUID(),...overrides};}
async function request(env,path,{method='GET',data,cookie,headers={}}={}){return worker.fetch(new Request('http://localhost'+path,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...headers},...(data?{body:JSON.stringify(data)}:{})}),env);}
async function guest(env){const r=await request(env,'/api/session');return r.headers.get('set-cookie').split(';')[0];}
test('Astro app and public catalog are served; administration is closed by default',async()=>{const env={DB:database()};assert.equal((await request(env,'/')).status,200);const c=await(await request(env,'/api/catalog')).json();assert.equal(c.vehicles.length,6);assert.equal(c.sample,true);assert.equal((await request(env,'/api/admin/overview')).status,403);assert.equal((await request(env,'/api/bookings')).status,401);assert.equal((await request(env,'/api/bookings',{method:'POST',data:booking()})).status,401);});
test('guest booking persists with server quote, idempotency, availability and isolation',async()=>{const env={DB:database()},cookie=await guest(env),input=booking({amount:1,driver:true,delivery:'delivery'});const r=await request(env,'/api/bookings',{method:'POST',cookie,data:input});assert.equal(r.status,201);const b=await r.json();assert.equal(b.amount,940000);assert.equal(b.deposit,500000);assert.equal(b.payment_status,'pending');const retry=await(await request(env,'/api/bookings',{method:'POST',cookie,data:input})).json();assert.equal(retry.id,b.id);const mine=await(await request(env,'/api/bookings',{cookie})).json();assert.equal(mine.length,1);const other=await guest(env);assert.equal((await(await request(env,'/api/bookings',{cookie:other})).json()).length,0);assert.equal((await request(env,'/api/bookings/'+b.id,{method:'PATCH',cookie:other,data:{status:'cancelled'}})).status,404);const c=await(await request(env,'/api/catalog?start='+encodeURIComponent(input.startAt)+'&end='+encodeURIComponent(input.endAt))).json();assert.equal(c.vehicles.length,4);assert.ok(!c.vehicles.some(v=>v.id==='v1'));});
test('database prevents racing overlapping reservations; cancellation releases vehicle',async()=>{const env={DB:database()},cookie=await guest(env),input=booking();const results=await Promise.all([request(env,'/api/bookings',{method:'POST',cookie,data:input}),request(env,'/api/bookings',{method:'POST',cookie,data:{...input,idempotencyKey:crypto.randomUUID()}})]);assert.deepEqual(results.map(r=>r.status).sort(),[201,409]);const created=await results.find(r=>r.status===201).json();assert.equal((await request(env,'/api/bookings/'+created.id,{method:'PATCH',cookie,data:{status:'confirmed'}})).status,403);assert.equal((await request(env,'/api/bookings/'+created.id,{method:'PATCH',cookie,data:{status:'cancelled'}})).status,200);assert.equal((await request(env,'/api/bookings',{method:'POST',cookie,data:{...input,idempotencyKey:crypto.randomUUID()}})).status,201);});
test('repair slots are exclusive and reject out-of-hours appointments',async()=>{const env={DB:database()},cookie=await guest(env);const d=new Date(Date.now()+86400000*7);while(d.getUTCDay()===0)d.setUTCDate(d.getUTCDate()+1);d.setUTCHours(14,0,0,0);const input=booking({kind:'repair',vehicleId:undefined,serviceId:'s1',vehicleDetails:'Mazda CX5 ABC123',startAt:d.toISOString(),endAt:undefined});assert.equal((await request(env,'/api/bookings',{method:'POST',cookie,data:input})).status,201);assert.equal((await request(env,'/api/bookings',{method:'POST',cookie,data:{...input,idempotencyKey:crypto.randomUUID()}})).status,409);d.setUTCHours(3);assert.equal((await request(env,'/api/bookings',{method:'POST',cookie,data:{...input,startAt:d.toISOString(),idempotencyKey:crypto.randomUUID()}})).status,400);});
test('cross-origin mutation and invalid input are rejected; service switches enforced',async()=>{const env={DB:database(),LOCAL_ADMIN:'true'},cookie=await guest(env);assert.equal((await request(env,'/api/bookings',{method:'POST',cookie,data:booking(),headers:{Origin:'https://evil.example'}})).status,403);assert.equal((await request(env,'/api/quote',{method:'POST',data:booking({email:'bad'})})).status,400);assert.equal((await request(env,'/api/admin/settings',{method:'PUT',data:{rental:false}})).status,200);assert.equal((await request(env,'/api/bookings',{method:'POST',cookie,data:booking()})).status,409);assert.equal((await request(env,'/api/leads',{method:'POST',data:{name:'Cliente',email:'cliente@example.com',interest:'rental'}})).status,201);});
test('Kapso verifies raw HMAC and deduplicates messages; Vapi callbacks are qualified and idempotent',async()=>{const env={DB:database(),KAPSO_WEBHOOK_SECRET:'test-kapso-secret',VAPI_WEBHOOK_SECRET:'test-vapi-secret'};const payload={message:{id:'wamid.test',from:'573001112233',text:{body:'Hola, quiero alquilar'}},conversation:{id:'c1',phone_number:'573001112233'}};const raw=JSON.stringify(payload);const signature=createHmac('sha256',env.KAPSO_WEBHOOK_SECRET).update(raw).digest('hex');assert.equal((await request(env,'/api/webhooks/kapso',{method:'POST',data:payload})).status,401);for(let i=0;i<2;i++)assert.equal((await request(env,'/api/webhooks/kapso',{method:'POST',data:payload,headers:{'X-Webhook-Signature':signature,'X-Webhook-Event':'whatsapp.message.received'}})).status,200);assert.equal((await env.DB.prepare('SELECT * FROM messages').all()).results.length,1);const call={message:{type:'end-of-call-report',call:{id:'call1',customer:{number:'+573001112233'}},analysis:{structuredData:{callbackRequested:true,name:'Cliente',interest:'rental'},summary:'Solicita llamada'}}};assert.equal((await request(env,'/api/webhooks/vapi',{method:'POST',data:call})).status,401);for(let i=0;i<2;i++)assert.equal((await request(env,'/api/webhooks/vapi',{method:'POST',data:call,headers:{Authorization:'Bearer '+env.VAPI_WEBHOOK_SECRET}})).status,200);assert.equal((await env.DB.prepare('SELECT * FROM leads').all()).results.length,1);});
test('payment cannot be recorded by customer; local admin explicitly records a received payment',async()=>{const DB=database(),env={DB},cookie=await guest(env);const b=await(await request(env,'/api/bookings',{method:'POST',cookie,data:booking()})).json();const data={bookingId:b.id,method:'store',reference:'REC-123'};assert.equal((await request(env,'/api/admin/payment',{method:'POST',cookie,data})).status,403);assert.equal((await request({...env,LOCAL_ADMIN:'true'},'/api/admin/payment',{method:'POST',data})).status,200);assert.equal((await request({...env,LOCAL_ADMIN:'true'},'/api/admin/payment',{method:'POST',data})).status,409);});
test('Stripe requires authentic signed events and exact amount before acknowledging payment',async()=>{const env={DB:database(),STRIPE_WEBHOOK_SECRET:'whsec_test_secret'},cookie=await guest(env);const b=await(await request(env,'/api/bookings',{method:'POST',cookie,data:booking()})).json();const event={id:'evt_test_1',type:'checkout.session.completed',data:{object:{metadata:{bookingId:b.id},payment_status:'paid',currency:'cop',amount_total:(b.amount+b.deposit)*100}}};const timestamp=Math.floor(Date.now()/1000);function signed(data){return {"stripe-signature":'t='+timestamp+',v1='+createHmac('sha256',env.STRIPE_WEBHOOK_SECRET).update(timestamp+'.'+JSON.stringify(data)).digest('hex')};}assert.equal((await request(env,'/api/webhooks/stripe',{method:'POST',data:event})).status,401);const wrong={...event,data:{object:{...event.data.object,amount_total:100}}};assert.equal((await request(env,'/api/webhooks/stripe',{method:'POST',data:wrong,headers:signed(wrong)})).status,400);for(let i=0;i<2;i++)assert.equal((await request(env,'/api/webhooks/stripe',{method:'POST',data:event,headers:signed(event)})).status,200);const paid=await env.DB.prepare('SELECT * FROM bookings WHERE id=?').bind(b.id).first();assert.equal(paid.payment_status,'paid');assert.equal((await env.DB.prepare('SELECT * FROM webhook_events').all()).results.length,1);assert.equal((await request(env,'/api/payments/checkout',{method:'POST',cookie,data:{bookingId:b.id}})).status,503);});
test('production empty catalog does not silently advertise sample inventory',async()=>{const env={DB:database(),DEMO_CATALOG:'false'};const c=await(await request(env,'/api/catalog')).json();assert.deepEqual(c.vehicles,[]);assert.deepEqual(c.services,[]);assert.equal(c.sample,false);});
test('pending owner listing does not break the sample rental catalog',async()=>{const env={DB:database()},cookie=await guest(env);assert.equal((await request(env,'/api/listings',{method:'POST',cookie,data:{name:'Vehículo pendiente QA',brand:'Toyota',year:2025,plate:'QA-789',daily_rate:200000,image:'https://example.com/car.jpg'}})).status,201);const r=await request(env,'/api/bookings',{method:'POST',cookie,data:booking()});assert.equal(r.status,201);});
test('availability excludes maintenance and active sale holds even outside the hold dates',async()=>{const env={DB:database()},cookie=await guest(env),sale=booking({kind:'sale',vehicleId:'v2',endAt:undefined});assert.equal((await request(env,'/api/bookings',{method:'POST',cookie,data:sale})).status,201);const start=new Date(+new Date(sale.startAt)+10*86400000).toISOString(),end=new Date(+new Date(start)+86400000).toISOString();const c=await(await request(env,'/api/catalog?'+new URLSearchParams({start,end}))).json();assert.ok(!c.vehicles.some(v=>v.id==='v2'));assert.ok(c.vehicles.every(v=>v.status==='available'));});
test('availability rejects partial or reversed date ranges and Vapi uses the same results',async()=>{const env={DB:database(),VAPI_WEBHOOK_SECRET:'test'},input=booking();for(const query of [{start:input.startAt},{start:input.endAt,end:input.startAt}])assert.equal((await request(env,'/api/catalog?'+new URLSearchParams(query))).status,400);const start=input.startAt,end=input.endAt;const publicResult=await(await request(env,'/api/catalog?'+new URLSearchParams({start,end}))).json();const voice=await(await request(env,'/api/webhooks/vapi',{method:'POST',headers:{Authorization:'Bearer test'},data:{message:{type:'tool-calls',toolCallList:[{id:'tc1',function:{name:'check_availability',arguments:{startAt:start,endAt:end}}}]}}})).json();assert.deepEqual(JSON.parse(voice.results[0].result).map(v=>v.id),publicResult.vehicles.map(v=>v.id));});
test('test drives cannot finish after business closing time',async()=>{const env={DB:database()};const d=new Date(Date.now()+7*86400000);while(d.getUTCDay()===0)d.setUTCDate(d.getUTCDate()+1);d.setUTCHours(22,30,0,0);assert.equal((await request(env,'/api/quote',{method:'POST',data:booking({kind:'test_drive',vehicleId:'v2',startAt:d.toISOString(),endAt:undefined})})).status,400);});
test('cancelling a paid reservation flags the required refund',async()=>{const env={DB:database(),LOCAL_ADMIN:'true'},cookie=await guest(env);const b=await(await request(env,'/api/bookings',{method:'POST',cookie,data:booking()})).json();assert.equal((await request(env,'/api/admin/payment',{method:'POST',data:{bookingId:b.id,method:'store',reference:'QA-PAYMENT'}})).status,200);assert.equal((await request(env,'/api/bookings/'+b.id,{method:'PATCH',cookie,data:{status:'cancelled'}})).status,200);assert.equal((await env.DB.prepare('SELECT * FROM bookings WHERE id=?').bind(b.id).first()).payment_status,'refund_required');});
test('public Cloudflare deployment limits write requests without blocking reads',async()=>{let calls=0;const env={DB:database(),PUBLIC_API_LIMITER:{async limit({key}){assert.equal(key,'public:203.0.113.10');calls++;return {success:false};}}};const r=await request(env,'/api/leads',{method:'POST',headers:{'CF-Connecting-IP':'203.0.113.10'},data:{name:'QA',email:'qa@example.com',interest:'rental'}});assert.equal(r.status,429);assert.equal((await request(env,'/api/catalog')).status,200);assert.equal(calls,1);assert.equal((await env.DB.prepare('SELECT * FROM leads').all()).results.length,0);});

test('public landing is served at the root without the admin shell; public routes survive refresh',async()=>{
 const env={DB:database()};
 for(const path of ['/','/catalogo','/taller','/ventas','/mi-portal','/acceso']){
  const r=await request(env,path);assert.equal(r.status,200,path);
  const html=await r.text();assert.match(html,/El camino empieza con un buen auto/);
  assert.doesNotMatch(html,/class="sidebar|Ingresos totales|Últimas reservas|Santiago Ramírez/);
 }
 assert.equal((await request(env,'/pagina-inexistente')).status,404);
});
test('direct dashboard pages redirect guests and forged sessions to access without granting administration',async()=>{
 const env={DB:database()},cookie=await guest(env);
 for(const path of ['/dashboard','/dashboard/reservas','/dashboard/clientes','/dashboard/configuracion','/dashboard/']){
  for(const headers of [{},{Cookie:cookie},{Cookie:'__session=forged.token.value'}]){
   const r=await request(env,path,{headers});assert.equal(r.status,302,path);
   const target=new URL(r.headers.get('location'));assert.equal(target.pathname,'/acceso');assert.ok(target.searchParams.get('next').startsWith('/dashboard'));
   assert.equal(r.headers.get('cache-control'),'no-store');assert.equal(await r.text(),'');
  }
 }
 assert.equal((await request(env,'/api/admin/overview',{cookie})).status,403);
 assert.equal((await request({...env,LOCAL_ADMIN:'true'},'/dashboard')).status,200);
 const publicHost=await worker.fetch(new Request('https://popayanlink.example/dashboard'),{...env,LOCAL_ADMIN:'true'});
 assert.equal(publicHost.status,302,'local admin flag never permits a public host');
});

test('signed Clerk sessions distinguish administrators from customers and reject expired or foreign-origin tokens',async()=>{
 const {publicKey,privateKey}=generateKeyPairSync('rsa',{modulusLength:2048});
 const env={DB:database(),CLERK_SECRET_KEY:'sk_test_unit',CLERK_JWT_KEY:publicKey.export({type:'spki',format:'pem'}),ADMIN_USER_IDS:'user_owner'};
 const token=(sub,overrides={})=>{
  const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
  const issued=Math.floor(Date.now()/1000);
  const data=encode({alg:'RS256',typ:'JWT',kid:'unit-test'})+'.'+encode({sub,iss:'https://clerk.example',sid:'sess_unit',iat:issued,nbf:issued-10,exp:issued+300,azp:'http://localhost',...overrides});
  return data+'.'+sign('RSA-SHA256',Buffer.from(data),privateKey).toString('base64url');
 };
 const owner=token('user_owner'),customer=token('user_customer',{admin:true});
 const ownSession=await request(env,'/api/session',{headers:{Authorization:'Bearer '+owner}});
 assert.equal(ownSession.status,200);assert.equal((await ownSession.json()).admin,true);
 assert.equal((await request(env,'/api/admin/overview',{headers:{Authorization:'Bearer '+owner}})).status,200);
 const customerSession=await(await request(env,'/api/session',{headers:{Authorization:'Bearer '+customer}})).json();
 assert.equal(customerSession.guest,false);assert.equal(customerSession.admin,false,'editable token claims never grant administration');
 assert.equal((await request(env,'/api/admin/overview',{headers:{Authorization:'Bearer '+customer}})).status,403);
 assert.equal((await request(env,'/dashboard',{headers:{Cookie:'__session='+owner}})).status,200);
 assert.equal((await request(env,'/dashboard',{headers:{Cookie:'__session='+customer}})).status,302);
 assert.equal((await request(env,'/api/admin/overview',{headers:{Cookie:'__session='+owner}})).status,403,'API never accepts a session cookie as bearer authorization');
 for(const invalid of [token('user_owner',{exp:Math.floor(Date.now()/1000)-120}),token('user_owner',{azp:'https://foreign.example'})]){
  assert.equal((await request(env,'/api/admin/overview',{headers:{Authorization:'Bearer '+invalid}})).status,401);
  assert.equal((await request(env,'/dashboard',{headers:{Cookie:'__session='+invalid}})).status,302);
 }
});

test('landing and catalog use bundled images served as valid WebP from the same origin',async()=>{
 const env={DB:database()};
 const html=await(await request(env,'/')).text();assert.doesNotMatch(html,/https:\/\/images\.unsplash\.com/);
 const catalog=await(await request(env,'/api/catalog')).json();
 assert.equal(catalog.vehicles.length,6);
 for(const vehicle of catalog.vehicles){
  assert.match(vehicle.image,/^\/images\/[a-z0-9-]+\.webp$/);
  const r=await request(env,vehicle.image);assert.equal(r.status,200);assert.equal(r.headers.get('content-type'),'image/webp');
  const bytes=Buffer.from(await r.arrayBuffer());assert.ok(bytes.length>1000);assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WEBP');
 }
});
test('image migration replaces known remote photos while preserving unrelated vehicle data',()=>{
 const db=new DatabaseSync(':memory:');
 for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')&&!f.startsWith('0002')))db.exec(readFileSync('drizzle/'+file,'utf8'));
 db.exec(readFileSync('db/seed.sql','utf8'));
 db.prepare('UPDATE vehicles SET image=? WHERE id=?').run('https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&w=900','v1');
 db.prepare('UPDATE vehicles SET image=? WHERE id=?').run('https://photos.example/custom.webp','v2');
 const before=db.prepare('SELECT name,daily_rate,status FROM vehicles WHERE id=?').get('v1');
 db.exec(readFileSync('drizzle/0002_local_vehicle_images.sql','utf8'));
 assert.equal(db.prepare('SELECT image FROM vehicles WHERE id=?').get('v1').image,'/images/toyota-fortuner.webp');
 assert.equal(db.prepare('SELECT image FROM vehicles WHERE id=?').get('v2').image,'https://photos.example/custom.webp');
 assert.deepEqual(db.prepare('SELECT name,daily_rate,status FROM vehicles WHERE id=?').get('v1'),before);
 assert.equal(db.prepare('SELECT COUNT(*) AS n FROM vehicles').get().n,6);db.close();
});

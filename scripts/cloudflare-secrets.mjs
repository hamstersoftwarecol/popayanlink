import {readFile} from 'node:fs/promises';
import {parseEnv} from 'node:util';
import {spawn} from 'node:child_process';
const allowed=new Set(['CLERK_PUBLISHABLE_KEY','CLERK_SECRET_KEY','ADMIN_USER_IDS','APP_ORIGIN','VAPI_PUBLIC_KEY','VAPI_RECEPTIONIST_ID','VAPI_RENTAL_ID','VAPI_REPAIR_ID','VAPI_SALES_ID','VAPI_WEBHOOK_SECRET','KAPSO_API_KEY','KAPSO_PHONE_NUMBER_ID','KAPSO_WEBHOOK_SECRET','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET']);
let content;
try{content=await readFile('.env.production','utf8');}catch{console.error('Crea .env.production a partir de .env.example y completa las claves de producción. El archivo no se guarda en Git.');process.exit(1);}
const source=parseEnv(content);
if(!source.CLERK_PUBLISHABLE_KEY&&source.PUBLIC_CLERK_PUBLISHABLE_KEY)source.CLERK_PUBLISHABLE_KEY=source.PUBLIC_CLERK_PUBLISHABLE_KEY;
const entries=Object.entries(source).filter(([key,value])=>allowed.has(key)&&value.trim());
if(!entries.length){console.error('No hay credenciales configuradas para subir.');process.exit(1);}
console.log('Subiendo de forma segura estas claves: '+entries.map(([key])=>key).join(', '));
const child=spawn('npx',['wrangler','secret','bulk','--config','wrangler.cloudflare.jsonc'],{stdio:['pipe','inherit','inherit']});
child.stdin.end(JSON.stringify(Object.fromEntries(entries)));
child.on('exit',code=>process.exit(code||0));
child.on('error',()=>{console.error('No se pudo ejecutar Wrangler.');process.exit(1);});

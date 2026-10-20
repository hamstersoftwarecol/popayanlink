import { build } from 'esbuild';
import { writeFile, mkdir } from 'node:fs/promises';
await mkdir('.astro',{recursive:true});
await build({entryPoints:['src/data.ts'],outfile:'.astro/seed-data.mjs',bundle:true,format:'esm',platform:'node'});
const {sampleVehicles, sampleServices}=await import('../.astro/seed-data.mjs');
const q=v=>v==null?'NULL':typeof v==='number'?String(v):"'"+String(v).replaceAll("'","''")+"'";
const statements=sampleVehicles.map(v=>'INSERT OR IGNORE INTO vehicles (id,name,brand,category,year,seats,transmission,fuel,daily_rate,sale_price,status,image,plate,mileage,approved,created_at) VALUES ('+[v.id,v.name,v.brand,v.category,v.year,v.seats,v.transmission,v.fuel,v.daily_rate,v.sale_price,v.status,v.image,v.plate,v.mileage,1,''].map(q).join(',')+');');
statements.push(...sampleServices.map(s=>'INSERT OR IGNORE INTO services (id,name,description,price,duration,active) VALUES ('+[s.id,s.name,s.description,s.price,s.duration,1].map(q).join(',')+');'));
await writeFile('db/seed.sql','-- EXAMPLE INVENTORY ONLY. Do not import into a real business database.\n'+statements.join('\n')+'\n');

import {readFile,writeFile,mkdir} from 'node:fs/promises';
const images=JSON.parse(await readFile(new URL('../assets/vehicle-images.json',import.meta.url),'utf8'));
const directory=new URL('../public/images/',import.meta.url);
await mkdir(directory,{recursive:true});
await Promise.all(images.map(async image=>{
 const url=`https://images.unsplash.com/${image.photo}?fm=webp&fit=crop&w=${image.width}&q=85`;
 const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error(`${image.file}: HTTP ${response.status}`);
 const bytes=Buffer.from(await response.arrayBuffer());
 if(!response.headers.get('content-type')?.startsWith('image/webp')||bytes.subarray(0,4).toString()!=='RIFF'||bytes.subarray(8,12).toString()!=='WEBP')throw new Error(`${image.file}: el proveedor no devolvió una imagen WebP válida.`);
 await writeFile(new URL(image.file,directory),bytes);
 console.log(`${image.file}: ${Math.round(bytes.length/1024)} KB`);
}));

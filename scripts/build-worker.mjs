import {build} from 'esbuild';
import {readFile,readdir,mkdir,writeFile,cp} from 'node:fs/promises';
import path from 'node:path';
const assets={};
async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else assets['/'+path.relative('dist/client',p).split(path.sep).join('/')]=(await readFile(p)).toString('base64');}}
await walk('dist/client');await mkdir('dist/server',{recursive:true});await mkdir('dist/.openai',{recursive:true});
await writeFile('worker/assets.generated.json',JSON.stringify(assets));
await build({entryPoints:['worker/index.ts'],outfile:'dist/server/index.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,external:['cloudflare:workers']});
await cp('.openai/hosting.json','dist/.openai/hosting.json');
console.log('Worker y recursos de Astro empaquetados.');

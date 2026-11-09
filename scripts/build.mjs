import {mkdir,cp} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const p of ['index.html','src','public']) await cp(p,`dist/${p}`,{recursive:true});
console.log('Build erstellt: dist/');

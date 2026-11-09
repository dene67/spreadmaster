import {mkdir,writeFile,readFile,access} from 'node:fs/promises';
const dex=JSON.parse(await readFile('public/data/pokedex.json','utf8'));
await mkdir('public/sprites',{recursive:true});
const nums=[...new Set(Object.values(dex).filter(p=>p.num>0&&!p.isNonstandard).map(p=>p.num))];let failed=[];
for(let i=0;i<nums.length;i+=16)await Promise.all(nums.slice(i,i+16).map(async n=>{const path=`public/sprites/${n}.png`;try{await access(path);return;}catch{}try{const r=await fetch(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${n}.png`);if(!r.ok)throw Error(r.status);await writeFile(path,Buffer.from(await r.arrayBuffer()));}catch{failed.push(n);}}));
if(failed.length){console.error('Fehlende Sprites:',failed);process.exitCode=1;}else console.log(`${nums.length} Sprites lokal verfügbar`);

import {readFile,writeFile,mkdir} from 'node:fs/promises';
import vm from 'node:vm';
const context={};vm.createContext(context);vm.runInContext(await readFile('public/data/champions.js','utf8'),context);
const roster=context.CHAMPIONS_DATA.species;
const response=await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000');if(!response.ok)throw Error(`PokéAPI index: ${response.status}`);
const index=(await response.json()).results;
const lookup=new Map(index.map(p=>[p.name.replace(/[^a-z0-9]/g,''),p.url.split('/').filter(Boolean).at(-1)]));
const alias={meowsticmmega:'meowsticmalemega',aegislash:'aegislashshield',basculegion:'basculegionmale',basculegionf:'basculegionfemale',indeedee:'indeedeemale',indeedeef:'indeedeefemale',meowstic:'meowsticmale',meowsticf:'meowsticfemale',mimikyu:'mimikyudisguised',eiscue:'eiscueice',palafin:'palafinzero',darmanitan:'darmanitanstandard',wishiwashi:'wishiwashisolo',zygarde:'zygarde50',pumpkaboo:'pumpkabooaverage',gourgeist:'gourgeistaverage',taurospaldeacombat:'taurospaldeacombatbreed',taurospaldeablaze:'taurospaldeablazebreed',taurospaldeaaqua:'taurospaldeaaquabreed',urshifu:'urshifusinglestrike'};
await mkdir('public/sprites/shiny',{recursive:true});
const missing=[],baseFallback=[];
async function download(url){try{const r=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!r.ok)return null;return Buffer.from(await r.arrayBuffer());}catch{return null;}}
const shinyPokeApi=n=>`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${n}.png`;
const dex=JSON.parse(await readFile('public/data/pokedex.json','utf8'));
const numbers=[...new Set(Object.values(dex).map(p=>p.num).filter(n=>Number.isInteger(n)&&n>0&&n<=1025))];
for(let i=0;i<numbers.length;i+=20)await Promise.all(numbers.slice(i,i+20).map(async n=>{const data=await download(shinyPokeApi(n));if(data)await writeFile(`public/sprites/shiny/${n}.png`,data);else missing.push(String(n));}));
for(let i=0;i<roster.length;i+=20)await Promise.all(roster.slice(i,i+20).map(async p=>{
 const n=lookup.get(alias[p.id]||p.id);
 let data=n?await download(shinyPokeApi(n)):null;
 if(!data){const slug=p.name.toLowerCase().replace(/[^a-z0-9-]/g,'');data=await download(`https://play.pokemonshowdown.com/sprites/gen5-shiny/${slug}.png`);}
 if(!data){try{data=await readFile(`public/sprites/shiny/${p.num}.png`);baseFallback.push(p.id);}catch{missing.push(p.id);return;}}
 await writeFile(`public/sprites/shiny/${p.id}.png`,data);
}));
await writeFile('public/data/shiny-sprite-fallbacks.json',JSON.stringify({baseFallback,missing},null,2));
console.log(`${numbers.length} base species and ${roster.length} roster forms processed; ${baseFallback.length} form fallbacks; ${missing.length} missing.`);
if(baseFallback.length)console.log('Base-form shiny fallback:',baseFallback.join(', '));
if(missing.length){console.error('Missing shiny assets:',missing.join(', '));process.exitCode=1;}

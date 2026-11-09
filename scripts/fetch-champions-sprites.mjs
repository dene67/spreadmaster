import {readFile,writeFile,access} from 'node:fs/promises';
import vm from 'node:vm';
const context={};vm.createContext(context);vm.runInContext(await readFile('public/data/champions.js','utf8'),context);
const roster=context.CHAMPIONS_DATA.species;
const r=await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000');if(!r.ok)throw Error(r.status);
const index=(await r.json()).results;const lookup=new Map(index.map(p=>[p.name.replace(/[^a-z0-9]/g,''),p.url.split('/').filter(Boolean).at(-1)]));
const alias={meowsticmmega:'meowsticmalemega',aegislash:'aegislashshield',basculegion:'basculegionmale',basculegionf:'basculegionfemale',indeedee:'indeedeemale',indeedeef:'indeedeefemale',meowstic:'meowsticmale',meowsticf:'meowsticfemale',mimikyu:'mimikyudisguised',eiscue:'eiscueice',palafin:'palafinzero',darmanitan:'darmanitanstandard',wishiwashi:'wishiwashisolo',zygarde:'zygarde50',pumpkaboo:'pumpkabooaverage',gourgeist:'gourgeistaverage',taurospaldeacombat:'taurospaldeacombatbreed',taurospaldeablaze:'taurospaldeablazebreed',taurospaldeaaqua:'taurospaldeaaquabreed',urshifu:'urshifusinglestrike'};
let fallback=[];
for(let i=0;i<roster.length;i+=12)await Promise.all(roster.slice(i,i+12).map(async p=>{const key=alias[p.id]||p.id;const num=lookup.get(key);const source=num?`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${num}.png`:`https://play.pokemonshowdown.com/sprites/gen5/${p.name.toLowerCase().replace(/[^a-z0-9-]/g,'')}.png`;
 try{const response=await fetch(source);if(!response.ok)throw Error(response.status);await writeFile(`public/sprites/${p.id}.png`,Buffer.from(await response.arrayBuffer()));}catch{try{const base=await readFile(`public/sprites/${p.num}.png`);await writeFile(`public/sprites/${p.id}.png`,base);fallback.push(p.id);}catch{const response=await fetch(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.num}.png`);if(!response.ok)throw Error('Missing sprite '+p.name);await writeFile(`public/sprites/${p.id}.png`,Buffer.from(await response.arrayBuffer()));fallback.push(p.id);}}}));
await writeFile('public/data/sprite-fallbacks.json',JSON.stringify(fallback,null,2));console.log(`${roster.length} roster sprites saved; base-sprite fallbacks: ${fallback.length}`,fallback);


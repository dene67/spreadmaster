import {stats} from './data.js';
import {spToEV} from './speed.js';
export function makePokemon(engine,gen,set,{stage=0,burn=false}={}){
 const evs=Object.fromEntries(stats.map(k=>[k,spToEV(set.points[k])]));
 // Aegislash is named Aegislash-Shield by the engine. The roster uses Aegislash.
 const name=set.species==='Aegislash'?'Aegislash-Shield':set.species;
 return new engine.Pokemon(gen,name,{level:50,nature:set.nature,ability:set.ability||undefined,item:set.item,evs,ivs:Object.fromEntries(stats.map(k=>[k,31])),status:burn?'brn':'',boosts:{atk:stage,spa:stage,def:stage,spd:stage}});
}

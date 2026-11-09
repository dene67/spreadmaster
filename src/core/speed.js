export const MAX_SP=32;
export const TOTAL_SP=66;
export function championStat(base,points=0,nature=1,hp=false){return hp?base+75+points:Math.floor((base+20+points)*nature);}
export function speedStat(base,{points=0,nature=1,stage=0,tailwind=false,scarf=false,paralyzed=false,ability='none',item='none'}={}){
 const stages=[1,1.5,2,2.5,3,3.5,4],raw=championStat(base,points,nature);let value=stage>=0?Math.floor(raw*stages[Math.min(6,stage)]):Math.floor(raw/stages[Math.min(6,-stage)]);
 const abilityMultiplier=({none:1,quickfeet:1.5,unburden:2,weather:2,slowstart:.5}[ability]??Number(ability))||1;
 const itemMultiplier={none:1,scarf:1.5,halving:.5}[item]??1;
 value=Math.floor(value*abilityMultiplier);value=Math.floor(value*itemMultiplier);if(tailwind)value=Math.floor(value*2);if(paralyzed&&ability!=='quickfeet')value=Math.floor(value/2);return Math.max(1,value);
}
export function minimumPoints(base,target,options={}){for(let points=0;points<=32;points++)if(speedStat(base,{...options,points})>target)return points;return null;}
export function classifyRoster(species,target,opponent={}){
 const groups={always:[],neutral:[],positive:[],negative:[],slower:[],tie:[]};
 for(const p of species){const min=speedStat(p.baseStats.spe,{...opponent,points:0,nature:opponent.includeNegative?.9:1}),maxPositive=speedStat(p.baseStats.spe,{...opponent,points:32,nature:1.1}),maxNeutral=speedStat(p.baseStats.spe,{...opponent,points:32,nature:1}),maxNegative=opponent.includeNegative?speedStat(p.baseStats.spe,{...opponent,points:32,nature:.9}):null,entry={...p,min,max:maxPositive};if(min>target){groups.always.push(entry);continue;}if(maxNegative!==null&&maxNegative>target)groups.negative.push(entry);else if(maxNeutral>target)groups.neutral.push(entry);else if(maxPositive>target)groups.positive.push(entry);else if(maxPositive===target)groups.tie.push(entry);else groups.slower.push(entry);}
 for(const list of Object.values(groups))list.sort((a,b)=>b.max-a.max||a.name.localeCompare(b.name));return groups;
}
// Group only Pokémon with identical base Speed and effective bounds. Different
// base stats can collapse to the same rounded value under battle modifiers but
// do not necessarily share investment breakpoints.
export function groupSpeedMatches(list){
 const groups=new Map();
 for(const p of list){const key=`${p.baseStats.spe}:${p.min}:${p.max}`;if(!groups.has(key))groups.set(key,{base:p.baseStats.spe,min:p.min,max:p.max,pokemon:[]});groups.get(key).pokemon.push(p);}
 return [...groups.values()].sort((a,b)=>b.max-a.max||b.min-a.min||b.base-a.base);
}
// Exact level-50 stat-equivalent boundary for Smogon; the UI never uses EVs.
export const spToEV=points=>points===0?0:8*points-4;
export const evToSP=ev=>Math.floor((Math.floor(ev/4)+1)/2);

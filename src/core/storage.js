import {evToSP} from './speed.js';
const stats=['hp','atk','def','spa','spd','spe'];
export function migrateSet(s){if(s.points)return s;const points=Object.fromEntries(stats.map(k=>[k,evToSP(s.evs?.[k]||0)]));const {evs,ivs,teraType,...rest}=s;return {...rest,level:50,points};}
export function createStorage(storage){const key='spreadmaster:v2';return {
 load(){const raw=storage.getItem(key)||storage.getItem('volcarona-lab:v1');if(!raw)return {teams:[],sets:[],version:2};const value=JSON.parse(raw);if(!Array.isArray(value.teams)||!Array.isArray(value.sets))throw Error('Invalid workspace data');return {...value,version:2,sets:value.sets.map(migrateSet)};},
 save(value){storage.setItem(key,JSON.stringify({...value,version:2}));}
};}
export function validateSet(s){
 if(!s||typeof s.species!=='string'||typeof s.name!=='string'||s.name.length>80||!s.points||!Array.isArray(s.moves)||s.moves.length>4||s.moves.some(m=>typeof m!=='string'))throw Error('Invalid Pokémon set');
 for(const k of ['nature','ability','item'])if(typeof s[k]!=='string')throw Error('Invalid set details');
 for(const k of stats)if(!Number.isInteger(s.points[k])||s.points[k]<0||s.points[k]>32)throw Error('Each stat must have 0–32 Stat Points');
 if(stats.reduce((n,k)=>n+s.points[k],0)>66)throw Error('A Pokémon can use at most 66 Stat Points');
 if(s.level!==50)throw Error('Champions sets must be level 50');return s;
}

export async function loadDex(){return globalThis.VOLCARONA_DEX;}
export const stats=['hp','atk','def','spa','spd','spe'];
export const labels={hp:'HP',atk:'Attack',def:'Defense',spa:'Sp. Attack',spd:'Sp. Defense',spe:'Speed'};
export const shortLabels={hp:'HP',atk:'Atk',def:'Def',spa:'SpA',spd:'SpD',spe:'Spe'};
export const natureSpeed=n=>['Timid','Jolly','Hasty','Naive'].includes(n)?1.1:['Brave','Quiet','Relaxed','Sassy'].includes(n)?.9:1;
export const blankPoints=()=>Object.fromEntries(stats.map(k=>[k,0]));
export const newSet=(species='Volcarona')=>({id:crypto.randomUUID(),name:species,species,level:50,nature:'Hardy',ability:'',item:'',points:blankPoints(),moves:[]});
export const sprite=(p,shiny=globalThis.document?.documentElement?.dataset?.theme==='shiny')=>p?`./public/sprites/${shiny?'shiny/':''}${p.spriteId||p.id||p.num}.png`:'';
export const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

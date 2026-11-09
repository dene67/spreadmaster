import {stats,shortLabels} from './data.js';
import {championStat} from './speed.js';

export function statParts(ctx,set,k){
 const p=ctx.byName(set.species), n=ctx.gen.natures.get(ctx.id(set.nature));
 const multiplier=n?.plus===n?.minus?1:n?.plus===k?1.1:n?.minus===k?.9:1;
 const base=championStat(p.baseStats[k],0,1,k==='hp');
 const points=set.points[k];
 const total=championStat(p.baseStats[k],points,multiplier,k==='hp');
 return {base,points,total,nature:total-base-points};
}
export function statBars(parts){
 const {base,points,nature}=parts;
 const scale=330,normal=Math.min(scale,base+points);
 // A negative nature removes part of the existing total; hatch the deducted end.
 const reduction=Math.min(normal,Math.max(0,-nature)), keptBase=Math.min(base,Math.max(0,normal-reduction));
 const keptPoints=Math.max(0,normal-reduction-keptBase);
 const natureWidth=Math.min(Math.max(0,nature),Math.max(0,scale-normal));
 return `<i class="chart-base" style="width:${keptBase/scale*100}%"></i><i class="chart-sp" style="width:${keptPoints/scale*100}%"></i>${nature>0?`<i class="chart-nature" style="width:${natureWidth/scale*100}%"></i>`:reduction?`<i class="chart-negative" style="width:${reduction/scale*100}%"></i>`:''}`;
}
export function calcSpread(ctx,set,side){
 const total=stats.reduce((n,k)=>n+set.points[k],0);
 const nature=ctx.gen.natures.get(ctx.id(set.nature));
 return `<div class="calc-spread" data-spread="${side}"><div class="spread-heading"><b>Stat spread</b><span data-total="${side}">${total} / 66 SP</span></div><div class="chart-legend"><span>● Base</span><span>● Stat Points</span><span>● Nature</span></div>${stats.map(k=>{const parts=statParts(ctx,set,k),suffix=nature?.plus===k?'+':nature?.minus===k?'−':'';return `<div class="calc-stat-row"><label for="${side}-${k}">${shortLabels[k]}</label><div class="calc-stat-input"><input type="range" id="${side}-${k}" min="0" max="32" value="${parts.points}" data-sp-side="${side}" data-sp-stat="${k}" aria-label="${side} ${shortLabels[k]} Stat Points"><input type="text" inputmode="numeric" maxlength="3" pattern="[0-9]{1,2}[+−-]?" value="${parts.points}${suffix}" data-sp-number="${side}" data-sp-stat="${k}" aria-label="${side} ${shortLabels[k]} Stat Points; append + or − to choose Nature"></div><div class="calc-stat-bar chart-track" data-bar="${side}-${k}">${statBars(parts)}</div><strong data-stat-value="${side}-${k}">${parts.total}</strong></div>`;}).join('')}<p class="hint">Changes are temporary until you save the set.</p></div>`;
}

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
 return `<div class="calc-spread" data-spread="${side}"><div class="spread-heading"><b>Stat spread</b><span data-total="${side}">${total} / 66 SP</span></div><div class="chart-legend"><span>● Base</span><span>● Stat Points</span><span>● Nature</span></div>${stats.map(k=>{const parts=statParts(ctx,set,k),suffix=nature?.plus===nature?.minus?'':nature?.plus===k?'+':nature?.minus===k?'−':'';return `<div class="calc-stat-row"><label for="${side}-${k}">${shortLabels[k]}</label><div class="calc-stat-input"><input type="range" id="${side}-${k}" min="0" max="32" value="${parts.points}" data-sp-side="${side}" data-sp-stat="${k}" aria-label="${side} ${shortLabels[k]} Stat Points"><input type="text" inputmode="numeric" maxlength="4" pattern="[0-9]{1,2}[+−-]?" value="${parts.points}${suffix}" data-sp-number="${side}" data-sp-stat="${k}" aria-label="${side} ${shortLabels[k]} Stat Points; append + or − to choose Nature"></div><div class="calc-stat-bar chart-track" data-bar="${side}-${k}">${statBars(parts)}</div><strong data-stat-value="${side}-${k}">${parts.total}</strong></div>`;}).join('')}<p class="hint">Changes are temporary until you save the set.</p></div>`;
}

export function compactStatDistribution(ctx,set){
 const order=['hp','atk','def','spe','spd','spa'],baseStats=ctx.byName(set.species).baseStats,bst=stats.reduce((sum,k)=>sum+baseStats[k],0),totals=Object.fromEntries(stats.map(k=>[k,statParts(ctx,set,k).total])),max=Math.max(1,...stats.map(k=>championStat(baseStats[k],32,k==='hp'?1:1.1,k==='hp')));
 const point=(i,r)=>{const angle=(-90+i*60)*Math.PI/180;return [90+Math.cos(angle)*r,76+Math.sin(angle)*r];},pair=p=>p.map(v=>v.toFixed(2)).join(','),polygon=r=>order.map((_,i)=>pair(point(i,r))).join(' ');
 const summary=stats.map(k=>`${shortLabels[k]} ${totals[k]}`).join(', ');
 return `<div class="compact-stat-distribution"><svg class="stat-hexagon" viewBox="0 0 180 154" role="img" aria-label="Level 50 stats: ${summary}. Outer ring: ${max}, highest achievable stat with 32 SP and a boosting nature. Base stat total: ${bst}.">${[.25,.5,.75,1].map(f=>`<polygon class="stat-ring" points="${polygon(44*f)}"/>`).join('')}${order.map((_,i)=>`<line class="stat-axis" x1="90" y1="76" x2="${point(i,44)[0]}" y2="${point(i,44)[1]}"/>`).join('')}<polygon class="stat-shape" points="${order.map((k,i)=>pair(point(i,44*totals[k]/max))).join(' ')}"/>${order.map((k,i)=>{const [x,y]=point(i,64);return `<text class="stat-edge-label" x="${x}" y="${y-3}" text-anchor="middle"><tspan x="${x}">${shortLabels[k]}</tspan><tspan class="stat-edge-value" x="${x}" dy="12">${totals[k]}</tspan></text>`;}).join('')}</svg><dl class="stat-total-list">${stats.map(k=>`<div><dt>${shortLabels[k]}</dt><dd>${totals[k]}</dd></div>`).join('')}</dl></div>`;
}

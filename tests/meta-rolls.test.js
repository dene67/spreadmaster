import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {rosterDamageFeature} from '../src/features/roster-damage.js';
import {newSet} from '../src/core/data.js';
const sandbox={console};sandbox.window=sandbox;vm.createContext(sandbox);
for(const file of ['vendor/calc-data.js','vendor/calc.js','data/champions.js'])vm.runInContext(readFileSync(new URL('../public/'+file,import.meta.url),'utf8'),sandbox);
const {calc,CHAMPIONS_DATA:data}=sandbox;globalThis.calc=calc;
const gen=calc.Generations.get(9),species=Array.from(data.species).filter(p=>['volcarona','garchomp','abomasnow'].includes(p.id));
const ctx={gen,species,id:s=>s.toLowerCase().replace(/[^a-z0-9]/g,''),byName:s=>species.find(p=>p.name===s||p.id===s),learnsets:JSON.parse(readFileSync(new URL('../public/data/champions-learnsets.json',import.meta.url),'utf8')),natures:Array.from(gen.natures,n=>n.name),moves:Array.from(gen.moves,m=>m.name),items:[],moveText:{},render:()=>{}};
test('Meta Rolls shows spread targeting and both bulk roll outcomes in compact cards',()=>{
 const feature=rosterDamageFeature(ctx),set=newSet('Volcarona');set.moves=['Heat Wave'];feature.fromSet(set);
 const html=feature.render();assert.match(html,/Spread move/);assert.match(html,/Single target damage/);assert.match(html,/No bulk/);assert.match(html,/Full bulk/);assert.match(html,/Unavoidable OHKO roll/);assert.match(html,/Avoidable OHKO/);assert.match(html,/32 HP \+ 32 defensive SP · neutral nature/);assert.match(html,/boosting defensive nature/);assert.equal((html.match(/data-rd-column-sort=/g)||[]).length,4);assert.match(html,/Roll ·|OHKO|Survives/);
});
test('Single-target attacks do not offer a spread damage switch',()=>{
 const feature=rosterDamageFeature(ctx),set=newSet('Volcarona');set.moves=['Bug Buzz'];feature.fromSet(set);
 const html=feature.render();assert.match(html,/Single-target move/);assert.doesNotMatch(html,/id="rd-single-target"/);
});
test('Spread damage switch recalculates through the engine',()=>{
 const feature=rosterDamageFeature(ctx),set=newSet('Volcarona');set.moves=['Heat Wave'];feature.fromSet(set);
 const before=feature.render();let target;
 const root={querySelector:selector=>selector==='#rd-single-target'?(target={}):selector==='#rd-search'?null:{},querySelectorAll:()=>[]};
 feature.bind(root);target.onchange({target:{checked:true}});
 const after=feature.render();const range=html=>Number(html.match(/data-rd-hi="(\d+)"/)[1]);assert.ok(range(after)>range(before));assert.match(after,/One target remains/);
});

test('Take Everything compares opposing offensive investment while holding the selected defense fixed',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>({ok:true,json:async()=>({rows:[{category:'move',name:'Heat Wave',percentage:'80%',rank:1}]})});
 try{const feature=rosterDamageFeature(ctx),defend={dataset:{side:'defend'}},root={querySelector:selector=>selector==='#rd-search'?null:{},querySelectorAll:selector=>selector==='[data-side]'?[defend]:[]};
 feature.bind(root);defend.onclick();feature.bind(root);await new Promise(resolve=>setImmediate(resolve));
 const html=feature.render();assert.doesNotMatch(html,/Your Pokémon: 0 HP|Your Pokémon: 32 HP/);assert.match(html,/Opponent: 0 attacking SP/);assert.match(html,/Opponent: 32 attacking SP/);assert.match(html,/0 offense SP/);assert.match(html,/32 SP \/ \+nature/);assert.match(html,/rd-single-target/);assert.match(html,/Investment-dependent OHKO/);assert.equal((html.match(/data-rd-column-sort=/g)||[]).length,4);
 }finally{globalThis.fetch=original;}
});

test('Item effect categories remove opposing Mega forms from roster results',()=>{
 const all=[...species,Array.from(data.species).find(p=>p.name==='Garchomp-Mega')],context={...ctx,species:all,byName:name=>all.find(p=>p.name===name||p.id===name)},feature=rosterDamageFeature(context),set=newSet('Volcarona');set.moves=['Heat Wave'];feature.fromSet(set);assert.match(feature.render(),/data-rd-preview="garchompmega"/);
 const item={dataset:{rdItemEffect:'ownItem'}},root={querySelector:selector=>selector==='#rd-search'?null:{},querySelectorAll:selector=>selector==='[data-rd-item-effect]'?[item]:[]};feature.bind(root);item.onchange({target:{value:'life'}});assert.doesNotMatch(feature.render(),/data-rd-preview="garchompmega"/);
});

test('Loading a box set fills the remaining moves and chooses a different strongest move for each opponent',()=>{
 const feature=rosterDamageFeature(ctx),set=newSet('Volcarona');set.ability='Flame Body';set.moves=['Heat Wave','Bug Buzz','Giga Drain','Protect'];feature.fromSet(set);const html=feature.render();assert.match(html,/id="rd-full-moveset" checked/);assert.match(html,/id="rd-extra-move-2"[^>]*value="Protect"/);
 const card=id=>html.split('data-rd-preview="'+id+'"')[1].split('</details>')[0];assert.match(card('garchomp'),/data-rd-move="Bug Buzz"/);assert.match(card('abomasnow'),/data-rd-move="Heat Wave"/);
 assert.deepEqual(set.moves,['Heat Wave','Bug Buzz','Giga Drain','Protect']);
});
test('Full moveset chooses one opposing ability against the whole moveset, rather than a different counter for each move',()=>{
 const azumarill={...gen.species.get('azumarill'),abilities:{0:'Thick Fat',1:'Huge Power',H:'Sap Sipper'}},all=[...species,azumarill],context={...ctx,species:all,byName:name=>all.find(p=>p.name===name||p.id===name)},feature=rosterDamageFeature(context),set=newSet('Volcarona');set.ability='Flame Body';set.moves=['Heat Wave','Bug Buzz','Giga Drain','Protect'];feature.fromSet(set);const card=feature.render().split('data-rd-preview="azumarill"')[1].split('</details>')[0];assert.match(card,/Sap Sipper/);assert.match(card,/data-rd-move="Bug Buzz"/);
});
test('Status-only loaded movesets do not silently add an attack outside the set',()=>{
 const feature=rosterDamageFeature(ctx),set=newSet('Volcarona');set.moves=['Protect','Quiver Dance'];feature.fromSet(set);const html=feature.render();assert.doesNotMatch(html,/data-rd-preview=/);assert.match(html,/0 damaging attacks/);
});

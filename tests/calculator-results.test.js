import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {calculatorFeature} from '../src/features/calculator.js';
import {newSet} from '../src/core/data.js';
import {makePokemon} from '../src/core/calculator.js';
import {koChance} from '../src/core/damage-rolls.js';
const box={console};box.window=box;vm.createContext(box);for(const file of ['vendor/calc-data.js','vendor/calc.js','data/champions.js'])vm.runInContext(readFileSync(new URL('../public/'+file,import.meta.url),'utf8'),box);
const {calc,CHAMPIONS_DATA:data}=box;globalThis.calc=calc;const gen=calc.Generations.get(9),species=Array.from(data.species).filter(p=>['volcarona','garchomp','abomasnow','cloyster'].includes(p.id)),id=s=>s.toLowerCase().replace(/[^a-z0-9]/g,''),ctx={gen,id,species,byName:s=>species.find(p=>p.id===id(s))||gen.species.get(id(s)),learnsets:JSON.parse(readFileSync(new URL('../public/data/champions-learnsets.json',import.meta.url),'utf8')),natures:Array.from(gen.natures,n=>n.name),moves:Array.from(gen.moves,m=>m.name),items:[],moveText:{},db:{sets:[]},isLegal:()=>true,meta:{regulation:'M-C'}};
function render(a,d){const feature=calculatorFeature(ctx);feature.fromSet(a,'attacker');feature.fromSet(d,'defender');return feature.render();}
test('Every damaging move with an OHKO chance displays its own exact roll probability',()=>{
 const a=newSet('Volcarona'),d=newSet('Abomasnow');a.name='Ember';a.points.spa=32;a.nature='Modest';a.moves=['Heat Wave','Bug Buzz','Fire Blast','Protect'];
 const html=render(a,d);assert.doesNotMatch(html,/id="calc-stickyWeb"|<span>Sticky Web/);assert.match(html,/<h2>Ember<\/h2>/);
 const articles=html.match(/<article class="moveset-damage[\s\S]*?<\/article>/g);
 for(const name of a.moves.slice(0,3)){const result=calc.calculate(gen,makePokemon(calc,gen,a),makePokemon(calc,gen,d),new calc.Move(gen,name,{ability:a.ability,item:a.item}),new calc.Field({gameType:'Doubles'})),[lo,hi]=result.range(),chance=koChance({lo,hi,hp:result.defender.maxHP(),rolls:result.damage}),article=articles.find(text=>text.includes(name));assert.ok(chance>0);assert.ok(article.includes((chance*100).toFixed(1)+'% OHKO'),name);}
 assert.doesNotMatch(articles.find(text=>text.includes('Protect')),/calc-ohko-chance/);
});
test('Moves which cannot OHKO do not display a positive OHKO chance',()=>{
 const a=newSet('Volcarona'),d=newSet('Garchomp');a.moves=['Ember'];d.points.hp=32;d.points.spd=32;d.nature='Careful';const html=render(a,d);assert.doesNotMatch(html,/calc-ohko-chance/);
});

test('Multi-hit OHKO chance preserves weighted rolls and uses Skill Link hit count',()=>{
 const a=newSet('Cloyster'),d=newSet('Garchomp');a.ability='Skill Link';a.moves=['Icicle Spear'];d.points.hp=32;d.points.def=32;d.nature='Impish';const result=calc.calculate(gen,makePokemon(calc,gen,a),makePokemon(calc,gen,d),new calc.Move(gen,'Icicle Spear',{ability:a.ability}),new calc.Field({gameType:'Doubles'})),[lo,hi]=result.range(),chance=koChance({lo,hi,hp:result.defender.maxHP(),rolls:result.damage});assert.equal(result.move.hits,5);assert.ok(chance>0&&chance<1);assert.ok(render(a,d).includes((chance*100).toFixed(1)+'% OHKO'));
});

test('Two-hit KO estimates appear as compact move labels',()=>{const a=newSet('Volcarona'),d=newSet('Garchomp');a.points.spa=32;a.moves=['Bug Buzz'];const result=calc.calculate(gen,makePokemon(calc,gen,a),makePokemon(calc,gen,d),new calc.Move(gen,'Bug Buzz'),new calc.Field({gameType:'Doubles'}));const estimate=result.kochance();assert.equal(estimate.n,2);assert.ok(render(a,d).includes((estimate.chance*100).toFixed(1)+'% 2HKO'));assert.doesNotMatch(render(a,d),/calc-ohko-chance/);});

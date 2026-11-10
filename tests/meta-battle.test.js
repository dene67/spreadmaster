import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {strongestMatchup,battleDefaults,effectItem} from '../src/core/meta-battle.js';
import {newSet} from '../src/core/data.js';
import {makePokemon} from '../src/core/calculator.js';
const box={console};box.window=box;vm.createContext(box);for(const name of ['calc-data','calc'])vm.runInContext(readFileSync(new URL('../public/vendor/'+name+'.js',import.meta.url),'utf8'),box);
const engine=box.calc,gen=engine.Generations.get(9),id=s=>s.toLowerCase().replace(/[^a-z0-9]/g,''),ctx={gen,id,byName:name=>{const p=gen.species.get(id(name));return name==='Azumarill'?{...p,abilities:{0:'Thick Fat',1:'Huge Power',H:'Sap Sipper'}}:name==='Torkoal'?{...p,abilities:{0:'White Smoke',1:'Drought',H:'Shell Armor'}}:name==='Hariyama'?{...p,abilities:{0:'Thick Fat',1:'Guts',H:'Sheer Force'}}:p}};
const hit=(a,d,name,options={})=>strongestMatchup(engine,ctx,newSet(a),newSet(d),gen.moves.get(id(name)),options);
test('Auto abilities choose physical power and the strongest defensive reduction',()=>{
 const strong=hit('Azumarill','Garchomp','Play Rough');assert.equal(strong.attackerAbility,'Huge Power');
 const reduced=hit('Volcarona','Hariyama','Heat Wave');assert.equal(reduced.defenderAbility,'Thick Fat');
});
test('Sturdy and prior-hit stacks are excluded from ability candidates',()=>{
 const fixed={...ctx,byName:name=>({...ctx.byName(name),abilities:name==='Golem'?{0:'Sturdy'}:name==='Mudsdale'?{0:'Stamina'}:ctx.byName(name).abilities})};
 for(const target of ['Golem','Mudsdale']){const result=strongestMatchup(engine,fixed,newSet('Garchomp'),newSet(target),gen.moves.get('earthquake'));assert.equal(result.defenderAbility,'None');}
});
test('Life Orb stacks with eligible Sheer Force damage while suppressing recoil only on eligible moves',()=>{
 const fixed={...ctx,byName:name=>name==='Nidoking'?{...ctx.byName(name),abilities:{0:'Sheer Force'}}:ctx.byName(name)},a=newSet('Nidoking'),d=newSet('Garchomp');
 const calc=(move,effect)=>strongestMatchup(engine,fixed,a,d,gen.moves.get(move),{attackerItem:effect});
 const bare=calc('sludgebomb','none'),orb=calc('sludgebomb','life');assert.equal(orb.attackerAbility,'Sheer Force');assert.ok(orb.hi>bare.hi);assert.equal(orb.lifeOrbRecoil,0);assert.ok(calc('earthquake','life').lifeOrbRecoil>0);
});
test('Item categories use the relevant type/stat and reject damage items on Mega forms',()=>{
 assert.equal(effectItem('choice',gen.moves.get('earthquake')),'Choice Band');assert.equal(effectItem('choice',gen.moves.get('heatwave')),'Choice Specs');assert.equal(effectItem('type',gen.moves.get('heatwave')),'Charcoal');
 assert.equal(hit('Garchomp-Mega','Volcarona','Earthquake',{attackerItem:'life'}),null);
});
test('Battle modifiers affect rolls and entry hazards affect HP before full-HP defenses',()=>{
 const normal=hit('Garchomp','Volcarona','Dragon Claw'),boosted=hit('Garchomp','Volcarona','Dragon Claw',{conditions:{...battleDefaults,helping:true}}),screen=hit('Garchomp','Volcarona','Dragon Claw',{conditions:{...battleDefaults,screens:true}});
 assert.ok(boosted.hi>normal.hi);assert.ok(screen.hi<normal.hi);
 const rocks=hit('Garchomp','Volcarona','Dragon Claw',{conditions:{...battleDefaults,stealthRock:true,leftovers:true}});assert.equal(rocks.entryDamage,Math.floor(rocks.maxHP/2));assert.equal(rocks.hp,rocks.maxHP-rocks.entryDamage);assert.ok(rocks.residual.some(row=>row.name==='Leftovers'&&row.hp>0));
});

test('Automatic ability weather is included unless the field explicitly overrides it',()=>{
 const result=hit('Torkoal','Garchomp','Flamethrower');assert.equal(result.attackerAbility,'Drought');assert.equal(result.weather,'Sun');
 const rain=hit('Torkoal','Garchomp','Flamethrower',{conditions:{...battleDefaults,weather:'Rain'}});assert.equal(rain.weather,'Rain');assert.ok(rain.hi<result.hi);
 assert.equal(hit('Garchomp','Garchomp-Mega','Dragon Claw',{defenderItem:'eviolite'}),null);
});

test('Selected own ability is preserved while the opponent still gets its best ability',()=>{
 const a=newSet('Azumarill'),d=newSet('Hariyama');a.ability='Thick Fat';const result=strongestMatchup(engine,ctx,a,d,gen.moves.get('playrough'),{attackerAbilities:'selected'});assert.equal(result.attackerAbility,'Thick Fat');assert.ok(result.hi<hit('Azumarill','Hariyama','Play Rough').hi);
 const defender=newSet('Azumarill');defender.ability='Thick Fat';const reverse=strongestMatchup(engine,ctx,newSet('Hariyama'),defender,gen.moves.get('closecombat'),{defenderAbilities:'selected'});assert.equal(reverse.defenderAbility,'Thick Fat');
});
test('Selected conditional own abilities activate only from explicit battle state or activation option',()=>{
 const a=newSet('Hariyama'),d=newSet('Garchomp');a.ability='Guts';const options={attackerAbilities:'selected'},normal=strongestMatchup(engine,ctx,a,d,gen.moves.get('closecombat'),options),burn=strongestMatchup(engine,ctx,a,d,gen.moves.get('closecombat'),{...options,conditions:{...battleDefaults,burn:true}});assert.ok(burn.hi>normal.hi);assert.ok(!normal.abilityNotes.some(n=>n.includes('poisoned')));
});
test('Guts, Choice Band, burn, stages, Helping Hand, screens and Grassy Terrain combine exactly as in the engine',()=>{
 const a=newSet('Hariyama'),d=newSet('Garchomp');a.ability='Guts';a.item='Choice Band';d.ability='Rough Skin';const c={...battleDefaults,burn:true,atkStage:1,defStage:1,helping:true,screens:true,terrain:'Grassy'},move=gen.moves.get('earthquake');
 const result=strongestMatchup(engine,ctx,a,d,move,{conditions:c,attackerAbilities:'selected',defenderAbilities:'selected'});
 const reference=engine.calculate(gen,makePokemon(engine,gen,a,{stage:1,burn:true}),makePokemon(engine,gen,d,{stage:1}),new engine.Move(gen,move.name,{ability:a.ability,item:a.item}),new engine.Field({gameType:'Doubles',terrain:'Grassy',attackerSide:{isHelpingHand:true},defenderSide:{isReflect:true,isLightScreen:true}}));assert.deepEqual([result.lo,result.hi],Array.from(reference.range()));assert.ok(result.battleNotes.includes('Helping Hand'));
});
test('Solar Power, Life Orb, Sun, Thick Fat, Assault Vest and screens combine through the engine',()=>{
 const a=newSet('Charizard'),d=newSet('Hariyama');a.ability='Solar Power';a.item='Life Orb';d.ability='Thick Fat';d.item='Assault Vest';const c={...battleDefaults,weather:'Sun',screens:true},move=gen.moves.get('flamethrower'),result=strongestMatchup(engine,ctx,a,d,move,{conditions:c,attackerAbilities:'selected',defenderAbilities:'selected'});
 const reference=engine.calculate(gen,makePokemon(engine,gen,a),makePokemon(engine,gen,d),new engine.Move(gen,move.name,{ability:a.ability,item:a.item}),new engine.Field({gameType:'Doubles',weather:'Sun',defenderSide:{isReflect:true,isLightScreen:true}}));assert.deepEqual([result.lo,result.hi],Array.from(reference.range()));
});
test('Unnerve suppresses resistance berry effects',()=>{
 const a=newSet('Tyranitar'),d=newSet('Garchomp');a.ability='Unnerve';d.ability='Rough Skin';const options={attackerAbilities:'selected',defenderAbilities:'selected'},move=gen.moves.get('icebeam'),bare=strongestMatchup(engine,ctx,a,d,move,options),berry=strongestMatchup(engine,ctx,a,d,move,{...options,defenderItem:'berry'});assert.equal(berry.hi,bare.hi);
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {koChance,hitStatus,attackBenchmarkGroup,defenseBenchmarkGroup,relevantBenchmark} from '../src/core/damage-rolls.js';
test('OHKO labels distinguish guaranteed, possible and survival at the exact HP boundary',()=>{
 assert.equal(hitStatus({lo:100,hi:120,hp:100}).kind,'guaranteed');
 assert.equal(hitStatus({lo:99,hi:100,hp:100}).kind,'possible');
 assert.equal(hitStatus({lo:80,hi:99,hp:100}).kind,'survives');
});
test('KO chance counts every damage roll, including duplicate outcomes',()=>{
 assert.equal(koChance({hp:100,rolls:[90,99,100,100]}),0.5);
 assert.equal(koChance({hp:100,rolls:100}),1);
 assert.equal(koChance({hp:100,rolls:99}),0);
});
test('Multi-hit KO chance combines independent hit rolls rather than comparing each hit to HP',()=>{
 assert.equal(koChance({hp:100,rolls:[[40,60],[40,60]]}),0.75);
 assert.equal(koChance({hp:121,rolls:[[40,60],[40,60]]}),0);
});

test('Four attack groups distinguish guaranteed, unavoidable rolls, avoidable rolls and no OHKO',()=>{
 const bare={lo:90,hi:120,hp:100};assert.equal(attackBenchmarkGroup(bare,{lo:100,hi:120,hp:100}),0);assert.equal(attackBenchmarkGroup(bare,{lo:99,hi:100,hp:100}),1);assert.equal(attackBenchmarkGroup(bare,{lo:80,hi:99,hp:100}),2);assert.equal(attackBenchmarkGroup({lo:80,hi:99,hp:100},{lo:40,hi:60,hp:100}),3);
});

test('Defensive groups distinguish a roll at zero investment from investment-dependent OHKOs',()=>{
 const high={lo:110,hi:130,hp:100};assert.equal(defenseBenchmarkGroup({lo:100,hi:120,hp:100},high),0);assert.equal(defenseBenchmarkGroup({lo:90,hi:100,hp:100},high),1);assert.equal(defenseBenchmarkGroup({lo:70,hi:99,hp:100},high),2);assert.equal(defenseBenchmarkGroup({lo:50,hi:70,hp:100},{lo:80,hi:99,hp:100}),3);
});
test('Relevant benchmark chooses the first safe bulk and the strongest safe opposing offense',()=>{
 const unsafe={lo:90,hi:110,hp:100},safe={lo:70,hi:99,hp:100},safer={lo:40,hi:60,hp:100};
 assert.equal(relevantBenchmark({hit:unsafe,neutralHit:safe,bulkHit:safer},'attack',2).key,'neutralHit');assert.equal(relevantBenchmark({hit:unsafe,neutralHit:unsafe,bulkHit:safe},'attack',2).key,'bulkHit');
 assert.equal(relevantBenchmark({hit:unsafe,neutralHit:safe,zeroHit:safer},'defend',2).key,'neutralHit');assert.equal(relevantBenchmark({hit:unsafe,neutralHit:unsafe,zeroHit:safe},'defend',2).key,'zeroHit');
 assert.equal(relevantBenchmark({hit:safe,neutralHit:safer,zeroHit:safer},'defend',3).key,'hit');assert.equal(relevantBenchmark({hit:unsafe,zeroHit:unsafe},'defend',0).key,'zeroHit');
});

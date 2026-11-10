import test from 'node:test';
import assert from 'node:assert/strict';
import { rhythmDoses, airwayEstimate } from '../app/clinical-additions';
test('AHA rhythm doses preserve minimum, first and subsequent maximum doses', () => {
 assert.equal(rhythmDoses(3).atropine,.1);
 assert.equal(rhythmDoses(20).atropine,.4);
 assert.equal(rhythmDoses(50).atropine,.5);
 assert.equal(rhythmDoses(80).adenosineFirst,6);
 assert.equal(rhythmDoses(80).adenosineSecond,12);
 assert.equal(rhythmDoses(40).amiodaroneFirst,200);
 assert.equal(rhythmDoses(40).amiodaroneRepeat,150);
 assert.equal(rhythmDoses(80).amiodaroneFirst,300);
});
test('tube diameter and oral depth use independent age estimates', () => {
 assert.deepEqual(airwayEstimate(2),{cuffed:4,uncuffed:4.5,depth:13});
 assert.deepEqual(airwayEstimate(8),{cuffed:5.5,uncuffed:6,depth:16});
});

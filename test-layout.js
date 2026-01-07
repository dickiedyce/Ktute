import { parseCombinedLayout } from './src/keyboard/layout-parser.js';

const input = `[layout:corne-workman]
rows: 3
columns: 15,15
thumb: 3,3
split: true
stagger: none

row0: ¦     q:1 ¦     ¦ ¦   d:1 ¦   ¦ ¦   r:1 ¦   ¦ ¦   w:1 ¦   | ¦   f:1 ¦   ¦ ¦   u:1 ¦   ¦ ¦   p:1 ¦   ¦ ¦   ;:1 ¦
row1: bsp:1 a:1 tab:1 ¦ _:1 s:1 b:1 ¦ _:1 h:1 c:1 ¦ _:1 t:1 g:1 | y:1 n:1 ~:1 ¦ j:1 e:1 \\:1 ¦ k:1 o:1 _:1 ¦ _:1 i:1 ':1  
row2: ¦     z:1 ¦     ¦ ¦   x:1 ¦   ¦ ¦   m:1 ¦   ¦ ¦   c:1 ¦   | ¦   l:1 ¦   ¦ ¦   ,:1 ¦   ¦ ¦   .:1 ¦   ¦ ¦   /:1 ¦

thumb: gui alt spc | ent alt ctrl

fingers:
row0: 1 2 3 4 | 5 6 7 8
row1: 1 1 1 2 2 2 3 3 3 4 4 4 | 5 5 5 6 6 6 7 7 7 8 8 8
row2: 1 2 3 4 | 5 6 7 8
thumb: 4 4 4 | 5 5 5`;

const result = parseCombinedLayout(input);

console.log('\n=== Physical Keys ===');
const leftRow0 = result.physical.keys.filter(k => k.hand === 'left' && k.row === 0);
console.log('Left hand row 0:', leftRow0.map(k => `col ${k.col}`));

console.log('\n=== Mapping Keys ===');
console.log('First 20 labels:', result.mapping.layers[0].keys.slice(0, 20));

console.log('\n=== Left Hand Row 0 Details ===');
leftRow0.forEach((k, i) => {
  const label = result.mapping.layers[0].keys[result.physical.keys.indexOf(k)];
  console.log(`Key ${i}: col=${k.col}, label="${label}"`);
});

console.log('\n=== Row Widths ===');
const leftKeys = result.physical.keys.filter(k => k.hand === 'left' && !k.isThumb);
const leftRowWidths = {};
for (const key of leftKeys) {
  const keyEnd = key.col + (key.width || 1);
  leftRowWidths[key.row] = Math.max(leftRowWidths[key.row] || 0, keyEnd);
}
console.log('Row widths:', leftRowWidths);
console.log('Max width:', Math.max(...Object.values(leftRowWidths)));

console.log('\n=== Finger Assignments ===');
console.log('Total fingers:', result.mapping.fingers?.length);
console.log('First 30 fingers:', result.mapping.fingers?.slice(0, 30));

console.log('\n=== Keys with Fingers ===');
result.physical.keys.slice(0, 15).forEach((k, i) => {
  const label = result.mapping.layers[0].keys[i];
  const finger = result.mapping.fingers?.[i];
  console.log(`Key ${i}: label="${label}", finger=${finger}, row=${k.row}, col=${k.col}, hand=${k.hand}`);
});

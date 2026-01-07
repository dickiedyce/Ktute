import { parseCombinedLayout } from './src/keyboard/layout-parser.js';

const input = `[layout:with-gaps]
rows: 2
columns: 5,5
split: true

row0: ¦ q ¦ w ¦ | ¦ e ¦ r ¦
row1: a s d f g | h j k l ;
`;

const { physical, mapping } = parseCombinedLayout(input);

console.log('Total physical keys:', physical.keys.length);

const leftRow0 = physical.keys.filter(k => k.hand === 'left' && k.row === 0);
console.log('\nLeft row 0 keys:', leftRow0.length);
console.log('Positions:', leftRow0.map(k => k.col));

const rightRow0 = physical.keys.filter(k => k.hand === 'right' && k.row === 0);
console.log('\nRight row 0 keys:', rightRow0.length);
console.log('Positions:', rightRow0.map(k => k.col));

console.log('\nTest results:');
console.log('✓ Total keys =', physical.keys.length === 14);
console.log('✓ Left row 0[0].col =', leftRow0[0].col === 0.25);
console.log('✓ Left row 0[1].col =', leftRow0[1].col === 1.5);
console.log('✓ Right row 0[0].col =', rightRow0[0].col === 0.25);
console.log('✓ Right row 0[1].col =', rightRow0[1].col === 1.5);

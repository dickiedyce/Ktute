import { parseCombinedLayout } from './src/keyboard/layout-parser.js';

// Test 1: Default gaps (1.0 width)
const input1 = `[layout:with-gaps]
rows: 2
columns: 5,5
split: true

row0: ¦ q ¦ w ¦ | ¦ e ¦ r ¦
row1: a s d f g | h j k l ;
`;

const result1 = parseCombinedLayout(input1);
console.log('=== Test 1: Default Gaps (1.0) ===');
console.log('All left keys:', result1.physical.keys.filter(k => k.hand === 'left').map(k => ({ row: k.row, col: k.col })));
const leftRow0_1 = result1.physical.keys.filter(k => k.hand === 'left' && k.row === 0);
console.log('Left row 0 count:', leftRow0_1.length);
console.log('Left row 0 positions:', leftRow0_1.map(k => k.col));
console.log('Expected: [1, 3]');
console.log('✓ Correct:', leftRow0_1[0].col === 1 && leftRow0_1[1].col === 3);

// Test 2: Custom gap widths
const input2 = `[layout:custom-gaps]
rows: 1
columns: 4,4
split: true

row0: ¦:0.25 a ¦:0.5 b | c ¦:0.25 d ¦
`;

const result2 = parseCombinedLayout(input2);
console.log('\n=== Test 2: Custom Gap Widths ===');
const leftRow0_2 = result2.physical.keys.filter(k => k.hand === 'left' && k.row === 0);
const rightRow0_2 = result2.physical.keys.filter(k => k.hand === 'right' && k.row === 0);
console.log('Left row 0 positions:', leftRow0_2.map(k => k.col));
console.log('Expected: [0.25, 1.75]');
console.log('✓ Left correct:', leftRow0_2[0].col === 0.25 && leftRow0_2[1].col === 1.75);
console.log('Right row 0 positions:', rightRow0_2.map(k => k.col));
console.log('Expected: [0, 1.25]');
console.log('✓ Right correct:', rightRow0_2[0].col === 0 && rightRow0_2[1].col === 1.25);

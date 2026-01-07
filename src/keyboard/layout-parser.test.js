import { describe, it, expect } from 'vitest';
import { parsePhysicalLayout, parseKeyMapping, parseCombinedLayout } from './layout-parser.js';

describe('Layout Parser', () => {
  describe('parsePhysicalLayout', () => {
    it('should parse a simple physical layout definition', () => {
      const input = `
[physical:corne]
rows: 3
columns: 6,6
thumb: 3,3
split: true
stagger: none

row0: 1 1 1 1 1 1 | 1 1 1 1 1 1
row1: 1 1 1 1 1 1 | 1 1 1 1 1 1
row2: 1 1 1 1 1 1 | 1 1 1 1 1 1
thumb: 1 1 1 | 1 1 1
`;
      const layout = parsePhysicalLayout(input);
      
      expect(layout.name).toBe('corne');
      expect(layout.rows).toBe(3);
      expect(layout.columns).toEqual([6, 6]);
      expect(layout.thumb).toEqual([3, 3]);
      expect(layout.split).toBe(true);
      expect(layout.stagger).toBe('none');
    });

    it('should return key positions', () => {
      const input = `
[physical:test]
rows: 2
columns: 3,3
split: true

row0: 1 1 1 | 1 1 1
row1: 1 1 1 | 1 1 1
`;
      const layout = parsePhysicalLayout(input);
      
      expect(layout.keys).toHaveLength(12);
      expect(layout.keys[0]).toEqual({ row: 0, col: 0, width: 1, hand: 'left', isThumb: false });
      expect(layout.keys[3]).toEqual({ row: 0, col: 0, width: 1, hand: 'right', isThumb: false });
    });

    it('should handle gaps in layout (0 = no key)', () => {
      const input = `
[physical:gapped]
rows: 2
columns: 3,3
split: true

row0: 1 0 1 | 1 1 1
row1: 1 1 1 | 1 0 1
`;
      const layout = parsePhysicalLayout(input);
      
      // Should only have 10 keys (2 gaps)
      expect(layout.keys).toHaveLength(10);
    });

    it('should treat broken bar as gap and underscore as blank key', () => {
      const input = `
[layout:with-gaps-and-blanks]
rows: 2
columns: 5,0
split: false

row0: q w e r t
row1: a ¦ c _ e
`;
      const { physical, mapping } = parseCombinedLayout(input);
      
      // Row 1 should have 4 keys (1 gap marked with ¦)
      const row1Keys = physical.keys.filter(k => k.row === 1);
      expect(row1Keys).toHaveLength(4);
      
      // Mapping should have 9 keys total (5 + 4), including _ as a blank label
      expect(mapping.layers[0].keys).toHaveLength(9);
      expect(mapping.layers[0].keys).toContain('_');  // _ is a valid blank key
      expect(mapping.layers[0].keys).not.toContain('¦'); // ¦ is a gap
    });

    it('should treat broken bar as gap in combined layout format', () => {
      const input = `
[layout:with-gaps]
rows: 2
columns: 5,0
split: false

row0: q w e r t
row1: a ¦ c ¦ e
`;
      const { physical, mapping } = parseCombinedLayout(input);
      
      // Row 1 should have 3 keys (2 gaps marked with ¦)
      const row1Keys = physical.keys.filter(k => k.row === 1);
      expect(row1Keys).toHaveLength(3);
      
      // Mapping should have 8 keys total (5 + 3)
      expect(mapping.layers[0].keys).toHaveLength(8);
      expect(mapping.layers[0].keys).not.toContain('¦');
    });

    it('should support wider keys with width values', () => {
      const input = `
[physical:wider]
rows: 2
columns: 5,0
split: false

row0: 1 1 1 1 1
row1: 1.5 1 1 1 1.5
`;
      const layout = parsePhysicalLayout(input);
      
      expect(layout.keys).toHaveLength(10);
      
      // Row 0 should all be width 1
      const row0Keys = layout.keys.filter(k => k.row === 0);
      expect(row0Keys.every(k => k.width === 1)).toBe(true);
      
      // Row 1 should have 1.5 width on edges
      const row1Keys = layout.keys.filter(k => k.row === 1).sort((a, b) => a.col - b.col);
      expect(row1Keys[0].width).toBe(1.5);
      expect(row1Keys[1].width).toBe(1);
      expect(row1Keys[4].width).toBe(1.5);
    });

    it('should include thumb keys', () => {
      const input = `
[physical:thumbs]
rows: 1
columns: 3,3
thumb: 2,2
split: true

row0: 1 1 1 | 1 1 1
thumb: 1 1 | 1 1
`;
      const layout = parsePhysicalLayout(input);
      
      const thumbKeys = layout.keys.filter(k => k.isThumb);
      expect(thumbKeys).toHaveLength(4);
    });
  });

  describe('parseKeyMapping', () => {
    it('should parse key mapping definition', () => {
      const input = `
[mapping:colemak-dh]
base: corne

row0: q w f p b | j l u y ;
row1: a r s t g | m n e i o
row2: z x c d v | k h , . /
thumb: esc spc tab | ent bspc del
`;
      const mapping = parseKeyMapping(input);
      
      expect(mapping.name).toBe('colemak-dh');
      expect(mapping.base).toBe('corne');
      expect(mapping.layers).toHaveLength(1);
      expect(mapping.layers[0].keys).toContain('q');
      expect(mapping.layers[0].keys).toContain('esc');
    });

    it('should parse multiple layers', () => {
      const input = `
[mapping:multi-layer]
base: corne

row0: q w e | r t y
thumb: spc | ent

[layer:1]
row0: 1 2 3 | 4 5 6
thumb: _ | _
`;
      const mapping = parseKeyMapping(input);
      
      expect(mapping.layers).toHaveLength(2);
      expect(mapping.layers[0].keys).toContain('q');
      expect(mapping.layers[1].keys).toContain('1');
    });

    it('should parse finger assignments', () => {
      const input = `
[mapping:with-fingers]
base: corne

row0: q w e | r t y

fingers:
row0: 1 2 3 | 6 7 8
`;
      const mapping = parseKeyMapping(input);
      
      expect(mapping.fingers).toBeDefined();
      expect(mapping.fingers).toContain(1);
      expect(mapping.fingers).toContain(8);
    });

    it('should handle special keys', () => {
      const input = `
[mapping:specials]
base: test

row0: ctrl+a alt+tab shift+1 | cmd+c cmd+v cmd+z
`;
      const mapping = parseKeyMapping(input);
      
      expect(mapping.layers[0].keys).toContain('ctrl+a');
      expect(mapping.layers[0].keys).toContain('cmd+z');
    });
  });

  describe('parseCombinedLayout', () => {
    it('should parse a combined layout with keys', () => {
      const input = `
[layout:test-layout]
rows: 2
columns: 3,3
split: true

row0: q w e | r t y
row1: a s d | f g h
`;
      const { physical, mapping } = parseCombinedLayout(input);
      
      expect(physical.name).toBe('test-layout');
      expect(physical.rows).toBe(2);
      expect(physical.keys).toHaveLength(12);
      expect(mapping.layers[0].keys).toContain('q');
      expect(mapping.layers[0].keys).toContain('h');
    });

    it('should support key:width syntax for wider keys', () => {
      const input = `
[layout:wide-keys]
rows: 2
columns: 5,0
split: false

row0: q w e r t
row1: shift:1.5 a s d shift:1.5
`;
      const { physical, mapping } = parseCombinedLayout(input);
      
      expect(physical.keys).toHaveLength(10);
      
      // Check widths in row 1
      const row1Keys = physical.keys.filter(k => k.row === 1).sort((a, b) => a.col - b.col);
      expect(row1Keys[0].width).toBe(1.5); // first shift
      expect(row1Keys[1].width).toBe(1);   // a
      expect(row1Keys[4].width).toBe(1.5); // second shift
      
      // Check key labels are captured
      expect(mapping.layers[0].keys).toContain('shift');
      expect(mapping.layers[0].keys).toContain('a');
    });

    it('should treat numeric tokens as key labels in combined layout format', () => {
      const input = `
[layout:number-row]
rows: 2
columns: 5,0
split: false

row0: 1 2 3 4 5
row1: a b c d e
`;
      const { physical, mapping } = parseCombinedLayout(input);
      
      expect(physical.keys).toHaveLength(10);
      
      // All row0 keys should have width 1 (not be treated as widths)
      const row0Keys = physical.keys.filter(k => k.row === 0);
      expect(row0Keys).toHaveLength(5);
      row0Keys.forEach(k => {
        expect(k.width).toBe(1);
      });
      
      // Numeric tokens should be captured as key labels
      expect(mapping.layers[0].keys).toContain('1');
      expect(mapping.layers[0].keys).toContain('2');
      expect(mapping.layers[0].keys).toContain('5');
      expect(mapping.layers[0].keys).toContain('a');
    });

    it('should treat 0 as key label in combined format, use ¦ for gaps', () => {
      const input = `
[layout:with-zero]
rows: 1
columns: 11,0
split: false

row0: 1 2 3 4 5 6 7 8 9 0 ¦
`;
      const { physical, mapping } = parseCombinedLayout(input);
      
      // Should have 10 keys (11 positions - 1 gap)
      expect(physical.keys).toHaveLength(10);
      
      // 0 should be a key label, not a gap
      expect(mapping.layers[0].keys).toContain('0');
      expect(mapping.layers[0].keys).toHaveLength(10);
    });

    it('should support thumb row with wider keys', () => {
      const input = `
[layout:thumb-wide]
rows: 1
columns: 3,3
thumb: 2,2
split: true

row0: q w e | r t y
thumb: ctrl spc:2 | ent:2 alt
`;
      const { physical, mapping } = parseCombinedLayout(input);
      
      const thumbKeys = physical.keys.filter(k => k.isThumb);
      expect(thumbKeys).toHaveLength(4);
      
      // Find the space key (spc:2)
      const leftThumb = thumbKeys.filter(k => k.hand === 'left').sort((a, b) => a.col - b.col);
      expect(leftThumb[0].width).toBe(1);  // ctrl
      expect(leftThumb[1].width).toBe(2);  // spc
      
      // Find the enter key (ent:2)
      const rightThumb = thumbKeys.filter(k => k.hand === 'right').sort((a, b) => a.col - b.col);
      expect(rightThumb[0].width).toBe(2); // ent
      expect(rightThumb[1].width).toBe(1); // alt
      
      expect(mapping.layers[0].keys).toContain('spc');
      expect(mapping.layers[0].keys).toContain('ent');
    });

    it('should support key:width syntax for non-split keyboards', () => {
      const input = `
[layout:standard60]
rows: 2
columns: 6,0
split: false

row0: tab:1.5 q w e r t
row1: ctrl:1.75 a s d f g
`;
      const { physical, mapping } = parseCombinedLayout(input);
      
      expect(physical.keys).toHaveLength(12);
      expect(physical.split).toBe(false);
      
      // Check widths in row 0
      const row0Keys = physical.keys.filter(k => k.row === 0).sort((a, b) => a.col - b.col);
      expect(row0Keys[0].width).toBe(1.5); // tab
      expect(row0Keys[1].width).toBe(1);   // q
      
      // Check column positions advance correctly with width
      expect(row0Keys[0].col).toBe(0);     // tab at col 0
      expect(row0Keys[1].col).toBe(1.5);   // q at col 1.5 (after 1.5-wide tab)
      expect(row0Keys[2].col).toBe(2.5);   // w at col 2.5
      
      // Check widths in row 1
      const row1Keys = physical.keys.filter(k => k.row === 1).sort((a, b) => a.col - b.col);
      expect(row1Keys[0].width).toBe(1.75); // ctrl
      expect(row1Keys[1].width).toBe(1);    // a
      expect(row1Keys[0].col).toBe(0);      // ctrl at col 0
      expect(row1Keys[1].col).toBe(1.75);   // a at col 1.75 (after 1.75-wide ctrl)
      
      // Check key labels
      expect(mapping.layers[0].keys).toContain('tab');
      expect(mapping.layers[0].keys).toContain('ctrl');
    });
  });
});

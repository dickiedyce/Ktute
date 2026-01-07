import { describe, it, expect } from 'vitest';
import { parsePhysicalLayout, parseKeyMapping } from './layout-parser.js';

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
      expect(layout.keys[0]).toEqual({ row: 0, col: 0, hand: 'left', isThumb: false });
      expect(layout.keys[3]).toEqual({ row: 0, col: 0, hand: 'right', isThumb: false });
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
});

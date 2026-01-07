import { describe, it, expect } from 'vitest';
import { getBuiltinPhysicalLayouts, CORNE, ERGODOX, SVAALBOARD } from './physical-layouts.js';
import { getBuiltinKeyMappings, getMappingsForLayout } from './key-mappings.js';
import { parsePhysicalLayout, parseKeyMapping } from './layout-parser.js';

describe('Built-in Physical Layouts', () => {
  it('should provide all built-in layouts', () => {
    const layouts = getBuiltinPhysicalLayouts();
    expect(layouts.corne).toBeDefined();
    expect(layouts.ergodox).toBeDefined();
    expect(layouts.svaalboard).toBeDefined();
    expect(layouts.standard60).toBeDefined();
  });

  it('should parse Corne layout correctly', () => {
    const layout = parsePhysicalLayout(CORNE);
    expect(layout.name).toBe('corne');
    expect(layout.rows).toBe(3);
    expect(layout.split).toBe(true);
    // 36 main keys + 6 thumb keys = 42
    expect(layout.keys).toHaveLength(42);
  });

  it('should parse Ergodox layout correctly', () => {
    const layout = parsePhysicalLayout(ERGODOX);
    expect(layout.name).toBe('ergodox');
    expect(layout.split).toBe(true);
    expect(layout.keys.length).toBeGreaterThan(50);
  });

  it('should parse Svaalboard layout correctly', () => {
    const layout = parsePhysicalLayout(SVAALBOARD);
    expect(layout.name).toBe('svaalboard');
    expect(layout.rows).toBe(4);
    expect(layout.split).toBe(true);
  });
});

describe('Built-in Key Mappings', () => {
  it('should provide all built-in mappings', () => {
    const mappings = getBuiltinKeyMappings();
    expect(mappings['qwerty']).toBeDefined();
    expect(mappings['colemak-dh']).toBeDefined();
    expect(mappings['workman']).toBeDefined();
    expect(mappings['dvorak']).toBeDefined();
  });

  it('should parse QWERTY mapping correctly', () => {
    const mappings = getBuiltinKeyMappings();
    const mapping = parseKeyMapping(mappings['qwerty']);
    expect(mapping.name).toBe('qwerty');
    expect(mapping.base).toBe('corne');
    expect(mapping.layers[0].keys).toContain('q');
    expect(mapping.fingers).toBeDefined();
  });

  it('should parse Colemak-DH mapping with multiple layers', () => {
    const mappings = getBuiltinKeyMappings();
    const mapping = parseKeyMapping(mappings['colemak-dh']);
    expect(mapping.name).toBe('colemak-dh');
    expect(mapping.layers).toHaveLength(2);
    expect(mapping.layers[1].keys).toContain('1');
  });

  it('should get mappings for specific layout', () => {
    const corneMappings = getMappingsForLayout('corne');
    expect(corneMappings['qwerty']).toBeDefined();
    expect(corneMappings['colemak-dh']).toBeDefined();
    
    const ergodoxMappings = getMappingsForLayout('ergodox');
    expect(ergodoxMappings['qwerty-ergodox']).toBeDefined();
  });
});

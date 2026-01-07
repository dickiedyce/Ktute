/**
 * Built-in Key Mappings
 * Logical layouts: QWERTY, Colemak-DH, Workman, Dvorak
 */

/**
 * QWERTY mapping for Corne
 */
export const QWERTY_CORNE = `
[mapping:qwerty]
base: corne

row0: tab q w e r t | y u i o p bspc
row1: ctrl a s d f g | h j k l ; '
row2: shift z x c v b | n m , . / shift
thumb: gui alt spc | ent alt ctrl

fingers:
row0: 1 1 2 3 4 4 | 5 5 6 7 8 8
row1: 1 1 2 3 4 4 | 5 5 6 7 8 8
row2: 1 1 2 3 4 4 | 5 5 6 7 8 8
thumb: 4 4 4 | 5 5 5
`;

/**
 * Colemak-DH mapping for Corne
 */
export const COLEMAK_DH_CORNE = `
[mapping:colemak-dh]
base: corne

row0: tab q w f p b | j l u y ; bspc
row1: ctrl a r s t g | m n e i o '
row2: shift z x c d v | k h , . / shift
thumb: gui alt spc | ent alt ctrl

[layer:1]
row0: \` 1 2 3 4 5 | 6 7 8 9 0 del
row1: _ ! @ # $ % | ^ & * ( ) _
row2: _ ~ \\ | - = | + [ ] { } _
thumb: _ _ _ | _ _ _

fingers:
row0: 1 1 2 3 4 4 | 5 5 6 7 8 8
row1: 1 1 2 3 4 4 | 5 5 6 7 8 8
row2: 1 1 2 3 4 4 | 5 5 6 7 8 8
thumb: 4 4 4 | 5 5 5
`;

/**
 * Workman mapping for Corne
 */
export const WORKMAN_CORNE = `
[mapping:workman]
base: corne

row0: tab q d r w b | j f u p ; bspc
row1: ctrl a s h t g | y n e o i '
row2: shift z x m c v | k l , . / shift
thumb: gui alt spc | ent alt ctrl

fingers:
row0: 1 1 2 3 4 4 | 5 5 6 7 8 8
row1: 1 1 2 3 4 4 | 5 5 6 7 8 8
row2: 1 1 2 3 4 4 | 5 5 6 7 8 8
thumb: 4 4 4 | 5 5 5
`;

/**
 * Dvorak mapping for Corne
 */
export const DVORAK_CORNE = `
[mapping:dvorak]
base: corne

row0: tab ' , . p y | f g c r l bspc
row1: ctrl a o e u i | d h t n s -
row2: shift ; q j k x | b m w v z shift
thumb: gui alt spc | ent alt ctrl

fingers:
row0: 1 1 2 3 4 4 | 5 5 6 7 8 8
row1: 1 1 2 3 4 4 | 5 5 6 7 8 8
row2: 1 1 2 3 4 4 | 5 5 6 7 8 8
thumb: 4 4 4 | 5 5 5
`;

/**
 * QWERTY mapping for Ergodox
 */
export const QWERTY_ERGODOX = `
[mapping:qwerty-ergodox]
base: ergodox

row0: = 1 2 3 4 5 esc | esc 6 7 8 9 0 -
row1: tab q w e r t | y u i o p \\
row2: ctrl a s d f g [ | ] h j k l ; '
row3: shift z x c v b | n m , . / shift
row4: \` gui alt left right | up down [ ] ctrl
thumb: del bspc gui | alt ent spc

fingers:
row0: 1 1 2 3 4 4 4 | 5 5 5 6 7 8 8
row1: 1 1 2 3 4 4 | 5 5 6 7 8 8
row2: 1 1 2 3 4 4 4 | 5 5 5 6 7 8 8
row3: 1 1 2 3 4 4 | 5 5 6 7 8 8
row4: 1 1 2 3 4 | 5 6 7 8 8
thumb: 4 4 4 4 | 5 5 5 5
`;

/**
 * Get all built-in key mappings
 * @returns {Object} Mapping name -> definition
 */
export function getBuiltinKeyMappings() {
  return {
    'qwerty': QWERTY_CORNE,
    'colemak-dh': COLEMAK_DH_CORNE,
    'workman': WORKMAN_CORNE,
    'dvorak': DVORAK_CORNE,
    'qwerty-ergodox': QWERTY_ERGODOX,
  };
}

/**
 * Get mappings for a specific physical layout
 * @param {string} layoutName
 * @returns {Object} Mapping name -> definition
 */
export function getMappingsForLayout(layoutName) {
  const allMappings = getBuiltinKeyMappings();
  const result = {};
  
  for (const [name, def] of Object.entries(allMappings)) {
    if (def.includes(`base: ${layoutName}`)) {
      result[name] = def;
    }
  }
  
  return result;
}

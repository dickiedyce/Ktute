/**
 * Combined Layouts
 * Complete keyboard definitions with physical structure and key labels
 */

import { storage } from '../core/storage.js';

const CUSTOM_LAYOUTS_KEY = 'custom-layouts';

/**
 * Built-in combined layouts
 * Each layout includes both physical structure and key mapping
 */
export const BUILTIN_LAYOUTS = {
  'corne-colemak-dh': {
    name: 'Corne • Colemak-DH',
    definition: `[layout:corne-colemak-dh]
rows: 3
columns: 6,6
thumb: 3,3
split: true
stagger: none

row0: tab q w f p b | j l u y ; bspc
row1: ctrl a r s t g | m n e i o '
row2: shift z x c d v | k h , . / shift
thumb: gui alt spc | ent alt ctrl

fingers:
row0: 1 1 2 3 4 4 | 5 5 6 7 8 8
row1: 1 1 2 3 4 4 | 5 5 6 7 8 8
row2: 1 1 2 3 4 4 | 5 5 6 7 8 8
thumb: 4 4 4 | 5 5 5
`,
  },
  'corne-qwerty': {
    name: 'Corne • QWERTY',
    definition: `[layout:corne-qwerty]
rows: 3
columns: 6,6
thumb: 3,3
split: true
stagger: none

row0: tab q w e r t | y u i o p bspc
row1: ctrl a s d f g | h j k l ; '
row2: shift z x c v b | n m , . / shift
thumb: gui alt spc | ent alt ctrl

fingers:
row0: 1 1 2 3 4 4 | 5 5 6 7 8 8
row1: 1 1 2 3 4 4 | 5 5 6 7 8 8
row2: 1 1 2 3 4 4 | 5 5 6 7 8 8
thumb: 4 4 4 | 5 5 5
`,
  },
  'corne-workman': {
    name: 'Corne • Workman',
    definition: `[layout:corne-workman]
rows: 3
columns: 6,6
thumb: 3,3
split: true
stagger: none

row0: tab q d r w b | j f u p ; bspc
row1: ctrl a s h t g | y n e o i '
row2: shift z x m c v | k l , . / shift
thumb: gui alt spc | ent alt ctrl

fingers:
row0: 1 1 2 3 4 4 | 5 5 6 7 8 8
row1: 1 1 2 3 4 4 | 5 5 6 7 8 8
row2: 1 1 2 3 4 4 | 5 5 6 7 8 8
thumb: 4 4 4 | 5 5 5
`,
  },
  'corne-dvorak': {
    name: 'Corne • Dvorak',
    definition: `[layout:corne-dvorak]
rows: 3
columns: 6,6
thumb: 3,3
split: true
stagger: none

row0: tab ' , . p y | f g c r l bspc
row1: ctrl a o e u i | d h t n s -
row2: shift ; q j k x | b m w v z shift
thumb: gui alt spc | ent alt ctrl

fingers:
row0: 1 1 2 3 4 4 | 5 5 6 7 8 8
row1: 1 1 2 3 4 4 | 5 5 6 7 8 8
row2: 1 1 2 3 4 4 | 5 5 6 7 8 8
thumb: 4 4 4 | 5 5 5
`,
  },
  'ergodox-qwerty': {
    name: 'Ergodox • QWERTY',
    definition: `[layout:ergodox-qwerty]
rows: 5
columns: 7,7
thumb: 4,4
split: true
stagger: columnar

row0: = 1 2 3 4 5 esc | esc 6 7 8 9 0 -
row1: tab q w e r t 0 | 0 y u i o p \\
row2: ctrl a s d f g [ | ] h j k l ; '
row3: shift z x c v b 0 | 0 n m , . / shift
row4: \` gui alt left right 0 0 | 0 0 up down [ ] ctrl
thumb: del bspc gui alt | alt gui ent spc

fingers:
row0: 1 1 2 3 4 4 4 | 5 5 5 6 7 8 8
row1: 1 1 2 3 4 4 4 | 5 5 5 6 7 8 8
row2: 1 1 2 3 4 4 4 | 5 5 5 6 7 8 8
row3: 1 1 2 3 4 4 4 | 5 5 5 6 7 8 8
row4: 1 1 2 3 4 4 4 | 5 5 5 6 7 8 8
thumb: 4 4 4 4 | 5 5 5 5
`,
  },
  'svaalboard-colemak-dh': {
    name: 'Svaalboard • Colemak-DH',
    definition: `[layout:svaalboard-colemak-dh]
rows: 4
columns: 6,6
thumb: 4,4
split: true
stagger: none

row0: \` 1 2 3 4 5 | 6 7 8 9 0 -
row1: tab q w f p b | j l u y ; bspc
row2: ctrl a r s t g | m n e i o '
row3: shift z x c d v | k h , . / shift
thumb: gui alt spc ent | ent spc alt ctrl

fingers:
row0: 1 1 2 3 4 4 | 5 5 6 7 8 8
row1: 1 1 2 3 4 4 | 5 5 6 7 8 8
row2: 1 1 2 3 4 4 | 5 5 6 7 8 8
row3: 1 1 2 3 4 4 | 5 5 6 7 8 8
thumb: 4 4 4 4 | 5 5 5 5
`,
  },
  'standard60-qwerty': {
    name: 'Standard 60% • QWERTY',
    definition: `[layout:standard60-qwerty]
rows: 5
columns: 14,0
thumb: 0,0
split: false
stagger: standard

row0: esc 1 2 3 4 5 6 7 8 9 0 - = bspc
row1: tab q w e r t y u i o p [ ] \\
row2: caps a s d f g h j k l ; ' ent 0
row3: shift z x c v b n m , . / shift 0 0
row4: ctrl gui alt spc 0 0 0 0 0 0 alt gui menu ctrl

fingers:
row0: 1 1 2 3 4 4 4 5 5 5 6 7 8 8
row1: 1 1 2 3 4 4 5 5 6 7 8 8 8 8
row2: 1 1 2 3 4 4 5 5 6 7 8 8 8 8
row3: 1 1 2 3 4 4 5 5 6 7 8 8 8 8
row4: 1 1 2 4 4 4 4 4 5 5 5 7 8 8
`,
  },
};

/**
 * Get all built-in layouts
 * @returns {Object}
 */
export function getBuiltinLayouts() {
  return BUILTIN_LAYOUTS;
}

/**
 * Get all custom layouts from storage
 * @returns {Object}
 */
export function getCustomLayouts() {
  return storage.get(CUSTOM_LAYOUTS_KEY, {});
}

/**
 * Get all layouts (built-in + custom)
 * @returns {Object}
 */
export function getAllLayouts() {
  return { ...BUILTIN_LAYOUTS, ...getCustomLayouts() };
}

/**
 * Save a custom layout
 * @param {string} id - Unique layout ID
 * @param {string} name - Display name
 * @param {string} definition - Layout definition text
 */
export function saveCustomLayout(id, name, definition) {
  const layouts = getCustomLayouts();
  layouts[id] = { name, definition, custom: true };
  storage.set(CUSTOM_LAYOUTS_KEY, layouts);
}

/**
 * Delete a custom layout
 * @param {string} id - Layout ID
 * @returns {boolean} - True if deleted
 */
export function deleteCustomLayout(id) {
  const layouts = getCustomLayouts();
  if (layouts[id]) {
    delete layouts[id];
    storage.set(CUSTOM_LAYOUTS_KEY, layouts);
    return true;
  }
  return false;
}

/**
 * Get a layout by ID
 * @param {string} id - Layout ID
 * @returns {Object|null}
 */
export function getLayout(id) {
  const all = getAllLayouts();
  return all[id] || null;
}

/**
 * Check if a layout exists
 * @param {string} id - Layout ID
 * @returns {boolean}
 */
export function layoutExists(id) {
  return !!getLayout(id);
}

/**
 * Generate a unique ID from a name
 * @param {string} name
 * @returns {string}
 */
export function generateLayoutId(name) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  let id = base;
  let counter = 1;
  
  while (layoutExists(id)) {
    id = `${base}-${counter}`;
    counter++;
  }
  
  return id;
}

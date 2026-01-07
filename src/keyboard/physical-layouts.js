/**
 * Built-in Physical Keyboard Layouts
 * Definitions for Corne, Ergodox, Svaalboard, and Standard
 */

/**
 * Corne / Helix / CRKBD layout
 * 3x6 + 3 thumb keys per side
 */
export const CORNE = `
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

/**
 * Ergodox / Ergodox EZ layout
 * 5x7 + 4 thumb keys per side (simplified)
 */
export const ERGODOX = `
[physical:ergodox]
rows: 5
columns: 7,7
thumb: 4,4
split: true
stagger: columnar

row0: 1 1 1 1 1 1 1 | 1 1 1 1 1 1 1
row1: 1 1 1 1 1 1 0 | 0 1 1 1 1 1 1
row2: 1 1 1 1 1 1 1 | 1 1 1 1 1 1 1
row3: 1 1 1 1 1 1 0 | 0 1 1 1 1 1 1
row4: 1 1 1 1 1 0 0 | 0 0 1 1 1 1 1
thumb: 1 1 1 1 | 1 1 1 1
`;

/**
 * Svaalboard layout
 * Custom split ortholinear
 */
export const SVAALBOARD = `
[physical:svaalboard]
rows: 4
columns: 6,6
thumb: 4,4
split: true
stagger: none

row0: 1 1 1 1 1 1 | 1 1 1 1 1 1
row1: 1 1 1 1 1 1 | 1 1 1 1 1 1
row2: 1 1 1 1 1 1 | 1 1 1 1 1 1
row3: 1 1 1 1 1 1 | 1 1 1 1 1 1
thumb: 1 1 1 1 | 1 1 1 1
`;

/**
 * Standard 60% ANSI layout
 * For reference and testing
 */
export const STANDARD_60 = `
[physical:standard60]
rows: 5
columns: 14
split: false
stagger: row

row0: 1 1 1 1 1 1 1 1 1 1 1 1 1 1
row1: 1 1 1 1 1 1 1 1 1 1 1 1 1 1
row2: 1 1 1 1 1 1 1 1 1 1 1 1 1 0
row3: 1 1 1 1 1 1 1 1 1 1 1 1 0 0
row4: 1 1 1 1 1 1 1 1 0 0 0 0 0 0
`;

/**
 * Get all built-in physical layouts
 * @returns {Object} Layout name -> definition
 */
export function getBuiltinPhysicalLayouts() {
  return {
    corne: CORNE,
    ergodox: ERGODOX,
    svaalboard: SVAALBOARD,
    standard60: STANDARD_60,
  };
}

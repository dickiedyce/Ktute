/**
 * Finger Map
 * Maps fingers to names, colors, and key positions
 */

/**
 * Finger names (1-8)
 * 1-4: Left hand (pinky to index)
 * 5-8: Right hand (index to pinky)
 */
export const FINGER_NAMES = [
  'left pinky',   // 1
  'left ring',    // 2
  'left middle',  // 3
  'left index',   // 4
  'right index',  // 5
  'right middle', // 6
  'right ring',   // 7
  'right pinky',  // 8
];

/**
 * Finger colors for visualization
 * Distinct colors for each finger
 */
export const FINGER_COLORS = [
  '#e94560', // left pinky - red
  '#ff9f43', // left ring - orange
  '#ffd93d', // left middle - yellow
  '#4ecca3', // left index - green
  '#4ecca3', // right index - green (same as left index)
  '#ffd93d', // right middle - yellow
  '#ff9f43', // right ring - orange
  '#e94560', // right pinky - red
];

/**
 * Get finger name by number (1-8)
 * @param {number} finger
 * @returns {string}
 */
export function getFingerName(finger) {
  if (finger < 1 || finger > 8) {
    return 'unknown';
  }
  return FINGER_NAMES[finger - 1];
}

/**
 * Get finger color by number (1-8)
 * @param {number} finger
 * @returns {string} CSS color
 */
export function getFingerColor(finger) {
  if (finger < 1 || finger > 8) {
    return '#666';
  }
  return FINGER_COLORS[finger - 1];
}

/**
 * Get finger for a key by index
 * @param {number} keyIndex
 * @param {Object} mapping - Key mapping with fingers array
 * @returns {number|null}
 */
export function getFingerForKey(keyIndex, mapping) {
  if (!mapping || !mapping.fingers) {
    return null;
  }
  return mapping.fingers[keyIndex] || null;
}

/**
 * Get CSS variable definitions for finger colors
 * @returns {string}
 */
export function getFingerColorCSS() {
  return FINGER_COLORS
    .map((color, i) => `--finger-${i + 1}: ${color};`)
    .join('\n  ');
}

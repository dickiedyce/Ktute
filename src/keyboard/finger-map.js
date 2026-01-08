/**
 * Finger Map
 * Maps fingers to names, colors, and key positions
 */

/**
 * Finger names (0-9)
 * 0-4: Left hand (pinky to thumb)
 * 5-9: Right hand (thumb to pinky)
 */
export const FINGER_NAMES = [
  'left pinky',   // 0
  'left ring',    // 1
  'left middle',  // 2
  'left index',   // 3
  'left thumb',   // 4
  'right thumb',  // 5
  'right index',  // 6
  'right middle', // 7
  'right ring',   // 8
  'right pinky',  // 9
];

/**
 * Finger colors for visualization
 * Distinct colors for each finger, symmetric for corresponding fingers
 */
export const FINGER_COLORS = [
  '#e94560', // left pinky - red
  '#ff9f43', // left ring - orange
  '#ffd93d', // left middle - yellow
  '#4ecca3', // left index - green
  '#6c5ce7', // left thumb - purple
  '#6c5ce7', // right thumb - purple (same as left thumb)
  '#4ecca3', // right index - green
  '#ffd93d', // right middle - yellow
  '#ff9f43', // right ring - orange
  '#e94560', // right pinky - red
];

/**
 * Get finger name by number (0-9)
 * @param {number} finger
 * @returns {string}
 */
export function getFingerName(finger) {
  if (finger < 0 || finger > 9) {
    return 'unknown';
  }
  return FINGER_NAMES[finger];
}

/**
 * Get finger color by number (0-9)
 * @param {number} finger
 * @returns {string} CSS color
 */
export function getFingerColor(finger) {
  if (finger < 0 || finger > 9) {
    return '#666';
  }
  return FINGER_COLORS[finger];
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
  const finger = mapping.fingers[keyIndex];
  return finger !== undefined ? finger : null;
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

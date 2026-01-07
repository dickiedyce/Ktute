/**
 * SVG Keyboard Renderer
 * Renders keyboard layouts as SVG with interactive highlighting
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

// Default key dimensions
const KEY_WIDTH = 50;
const KEY_HEIGHT = 50;
const KEY_GAP = 4;
const KEY_RADIUS = 6;
const SPLIT_GAP = 80;
const THUMB_OFFSET_Y = 20;

/**
 * Create SVG element
 * @param {string} tag
 * @param {Object} attrs
 * @returns {SVGElement}
 */
function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  return el;
}

/**
 * Create a keyboard renderer
 * @param {HTMLElement} container - Container element
 * @param {Object} [options={}] - Renderer options
 * @returns {Object} Renderer instance
 */
export function createKeyboardRenderer(container, options = {}) {
  let svgElement = null;
  let keyElements = new Map(); // key label -> SVG group
  let currentLayout = null;
  let currentMapping = null;

  /**
   * Render the keyboard
   * @param {Object} physicalLayout - Physical layout definition
   * @param {Object} [keyMapping] - Key mapping definition
   * @param {Object} [renderOptions={}] - Render options
   */
  function render(physicalLayout, keyMapping = null, renderOptions = {}) {
    currentLayout = physicalLayout;
    currentMapping = keyMapping;

    // Clear container
    container.innerHTML = '';
    keyElements.clear();

    // Calculate dimensions
    const { width, height, keyPositions } = calculatePositions(physicalLayout);

    // Create SVG
    svgElement = svgEl('svg', {
      width: width,
      height: height,
      viewBox: `0 0 ${width} ${height}`,
      class: 'keyboard-svg',
    });

    // Render each key
    keyPositions.forEach((pos, index) => {
      const keyLabel = keyMapping?.layers?.[0]?.keys?.[index] || '';
      const finger = keyMapping?.fingers?.[index];
      
      const keyGroup = renderKey(pos, keyLabel, finger, renderOptions);
      svgElement.appendChild(keyGroup);
      
      if (keyLabel) {
        keyElements.set(keyLabel.toLowerCase(), keyGroup);
      }
    });

    container.appendChild(svgElement);
  }

  /**
   * Calculate key positions
   * @param {Object} layout
   * @returns {Object}
   */
  function calculatePositions(layout) {
    const keyPositions = [];
    
    let maxX = 0;
    let maxY = 0;

    // Group keys by hand and row
    const leftKeys = layout.keys.filter(k => k.hand === 'left' && !k.isThumb);
    const rightKeys = layout.keys.filter(k => k.hand === 'right' && !k.isThumb);
    const leftThumb = layout.keys.filter(k => k.hand === 'left' && k.isThumb);
    const rightThumb = layout.keys.filter(k => k.hand === 'right' && k.isThumb);

    // Calculate left hand max column for split offset
    const leftMaxCol = leftKeys.reduce((max, k) => Math.max(max, k.col), 0);
    const rightOffset = layout.split ? (leftMaxCol + 1) * (KEY_WIDTH + KEY_GAP) + SPLIT_GAP : (leftMaxCol + 1) * (KEY_WIDTH + KEY_GAP);

    // Render left hand keys
    for (const key of leftKeys) {
      const x = key.col * (KEY_WIDTH + KEY_GAP);
      const y = key.row * (KEY_HEIGHT + KEY_GAP);
      keyPositions.push({ x, y, hand: 'left', isThumb: false });
      maxX = Math.max(maxX, x + KEY_WIDTH);
      maxY = Math.max(maxY, y + KEY_HEIGHT);
    }

    // Render right hand keys
    for (const key of rightKeys) {
      const x = rightOffset + key.col * (KEY_WIDTH + KEY_GAP);
      const y = key.row * (KEY_HEIGHT + KEY_GAP);
      keyPositions.push({ x, y, hand: 'right', isThumb: false });
      maxX = Math.max(maxX, x + KEY_WIDTH);
      maxY = Math.max(maxY, y + KEY_HEIGHT);
    }

    // Calculate thumb row Y position
    const thumbY = maxY + THUMB_OFFSET_Y;

    // Render left thumb keys
    for (const key of leftThumb) {
      const x = key.col * (KEY_WIDTH + KEY_GAP);
      const y = thumbY;
      keyPositions.push({ x, y, hand: 'left', isThumb: true });
      maxX = Math.max(maxX, x + KEY_WIDTH);
      maxY = Math.max(maxY, y + KEY_HEIGHT);
    }

    // Render right thumb keys
    for (const key of rightThumb) {
      const x = rightOffset + key.col * (KEY_WIDTH + KEY_GAP);
      const y = thumbY;
      keyPositions.push({ x, y, hand: 'right', isThumb: true });
      maxX = Math.max(maxX, x + KEY_WIDTH);
      maxY = Math.max(maxY, y + KEY_HEIGHT);
    }

    return {
      width: maxX + KEY_GAP,
      height: maxY + KEY_GAP,
      keyPositions,
    };
  }

  /**
   * Render a single key
   * @param {Object} pos - Position { x, y, hand, isThumb }
   * @param {string} label - Key label
   * @param {number} [finger] - Finger number
   * @param {Object} [renderOptions={}]
   * @returns {SVGElement}
   */
  function renderKey(pos, label, finger, renderOptions = {}) {
    const group = svgEl('g', {
      'data-key': label || 'empty',
      'data-hand': pos.hand,
      class: 'key',
    });

    if (finger && renderOptions.showFingers) {
      group.setAttribute('data-finger', finger);
    }

    // Key background
    const rect = svgEl('rect', {
      x: pos.x,
      y: pos.y,
      width: KEY_WIDTH,
      height: KEY_HEIGHT,
      rx: KEY_RADIUS,
      ry: KEY_RADIUS,
      class: 'key-bg',
    });
    group.appendChild(rect);

    // Key label
    if (label && label !== '_') {
      const text = svgEl('text', {
        x: pos.x + KEY_WIDTH / 2,
        y: pos.y + KEY_HEIGHT / 2 + 5,
        class: 'key-label',
        'text-anchor': 'middle',
      });
      text.textContent = label;
      group.appendChild(text);
    }

    return group;
  }

  /**
   * Highlight a key
   * @param {string} keyLabel
   */
  function highlightKey(keyLabel) {
    const keyGroup = keyElements.get(keyLabel.toLowerCase());
    if (keyGroup) {
      keyGroup.classList.add('active');
    }
  }

  /**
   * Mark a key as correct or error
   * @param {string} keyLabel
   * @param {string} status - 'correct' or 'error'
   */
  function markKey(keyLabel, status) {
    const keyGroup = keyElements.get(keyLabel.toLowerCase());
    if (keyGroup) {
      keyGroup.classList.add(status);
    }
  }

  /**
   * Clear all highlights
   */
  function clearHighlights() {
    for (const keyGroup of keyElements.values()) {
      keyGroup.classList.remove('active', 'correct', 'error');
    }
  }

  /**
   * Get key element by label
   * @param {string} keyLabel
   * @returns {SVGElement|null}
   */
  function getKeyElement(keyLabel) {
    return keyElements.get(keyLabel.toLowerCase()) || null;
  }

  return {
    render,
    highlightKey,
    markKey,
    clearHighlights,
    getKeyElement,
  };
}

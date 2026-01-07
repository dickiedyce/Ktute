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

    // For non-split keyboards, just render left-to-right
    if (!layout.split) {
      const allKeys = layout.keys.filter(k => !k.isThumb);
      const thumbKeys = layout.keys.filter(k => k.isThumb);
      
      for (const key of allKeys) {
        const keyWidth = (key.width || 1) * KEY_WIDTH + (key.width > 1 ? (key.width - 1) * KEY_GAP : 0);
        const x = key.col * (KEY_WIDTH + KEY_GAP);
        const y = key.row * (KEY_HEIGHT + KEY_GAP);
        keyPositions.push({ x, y, width: keyWidth, hand: 'left', isThumb: false });
        maxX = Math.max(maxX, x + keyWidth);
        maxY = Math.max(maxY, y + KEY_HEIGHT);
      }
      
      // Thumb/space bar row
      if (thumbKeys.length > 0) {
        const thumbY = maxY + THUMB_OFFSET_Y;
        for (const key of thumbKeys) {
          const keyWidth = (key.width || 1) * KEY_WIDTH + (key.width > 1 ? (key.width - 1) * KEY_GAP : 0);
          const x = key.col * (KEY_WIDTH + KEY_GAP);
          keyPositions.push({ x, y: thumbY, width: keyWidth, hand: 'left', isThumb: true });
          maxX = Math.max(maxX, x + keyWidth);
          maxY = Math.max(maxY, thumbY + KEY_HEIGHT);
        }
      }
      
      return {
        width: maxX + KEY_GAP,
        height: maxY + KEY_GAP,
        keyPositions,
      };
    }

    // Split keyboard logic
    const leftKeys = layout.keys.filter(k => k.hand === 'left' && !k.isThumb);
    const rightKeys = layout.keys.filter(k => k.hand === 'right' && !k.isThumb);
    const leftThumb = layout.keys.filter(k => k.hand === 'left' && k.isThumb);
    const rightThumb = layout.keys.filter(k => k.hand === 'right' && k.isThumb);

    // Calculate max width per row for proper alignment
    // Width is based on actual physical extent (rightmost key position + its width)
    const leftRowWidths = {};
    for (const key of leftKeys) {
      const keyEnd = key.col + (key.width || 1);
      leftRowWidths[key.row] = Math.max(leftRowWidths[key.row] || 0, keyEnd);
    }
    const leftMaxWidth = Math.max(...Object.values(leftRowWidths), 0);
    
    // Calculate thumb row width for right-alignment
    const leftThumbWidth = leftThumb.reduce((max, k) => Math.max(max, k.col + (k.width || 1)), 0);
    
    const rightOffset = leftMaxWidth * (KEY_WIDTH + KEY_GAP) + SPLIT_GAP;
    
    // Calculate base Y position for thumb cluster (below regular rows)
    const maxRegularRow = Math.max(...leftKeys.map(k => k.row), ...rightKeys.map(k => k.row), 0);
    const thumbBaseY = (maxRegularRow + 1) * (KEY_HEIGHT + KEY_GAP) + THUMB_OFFSET_Y;

    // Process keys in original order to match mapping.keys array
    for (const key of layout.keys) {
      const isThumb = key.isThumb;
      
      // Calculate Y position: regular rows use row index, thumb keys use negative row indices
      let y;
      if (isThumb) {
        // Map thumb row indices to positions
        // row -1 (legacy 'thumb') = thumbBaseY
        // row -10 (thumb0) = thumbBaseY
        // row -11 (thumb1) = thumbBaseY + KEY_HEIGHT + KEY_GAP
        const thumbRowOffset = key.row === -1 ? 0 : Math.abs(key.row + 10);
        y = thumbBaseY + thumbRowOffset * (KEY_HEIGHT + KEY_GAP);
      } else {
        y = key.row * (KEY_HEIGHT + KEY_GAP);
      }
      
      if (key.hand === 'left') {
        const keyWidth = (key.width || 1) * KEY_WIDTH + ((key.width || 1) > 1 ? ((key.width || 1) - 1) * KEY_GAP : 0);
        
        if (isThumb) {
          // Left hand thumb keys - right-align toward center
          const inset = (leftMaxWidth - leftThumbWidth) * (KEY_WIDTH + KEY_GAP);
          const x = inset + key.col * (KEY_WIDTH + KEY_GAP);
          keyPositions.push({ x, y, width: keyWidth, hand: 'left', isThumb });
          maxX = Math.max(maxX, x + keyWidth);
        } else {
          // Left hand regular keys - no inset, positioned by column values
          const x = key.col * (KEY_WIDTH + KEY_GAP);
          keyPositions.push({ x, y, width: keyWidth, hand: 'left', isThumb });
          maxX = Math.max(maxX, x + keyWidth);
        }
        maxY = Math.max(maxY, y + KEY_HEIGHT);
      } else {
        // Right hand keys (left-aligned, which is toward center)
        const keyWidth = (key.width || 1) * KEY_WIDTH + ((key.width || 1) > 1 ? ((key.width || 1) - 1) * KEY_GAP : 0);
        const x = rightOffset + key.col * (KEY_WIDTH + KEY_GAP);
        keyPositions.push({ x, y, width: keyWidth, hand: 'right', isThumb });
        maxX = Math.max(maxX, x + keyWidth);
        maxY = Math.max(maxY, y + KEY_HEIGHT);
      }
    }

    return {
      width: maxX + KEY_GAP,
      height: maxY + KEY_GAP,
      keyPositions,
    };
  }

  /**
   * Render a single key
   * @param {Object} pos - Position { x, y, width, hand, isThumb }
   * @param {string} label - Key label
   * @param {number} [finger] - Finger number
   * @param {Object} [renderOptions={}]
   * @returns {SVGElement}
   */
  function renderKey(pos, label, finger, renderOptions = {}) {
    const keyWidth = pos.width || KEY_WIDTH;
    
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
      width: keyWidth,
      height: KEY_HEIGHT,
      rx: KEY_RADIUS,
      ry: KEY_RADIUS,
      class: 'key-bg',
    });
    group.appendChild(rect);

    // Key label
    if (label && label !== '_') {
      const text = svgEl('text', {
        x: pos.x + keyWidth / 2,
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

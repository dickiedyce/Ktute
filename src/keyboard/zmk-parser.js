/**
 * ZMK Keymap Parser
 * Parses ZMK devicetree keymap files into Ktute format
 */

/**
 * Map from ZMK key names to Ktute labels
 */
export const ZMK_TO_LABEL = {
  // Letters
  A: 'a', B: 'b', C: 'c', D: 'd', E: 'e', F: 'f', G: 'g', H: 'h',
  I: 'i', J: 'j', K: 'k', L: 'l', M: 'm', N: 'n', O: 'o', P: 'p',
  Q: 'q', R: 'r', S: 's', T: 't', U: 'u', V: 'v', W: 'w', X: 'x',
  Y: 'y', Z: 'z',
  
  // Numbers
  N0: '0', N1: '1', N2: '2', N3: '3', N4: '4',
  N5: '5', N6: '6', N7: '7', N8: '8', N9: '9',
  
  // Special keys
  SPACE: 'spc',
  RET: 'ent',
  ENTER: 'ent',
  BSPC: 'bspc',
  BACKSPACE: 'bspc',
  TAB: 'tab',
  ESC: 'esc',
  ESCAPE: 'esc',
  DEL: 'del',
  DELETE: 'del',
  
  // Modifiers - Left
  LSHFT: 'lsft',
  LSHIFT: 'lsft',
  LCTRL: 'lctl',
  LCTL: 'lctl',
  LALT: 'lalt',
  LGUI: 'lgui',
  LCMD: 'lgui',
  LWIN: 'lgui',
  LMETA: 'lgui',
  
  // Modifiers - Right
  RSHFT: 'rsft',
  RSHIFT: 'rsft',
  RCTRL: 'rctl',
  RCTL: 'rctl',
  RALT: 'ralt',
  RGUI: 'rgui',
  RCMD: 'rgui',
  RWIN: 'rgui',
  RMETA: 'rgui',
  
  // Punctuation
  COMMA: ',',
  DOT: '.',
  PERIOD: '.',
  FSLH: '/',
  SLASH: '/',
  SEMI: ';',
  SEMICOLON: ';',
  SQT: "'",
  APOS: "'",
  APOSTROPHE: "'",
  DQT: '"',
  DOUBLE_QUOTES: '"',
  LBKT: '[',
  LBRC: '[',
  RBKT: ']',
  RBRC: ']',
  BSLH: '\\',
  BACKSLASH: '\\',
  MINUS: '-',
  EQUAL: '=',
  GRAVE: '`',
  TILDE: '~',
  
  // Arrow keys
  UP: '↑',
  DOWN: '↓',
  LEFT: '←',
  RIGHT: '→',
  
  // Function keys
  F1: 'f1', F2: 'f2', F3: 'f3', F4: 'f4', F5: 'f5', F6: 'f6',
  F7: 'f7', F8: 'f8', F9: 'f9', F10: 'f10', F11: 'f11', F12: 'f12',
  
  // Other
  CAPS: 'caps',
  CAPSLOCK: 'caps',
  PSCRN: 'psc',
  PRINTSCREEN: 'psc',
  SLCK: 'slk',
  SCROLLLOCK: 'slk',
  PAUSE_BREAK: 'brk',
  INS: 'ins',
  INSERT: 'ins',
  HOME: 'hom',
  END: 'end',
  PG_UP: 'pgu',
  PAGE_UP: 'pgu',
  PG_DN: 'pgd',
  PAGE_DOWN: 'pgd',
};

/**
 * Parse a ZMK keymap file
 * @param {string} content - ZMK keymap file content
 * @returns {Object} Parsed keymap with layers
 */
export function parseZmkKeymap(content) {
  const result = {
    layers: [],
  };
  
  // Find the keymap block - match from "keymap {" to its closing "};"
  // We need to handle nested braces
  const keymapStart = content.search(/keymap\s*\{/);
  if (keymapStart === -1) {
    return result;
  }
  
  // Find the matching closing brace
  let braceCount = 0;
  let keymapEnd = -1;
  let inKeymap = false;
  
  for (let i = keymapStart; i < content.length; i++) {
    if (content[i] === '{') {
      braceCount++;
      inKeymap = true;
    } else if (content[i] === '}') {
      braceCount--;
      if (inKeymap && braceCount === 0) {
        keymapEnd = i + 1;
        break;
      }
    }
  }
  
  if (keymapEnd === -1) {
    return result;
  }
  
  const keymapBlock = content.slice(keymapStart, keymapEnd);
  
  // Find all layer blocks
  // Match pattern: layer_name { bindings = < ... >; };
  const layerRegex = /(\w+)\s*\{\s*bindings\s*=\s*<([^>]+)>/g;
  let match;
  
  while ((match = layerRegex.exec(keymapBlock)) !== null) {
    const layerName = match[1];
    const bindingsStr = match[2];
    
    const keys = parseBindings(bindingsStr);
    
    result.layers.push({
      name: layerName,
      keys,
    });
  }
  
  return result;
}

/**
 * Parse bindings string into array of key labels
 * @param {string} bindingsStr - The bindings content (inside < >)
 * @returns {string[]} Array of key labels
 */
function parseBindings(bindingsStr) {
  const keys = [];
  
  // Split by whitespace and filter empty strings
  const tokens = bindingsStr.trim().split(/\s+/).filter(t => t.length > 0);
  
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    
    if (token === '&kp') {
      // Key press: &kp KEYCODE
      i++;
      if (i < tokens.length) {
        const keycode = tokens[i];
        keys.push(zmkToLabel(keycode));
      }
    } else if (token.startsWith('&kp')) {
      // Key press inline: &kp(KEYCODE) or &kpKEYCODE (shouldn't happen but handle it)
      const keycode = token.slice(3);
      if (keycode) {
        keys.push(zmkToLabel(keycode));
      }
    } else if (token === '&trans') {
      // Transparent - inherits from lower layer
      keys.push('_');
    } else if (token === '&none') {
      // No binding
      keys.push('_');
    } else if (token === '&lt') {
      // Layer tap: &lt LAYER KEYCODE
      i++; // skip layer number
      i++;
      if (i < tokens.length) {
        const keycode = tokens[i];
        keys.push(zmkToLabel(keycode));
      }
    } else if (token === '&mt') {
      // Mod tap: &mt MOD KEYCODE
      i++; // skip modifier
      i++;
      if (i < tokens.length) {
        const keycode = tokens[i];
        keys.push(zmkToLabel(keycode));
      }
    } else if (token === '&mo') {
      // Momentary layer: &mo LAYER
      i++; // skip layer number
      keys.push('mo');
    } else if (token === '&to') {
      // To layer: &to LAYER
      i++; // skip layer number
      keys.push('to');
    } else if (token === '&tog') {
      // Toggle layer: &tog LAYER
      i++; // skip layer number
      keys.push('tog');
    } else if (token === '&sk') {
      // Sticky key: &sk KEYCODE
      i++;
      if (i < tokens.length) {
        const keycode = tokens[i];
        keys.push(zmkToLabel(keycode));
      }
    } else if (token === '&sl') {
      // Sticky layer: &sl LAYER
      i++; // skip layer number
      keys.push('sl');
    } else if (token === '&bootloader' || token === '&reset' || token === '&bt' || token === '&out') {
      // System bindings - skip any arguments
      keys.push('_');
      // These might have arguments, but we'll just add the binding itself
    } else if (token.startsWith('&')) {
      // Unknown binding - skip it
      keys.push('_');
    }
    // Skip anything else (comments, etc.)
    
    i++;
  }
  
  return keys;
}

/**
 * Convert ZMK keycode to Ktute label
 * @param {string} keycode - ZMK keycode
 * @returns {string} Ktute label
 */
function zmkToLabel(keycode) {
  // Check direct mapping
  if (ZMK_TO_LABEL[keycode]) {
    return ZMK_TO_LABEL[keycode];
  }
  
  // Handle lowercase input
  const upper = keycode.toUpperCase();
  if (ZMK_TO_LABEL[upper]) {
    return ZMK_TO_LABEL[upper];
  }
  
  // Return lowercase keycode as fallback
  return keycode.toLowerCase();
}

/**
 * Convert parsed ZMK keymap to Ktute combined layout format
 * @param {Object} parsed - Parsed ZMK keymap
 * @param {string} physicalLayout - Physical layout definition to use
 * @returns {string} Ktute combined layout definition
 */
export function zmkToKtuteLayout(parsed, physicalLayout) {
  if (parsed.layers.length === 0) {
    return null;
  }
  
  // Use the first layer (base layer) for the mapping
  const baseLayer = parsed.layers[0];
  
  // This is a simplified conversion - full implementation would
  // need to know the physical layout dimensions
  return {
    physical: physicalLayout,
    keys: baseLayer.keys,
  };
}

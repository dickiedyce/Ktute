/**
 * Layout Parser
 * Parses text-based physical keyboard layout and key mapping definitions
 */

/**
 * Parse a single key token from row data
 * Supports formats:
 *   - In physical-only mode: "1", "1.5", "2" = width, "0" = gap
 *   - In combined mode: "1", "2" = key labels, "0" = gap
 *   - "a", "spc", "ctrl" - key label with width 1
 *   - "spc:2", "shift:1.5" - key label with explicit width
 * @param {string} token - The key token to parse
 * @param {boolean} isCombinedFormat - Whether we're parsing a combined layout (labels, not widths)
 * @returns {{ label: string, width: number, isPhysicalOnly: boolean }}
 */
function parseKeyToken(token, isCombinedFormat = false) {
  // Check for label:width format first
  const colonMatch = token.match(/^([^:]+):(\d+\.?\d*)$/);
  if (colonMatch) {
    return {
      label: colonMatch[1],
      width: parseFloat(colonMatch[2]),
      isPhysicalOnly: false,
    };
  }
  
  // "¦" (broken bar) is always a gap (no key) in any format
  // Quarter-width spacing
  if (token === '¦') {
    return {
      label: null,
      width: 0.25,
      isPhysicalOnly: true,
    };
  }
  
  // Check if purely numeric
  const numericValue = parseFloat(token);
  const isNumeric = !isNaN(numericValue) && token.match(/^[\d.]+$/);
  
  if (isNumeric) {
    if (isCombinedFormat) {
      // In combined format, treat numeric as key label (e.g., "0", "1", "2" on number row)
      return {
        label: token,
        width: 1,
        isPhysicalOnly: false,
      };
    } else {
      // In physical-only format, "0" = gap, other numbers = width
      if (token === '0') {
        return {
          label: null,
          width: 0,
          isPhysicalOnly: true,
        };
      }
      return {
        label: null,
        width: numericValue,
        isPhysicalOnly: true,
      };
    }
  }
  
  // Regular key label with width 1 (including "_" for blank key)
  return {
    label: token,
    width: 1,
    isPhysicalOnly: false,
  };
}

/**
 * Parse a combined layout definition (physical + keys in one)
 * @param {string} input - Layout definition text
 * @returns {Object} Object with { physical, mapping }
 */
export function parseCombinedLayout(input) {
  const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  
  const physical = {
    name: '',
    rows: 0,
    columns: [],
    thumb: [],
    split: false,
    stagger: 'none',
    keys: [],
  };
  
  const mapping = {
    name: '',
    base: '',
    layers: [{ keys: [] }],
    fingers: null,
  };

  let parsingFingers = false;
  let fingerValues = [];
  let rowIndex = 0;
  let isCombinedFormat = false; // Track if using [layout:...] header

  for (const line of lines) {
    // Parse header [layout:name] (combined format)
    const layoutHeaderMatch = line.match(/^\[layout:([\w-]+)\]$/);
    if (layoutHeaderMatch) {
      physical.name = layoutHeaderMatch[1];
      mapping.name = layoutHeaderMatch[1];
      mapping.base = layoutHeaderMatch[1];
      isCombinedFormat = true; // Numeric tokens are labels, not widths
      continue;
    }

    // Also support old [physical:name] and [mapping:name] headers for backwards compatibility
    const physicalHeaderMatch = line.match(/^\[physical:(\w+)\]$/);
    if (physicalHeaderMatch) {
      physical.name = physicalHeaderMatch[1];
      continue;
    }
    
    const mappingHeaderMatch = line.match(/^\[mapping:([\w-]+)\]$/);
    if (mappingHeaderMatch) {
      mapping.name = mappingHeaderMatch[1];
      continue;
    }

    // Check for fingers section
    if (line === 'fingers:') {
      parsingFingers = true;
      fingerValues = [];
      continue;
    }

    // Parse key-value pairs
    const kvMatch = line.match(/^(\w+):\s*(.+)$/);
    if (kvMatch) {
      const [, key, value] = kvMatch;
      
      switch (key) {
        case 'rows':
          physical.rows = parseInt(value, 10);
          break;
        case 'columns':
          physical.columns = value.split(',').map(v => parseInt(v.trim(), 10));
          break;
        case 'split':
          physical.split = value.toLowerCase() === 'true';
          break;
        case 'stagger':
          physical.stagger = value;
          break;
        case 'base':
          mapping.base = value;
          break;
        case 'thumb':
          // Could be thumb count "3,3" or thumb row data
          if (value.includes(',') && !value.includes('|') && !value.match(/[a-zA-Z]/)) {
            physical.thumb = value.split(',').map(v => parseInt(v.trim(), 10));
            break;
          }
          // Fall through to parse as row
        default:
          // Row definitions: row0, row1, row2, thumb
          if (key.startsWith('row') || key === 'thumb') {
            const isThumb = key === 'thumb';
            const currentRowIndex = isThumb ? -1 : parseInt(key.slice(3), 10);
            
            // Split by | for left/right hands
            const parts = value.split('|').map(s => s.trim());
            const leftPart = parts[0];
            const rightPart = parts[1] || null;
            
            if (parsingFingers) {
              // Finger assignments - space-separated values, one per key
              // Support dots for "no finger" on blank keys
              const allValues = parts.flatMap(part => part.split(/\s+/).filter(v => v !== ''));
              fingerValues.push(...allValues.map(v => v === '.' ? null : parseInt(v, 10)));
            } else {
              // Parse left hand - track position including gaps
              const leftKeys = leftPart.split(/\s+/).filter(k => k !== '');
              let leftColPos = 0;
              leftKeys.forEach((k) => {
                const parsed = parseKeyToken(k, isCombinedFormat);
                
                // Check if this is a gap (¦) - small width, label is null
                if (parsed.label === null && parsed.width > 0 && parsed.width < 1) {
                  // Gap - advance position by gap width (e.g., 0.25)
                  leftColPos += parsed.width;
                } else if (parsed.isPhysicalOnly) {
                  // Physical-only format: 0 = gap, number = key width
                  if (parsed.width > 0) {
                    physical.keys.push({
                      row: currentRowIndex,
                      col: leftColPos,
                      width: parsed.width,
                      hand: 'left',
                      isThumb,
                    });
                  }
                  leftColPos += parsed.width > 0 ? parsed.width : 1;
                } else {
                  // Combined format: key label with width
                  // Supports label:width syntax (e.g., spc:2 for 2-unit spacebar)
                  physical.keys.push({
                    row: currentRowIndex,
                    col: leftColPos,
                    width: parsed.width,
                    hand: 'left',
                    isThumb,
                  });
                  mapping.layers[0].keys.push(parsed.label);
                  leftColPos += parsed.width;
                }
              });

              // Parse right hand
              if (rightPart) {
                const rightKeys = rightPart.split(/\s+/).filter(k => k !== '');
                let rightColPos = 0;
                rightKeys.forEach((k) => {
                  const parsed = parseKeyToken(k, isCombinedFormat);
                  
                  // Check if this is a gap (¦) - small width, label is null
                  if (parsed.label === null && parsed.width > 0 && parsed.width < 1) {
                    // Gap - advance position by gap width (e.g., 0.25)
                    rightColPos += parsed.width;
                  } else if (parsed.isPhysicalOnly) {
                    if (parsed.width > 0) {
                      physical.keys.push({
                        row: currentRowIndex,
                        col: rightColPos,
                        width: parsed.width,
                        hand: 'right',
                        isThumb,
                      });
                    }
                    rightColPos += parsed.width > 0 ? parsed.width : 1;
                  } else {
                    physical.keys.push({
                      row: currentRowIndex,
                      col: rightColPos,
                      width: parsed.width,
                      hand: 'right',
                      isThumb,
                    });
                    mapping.layers[0].keys.push(parsed.label);
                    rightColPos += parsed.width;
                  }
                });
              }
            }
          }
      }
    }
  }

  if (fingerValues.length > 0) {
    mapping.fingers = fingerValues;
  }

  return { physical, mapping };
}

/**
 * Parse a physical layout definition
 * @param {string} input - Layout definition text
 * @returns {Object} Parsed physical layout
 */
export function parsePhysicalLayout(input) {
  const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  
  const layout = {
    name: '',
    rows: 0,
    columns: [],
    thumb: [],
    split: false,
    stagger: 'none',
    keys: [],
  };

  let currentSection = 'header';

  for (const line of lines) {
    // Parse header [physical:name]
    const headerMatch = line.match(/^\[physical:(\w+)\]$/);
    if (headerMatch) {
      layout.name = headerMatch[1];
      continue;
    }

    // Parse key-value pairs
    const kvMatch = line.match(/^(\w+):\s*(.+)$/);
    if (kvMatch) {
      const [, key, value] = kvMatch;
      
      switch (key) {
        case 'rows':
          layout.rows = parseInt(value, 10);
          break;
        case 'columns':
          layout.columns = value.split(',').map(v => parseInt(v.trim(), 10));
          break;
        case 'split':
          layout.split = value.toLowerCase() === 'true';
          break;
        case 'stagger':
          layout.stagger = value;
          break;
        case 'thumb':
          // Could be thumb count "3,3" or thumb row "1 1 1 | 1 1 1"
          if (value.includes(',') && !value.includes('|')) {
            layout.thumb = value.split(',').map(v => parseInt(v.trim(), 10));
            break;
          }
          // Fall through to parse as row
        default:
          // Row definitions: row0, row1, row2, thumb
          if (key.startsWith('row') || key === 'thumb') {
            const isThumb = key === 'thumb';
            const rowIndex = isThumb ? -1 : parseInt(key.slice(3), 10);
            
            // Split by | for left/right hands
            const parts = value.split('|').map(s => s.trim());
            const leftPart = parts[0];
            const rightPart = parts[1] || null;
            
            // Parse left hand keys - track position including gaps
            const leftKeys = leftPart.split(/\s+/);
            let leftColPos = 0;
            leftKeys.forEach((k) => {
              const width = parseFloat(k) || 0;
              if (width > 0) {
                layout.keys.push({
                  row: rowIndex,
                  col: leftColPos,
                  width: width,
                  hand: 'left',
                  isThumb,
                });
              }
              // Always advance position (even for 0 values, to create gaps)
              leftColPos += width > 0 ? width : 1;
            });

            // Parse right hand keys
            if (rightPart) {
              const rightKeys = rightPart.split(/\s+/);
              let rightColPos = 0;
              rightKeys.forEach((k) => {
                const width = parseFloat(k) || 0;
                if (width > 0) {
                  layout.keys.push({
                    row: rowIndex,
                    col: rightColPos,
                    width: width,
                    hand: 'right',
                    isThumb,
                  });
                }
                rightColPos += width > 0 ? width : 1;
              });
            }
          }
      }
    }
  }

  return layout;
}

/**
 * Parse a key mapping definition
 * @param {string} input - Mapping definition text
 * @returns {Object} Parsed key mapping
 */
export function parseKeyMapping(input) {
  const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  
  const mapping = {
    name: '',
    base: '',
    layers: [],
    fingers: null,
  };

  let currentLayer = { keys: [] };
  let parsingFingers = false;
  let fingerValues = [];

  for (const line of lines) {
    // Parse header [mapping:name]
    const headerMatch = line.match(/^\[mapping:(\w+[-\w]*)\]$/);
    if (headerMatch) {
      mapping.name = headerMatch[1];
      // Start layer 0
      currentLayer = { keys: [] };
      mapping.layers.push(currentLayer);
      parsingFingers = false;
      continue;
    }

    // Parse layer header [layer:n]
    const layerMatch = line.match(/^\[layer:(\d+)\]$/);
    if (layerMatch) {
      currentLayer = { keys: [] };
      mapping.layers.push(currentLayer);
      parsingFingers = false;
      continue;
    }

    // Check for fingers section
    if (line === 'fingers:') {
      parsingFingers = true;
      fingerValues = [];
      continue;
    }

    // Parse key-value pairs
    const kvMatch = line.match(/^(\w+):\s*(.+)$/);
    if (kvMatch) {
      const [, key, value] = kvMatch;
      
      if (key === 'base') {
        mapping.base = value;
        continue;
      }

      // Row definitions
      if (key.startsWith('row') || key === 'thumb') {
        // Split by | for left/right hands
        const parts = value.split('|').map(s => s.trim());
        const allKeys = parts.flatMap(part => part.split(/\s+/));
        
        if (parsingFingers) {
          fingerValues.push(...allKeys.map(k => k === '.' ? null : parseInt(k, 10)));
        } else {
          currentLayer.keys.push(...allKeys);
        }
      }
    }
  }

  if (fingerValues.length > 0) {
    mapping.fingers = fingerValues;
  }

  return mapping;
}

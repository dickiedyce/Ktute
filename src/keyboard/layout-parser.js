/**
 * Layout Parser
 * Parses text-based physical keyboard layout and key mapping definitions
 */

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
            const [leftPart, rightPart] = value.split('|').map(s => s.trim());
            
            // Parse left hand keys
            const leftKeys = leftPart.split(/\s+/);
            leftKeys.forEach((k, col) => {
              if (k === '1') {
                layout.keys.push({
                  row: rowIndex,
                  col,
                  hand: 'left',
                  isThumb,
                });
              }
            });

            // Parse right hand keys
            if (rightPart) {
              const rightKeys = rightPart.split(/\s+/);
              rightKeys.forEach((k, col) => {
                if (k === '1') {
                  layout.keys.push({
                    row: rowIndex,
                    col,
                    hand: 'right',
                    isThumb,
                  });
                }
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
          fingerValues.push(...allKeys.map(k => parseInt(k, 10)));
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

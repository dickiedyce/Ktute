/**
 * Layout Editor View
 * Create and edit custom keyboard layouts (combined physical + keys)
 */

import { storage } from '../core/storage.js';
import { preferences } from '../core/preferences.js';
import {
  getAllLayouts,
  getBuiltinLayouts,
  saveCustomLayout,
  deleteCustomLayout,
  generateLayoutId,
} from '../keyboard/combined-layouts.js';
import { createKeyboardRenderer } from '../keyboard/renderer.js';
import { parseCombinedLayout } from '../keyboard/layout-parser.js';
import { parseZmkKeymap } from '../keyboard/zmk-parser.js';

const DEFAULT_LAYOUT = `[layout:my-layout]
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
`;

/**
 * Create the layout editor view
 * @param {HTMLElement} container - Container element
 * @param {Object} [options={}] - View options
 * @returns {Object} View controller with destroy method
 */
export function createLayoutEditorView(container, options = {}) {
  const { onBack } = options;

  // Get available layouts
  const allLayouts = getAllLayouts();
  const builtinLayouts = getBuiltinLayouts();
  const customLayouts = Object.fromEntries(
    Object.entries(allLayouts).filter(([id]) => !(id in builtinLayouts))
  );

  // Current state
  let layoutName = 'My Custom Layout';
  let currentText = DEFAULT_LAYOUT;
  let validationError = null;
  let currentLoadedLayoutId = null; // Track currently loaded custom layout

  // DOM elements
  let nameInput = null;
  let editorTextarea = null;
  let previewContainer = null;
  let errorDisplay = null;
  let renderer = null;

  // Event handlers (for cleanup)
  const handlers = [];

  /**
   * Initialize the view
   */
  function init() {
    container.innerHTML = '';

    const view = document.createElement('main');
    view.setAttribute('data-view', 'layout-editor');
    view.className = 'layout-editor-view';

    view.innerHTML = `
      <header class="editor-header">
        <h1>Layout Editor</h1>
      </header>

      <section class="editor-toolbar">
        <div class="toolbar-group">
          <label for="layout-name">Name:</label>
          <input type="text" id="layout-name" class="layout-name-input" value="${escapeHtml(layoutName)}" placeholder="My Layout" />
        </div>

        <div class="toolbar-group">
          <label for="load-custom">Custom:</label>
          <select id="load-custom" data-action="load-custom">
            <option value="">-- Select --</option>
            ${Object.entries(customLayouts)
              .map(([id, layout]) => `<option value="${id}">${layout.name}</option>`)
              .join('')}
          </select>
          <button class="btn btn-danger btn-sm" data-action="delete-custom" disabled>Delete</button>
        </div>

        <div class="toolbar-group">
          <label for="load-builtin">Built-in:</label>
          <select id="load-builtin" data-action="load-builtin">
            <option value="">-- Select --</option>
            ${Object.entries(builtinLayouts)
              .map(([id, layout]) => `<option value="${id}">${layout.name}</option>`)
              .join('')}
          </select>
        </div>

        <div class="toolbar-actions">
          <button class="btn btn-primary" data-action="save">Save</button>
          <button class="btn btn-secondary" data-action="use-layout">Save &amp; Use</button>
          <button class="btn btn-secondary" data-action="export">Export</button>
          <button class="btn btn-secondary" data-action="import">Import</button>
          <button class="btn btn-secondary" data-action="import-zmk">Import ZMK</button>
          <input type="file" id="import-file" accept=".txt,.layout" style="display: none;">
        </div>
      </section>

      <section class="editor-preview-container">
        <div class="editor-preview"></div>
      </section>

      <section class="editor-text-container">
        <textarea 
          class="layout-text-editor" 
          spellcheck="false"
          placeholder="Enter layout definition..."
        >${escapeHtml(currentText)}</textarea>
        <div class="validation-error" style="display: none;"></div>
      </section>

      <section class="editor-help">
        <table class="help-table">
          <thead><tr><th colspan="2">Structure</th></tr></thead>
          <tbody>
            <tr><td><code>[layout:name]</code></td><td>Define layout name</td></tr>
            <tr><td><code>rows: 3</code></td><td>Number of rows</td></tr>
            <tr><td><code>columns: 6,6</code></td><td>Keys per hand</td></tr>
            <tr><td><code>split: true</code></td><td>Split keyboard</td></tr>
          </tbody>
        </table>

        <table class="help-table">
          <thead><tr><th colspan="2">Rows &amp; Keys</th></tr></thead>
          <tbody>
            <tr><td><code>row0: q w e | r t y</code></td><td>Use <code>|</code> for split</td></tr>
            <tr><td><code>thumb:</code> or <code>thumb0:</code></td><td>Thumb row(s)</td></tr>
            <tr><td><code>spc:2</code> / <code>¦:0.5</code></td><td>Custom width</td></tr>
            <tr><td><code>_</code> / <code>¦</code></td><td>Blank / gap</td></tr>
          </tbody>
        </table>

        <table class="help-table">
          <thead><tr><th colspan="2">Fingers</th></tr></thead>
          <tbody>
            <tr><td><code>fingers:</code></td><td>Start finger section</td></tr>
            <tr><td><code>row0: 0 1 2 | 7 8 9</code></td><td>One per key</td></tr>
            <tr><td>0-4 Left</td><td>pinky→thumb</td></tr>
            <tr><td>5-9 Right</td><td>thumb→pinky</td></tr>
          </tbody>
        </table>

        <p class="help-hint"><kbd>Esc</kbd> back • <kbd>Ctrl+S</kbd> save</p>
      </section>
    `;

    container.appendChild(view);

    // Get DOM references
    nameInput = container.querySelector('#layout-name');
    editorTextarea = container.querySelector('.layout-text-editor');
    previewContainer = container.querySelector('.editor-preview');
    errorDisplay = container.querySelector('.validation-error');

    // Set up renderer
    renderer = createKeyboardRenderer(previewContainer);

    // Bind events
    bindEvents();

    // Initial render
    updatePreview();
  }

  /**
   * Escape HTML entities
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Bind event handlers
   */
  function bindEvents() {
    // Name input changes
    const handleNameChange = () => {
      layoutName = nameInput.value.trim() || 'My Layout';
    };

    // Text editor changes
    const handleTextInput = () => {
      currentText = editorTextarea.value;
      updatePreview();
    };

    // Load built-in layout
    const handleLoadBuiltin = (e) => {
      const id = e.target.value;
      if (!id) return;

      const layout = builtinLayouts[id];
      if (layout) {
        editorTextarea.value = layout.definition;
        currentText = layout.definition;
        // Set name based on layout name
        nameInput.value = layout.name + ' (copy)';
        layoutName = nameInput.value;
        updatePreview();
      }
      e.target.value = ''; // Reset dropdown
    };

    // Load custom layout
    const handleLoadCustom = (e) => {
      const id = e.target.value;
      if (!id) return;

      const layout = customLayouts[id];
      if (layout) {
        currentLoadedLayoutId = id; // Track loaded layout
        editorTextarea.value = layout.definition;
        currentText = layout.definition;
        // Set name to the actual name (for editing)
        nameInput.value = layout.name;
        layoutName = nameInput.value;
        updatePreview();
        
        // Enable delete button
        const deleteBtn = container.querySelector('[data-action="delete-custom"]');
        if (deleteBtn) deleteBtn.disabled = false;
      }
      e.target.value = ''; // Reset dropdown
    };

    // Delete custom layout
    const handleDeleteCustom = () => {
      // Use the currently loaded layout ID
      if (!currentLoadedLayoutId) {
        alert('Please load a custom layout first');
        return;
      }

      const layout = customLayouts[currentLoadedLayoutId];
      if (!layout) return;

      if (confirm(`Are you sure you want to delete "${layout.name}"?`)) {
        // Delete the layout
        deleteCustomLayout(currentLoadedLayoutId);

        // If this was the active layout, switch to a built-in layout
        const activeLayoutId = preferences.getLayout();
        if (activeLayoutId === currentLoadedLayoutId) {
          // Default to first built-in layout
          const builtinIds = Object.keys(builtinLayouts);
          if (builtinIds.length > 0) {
            preferences.setLayout(builtinIds[0]);
          }
        }

        // Reload the page to refresh the dropdowns
        window.location.reload();
      }
    };

    // Save layout
    const handleSave = () => {
      if (validationError) {
        return;
      }

      // If we have a loaded layout and the name matches, update it
      // Otherwise generate a new ID
      let id;
      if (currentLoadedLayoutId && customLayouts[currentLoadedLayoutId]?.name === layoutName) {
        id = currentLoadedLayoutId;
      } else {
        id = generateLayoutId(layoutName);
      }
      
      saveCustomLayout(id, layoutName, currentText);

      // Update currentLoadedLayoutId to the saved ID
      currentLoadedLayoutId = id;

      // Update the dropdown to reflect the saved layout
      const allLayouts = getAllLayouts();
      const builtinIds = Object.keys(getBuiltinLayouts());
      const updatedCustomLayouts = Object.fromEntries(
        Object.entries(allLayouts).filter(([layoutId]) => !builtinIds.includes(layoutId))
      );
      
      const loadCustomDropdown = container.querySelector('#load-custom');
      loadCustomDropdown.innerHTML = `
        <option value="">-- Select --</option>
        ${Object.entries(updatedCustomLayouts)
          .map(([layoutId, layout]) => `<option value="${layoutId}">${layout.name}</option>`)
          .join('')}
      `;

      // Update customLayouts reference
      Object.assign(customLayouts, updatedCustomLayouts);

      // Enable delete button since we now have a loaded layout
      const deleteBtn = container.querySelector('[data-action="delete-custom"]');
      if (deleteBtn) deleteBtn.disabled = false;

      // Show success feedback
      const saveBtn = container.querySelector('[data-action="save"]');
      const originalText = saveBtn.textContent;
      saveBtn.textContent = 'Saved!';
      setTimeout(() => {
        saveBtn.textContent = originalText;
      }, 2000);

      return id;
    };

    // Save and use layout
    const handleSaveAndUse = () => {
      const id = handleSave();
      if (id) {
        preferences.setLayout(id);
        // Navigate back to home
        if (onBack) {
          onBack();
        } else {
          window.location.hash = '/';
        }
      }
    };

    // Export layout
    const handleExport = () => {
      const blob = new Blob([currentText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${layoutName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.layout.txt`;
      a.click();
      URL.revokeObjectURL(url);
    };

    // Import layout
    const handleImport = () => {
      const fileInput = container.querySelector('#import-file');
      fileInput.click();
    };

    const handleFileSelected = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        editorTextarea.value = event.target.result;
        currentText = event.target.result;
        
        // Try to extract name from file or content
        const nameMatch = currentText.match(/\[layout:([\w-]+)\]/);
        if (nameMatch) {
          const extractedName = nameMatch[1]
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          nameInput.value = extractedName;
          layoutName = extractedName;
        } else {
          nameInput.value = file.name.replace(/\.(layout|txt)$/i, '');
          layoutName = nameInput.value;
        }

        updatePreview();
      };
      reader.readAsText(file);
      e.target.value = ''; // Reset for next import
    };

    // Show ZMK import modal
    const handleImportZmk = () => {
      showZmkImportModal();
    };

    // Ctrl+S to save
    const handleKeyDown = (e) => {
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
        return;
      }

      if (e.key === 'Escape') {
        // Don't trigger if we're in the textarea or name input
        if (document.activeElement === editorTextarea || document.activeElement === nameInput) {
          document.activeElement.blur();
          return;
        }
        if (onBack) {
          onBack();
        } else {
          window.location.hash = '/';
        }
      }
    };

    // Add event listeners
    nameInput.addEventListener('input', handleNameChange);
    editorTextarea.addEventListener('input', handleTextInput);
    document.addEventListener('keydown', handleKeyDown);

    const loadDropdown = container.querySelector('[data-action="load-builtin"]');
    loadDropdown.addEventListener('change', handleLoadBuiltin);

    const loadCustomDropdown = container.querySelector('[data-action="load-custom"]');
    loadCustomDropdown.addEventListener('change', handleLoadCustom);

    const deleteBtn = container.querySelector('[data-action="delete-custom"]');
    deleteBtn.addEventListener('click', handleDeleteCustom);

    const saveBtn = container.querySelector('[data-action="save"]');
    saveBtn.addEventListener('click', handleSave);

    const useBtn = container.querySelector('[data-action="use-layout"]');
    useBtn.addEventListener('click', handleSaveAndUse);

    const exportBtn = container.querySelector('[data-action="export"]');
    exportBtn.addEventListener('click', handleExport);

    const importBtn = container.querySelector('[data-action="import"]');
    importBtn.addEventListener('click', handleImport);

    const importZmkBtn = container.querySelector('[data-action="import-zmk"]');
    importZmkBtn.addEventListener('click', handleImportZmk);

    const fileInput = container.querySelector('#import-file');
    fileInput.addEventListener('change', handleFileSelected);

    handlers.push(
      { element: nameInput, event: 'input', handler: handleNameChange },
      { element: editorTextarea, event: 'input', handler: handleTextInput },
      { element: document, event: 'keydown', handler: handleKeyDown },
      { element: loadDropdown, event: 'change', handler: handleLoadBuiltin },
      { element: loadCustomDropdown, event: 'change', handler: handleLoadCustom },
      { element: deleteBtn, event: 'click', handler: handleDeleteCustom },
      { element: saveBtn, event: 'click', handler: handleSave },
      { element: useBtn, event: 'click', handler: handleSaveAndUse },
      { element: exportBtn, event: 'click', handler: handleExport },
      { element: importBtn, event: 'click', handler: handleImport },
      { element: importZmkBtn, event: 'click', handler: handleImportZmk },
      { element: fileInput, event: 'change', handler: handleFileSelected }
    );
  }

  /**
   * Update the keyboard preview
   */
  function updatePreview() {
    validationError = null;
    hideError();

    try {
      const { physical, mapping } = parseCombinedLayout(currentText);
      renderer.render(physical, mapping, { showFingers: true });
    } catch (err) {
      validationError = err.message;
      showError(err.message);
    }
  }

  /**
   * Show validation error
   * @param {string} message
   */
  function showError(message) {
    errorDisplay.textContent = message;
    errorDisplay.style.display = 'block';
  }

  /**
   * Hide validation error
   */
  function hideError() {
    errorDisplay.style.display = 'none';
  }

  /**
   * Show ZMK import modal
   */
  function showZmkImportModal() {
    const modal = document.createElement('div');
    modal.className = 'zmk-import-modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <h2>Import ZMK Keymap</h2>
        <p>Paste your ZMK keymap file content below:</p>
        <textarea class="zmk-textarea" placeholder="/ {
    keymap {
        compatible = &quot;zmk,keymap&quot;;
        default_layer {
            bindings = <
                &kp Q &kp W ...
            >;
        };
    };
};"></textarea>
        <div class="modal-actions">
          <button class="btn btn-primary" data-action="apply-zmk">Import</button>
          <button class="btn btn-secondary" data-action="cancel-zmk">Cancel</button>
        </div>
      </div>
    `;

    container.appendChild(modal);

    const textarea = modal.querySelector('.zmk-textarea');
    const applyBtn = modal.querySelector('[data-action="apply-zmk"]');
    const cancelBtn = modal.querySelector('[data-action="cancel-zmk"]');
    const backdrop = modal.querySelector('.modal-backdrop');

    const closeModal = () => {
      modal.remove();
    };

    const applyZmk = () => {
      const zmkContent = textarea.value;
      const parsed = parseZmkKeymap(zmkContent);
      
      if (parsed.layers.length === 0) {
        alert('Could not parse ZMK keymap. Please check the format.');
        return;
      }

      // Convert to Ktute format
      const keys = parsed.layers[0].keys;
      const newLayout = generateLayoutFromKeys(keys);
      
      editorTextarea.value = newLayout;
      currentText = newLayout;
      layoutName = 'Imported ZMK Layout';
      nameInput.value = layoutName;
      
      updatePreview();
      closeModal();
    };

    applyBtn.addEventListener('click', applyZmk);
    cancelBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    
    textarea.focus();
  }

  /**
   * Generate a layout definition from an array of keys
   * @param {string[]} keys - Array of key labels
   * @returns {string} Layout definition
   */
  function generateLayoutFromKeys(keys) {
    // Try to detect layout size
    // Common sizes: 36 (3x6 + 3 thumb), 42 (3x6 + 3 thumb per hand), 44, 48
    const count = keys.length;
    
    let rows, cols, thumbCount, split;
    
    if (count === 36) {
      // Sweep/Ferris style: 3x5 + 2 thumb per hand
      rows = 3;
      cols = 5;
      thumbCount = 3;
      split = true;
    } else if (count === 42) {
      // Corne style: 3x6 + 3 thumb per hand
      rows = 3;
      cols = 6;
      thumbCount = 3;
      split = true;
    } else if (count === 48) {
      // Lily58 style: 4x6 + 4 thumb
      rows = 4;
      cols = 6;
      thumbCount = 4;
      split = true;
    } else {
      // Generic: assume 3 rows, figure out columns
      rows = 3;
      split = true;
      thumbCount = Math.max(2, Math.floor(count / 10));
      const mainKeys = count - (thumbCount * 2);
      cols = Math.ceil(mainKeys / (rows * 2));
    }

    // Build the layout string
    let layout = `[layout:zmk-import]
rows: ${rows}
columns: ${cols},${cols}
thumb: ${thumbCount},${thumbCount}
split: ${split}
stagger: none

`;

    // Split keys into rows
    const keysPerRow = cols * 2;
    let keyIndex = 0;
    
    for (let r = 0; r < rows; r++) {
      const leftKeys = [];
      const rightKeys = [];
      
      for (let c = 0; c < cols; c++) {
        if (keyIndex < keys.length) {
          leftKeys.push(keys[keyIndex++]);
        }
      }
      for (let c = 0; c < cols; c++) {
        if (keyIndex < keys.length) {
          rightKeys.push(keys[keyIndex++]);
        }
      }
      
      layout += `row${r}: ${leftKeys.join(' ')} | ${rightKeys.join(' ')}\n`;
    }

    // Thumb row
    const leftThumb = [];
    const rightThumb = [];
    for (let t = 0; t < thumbCount; t++) {
      if (keyIndex < keys.length) {
        leftThumb.push(keys[keyIndex++]);
      }
    }
    for (let t = 0; t < thumbCount; t++) {
      if (keyIndex < keys.length) {
        rightThumb.push(keys[keyIndex++]);
      }
    }
    layout += `thumb: ${leftThumb.join(' ')} | ${rightThumb.join(' ')}\n`;

    return layout;
  }

  /**
   * Clean up event listeners
   */
  function destroy() {
    handlers.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    handlers.length = 0;
  }

  // Initialize
  init();

  return {
    destroy,
  };
}

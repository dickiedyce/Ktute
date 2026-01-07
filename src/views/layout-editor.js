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
  generateLayoutId,
} from '../keyboard/combined-layouts.js';
import { createKeyboardRenderer } from '../keyboard/renderer.js';
import { parseCombinedLayout } from '../keyboard/layout-parser.js';

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
        <p class="subtitle">Create custom keyboard layouts</p>
      </header>

      <div class="editor-layout">
        <section class="editor-sidebar">
          <div class="editor-name-group">
            <label for="layout-name">Layout Name</label>
            <input type="text" id="layout-name" class="layout-name-input" value="${escapeHtml(layoutName)}" placeholder="My Layout" />
          </div>

          <div class="editor-controls">
            <label for="load-custom">Load custom layout:</label>
            <select id="load-custom" data-action="load-custom">
              <option value="">-- Select --</option>
              ${Object.entries(customLayouts)
                .map(([id, layout]) => `<option value="${id}">${layout.name}</option>`)
                .join('')}
            </select>
            <button class="btn btn-danger btn-sm" data-action="delete-custom" disabled>Delete</button>
          </div>

          <div class="editor-controls">
            <label for="load-builtin">Load from built-in:</label>
            <select id="load-builtin" data-action="load-builtin">
              <option value="">-- Select --</option>
              ${Object.entries(builtinLayouts)
                .map(([id, layout]) => `<option value="${id}">${layout.name}</option>`)
                .join('')}
            </select>
          </div>

          <div class="editor-actions">
            <button class="btn btn-primary" data-action="save">Save Layout</button>
            <button class="btn btn-secondary" data-action="use-layout">Save &amp; Use</button>
            <div class="editor-actions-row">
              <button class="btn btn-secondary" data-action="export">Export</button>
              <button class="btn btn-secondary" data-action="import">Import</button>
              <input type="file" id="import-file" accept=".txt,.layout" style="display: none;">
            </div>
          </div>
        </section>

        <section class="editor-main">
          <div class="editor-text-container">
            <textarea 
              class="layout-text-editor" 
              spellcheck="false"
              placeholder="Enter layout definition..."
            >${escapeHtml(currentText)}</textarea>
            <div class="validation-error" style="display: none;"></div>
          </div>

          <div class="editor-preview-container">
            <h3>Preview</h3>
            <div class="editor-preview"></div>
          </div>
        </section>
      </div>

      <nav class="editor-nav">
        <p class="hint">Press <kbd>Escape</kbd> to go back • <kbd>Ctrl+S</kbd> to save</p>
      </nav>
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
        // Get all layouts
        const allLayouts = storage.get('customLayouts') || {};
        delete allLayouts[currentLoadedLayoutId];
        storage.set('customLayouts', allLayouts);

        // If this was the active layout, clear it
        const activeLayoutId = preferences.get('layoutId');
        if (activeLayoutId === currentLoadedLayoutId) {
          preferences.set('layoutId', null);
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

      const id = generateLayoutId(layoutName);
      saveCustomLayout(id, layoutName, currentText);

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

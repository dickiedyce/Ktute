/**
 * Layout Editor View
 * Create and edit custom keyboard layouts and key mappings
 */

import { storage } from '../core/storage.js';
import { getBuiltinPhysicalLayouts } from '../keyboard/physical-layouts.js';
import { getBuiltinKeyMappings } from '../keyboard/key-mappings.js';
import { createKeyboardRenderer } from '../keyboard/renderer.js';
import { parsePhysicalLayout, parseKeyMapping } from '../keyboard/layout-parser.js';

const DEFAULT_PHYSICAL_LAYOUT = `[physical:custom]
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

const DEFAULT_KEY_MAPPING = `[mapping:custom]
base: custom

row0: q w e r t y | u i o p [ ]
row1: a s d f g h | j k l ; ' \\
row2: z x c v b n | m , . / - =
thumb: esc spc tab | ent bspc del

fingers:
row0: 1 2 3 4 4 4 | 5 5 5 6 7 8
row1: 1 2 3 4 4 4 | 5 5 5 6 7 8
row2: 1 2 3 4 4 4 | 5 5 5 6 7 8
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
  const physicalLayouts = getBuiltinPhysicalLayouts();
  const keyMappings = getBuiltinKeyMappings();

  // Current state
  let activeTab = 'physical-layout';
  let currentText = DEFAULT_PHYSICAL_LAYOUT;
  let validationError = null;

  // DOM elements
  let tabsContainer = null;
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
          <div class="editor-tabs">
            <button class="tab-btn active" data-tab="physical-layout">Physical Layout</button>
            <button class="tab-btn" data-tab="key-mapping">Key Mapping</button>
          </div>

          <div class="editor-controls">
            <label for="load-builtin">Load from built-in:</label>
            <select id="load-builtin" data-action="load-builtin">
              <option value="">-- Select --</option>
              ${Object.keys(physicalLayouts)
                .map((name) => `<option value="${name}">${formatName(name)}</option>`)
                .join('')}
            </select>
          </div>

          <div class="editor-actions">
            <button class="btn btn-primary" data-action="save">Save Layout</button>
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
    tabsContainer = container.querySelector('.editor-tabs');
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
   * Format name for display
   * @param {string} name
   * @returns {string}
   */
  function formatName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
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
    // Tab switching
    const handleTabClick = (e) => {
      const tab = e.target.closest('[data-tab]');
      if (!tab) return;

      // Update active tab
      tabsContainer.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active'));
      tab.classList.add('active');

      activeTab = tab.dataset.tab;

      // Update editor content
      if (activeTab === 'physical-layout') {
        editorTextarea.value = DEFAULT_PHYSICAL_LAYOUT;
        updateBuiltinDropdown(physicalLayouts);
      } else {
        editorTextarea.value = DEFAULT_KEY_MAPPING;
        updateBuiltinDropdown(keyMappings);
      }

      currentText = editorTextarea.value;
      updatePreview();
    };

    // Text editor changes
    const handleTextInput = () => {
      currentText = editorTextarea.value;
      updatePreview();
    };

    // Load built-in layout
    const handleLoadBuiltin = (e) => {
      const name = e.target.value;
      if (!name) return;

      const layouts = activeTab === 'physical-layout' ? physicalLayouts : keyMappings;
      if (layouts[name]) {
        editorTextarea.value = layouts[name];
        currentText = layouts[name];
        updatePreview();
      }
    };

    // Save layout
    const handleSave = () => {
      if (validationError) {
        return;
      }

      // Extract name from layout text
      const nameMatch = currentText.match(/\[(physical|mapping):([^\]]+)\]/);
      if (!nameMatch) {
        showError('Could not find layout name in definition');
        return;
      }

      const type = nameMatch[1] === 'physical' ? 'custom-layouts' : 'custom-mappings';
      const name = nameMatch[2].trim();

      // Save to storage
      const stored = storage.get(type, {});
      stored[name] = currentText;
      storage.set(type, stored);

      // Show success feedback
      const saveBtn = container.querySelector('[data-action="save"]');
      const originalText = saveBtn.textContent;
      saveBtn.textContent = 'Saved!';
      setTimeout(() => {
        saveBtn.textContent = originalText;
      }, 2000);
    };

    // Export layout
    const handleExport = () => {
      const nameMatch = currentText.match(/\[(physical|mapping):([^\]]+)\]/);
      const name = nameMatch ? nameMatch[2].trim() : 'layout';
      const extension = activeTab === 'physical-layout' ? 'layout' : 'mapping';
      
      const blob = new Blob([currentText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}.${extension}.txt`;
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
        updatePreview();
      };
      reader.readAsText(file);
      e.target.value = ''; // Reset for next import
    };

    // Escape key to go back
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        // Don't trigger if we're in the textarea
        if (document.activeElement === editorTextarea) {
          editorTextarea.blur();
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
    tabsContainer.addEventListener('click', handleTabClick);
    editorTextarea.addEventListener('input', handleTextInput);
    document.addEventListener('keydown', handleKeyDown);

    const loadDropdown = container.querySelector('[data-action="load-builtin"]');
    loadDropdown.addEventListener('change', handleLoadBuiltin);

    const saveBtn = container.querySelector('[data-action="save"]');
    saveBtn.addEventListener('click', handleSave);

    const exportBtn = container.querySelector('[data-action="export"]');
    exportBtn.addEventListener('click', handleExport);

    const importBtn = container.querySelector('[data-action="import"]');
    importBtn.addEventListener('click', handleImport);

    const fileInput = container.querySelector('#import-file');
    fileInput.addEventListener('change', handleFileSelected);

    handlers.push(
      { element: tabsContainer, event: 'click', handler: handleTabClick },
      { element: editorTextarea, event: 'input', handler: handleTextInput },
      { element: document, event: 'keydown', handler: handleKeyDown },
      { element: loadDropdown, event: 'change', handler: handleLoadBuiltin },
      { element: saveBtn, event: 'click', handler: handleSave },
      { element: exportBtn, event: 'click', handler: handleExport },
      { element: importBtn, event: 'click', handler: handleImport },
      { element: fileInput, event: 'change', handler: handleFileSelected }
    );
  }

  /**
   * Update built-in dropdown options
   * @param {Object} layouts
   */
  function updateBuiltinDropdown(layouts) {
    const dropdown = container.querySelector('[data-action="load-builtin"]');
    dropdown.innerHTML = `
      <option value="">-- Select --</option>
      ${Object.keys(layouts)
        .map((name) => `<option value="${name}">${formatName(name)}</option>`)
        .join('')}
    `;
  }

  /**
   * Update the keyboard preview
   */
  function updatePreview() {
    validationError = null;
    hideError();

    try {
      if (activeTab === 'physical-layout') {
        const parsedLayout = parsePhysicalLayout(currentText);
        // Use a basic mapping for preview
        const defaultMapping = parseKeyMapping(DEFAULT_KEY_MAPPING);
        renderer.render(parsedLayout, defaultMapping, { showFingers: false });
      } else {
        // For key mapping, we need a physical layout
        const parsedMapping = parseKeyMapping(currentText);
        const defaultLayout = parsePhysicalLayout(DEFAULT_PHYSICAL_LAYOUT);
        renderer.render(defaultLayout, parsedMapping, { showFingers: true });
      }
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

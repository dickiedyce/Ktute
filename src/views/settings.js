/**
 * Settings View
 * Layout and preference configuration
 */

import { preferences } from '../core/preferences.js';
import { getAllLayouts, deleteCustomLayout } from '../keyboard/combined-layouts.js';
import { createKeyboardRenderer } from '../keyboard/renderer.js';
import { parseCombinedLayout } from '../keyboard/layout-parser.js';

/**
 * Create the settings view
 * @param {HTMLElement} container - Container element
 * @param {Object} [options={}] - View options
 * @returns {Object} View controller with destroy method
 */
export function createSettingsView(container, options = {}) {
  const { onBack } = options;

  // Current selection
  let currentLayoutId = preferences.getLayout();

  // DOM elements
  let layoutSelect = null;
  let previewContainer = null;
  let deleteBtn = null;
  let renderer = null;

  // Event handlers (for cleanup)
  const handlers = [];

  /**
   * Initialize the view
   */
  function init() {
    container.innerHTML = '';

    const layouts = getAllLayouts();

    const view = document.createElement('main');
    view.setAttribute('data-view', 'settings');
    view.className = 'settings-view';

    view.innerHTML = `
      <header class="settings-header">
        <h1>Settings</h1>
        <p class="subtitle">Configure your keyboard layout</p>
      </header>

      <section class="settings-section">
        <h2>Keyboard Layout</h2>
        
        <div class="setting-group">
          <label for="layout-select">Active Layout</label>
          <div class="layout-select-group">
            <select id="layout-select" data-setting="layout">
              ${Object.entries(layouts)
                .map(
                  ([id, layout]) =>
                    `<option value="${id}" ${id === currentLayoutId ? 'selected' : ''}>${layout.name}${layout.custom ? ' (custom)' : ''}</option>`
                )
                .join('')}
            </select>
            <button class="btn btn-secondary btn-small" data-action="delete-layout" disabled>Delete</button>
          </div>
          <p class="setting-description">Choose from built-in or custom layouts</p>
        </div>
      </section>

      <section class="settings-section">
        <h2>Preview</h2>
        <div class="keyboard-preview"></div>
      </section>

      <nav class="settings-nav">
        <button class="btn btn-secondary" data-action="edit-layout">Edit Layout</button>
        <p class="hint">Press <kbd>Escape</kbd> to go back</p>
      </nav>
    `;

    container.appendChild(view);

    // Get DOM references
    layoutSelect = container.querySelector('[data-setting="layout"]');
    previewContainer = container.querySelector('.keyboard-preview');
    deleteBtn = container.querySelector('[data-action="delete-layout"]');

    // Set up renderer
    renderer = createKeyboardRenderer(previewContainer);

    // Bind events
    bindEvents();

    // Initial render
    updatePreview();
    updateDeleteButton();
  }

  /**
   * Bind event handlers
   */
  function bindEvents() {
    const handleLayoutChange = (e) => {
      currentLayoutId = e.target.value;
      preferences.setLayout(currentLayoutId);
      updatePreview();
      updateDeleteButton();
    };

    const handleDelete = () => {
      const layouts = getAllLayouts();
      const layout = layouts[currentLayoutId];
      
      if (layout?.custom) {
        if (confirm(`Delete layout "${layout.name}"?`)) {
          deleteCustomLayout(currentLayoutId);
          // Switch to first available layout
          const remaining = getAllLayouts();
          const firstId = Object.keys(remaining)[0];
          if (firstId) {
            currentLayoutId = firstId;
            preferences.setLayout(currentLayoutId);
          }
          // Re-initialize to refresh the select
          init();
        }
      }
    };

    const handleEditLayout = () => {
      window.location.hash = '/layout';
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onBack) {
          onBack();
        } else {
          window.location.hash = '/';
        }
      }
    };

    layoutSelect.addEventListener('change', handleLayoutChange);
    deleteBtn.addEventListener('click', handleDelete);
    
    const editBtn = container.querySelector('[data-action="edit-layout"]');
    if (editBtn) {
      editBtn.addEventListener('click', handleEditLayout);
      handlers.push({ element: editBtn, event: 'click', handler: handleEditLayout });
    }
    
    document.addEventListener('keydown', handleKeyDown);

    handlers.push(
      { element: layoutSelect, event: 'change', handler: handleLayoutChange },
      { element: deleteBtn, event: 'click', handler: handleDelete },
      { element: document, event: 'keydown', handler: handleKeyDown }
    );
  }

  /**
   * Update the delete button state
   */
  function updateDeleteButton() {
    const layouts = getAllLayouts();
    const layout = layouts[currentLayoutId];
    deleteBtn.disabled = !layout?.custom;
  }

  /**
   * Update the keyboard preview
   */
  function updatePreview() {
    const layouts = getAllLayouts();
    const layout = layouts[currentLayoutId];

    if (layout?.definition) {
      try {
        const { physical, mapping } = parseCombinedLayout(layout.definition);
        renderer.render(physical, mapping, { showFingers: true });
      } catch (e) {
        console.error('Failed to parse layout:', e);
        previewContainer.innerHTML = '<p class="error">Failed to render layout</p>';
      }
    }
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

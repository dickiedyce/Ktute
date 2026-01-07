/**
 * Settings View
 * Layout and preference configuration
 */

import { preferences } from '../core/preferences.js';
import { getBuiltinPhysicalLayouts } from '../keyboard/physical-layouts.js';
import { getBuiltinKeyMappings } from '../keyboard/key-mappings.js';
import { createKeyboardRenderer } from '../keyboard/renderer.js';
import { parsePhysicalLayout, parseKeyMapping } from '../keyboard/layout-parser.js';

/**
 * Create the settings view
 * @param {HTMLElement} container - Container element
 * @param {Object} [options={}] - View options
 * @returns {Object} View controller with destroy method
 */
export function createSettingsView(container, options = {}) {
  const { onBack } = options;

  // Get available layouts and mappings
  const physicalLayouts = getBuiltinPhysicalLayouts();
  const keyMappings = getBuiltinKeyMappings();

  // Current selections
  let currentLayout = preferences.getPhysicalLayout();
  let currentMapping = preferences.getKeyMapping();

  // DOM elements
  let layoutSelect = null;
  let mappingSelect = null;
  let previewContainer = null;
  let renderer = null;

  // Event handlers (for cleanup)
  const handlers = [];

  /**
   * Initialize the view
   */
  function init() {
    container.innerHTML = '';

    const view = document.createElement('main');
    view.setAttribute('data-view', 'settings');
    view.className = 'settings-view';

    view.innerHTML = `
      <header class="settings-header">
        <h1>Settings</h1>
        <p class="subtitle">Configure your keyboard and preferences</p>
      </header>

      <section class="settings-section">
        <h2>Keyboard Layout</h2>
        
        <div class="setting-group">
          <label for="physical-layout">Physical Layout</label>
          <select id="physical-layout" data-setting="physical-layout">
            ${Object.keys(physicalLayouts)
              .map(
                (name) =>
                  `<option value="${name}" ${name === currentLayout ? 'selected' : ''}>${formatLayoutName(name)}</option>`
              )
              .join('')}
          </select>
          <p class="setting-description">The physical arrangement of your keyboard</p>
        </div>

        <div class="setting-group">
          <label for="key-mapping">Key Mapping</label>
          <select id="key-mapping" data-setting="key-mapping">
            ${Object.keys(keyMappings)
              .map(
                (name) =>
                  `<option value="${name}" ${name === currentMapping ? 'selected' : ''}>${formatMappingName(name)}</option>`
              )
              .join('')}
          </select>
          <p class="setting-description">The logical layout of your keys</p>
        </div>
      </section>

      <section class="settings-section">
        <h2>Preview</h2>
        <div class="keyboard-preview"></div>
      </section>

      <nav class="settings-nav">
        <p class="hint">Press <kbd>Escape</kbd> to go back</p>
      </nav>
    `;

    container.appendChild(view);

    // Get DOM references
    layoutSelect = container.querySelector('[data-setting="physical-layout"]');
    mappingSelect = container.querySelector('[data-setting="key-mapping"]');
    previewContainer = container.querySelector('.keyboard-preview');

    // Set up renderer
    renderer = createKeyboardRenderer(previewContainer);

    // Bind events
    bindEvents();

    // Initial render
    updatePreview();
  }

  /**
   * Format layout name for display
   * @param {string} name
   * @returns {string}
   */
  function formatLayoutName(name) {
    const displayNames = {
      corne: 'Corne / CRKBD',
      ergodox: 'Ergodox',
      svaalboard: 'Svaalboard',
      standard60: 'Standard 60%',
    };
    return displayNames[name] || name;
  }

  /**
   * Format mapping name for display
   * @param {string} name
   * @returns {string}
   */
  function formatMappingName(name) {
    const displayNames = {
      qwerty: 'QWERTY',
      'colemak-dh': 'Colemak-DH',
      workman: 'Workman',
      dvorak: 'Dvorak',
      'qwerty-ergodox': 'QWERTY (Ergodox)',
    };
    return displayNames[name] || name;
  }

  /**
   * Bind event handlers
   */
  function bindEvents() {
    const handleLayoutChange = (e) => {
      currentLayout = e.target.value;
      preferences.setPhysicalLayout(currentLayout);
      updatePreview();
    };

    const handleMappingChange = (e) => {
      currentMapping = e.target.value;
      preferences.setKeyMapping(currentMapping);
      updatePreview();
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
    mappingSelect.addEventListener('change', handleMappingChange);
    document.addEventListener('keydown', handleKeyDown);

    handlers.push(
      { element: layoutSelect, event: 'change', handler: handleLayoutChange },
      { element: mappingSelect, event: 'change', handler: handleMappingChange },
      { element: document, event: 'keydown', handler: handleKeyDown }
    );
  }

  /**
   * Update the keyboard preview
   */
  function updatePreview() {
    const layoutDef = physicalLayouts[currentLayout];
    const mappingDef = keyMappings[currentMapping];

    if (layoutDef && mappingDef) {
      const parsedLayout = parsePhysicalLayout(layoutDef);
      const parsedMapping = parseKeyMapping(mappingDef);
      renderer.render(parsedLayout, parsedMapping, { showFingers: true });
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

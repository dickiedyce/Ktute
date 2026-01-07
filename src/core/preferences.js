/**
 * User preferences management
 * Handles layout, theme, and other user settings
 */

import { storage } from './storage.js';

const STORAGE_KEY = 'preferences';

const DEFAULTS = {
  layout: 'corne-colemak-dh',
  // Legacy keys for migration
  physicalLayout: null,
  keyMapping: null,
  theme: 'dark',
  showFingers: true,
  showHints: true,
  soundEnabled: false,
};

/**
 * Get stored preferences merged with defaults
 * @returns {Object}
 */
function getStored() {
  return { ...DEFAULTS, ...storage.get(STORAGE_KEY, {}) };
}

/**
 * Save preferences to storage
 * @param {Object} prefs
 */
function save(prefs) {
  storage.set(STORAGE_KEY, prefs);
}

/**
 * Preferences utility
 */
export const preferences = {
  /**
   * Get the current layout name
   * @returns {string}
   */
  getLayout() {
    return getStored().layout;
  },

  /**
   * Set the layout
   * @param {string} layoutName
   */
  setLayout(layoutName) {
    const prefs = getStored();
    prefs.layout = layoutName;
    save(prefs);
  },

  /**
   * Get the current physical layout name (legacy, for backwards compatibility)
   * @returns {string}
   */
  getPhysicalLayout() {
    const stored = getStored();
    // Return legacy value if set, otherwise derive from combined layout
    if (stored.physicalLayout) {
      return stored.physicalLayout;
    }
    // Default to 'corne' based on combined layout
    return 'corne';
  },

  /**
   * Set the physical layout (legacy)
   * @param {string} layoutName
   */
  setPhysicalLayout(layoutName) {
    const prefs = getStored();
    prefs.physicalLayout = layoutName;
    save(prefs);
  },

  /**
   * Get the current key mapping name (legacy, for backwards compatibility)
   * @returns {string}
   */
  getKeyMapping() {
    const stored = getStored();
    if (stored.keyMapping) {
      return stored.keyMapping;
    }
    return 'colemak-dh';
  },

  /**
   * Set the key mapping (legacy)
   * @param {string} mappingName
   */
  setKeyMapping(mappingName) {
    const prefs = getStored();
    prefs.keyMapping = mappingName;
    save(prefs);
  },

  /**
   * Get the current theme
   * @returns {string}
   */
  getTheme() {
    return getStored().theme;
  },

  /**
   * Set the theme
   * @param {string} theme
   */
  setTheme(theme) {
    const prefs = getStored();
    prefs.theme = theme;
    save(prefs);
  },

  /**
   * Get whether to show finger hints
   * @returns {boolean}
   */
  getShowFingers() {
    return getStored().showFingers;
  },

  /**
   * Set whether to show finger hints
   * @param {boolean} show
   */
  setShowFingers(show) {
    const prefs = getStored();
    prefs.showFingers = show;
    save(prefs);
  },

  /**
   * Get all preferences
   * @returns {Object}
   */
  getAll() {
    return getStored();
  },

  /**
   * Reset all preferences to defaults
   */
  reset() {
    save({ ...DEFAULTS });
  },
};

/**
 * User preferences management
 * Handles layout, theme, and other user settings
 */

import { storage } from './storage.js';

const STORAGE_KEY = 'preferences';

const DEFAULTS = {
  physicalLayout: 'corne',
  keyMapping: 'colemak-dh',
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
   * Get the current physical layout name
   * @returns {string}
   */
  getPhysicalLayout() {
    return getStored().physicalLayout;
  },

  /**
   * Set the physical layout
   * @param {string} layoutName
   */
  setPhysicalLayout(layoutName) {
    const prefs = getStored();
    prefs.physicalLayout = layoutName;
    save(prefs);
  },

  /**
   * Get the current key mapping name
   * @returns {string}
   */
  getKeyMapping() {
    return getStored().keyMapping;
  },

  /**
   * Set the key mapping
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

/**
 * LocalStorage wrapper with JSON serialization and namespacing
 */

const PREFIX = 'ktute:';

/**
 * Storage utility
 */
export const storage = {
  /**
   * Get a value from storage
   * @param {string} key
   * @param {*} [defaultValue=null] - Value to return if key not found
   * @returns {*}
   */
  get(key, defaultValue = null) {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) {
      return defaultValue;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  },

  /**
   * Set a value in storage
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  },

  /**
   * Remove a key from storage
   * @param {string} key
   */
  remove(key) {
    localStorage.removeItem(PREFIX + key);
  },

  /**
   * Check if a key exists
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return localStorage.getItem(PREFIX + key) !== null;
  },

  /**
   * Clear all app storage
   */
  clear() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  },
};

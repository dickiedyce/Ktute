/**
 * Simple reactive state management
 * Supports subscriptions per key or wildcard
 */

/**
 * Create a reactive store
 * @param {Object} initialState - Initial state object
 * @returns {Object} Store with get, set, update, subscribe methods
 */
export function createStore(initialState = {}) {
  let state = { ...initialState };
  const subscribers = new Map(); // key -> Set of callbacks
  const wildcardSubscribers = new Set(); // callbacks for any change

  /**
   * Get entire state
   * @returns {Object}
   */
  function getState() {
    return { ...state };
  }

  /**
   * Get a specific value
   * @param {string} key
   * @returns {*}
   */
  function get(key) {
    return state[key];
  }

  /**
   * Set a specific value
   * @param {string} key
   * @param {*} value
   */
  function set(key, value) {
    if (state[key] === value) {
      return; // No change
    }

    state[key] = value;
    notify(key, value);
  }

  /**
   * Update multiple values at once
   * @param {Object} updates
   */
  function update(updates) {
    for (const [key, value] of Object.entries(updates)) {
      set(key, value);
    }
  }

  /**
   * Subscribe to changes
   * @param {string} key - Key to watch, or '*' for all changes
   * @param {Function} callback - Called with (value) for key, or (key, value) for wildcard
   * @returns {Function} Unsubscribe function
   */
  function subscribe(key, callback) {
    if (key === '*') {
      wildcardSubscribers.add(callback);
      return () => wildcardSubscribers.delete(callback);
    }

    if (!subscribers.has(key)) {
      subscribers.set(key, new Set());
    }
    subscribers.get(key).add(callback);

    return () => subscribers.get(key).delete(callback);
  }

  /**
   * Notify subscribers of a change
   * @param {string} key
   * @param {*} value
   */
  function notify(key, value) {
    // Notify key-specific subscribers
    if (subscribers.has(key)) {
      for (const callback of subscribers.get(key)) {
        callback(value);
      }
    }

    // Notify wildcard subscribers
    for (const callback of wildcardSubscribers) {
      callback(key, value);
    }
  }

  return {
    getState,
    get,
    set,
    update,
    subscribe,
  };
}

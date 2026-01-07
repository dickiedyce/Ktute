/**
 * DOM utility functions
 * Lightweight helpers for DOM manipulation
 */

/**
 * Query selector shorthand
 * @param {string} selector - CSS selector
 * @param {Element|Document} [parent=document] - Parent to search within
 * @returns {Element|null}
 */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * Query selector all shorthand (returns array, not NodeList)
 * @param {string} selector - CSS selector
 * @param {Element|Document} [parent=document] - Parent to search within
 * @returns {Element[]}
 */
export function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

/**
 * Create an element with options
 * @param {string} tag - HTML tag name
 * @param {Object} [options={}] - Element options
 * @param {string} [options.className] - CSS class name(s)
 * @param {Object} [options.attrs] - Attributes to set
 * @param {Object} [options.data] - Data attributes to set
 * @param {string} [options.text] - Text content
 * @param {string} [options.html] - Inner HTML
 * @param {Element[]} [options.children] - Child elements to append
 * @returns {Element}
 */
export function createElement(tag, options = {}) {
  const el = document.createElement(tag);

  if (options.className) {
    el.className = options.className;
  }

  if (options.attrs) {
    for (const [key, value] of Object.entries(options.attrs)) {
      el.setAttribute(key, value);
    }
  }

  if (options.data) {
    for (const [key, value] of Object.entries(options.data)) {
      el.dataset[key] = value;
    }
  }

  if (options.text) {
    el.textContent = options.text;
  }

  if (options.html) {
    el.innerHTML = options.html;
  }

  if (options.children) {
    for (const child of options.children) {
      el.appendChild(child);
    }
  }

  return el;
}

/**
 * Add event listener
 * @param {Element} el - Element to attach listener to
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @param {Object} [options] - Event listener options
 */
export function on(el, event, handler, options) {
  el.addEventListener(event, handler, options);
}

/**
 * Remove event listener
 * @param {Element} el - Element to remove listener from
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @param {Object} [options] - Event listener options
 */
export function off(el, event, handler, options) {
  el.removeEventListener(event, handler, options);
}

/**
 * Global keyboard event handling
 * Supports key combinations, contexts, and a command menu
 */

import { createElement, $, $$ } from '../utils/dom.js';

/**
 * Check if target is an input element
 * @param {Element} target
 * @returns {boolean}
 */
function isInputElement(target) {
  const tagName = target.tagName?.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || target.isContentEditable;
}

/**
 * Parse a key string into components
 * @param {string} keyString - e.g., 'ctrl+s', 'Escape', 'shift+?'
 * @returns {Object}
 */
function parseKeyString(keyString) {
  const parts = keyString.toLowerCase().split('+');
  const key = parts.pop();
  return {
    key,
    ctrl: parts.includes('ctrl'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
    meta: parts.includes('meta'),
  };
}

/**
 * Check if event matches key definition
 * @param {KeyboardEvent} event
 * @param {Object} keyDef
 * @returns {boolean}
 */
function matchesKey(event, keyDef) {
  return (
    event.key.toLowerCase() === keyDef.key &&
    event.ctrlKey === keyDef.ctrl &&
    event.shiftKey === keyDef.shift &&
    event.altKey === keyDef.alt &&
    event.metaKey === keyDef.meta
  );
}

/**
 * Create a keyboard handler
 * @param {Object} handlers - Key to handler mapping
 * @returns {Object}
 */
export function createKeyboardHandler(handlers) {
  const contextStack = [];
  
  // Compile handlers
  const compiledHandlers = Object.entries(handlers).map(([key, handler]) => ({
    ...parseKeyString(key),
    handler,
  }));

  function handleKeyDown(event) {
    // Skip if typing in input
    if (isInputElement(event.target)) {
      return;
    }

    // Check context stack first (most recent context wins)
    for (let i = contextStack.length - 1; i >= 0; i--) {
      const contextHandlers = contextStack[i];
      for (const def of contextHandlers) {
        if (matchesKey(event, def)) {
          event.preventDefault();
          def.handler(event);
          return;
        }
      }
    }

    // Check global handlers
    for (const def of compiledHandlers) {
      if (matchesKey(event, def)) {
        event.preventDefault();
        def.handler(event);
        return;
      }
    }
  }

  document.addEventListener('keydown', handleKeyDown);

  return {
    /**
     * Push a new context (modal, menu, etc.)
     * @param {Object} handlers
     */
    pushContext(handlers) {
      const compiled = Object.entries(handlers).map(([key, handler]) => ({
        ...parseKeyString(key),
        handler,
      }));
      contextStack.push(compiled);
    },

    /**
     * Pop the current context
     */
    popContext() {
      contextStack.pop();
    },

    /**
     * Clean up
     */
    destroy() {
      document.removeEventListener('keydown', handleKeyDown);
    },

    /**
     * Temporarily deactivate the handler
     */
    deactivate() {
      document.removeEventListener('keydown', handleKeyDown);
    },

    /**
     * Re-activate the handler
     */
    activate() {
      document.addEventListener('keydown', handleKeyDown);
    },
  };
}

/**
 * Create a command menu (command palette style)
 * @param {Object} options
 * @param {Array} options.commands - Array of { id, label, action, keywords? }
 * @returns {Object}
 */
export function createCommandMenu(options) {
  const { commands } = options;
  
  let isOpen = false;
  let query = '';
  let selectedIndex = 0;
  let filteredCommands = [...commands];
  let menuElement = null;
  let inputElement = null;

  /**
   * Filter commands by query
   */
  function filterCommands() {
    if (!query) {
      filteredCommands = [...commands];
    } else {
      const lowerQuery = query.toLowerCase();
      filteredCommands = commands.filter((cmd) => {
        const searchText = `${cmd.label} ${cmd.keywords || ''}`.toLowerCase();
        return searchText.includes(lowerQuery);
      });
    }
    selectedIndex = Math.min(selectedIndex, Math.max(0, filteredCommands.length - 1));
  }

  /**
   * Render the menu
   */
  function render() {
    if (!menuElement) return;

    const listEl = menuElement.querySelector('[data-command-list]');
    if (!listEl) return;

    listEl.innerHTML = '';
    filteredCommands.forEach((cmd, index) => {
      const item = createElement('div', {
        className: `command-item ${index === selectedIndex ? 'selected' : ''}`,
        text: cmd.label,
        data: { commandItem: cmd.id },
      });
      item.addEventListener('click', () => {
        selectedIndex = index;
        selectCurrent();
      });
      listEl.appendChild(item);
    });
  }

  /**
   * Open the menu
   */
  function open() {
    if (isOpen) return;
    isOpen = true;
    query = '';
    selectedIndex = 0;
    filterCommands();

    // Create menu element
    menuElement = createElement('div', {
      className: 'command-menu-overlay',
      data: { commandMenu: '' },
    });

    const dialog = createElement('div', { className: 'command-menu-dialog' });
    
    inputElement = createElement('input', {
      className: 'command-menu-input',
      attrs: { type: 'text', placeholder: 'Type a command...' },
    });
    inputElement.addEventListener('input', (e) => {
      query = e.target.value;
      filterCommands();
      render();
    });
    inputElement.addEventListener('keydown', handleMenuKeyDown);

    const list = createElement('div', {
      className: 'command-menu-list',
      data: { commandList: '' },
    });

    dialog.appendChild(inputElement);
    dialog.appendChild(list);
    menuElement.appendChild(dialog);
    document.body.appendChild(menuElement);

    render();
    inputElement.focus();
  }

  /**
   * Close the menu
   */
  function close() {
    if (!isOpen) return;
    isOpen = false;
    
    if (menuElement) {
      menuElement.remove();
      menuElement = null;
      inputElement = null;
    }
  }

  /**
   * Handle keyboard in menu
   * @param {KeyboardEvent} event
   */
  function handleMenuKeyDown(event) {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveSelection(1);
        render();
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveSelection(-1);
        render();
        break;
      case 'Enter':
        event.preventDefault();
        selectCurrent();
        break;
    }
  }

  // Also listen for Escape globally when menu is open
  function handleGlobalKeyDown(event) {
    if (isOpen && event.key === 'Escape') {
      close();
    }
  }
  document.addEventListener('keydown', handleGlobalKeyDown);

  /**
   * Move selection
   * @param {number} delta
   */
  function moveSelection(delta) {
    selectedIndex = Math.max(0, Math.min(filteredCommands.length - 1, selectedIndex + delta));
  }

  /**
   * Select current command
   */
  function selectCurrent() {
    const cmd = filteredCommands[selectedIndex];
    if (cmd) {
      close();
      cmd.action();
    }
  }

  /**
   * Set query programmatically (for testing)
   * @param {string} q
   */
  function setQuery(q) {
    query = q;
    if (inputElement) {
      inputElement.value = q;
    }
    filterCommands();
    render();
  }

  /**
   * Get selected index (for testing)
   * @returns {number}
   */
  function getSelectedIndex() {
    return selectedIndex;
  }

  return {
    open,
    close,
    setQuery,
    selectCurrent,
    moveSelection,
    getSelectedIndex,
    destroy() {
      close();
      document.removeEventListener('keydown', handleGlobalKeyDown);
    },
  };
}

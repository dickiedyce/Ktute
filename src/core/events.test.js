import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createKeyboardHandler, createCommandMenu } from './events.js';

describe('Keyboard Events', () => {
  let handler;

  afterEach(() => {
    if (handler && handler.destroy) {
      handler.destroy();
    }
    document.body.innerHTML = '';
  });

  describe('createKeyboardHandler', () => {
    it('should register global key handlers', () => {
      const escapeHandler = vi.fn();
      handler = createKeyboardHandler({
        'Escape': escapeHandler,
      });

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(escapeHandler).toHaveBeenCalled();
    });

    it('should support modifier keys', () => {
      const ctrlSHandler = vi.fn();
      handler = createKeyboardHandler({
        'ctrl+s': ctrlSHandler,
      });

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }));
      expect(ctrlSHandler).toHaveBeenCalled();
    });

    it('should not trigger when typing in input', () => {
      const slashHandler = vi.fn();
      handler = createKeyboardHandler({
        '/': slashHandler,
      });

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      const event = new KeyboardEvent('keydown', { key: '/' });
      Object.defineProperty(event, 'target', { value: input });
      document.dispatchEvent(event);

      expect(slashHandler).not.toHaveBeenCalled();
    });

    it('should pass event to handler', () => {
      let receivedEvent = null;
      handler = createKeyboardHandler({
        'Enter': (e) => { receivedEvent = e; },
      });

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(receivedEvent).not.toBeNull();
      expect(receivedEvent.key).toBe('Enter');
    });

    it('should allow temporary override for modal contexts', () => {
      const globalHandler = vi.fn();
      const modalHandler = vi.fn();
      
      handler = createKeyboardHandler({
        'Escape': globalHandler,
      });

      handler.pushContext({
        'Escape': modalHandler,
      });

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(modalHandler).toHaveBeenCalled();
      expect(globalHandler).not.toHaveBeenCalled();

      handler.popContext();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(globalHandler).toHaveBeenCalled();
    });
  });
});

describe('Command Menu', () => {
  let menu;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  afterEach(() => {
    if (menu && menu.destroy) {
      menu.destroy();
    }
    document.body.innerHTML = '';
  });

  describe('createCommandMenu', () => {
    it('should create a command menu', () => {
      menu = createCommandMenu({
        commands: [
          { id: 'practice', label: 'Start Practice', action: () => {} },
        ],
      });
      expect(menu).toBeDefined();
    });

    it('should open on trigger', () => {
      menu = createCommandMenu({
        commands: [
          { id: 'practice', label: 'Start Practice', action: () => {} },
        ],
      });

      menu.open();
      const menuEl = document.querySelector('[data-command-menu]');
      expect(menuEl).not.toBeNull();
    });

    it('should close on escape', () => {
      menu = createCommandMenu({
        commands: [
          { id: 'practice', label: 'Start Practice', action: () => {} },
        ],
      });

      menu.open();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      const menuEl = document.querySelector('[data-command-menu]');
      expect(menuEl).toBeNull();
    });

    it('should filter commands by search query', () => {
      menu = createCommandMenu({
        commands: [
          { id: 'practice', label: 'Start Practice', action: () => {} },
          { id: 'stats', label: 'View Statistics', action: () => {} },
        ],
      });

      menu.open();
      menu.setQuery('stat');
      
      const items = document.querySelectorAll('[data-command-item]');
      expect(items).toHaveLength(1);
      expect(items[0].textContent).toContain('Statistics');
    });

    it('should execute command on selection', () => {
      const actionSpy = vi.fn();
      menu = createCommandMenu({
        commands: [
          { id: 'practice', label: 'Start Practice', action: actionSpy },
        ],
      });

      menu.open();
      menu.selectCurrent();
      
      expect(actionSpy).toHaveBeenCalled();
    });

    it('should navigate with arrow keys', () => {
      menu = createCommandMenu({
        commands: [
          { id: 'a', label: 'Command A', action: () => {} },
          { id: 'b', label: 'Command B', action: () => {} },
        ],
      });

      menu.open();
      expect(menu.getSelectedIndex()).toBe(0);
      
      menu.moveSelection(1);
      expect(menu.getSelectedIndex()).toBe(1);
      
      menu.moveSelection(-1);
      expect(menu.getSelectedIndex()).toBe(0);
    });
  });
});

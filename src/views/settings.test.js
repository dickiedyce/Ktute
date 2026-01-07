import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSettingsView } from './settings.js';
import { storage } from '../core/storage.js';

describe('Settings View', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    storage.clear();
  });

  describe('createSettingsView', () => {
    it('should render settings view with data-view attribute', () => {
      createSettingsView(container);
      const view = container.querySelector('[data-view="settings"]');
      expect(view).not.toBeNull();
    });

    it('should display layout selector', () => {
      createSettingsView(container);
      const layoutSelect = container.querySelector('[data-setting="layout"]');
      expect(layoutSelect).not.toBeNull();
    });

    it('should list available combined layouts', () => {
      createSettingsView(container);
      const options = container.querySelectorAll('[data-setting="layout"] option');
      const values = Array.from(options).map(o => o.value);
      expect(values).toContain('corne-colemak-dh');
      expect(values).toContain('corne-qwerty');
      expect(values).toContain('ergodox-qwerty');
    });

    it('should show current layout as selected', () => {
      createSettingsView(container);
      const layoutSelect = container.querySelector('[data-setting="layout"]');
      expect(layoutSelect.value).toBe('corne-colemak-dh');
    });
  });

  describe('layout selection', () => {
    it('should update preferences when layout changes', () => {
      const { destroy } = createSettingsView(container);
      const layoutSelect = container.querySelector('[data-setting="layout"]');
      
      layoutSelect.value = 'ergodox-qwerty';
      layoutSelect.dispatchEvent(new Event('change'));
      
      const prefs = storage.get('preferences');
      expect(prefs.layout).toBe('ergodox-qwerty');
      destroy();
    });
  });

  describe('keyboard preview', () => {
    it('should render keyboard preview', () => {
      createSettingsView(container);
      const preview = container.querySelector('.keyboard-preview');
      expect(preview).not.toBeNull();
    });

    it('should update preview when layout changes', () => {
      const { destroy } = createSettingsView(container);
      const layoutSelect = container.querySelector('[data-setting="layout"]');
      const preview = container.querySelector('.keyboard-preview');
      
      const initialSvg = preview.innerHTML;
      layoutSelect.value = 'ergodox-qwerty';
      layoutSelect.dispatchEvent(new Event('change'));
      
      // Preview should have changed
      expect(preview.innerHTML).not.toBe(initialSvg);
      destroy();
    });
  });

  describe('destroy', () => {
    it('should clean up event listeners', () => {
      const { destroy } = createSettingsView(container);
      destroy();
      // Should not throw
      expect(true).toBe(true);
    });
  });
});

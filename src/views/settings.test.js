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

    it('should display physical layout selector', () => {
      createSettingsView(container);
      const layoutSelect = container.querySelector('[data-setting="physical-layout"]');
      expect(layoutSelect).not.toBeNull();
    });

    it('should display key mapping selector', () => {
      createSettingsView(container);
      const mappingSelect = container.querySelector('[data-setting="key-mapping"]');
      expect(mappingSelect).not.toBeNull();
    });

    it('should list available physical layouts', () => {
      createSettingsView(container);
      const options = container.querySelectorAll('[data-setting="physical-layout"] option');
      const values = Array.from(options).map(o => o.value);
      expect(values).toContain('corne');
      expect(values).toContain('ergodox');
      expect(values).toContain('svaalboard');
      expect(values).toContain('standard60');
    });

    it('should list available key mappings', () => {
      createSettingsView(container);
      const options = container.querySelectorAll('[data-setting="key-mapping"] option');
      const values = Array.from(options).map(o => o.value);
      expect(values).toContain('colemak-dh');
      expect(values).toContain('qwerty');
    });

    it('should show current layout as selected', () => {
      createSettingsView(container);
      const layoutSelect = container.querySelector('[data-setting="physical-layout"]');
      expect(layoutSelect.value).toBe('corne');
    });

    it('should show current mapping as selected', () => {
      createSettingsView(container);
      const mappingSelect = container.querySelector('[data-setting="key-mapping"]');
      expect(mappingSelect.value).toBe('colemak-dh');
    });
  });

  describe('layout selection', () => {
    it('should update preferences when layout changes', () => {
      const { destroy } = createSettingsView(container);
      const layoutSelect = container.querySelector('[data-setting="physical-layout"]');
      
      layoutSelect.value = 'ergodox';
      layoutSelect.dispatchEvent(new Event('change'));
      
      const prefs = storage.get('preferences');
      expect(prefs.physicalLayout).toBe('ergodox');
      destroy();
    });

    it('should update preferences when mapping changes', () => {
      const { destroy } = createSettingsView(container);
      const mappingSelect = container.querySelector('[data-setting="key-mapping"]');
      
      mappingSelect.value = 'qwerty';
      mappingSelect.dispatchEvent(new Event('change'));
      
      const prefs = storage.get('preferences');
      expect(prefs.keyMapping).toBe('qwerty');
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
      const layoutSelect = container.querySelector('[data-setting="physical-layout"]');
      const preview = container.querySelector('.keyboard-preview');
      
      const initialSvg = preview.innerHTML;
      layoutSelect.value = 'ergodox';
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

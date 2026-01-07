import { describe, it, expect, beforeEach } from 'vitest';
import { preferences } from './preferences.js';
import { storage } from './storage.js';

describe('Preferences', () => {
  beforeEach(() => {
    storage.clear();
  });

  describe('getPhysicalLayout', () => {
    it('should return default layout when not set', () => {
      expect(preferences.getPhysicalLayout()).toBe('corne');
    });

    it('should return stored layout', () => {
      preferences.setPhysicalLayout('ergodox');
      expect(preferences.getPhysicalLayout()).toBe('ergodox');
    });
  });

  describe('getKeyMapping', () => {
    it('should return default mapping when not set', () => {
      expect(preferences.getKeyMapping()).toBe('colemak-dh');
    });

    it('should return stored mapping', () => {
      preferences.setKeyMapping('qwerty');
      expect(preferences.getKeyMapping()).toBe('qwerty');
    });
  });

  describe('setPhysicalLayout', () => {
    it('should persist layout to storage', () => {
      preferences.setPhysicalLayout('svaalboard');
      // Re-get from storage
      expect(storage.get('preferences')).toEqual(
        expect.objectContaining({ physicalLayout: 'svaalboard' })
      );
    });
  });

  describe('setKeyMapping', () => {
    it('should persist mapping to storage', () => {
      preferences.setKeyMapping('workman');
      expect(storage.get('preferences')).toEqual(
        expect.objectContaining({ keyMapping: 'workman' })
      );
    });
  });

  describe('getTheme', () => {
    it('should return dark theme by default', () => {
      expect(preferences.getTheme()).toBe('dark');
    });

    it('should return stored theme', () => {
      preferences.setTheme('light');
      expect(preferences.getTheme()).toBe('light');
    });
  });

  describe('getShowFingers', () => {
    it('should return true by default', () => {
      expect(preferences.getShowFingers()).toBe(true);
    });

    it('should return stored value', () => {
      preferences.setShowFingers(false);
      expect(preferences.getShowFingers()).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should return all preferences with defaults', () => {
      const prefs = preferences.getAll();
      expect(prefs).toEqual({
        layout: 'corne-colemak-dh',
        physicalLayout: null,
        keyMapping: null,
        theme: 'dark',
        showFingers: true,
        showHints: true,
        soundEnabled: false,
      });
    });

    it('should include stored values', () => {
      preferences.setPhysicalLayout('ergodox');
      preferences.setKeyMapping('dvorak');
      const prefs = preferences.getAll();
      expect(prefs.physicalLayout).toBe('ergodox');
      expect(prefs.keyMapping).toBe('dvorak');
    });
  });

  describe('reset', () => {
    it('should reset all preferences to defaults', () => {
      preferences.setPhysicalLayout('ergodox');
      preferences.setKeyMapping('dvorak');
      preferences.reset();
      expect(preferences.getPhysicalLayout()).toBe('corne');
      expect(preferences.getKeyMapping()).toBe('colemak-dh');
    });
  });
});

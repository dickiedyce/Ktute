import { describe, it, expect } from 'vitest';
import { getFingerName, getFingerColor, getFingerForKey, FINGER_NAMES, FINGER_COLORS } from './finger-map.js';

describe('Finger Map', () => {
  describe('getFingerName', () => {
    it('should return finger name for number 0-9', () => {
      expect(getFingerName(0)).toBe('left pinky');
      expect(getFingerName(1)).toBe('left ring');
      expect(getFingerName(2)).toBe('left middle');
      expect(getFingerName(3)).toBe('left index');
      expect(getFingerName(4)).toBe('left thumb');
      expect(getFingerName(5)).toBe('right thumb');
      expect(getFingerName(6)).toBe('right index');
      expect(getFingerName(7)).toBe('right middle');
      expect(getFingerName(8)).toBe('right ring');
      expect(getFingerName(9)).toBe('right pinky');
    });

    it('should return unknown for invalid finger', () => {
      expect(getFingerName(-1)).toBe('unknown');
      expect(getFingerName(10)).toBe('unknown');
    });
  });

  describe('getFingerColor', () => {
    it('should return mirrored colors for each hand', () => {
      // Corresponding fingers share colors (symmetric)
      expect(getFingerColor(0)).toBe(getFingerColor(9)); // pinkies
      expect(getFingerColor(1)).toBe(getFingerColor(8)); // ring
      expect(getFingerColor(2)).toBe(getFingerColor(7)); // middle
      expect(getFingerColor(3)).toBe(getFingerColor(6)); // index
      expect(getFingerColor(4)).toBe(getFingerColor(5)); // thumbs
    });

    it('should have different colors for different finger types', () => {
      const pinky = getFingerColor(0);
      const ring = getFingerColor(1);
      const middle = getFingerColor(2);
      const index = getFingerColor(3);
      const thumb = getFingerColor(4);
      
      const colors = new Set([pinky, ring, middle, index, thumb]);
      expect(colors.size).toBe(5);
    });

    it('should return default color for invalid finger', () => {
      expect(getFingerColor(-1)).toBe('#666');
      expect(getFingerColor(10)).toBe('#666');
    });
  });

  describe('getFingerForKey', () => {
    it('should return finger from mapping if available', () => {
      const mapping = {
        fingers: [0, 1, 2, 3, 4, 5],
      };
      expect(getFingerForKey(0, mapping)).toBe(0);
      expect(getFingerForKey(2, mapping)).toBe(2);
    });

    it('should return null if no mapping', () => {
      expect(getFingerForKey(0, null)).toBeNull();
      expect(getFingerForKey(0, {})).toBeNull();
    });
  });

  describe('FINGER_NAMES constant', () => {
    it('should have all 10 fingers', () => {
      expect(FINGER_NAMES).toHaveLength(10);
    });
  });

  describe('FINGER_COLORS constant', () => {
    it('should have all 10 colors', () => {
      expect(FINGER_COLORS).toHaveLength(10);
    });
  });
});

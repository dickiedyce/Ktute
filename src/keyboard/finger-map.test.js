import { describe, it, expect } from 'vitest';
import { getFingerName, getFingerColor, getFingerForKey, FINGER_NAMES, FINGER_COLORS } from './finger-map.js';

describe('Finger Map', () => {
  describe('getFingerName', () => {
    it('should return finger name for number 1-8', () => {
      expect(getFingerName(1)).toBe('left pinky');
      expect(getFingerName(2)).toBe('left ring');
      expect(getFingerName(3)).toBe('left middle');
      expect(getFingerName(4)).toBe('left index');
      expect(getFingerName(5)).toBe('right index');
      expect(getFingerName(6)).toBe('right middle');
      expect(getFingerName(7)).toBe('right ring');
      expect(getFingerName(8)).toBe('right pinky');
    });

    it('should return unknown for invalid finger', () => {
      expect(getFingerName(0)).toBe('unknown');
      expect(getFingerName(9)).toBe('unknown');
    });
  });

  describe('getFingerColor', () => {
    it('should return mirrored colors for each hand', () => {
      // Index fingers share color, as do other mirrored pairs
      expect(getFingerColor(1)).toBe(getFingerColor(8)); // pinkies
      expect(getFingerColor(2)).toBe(getFingerColor(7)); // ring
      expect(getFingerColor(3)).toBe(getFingerColor(6)); // middle
      expect(getFingerColor(4)).toBe(getFingerColor(5)); // index
    });

    it('should have different colors for different finger types', () => {
      const pinky = getFingerColor(1);
      const ring = getFingerColor(2);
      const middle = getFingerColor(3);
      const index = getFingerColor(4);
      
      const colors = new Set([pinky, ring, middle, index]);
      expect(colors.size).toBe(4);
    });

    it('should return default color for invalid finger', () => {
      expect(getFingerColor(0)).toBe('#666');
    });
  });

  describe('getFingerForKey', () => {
    it('should return finger from mapping if available', () => {
      const mapping = {
        fingers: [1, 2, 3, 4, 5, 6],
      };
      expect(getFingerForKey(0, mapping)).toBe(1);
      expect(getFingerForKey(2, mapping)).toBe(3);
    });

    it('should return null if no mapping', () => {
      expect(getFingerForKey(0, null)).toBeNull();
      expect(getFingerForKey(0, {})).toBeNull();
    });
  });

  describe('FINGER_NAMES constant', () => {
    it('should have all 8 fingers', () => {
      expect(FINGER_NAMES).toHaveLength(8);
    });
  });

  describe('FINGER_COLORS constant', () => {
    it('should have all 8 colors', () => {
      expect(FINGER_COLORS).toHaveLength(8);
    });
  });
});

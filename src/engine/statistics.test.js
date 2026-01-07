/**
 * Statistics Module Tests
 * WPM, accuracy, per-key stats calculation
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  createStatisticsTracker,
  calculateWPM,
  calculateAccuracy,
} from './statistics.js';

describe('calculateWPM', () => {
  it('should calculate words per minute correctly', () => {
    // 50 characters in 60 seconds = 10 WPM (5 chars = 1 word)
    expect(calculateWPM(50, 60000)).toBe(10);
  });

  it('should handle zero time', () => {
    expect(calculateWPM(50, 0)).toBe(0);
  });

  it('should calculate based on 5 characters per word', () => {
    // 25 characters in 30 seconds = 10 WPM
    expect(calculateWPM(25, 30000)).toBe(10);
  });

  it('should round to nearest integer', () => {
    // 27 chars in 30 seconds = 10.8 WPM -> 11
    expect(calculateWPM(27, 30000)).toBe(11);
  });
});

describe('calculateAccuracy', () => {
  it('should calculate accuracy percentage', () => {
    expect(calculateAccuracy(100, 5)).toBe(95);
  });

  it('should return 100 for no errors', () => {
    expect(calculateAccuracy(50, 0)).toBe(100);
  });

  it('should handle zero total characters', () => {
    expect(calculateAccuracy(0, 0)).toBe(100);
  });

  it('should not go below 0', () => {
    expect(calculateAccuracy(10, 20)).toBe(0);
  });
});

describe('createStatisticsTracker', () => {
  let tracker;

  beforeEach(() => {
    vi.useFakeTimers();
    tracker = createStatisticsTracker();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('session tracking', () => {
    it('should start a new session', () => {
      tracker.startSession();
      expect(tracker.isRunning()).toBe(true);
    });

    it('should end a session', () => {
      tracker.startSession();
      tracker.endSession();
      expect(tracker.isRunning()).toBe(false);
    });

    it('should track session duration', () => {
      tracker.startSession();
      vi.advanceTimersByTime(5000);
      expect(tracker.getDuration()).toBe(5000);
    });
  });

  describe('input tracking', () => {
    beforeEach(() => {
      tracker.startSession();
    });

    it('should track correct inputs', () => {
      tracker.recordInput('a', true);
      tracker.recordInput('b', true);
      const stats = tracker.getStats();
      expect(stats.totalChars).toBe(2);
      expect(stats.correctChars).toBe(2);
      expect(stats.errorChars).toBe(0);
    });

    it('should track errors', () => {
      tracker.recordInput('a', true);
      tracker.recordInput('x', false);
      tracker.recordInput('b', true);
      const stats = tracker.getStats();
      expect(stats.totalChars).toBe(3);
      expect(stats.correctChars).toBe(2);
      expect(stats.errorChars).toBe(1);
    });

    it('should calculate accuracy', () => {
      tracker.recordInput('a', true);
      tracker.recordInput('b', true);
      tracker.recordInput('x', false);
      tracker.recordInput('c', true);
      expect(tracker.getStats().accuracy).toBe(75);
    });

    it('should calculate WPM', () => {
      // Type 25 correct chars in 30 seconds = 10 WPM
      for (let i = 0; i < 25; i++) {
        tracker.recordInput('a', true);
      }
      vi.advanceTimersByTime(30000);
      expect(tracker.getStats().wpm).toBe(10);
    });
  });

  describe('per-key statistics', () => {
    beforeEach(() => {
      tracker.startSession();
    });

    it('should track stats per key', () => {
      tracker.recordInput('a', true);
      tracker.recordInput('a', true);
      tracker.recordInput('a', false);
      
      const keyStats = tracker.getKeyStats('a');
      expect(keyStats.total).toBe(3);
      expect(keyStats.correct).toBe(2);
      expect(keyStats.errors).toBe(1);
    });

    it('should track timing between keys', () => {
      tracker.recordInput('a', true);
      vi.advanceTimersByTime(100);
      tracker.recordInput('b', true);
      vi.advanceTimersByTime(150);
      tracker.recordInput('c', true);

      expect(tracker.getKeyStats('b').avgTime).toBe(100);
      expect(tracker.getKeyStats('c').avgTime).toBe(150);
    });

    it('should track confused keys', () => {
      // Expected 'a' but typed 'x'
      tracker.recordInput('x', false, 'a');
      tracker.recordInput('x', false, 'a');
      tracker.recordInput('y', false, 'a');

      const keyStats = tracker.getKeyStats('a');
      expect(keyStats.confusedWith).toEqual({ x: 2, y: 1 });
    });
  });

  describe('raw vs net WPM', () => {
    beforeEach(() => {
      tracker.startSession();
    });

    it('should calculate raw WPM (all chars)', () => {
      for (let i = 0; i < 25; i++) {
        tracker.recordInput('a', i % 5 !== 0); // 20 correct, 5 errors
      }
      vi.advanceTimersByTime(30000);
      
      const stats = tracker.getStats();
      expect(stats.rawWpm).toBe(10); // All 25 chars / 5 / 0.5 min
    });

    it('should calculate net WPM (correct chars minus errors)', () => {
      for (let i = 0; i < 25; i++) {
        tracker.recordInput('a', i % 5 !== 0); // 20 correct, 5 errors
      }
      vi.advanceTimersByTime(30000);
      
      const stats = tracker.getStats();
      // (20 correct - 5 errors) / 5 / 0.5 min = 6 WPM
      expect(stats.wpm).toBe(6);
    });
  });

  describe('reset', () => {
    it('should reset all statistics', () => {
      tracker.startSession();
      tracker.recordInput('a', true);
      tracker.recordInput('b', false);
      vi.advanceTimersByTime(5000);
      
      tracker.reset();
      
      const stats = tracker.getStats();
      expect(stats.totalChars).toBe(0);
      expect(stats.errorChars).toBe(0);
      expect(tracker.isRunning()).toBe(false);
    });
  });
});

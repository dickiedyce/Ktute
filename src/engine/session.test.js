/**
 * Session Management Tests
 * Track typing sessions and persist history
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  createSessionManager,
  createSession,
} from './session.js';

describe('createSession', () => {
  it('should create a session with unique id', () => {
    const session1 = createSession({ text: 'hello' });
    const session2 = createSession({ text: 'world' });
    expect(session1.id).toBeDefined();
    expect(session2.id).toBeDefined();
    expect(session1.id).not.toBe(session2.id);
  });

  it('should include timestamp', () => {
    const before = Date.now();
    const session = createSession({ text: 'test' });
    const after = Date.now();
    expect(session.timestamp).toBeGreaterThanOrEqual(before);
    expect(session.timestamp).toBeLessThanOrEqual(after);
  });

  it('should store session options', () => {
    const session = createSession({
      text: 'hello world',
      mode: 'practice',
      layoutUsed: 'corne',
      mappingUsed: 'colemak-dh',
    });
    expect(session.text).toBe('hello world');
    expect(session.mode).toBe('practice');
    expect(session.layoutUsed).toBe('corne');
    expect(session.mappingUsed).toBe('colemak-dh');
  });

  it('should initialize with empty statistics', () => {
    const session = createSession({ text: 'test' });
    expect(session.duration).toBe(0);
    expect(session.wpm).toBe(0);
    expect(session.accuracy).toBe(100);
    expect(session.errors).toEqual([]);
    expect(session.isComplete).toBe(false);
  });
});

describe('createSessionManager', () => {
  let manager;
  let mockStorage;

  beforeEach(() => {
    mockStorage = {
      data: {},
      get(key) { return this.data[key]; },
      set(key, value) { this.data[key] = value; },
      remove(key) { delete this.data[key]; },
    };
    manager = createSessionManager({ storage: mockStorage });
  });

  describe('active session', () => {
    it('should start a new session', () => {
      const session = manager.startSession({ text: 'hello' });
      expect(session.id).toBeDefined();
      expect(manager.getActiveSession()).toBe(session);
    });

    it('should return null when no active session', () => {
      expect(manager.getActiveSession()).toBe(null);
    });

    it('should end the active session', () => {
      manager.startSession({ text: 'hello' });
      manager.endSession({ wpm: 50, accuracy: 95, duration: 5000 });
      expect(manager.getActiveSession()).toBe(null);
    });

    it('should update session stats on end', () => {
      manager.startSession({ text: 'hello' });
      const session = manager.endSession({ 
        wpm: 50, 
        accuracy: 95, 
        duration: 5000,
        isComplete: true,
      });
      expect(session.wpm).toBe(50);
      expect(session.accuracy).toBe(95);
      expect(session.duration).toBe(5000);
      expect(session.isComplete).toBe(true);
    });
  });

  describe('session history', () => {
    it('should save completed sessions to history', () => {
      manager.startSession({ text: 'hello' });
      manager.endSession({ wpm: 50, accuracy: 95, duration: 5000 });
      
      manager.startSession({ text: 'world' });
      manager.endSession({ wpm: 60, accuracy: 98, duration: 4000 });

      const history = manager.getHistory();
      expect(history).toHaveLength(2);
    });

    it('should persist sessions to storage', () => {
      manager.startSession({ text: 'hello' });
      manager.endSession({ wpm: 50 });

      expect(mockStorage.data.sessions).toHaveLength(1);
    });

    it('should load history from storage', () => {
      mockStorage.data.sessions = [
        { id: '1', text: 'test', wpm: 45 },
        { id: '2', text: 'test', wpm: 55 },
      ];
      
      const manager2 = createSessionManager({ storage: mockStorage });
      expect(manager2.getHistory()).toHaveLength(2);
    });

    it('should get sessions in reverse chronological order', () => {
      mockStorage.data.sessions = [
        { id: '1', timestamp: 1000, wpm: 45 },
        { id: '2', timestamp: 2000, wpm: 55 },
        { id: '3', timestamp: 1500, wpm: 50 },
      ];
      
      const manager2 = createSessionManager({ storage: mockStorage });
      const history = manager2.getHistory();
      expect(history[0].id).toBe('2');
      expect(history[1].id).toBe('3');
      expect(history[2].id).toBe('1');
    });
  });

  describe('statistics aggregation', () => {
    beforeEach(() => {
      mockStorage.data.sessions = [
        { id: '1', wpm: 40, accuracy: 90, duration: 60000, isComplete: true },
        { id: '2', wpm: 50, accuracy: 95, duration: 60000, isComplete: true },
        { id: '3', wpm: 60, accuracy: 100, duration: 60000, isComplete: true },
      ];
      manager = createSessionManager({ storage: mockStorage });
    });

    it('should calculate average WPM', () => {
      expect(manager.getAverageWPM()).toBe(50);
    });

    it('should calculate average accuracy', () => {
      expect(manager.getAverageAccuracy()).toBe(95);
    });

    it('should get best WPM', () => {
      expect(manager.getBestWPM()).toBe(60);
    });

    it('should get total practice time', () => {
      expect(manager.getTotalTime()).toBe(180000);
    });

    it('should get total sessions count', () => {
      expect(manager.getTotalSessions()).toBe(3);
    });
  });

  describe('clear history', () => {
    it('should clear all sessions', () => {
      manager.startSession({ text: 'hello' });
      manager.endSession({ wpm: 50 });
      
      manager.clearHistory();
      
      expect(manager.getHistory()).toHaveLength(0);
      expect(mockStorage.data.sessions).toEqual([]);
    });
  });
});

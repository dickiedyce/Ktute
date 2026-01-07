/**
 * Typing Engine Tests
 * Core typing logic, character matching, and input handling
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createTypingEngine } from './typing-engine.js';

describe('createTypingEngine', () => {
  let engine;

  beforeEach(() => {
    engine = createTypingEngine();
  });

  describe('initialization', () => {
    it('should create an engine with initial state', () => {
      const state = engine.getState();
      expect(state.text).toBe('');
      expect(state.position).toBe(0);
      expect(state.errors).toEqual([]);
      expect(state.isComplete).toBe(false);
    });

    it('should load text for practice', () => {
      engine.loadText('hello world');
      const state = engine.getState();
      expect(state.text).toBe('hello world');
      expect(state.position).toBe(0);
    });
  });

  describe('character input', () => {
    beforeEach(() => {
      engine.loadText('hello');
    });

    it('should advance position on correct input', () => {
      engine.input('h');
      expect(engine.getState().position).toBe(1);
    });

    it('should record error on incorrect input', () => {
      engine.input('x');
      const state = engine.getState();
      expect(state.position).toBe(1); // Still advances
      expect(state.errors).toHaveLength(1);
      expect(state.errors[0]).toEqual({
        position: 0,
        expected: 'h',
        actual: 'x',
      });
    });

    it('should handle multiple correct inputs', () => {
      engine.input('h');
      engine.input('e');
      engine.input('l');
      expect(engine.getState().position).toBe(3);
      expect(engine.getState().errors).toHaveLength(0);
    });

    it('should mark complete when text is finished', () => {
      'hello'.split('').forEach(char => engine.input(char));
      expect(engine.getState().isComplete).toBe(true);
    });

    it('should ignore input after completion', () => {
      'hello'.split('').forEach(char => engine.input(char));
      engine.input('x');
      expect(engine.getState().position).toBe(5);
    });
  });

  describe('backspace handling', () => {
    beforeEach(() => {
      engine.loadText('hello');
    });

    it('should move position back on backspace', () => {
      engine.input('h');
      engine.input('e');
      engine.backspace();
      expect(engine.getState().position).toBe(1);
    });

    it('should not go below position 0', () => {
      engine.backspace();
      expect(engine.getState().position).toBe(0);
    });

    it('should allow correcting errors', () => {
      engine.input('x'); // Error at position 0
      expect(engine.getState().errors).toHaveLength(1);
      engine.backspace();
      engine.input('h'); // Correct this time
      const state = engine.getState();
      expect(state.position).toBe(1);
      // Error is cleared after backspace
      expect(state.errors).toHaveLength(0);
    });
  });

  describe('current character', () => {
    it('should return the current expected character', () => {
      engine.loadText('hello');
      expect(engine.getCurrentChar()).toBe('h');
      engine.input('h');
      expect(engine.getCurrentChar()).toBe('e');
    });

    it('should return null when complete', () => {
      engine.loadText('hi');
      engine.input('h');
      engine.input('i');
      expect(engine.getCurrentChar()).toBe(null);
    });
  });

  describe('typed text tracking', () => {
    beforeEach(() => {
      engine.loadText('hello');
    });

    it('should track typed characters', () => {
      engine.input('h');
      engine.input('e');
      expect(engine.getState().typed).toBe('he');
    });

    it('should handle backspace in typed text', () => {
      engine.input('h');
      engine.input('x');
      engine.backspace();
      expect(engine.getState().typed).toBe('h');
    });

    it('should track errors in typed text', () => {
      engine.input('h');
      engine.input('x'); // Wrong
      engine.input('l');
      expect(engine.getState().typed).toBe('hxl');
    });
  });

  describe('word-based progress', () => {
    beforeEach(() => {
      engine.loadText('hello world test');
    });

    it('should track current word index', () => {
      expect(engine.getState().wordIndex).toBe(0);
      'hello '.split('').forEach(char => engine.input(char));
      expect(engine.getState().wordIndex).toBe(1);
    });

    it('should return current word', () => {
      expect(engine.getCurrentWord()).toBe('hello');
      'hello '.split('').forEach(char => engine.input(char));
      expect(engine.getCurrentWord()).toBe('world');
    });

    it('should return remaining text', () => {
      engine.input('h');
      engine.input('e');
      expect(engine.getRemainingText()).toBe('llo world test');
    });
  });

  describe('reset', () => {
    it('should reset to initial state with same text', () => {
      engine.loadText('hello');
      engine.input('h');
      engine.input('e');
      engine.reset();
      
      const state = engine.getState();
      expect(state.text).toBe('hello');
      expect(state.position).toBe(0);
      expect(state.typed).toBe('');
      expect(state.errors).toEqual([]);
      expect(state.isComplete).toBe(false);
    });
  });

  describe('event callbacks', () => {
    it('should call onInput callback', () => {
      const inputs = [];
      engine = createTypingEngine({
        onInput: (char, correct) => inputs.push({ char, correct }),
      });
      engine.loadText('hi');
      engine.input('h');
      engine.input('x');
      
      expect(inputs).toEqual([
        { char: 'h', correct: true },
        { char: 'x', correct: false },
      ]);
    });

    it('should call onComplete callback', () => {
      let completed = false;
      engine = createTypingEngine({
        onComplete: () => { completed = true; },
      });
      engine.loadText('hi');
      engine.input('h');
      expect(completed).toBe(false);
      engine.input('i');
      expect(completed).toBe(true);
    });

    it('should call onProgress callback', () => {
      const progress = [];
      engine = createTypingEngine({
        onProgress: (state) => progress.push(state.position),
      });
      engine.loadText('hi');
      engine.input('h');
      engine.input('i');
      expect(progress).toEqual([1, 2]);
    });
  });
});

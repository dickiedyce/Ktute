import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from './state.js';

describe('State Management', () => {
  let store;

  beforeEach(() => {
    store = createStore({ count: 0, name: 'test' });
  });

  describe('createStore', () => {
    it('should create a store with initial state', () => {
      const state = store.getState();
      expect(state.count).toBe(0);
      expect(state.name).toBe('test');
    });

    it('should get a specific value', () => {
      expect(store.get('count')).toBe(0);
      expect(store.get('name')).toBe('test');
    });

    it('should set a value', () => {
      store.set('count', 5);
      expect(store.get('count')).toBe(5);
    });

    it('should update state with an object', () => {
      store.update({ count: 10, name: 'updated' });
      expect(store.get('count')).toBe(10);
      expect(store.get('name')).toBe('updated');
    });

    it('should notify subscribers on change', () => {
      let notified = false;
      let newValue = null;

      store.subscribe('count', (value) => {
        notified = true;
        newValue = value;
      });

      store.set('count', 42);

      expect(notified).toBe(true);
      expect(newValue).toBe(42);
    });

    it('should not notify if value unchanged', () => {
      let callCount = 0;

      store.subscribe('count', () => {
        callCount++;
      });

      store.set('count', 0); // same value
      expect(callCount).toBe(0);
    });

    it('should unsubscribe', () => {
      let callCount = 0;
      const handler = () => { callCount++; };

      const unsubscribe = store.subscribe('count', handler);
      store.set('count', 1);
      expect(callCount).toBe(1);

      unsubscribe();
      store.set('count', 2);
      expect(callCount).toBe(1); // still 1, not called again
    });

    it('should support wildcard subscription for any change', () => {
      let changes = [];

      store.subscribe('*', (key, value) => {
        changes.push({ key, value });
      });

      store.set('count', 5);
      store.set('name', 'new');

      expect(changes).toHaveLength(2);
      expect(changes[0]).toEqual({ key: 'count', value: 5 });
      expect(changes[1]).toEqual({ key: 'name', value: 'new' });
    });
  });
});

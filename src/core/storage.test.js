import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storage } from './storage.js';

describe('Storage Utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('set and get', () => {
    it('should store and retrieve a string', () => {
      storage.set('name', 'John');
      expect(storage.get('name')).toBe('John');
    });

    it('should store and retrieve a number', () => {
      storage.set('count', 42);
      expect(storage.get('count')).toBe(42);
    });

    it('should store and retrieve an object', () => {
      const obj = { a: 1, b: 'test' };
      storage.set('config', obj);
      expect(storage.get('config')).toEqual(obj);
    });

    it('should store and retrieve an array', () => {
      const arr = [1, 2, 3];
      storage.set('items', arr);
      expect(storage.get('items')).toEqual(arr);
    });

    it('should return default value if key not found', () => {
      expect(storage.get('nonexistent', 'default')).toBe('default');
    });

    it('should return null if key not found and no default', () => {
      expect(storage.get('nonexistent')).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove a key', () => {
      storage.set('temp', 'value');
      storage.remove('temp');
      expect(storage.get('temp')).toBeNull();
    });
  });

  describe('has', () => {
    it('should return true if key exists', () => {
      storage.set('exists', true);
      expect(storage.has('exists')).toBe(true);
    });

    it('should return false if key does not exist', () => {
      expect(storage.has('nope')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all stored data', () => {
      storage.set('a', 1);
      storage.set('b', 2);
      storage.clear();
      expect(storage.get('a')).toBeNull();
      expect(storage.get('b')).toBeNull();
    });
  });

  describe('prefix', () => {
    it('should prefix all keys with app namespace', () => {
      storage.set('test', 'value');
      // Check the raw localStorage key
      expect(localStorage.getItem('ktute:test')).not.toBeNull();
    });
  });
});

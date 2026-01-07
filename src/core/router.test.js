import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRouter } from './router.js';

describe('Router', () => {
  let router;

  beforeEach(() => {
    window.location.hash = '';
  });

  afterEach(() => {
    if (router && router.destroy) {
      router.destroy();
    }
    window.location.hash = '';
  });

  describe('createRouter', () => {
    it('should create a router with routes', () => {
      router = createRouter({
        '/': () => 'home',
        '/practice': () => 'practice',
      });
      expect(router).toBeDefined();
    });

    it('should return current route', () => {
      router = createRouter({
        '/': () => 'home',
      });
      expect(router.getCurrentRoute()).toBe('/');
    });

    it('should navigate to a route', () => {
      router = createRouter({
        '/': () => 'home',
        '/practice': () => 'practice',
      });
      
      router.navigate('/practice');
      expect(router.getCurrentRoute()).toBe('/practice');
    });

    it('should call route handler on navigation', () => {
      const homeHandler = vi.fn();
      const practiceHandler = vi.fn();
      
      router = createRouter({
        '/': homeHandler,
        '/practice': practiceHandler,
      });

      router.navigate('/practice');
      expect(practiceHandler).toHaveBeenCalled();
    });

    it('should handle hash changes', async () => {
      const handler = vi.fn();
      
      router = createRouter({
        '/': () => {},
        '/stats': handler,
      });

      window.location.hash = '#/stats';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      
      expect(handler).toHaveBeenCalled();
    });

    it('should call notFound handler for unknown routes', () => {
      const notFoundHandler = vi.fn();
      
      router = createRouter({
        '/': () => {},
      }, { notFound: notFoundHandler });

      router.navigate('/unknown');
      expect(notFoundHandler).toHaveBeenCalledWith('/unknown');
    });

    it('should support route parameters', () => {
      let capturedParams = null;
      
      router = createRouter({
        '/lesson/:id': (params) => { capturedParams = params; },
      });

      router.navigate('/lesson/42');
      expect(capturedParams).toEqual({ id: '42' });
    });
  });
});

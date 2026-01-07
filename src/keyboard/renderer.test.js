import { describe, it, expect, beforeEach } from 'vitest';
import { createKeyboardRenderer } from './renderer.js';

describe('Keyboard Renderer', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  describe('createKeyboardRenderer', () => {
    it('should create a renderer', () => {
      const renderer = createKeyboardRenderer(container);
      expect(renderer).toBeDefined();
    });

    it('should render an SVG element', () => {
      const renderer = createKeyboardRenderer(container);
      const physicalLayout = {
        name: 'test',
        rows: 1,
        columns: [3, 3],
        split: true,
        keys: [
          { row: 0, col: 0, hand: 'left', isThumb: false },
          { row: 0, col: 1, hand: 'left', isThumb: false },
          { row: 0, col: 2, hand: 'left', isThumb: false },
          { row: 0, col: 0, hand: 'right', isThumb: false },
          { row: 0, col: 1, hand: 'right', isThumb: false },
          { row: 0, col: 2, hand: 'right', isThumb: false },
        ],
      };

      renderer.render(physicalLayout);
      
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
    });

    it('should render key elements', () => {
      const renderer = createKeyboardRenderer(container);
      const physicalLayout = {
        name: 'test',
        keys: [
          { row: 0, col: 0, hand: 'left', isThumb: false },
          { row: 0, col: 1, hand: 'left', isThumb: false },
        ],
      };

      renderer.render(physicalLayout);
      
      const keys = container.querySelectorAll('[data-key]');
      expect(keys).toHaveLength(2);
    });

    it('should apply key labels from mapping', () => {
      const renderer = createKeyboardRenderer(container);
      const physicalLayout = {
        name: 'test',
        keys: [
          { row: 0, col: 0, hand: 'left', isThumb: false },
        ],
      };
      const keyMapping = {
        layers: [{ keys: ['q'] }],
      };

      renderer.render(physicalLayout, keyMapping);
      
      const keyLabel = container.querySelector('[data-key] text');
      expect(keyLabel.textContent).toBe('q');
    });

    it('should highlight active key', () => {
      const renderer = createKeyboardRenderer(container);
      const physicalLayout = {
        name: 'test',
        keys: [
          { row: 0, col: 0, hand: 'left', isThumb: false },
          { row: 0, col: 1, hand: 'left', isThumb: false },
        ],
      };
      const keyMapping = {
        layers: [{ keys: ['a', 'b'] }],
      };

      renderer.render(physicalLayout, keyMapping);
      renderer.highlightKey('a');
      
      const activeKey = container.querySelector('[data-key].active');
      expect(activeKey).not.toBeNull();
    });

    it('should show finger hint for key', () => {
      const renderer = createKeyboardRenderer(container);
      const physicalLayout = {
        name: 'test',
        keys: [
          { row: 0, col: 0, hand: 'left', isThumb: false },
        ],
      };
      const keyMapping = {
        layers: [{ keys: ['q'] }],
        fingers: [1], // pinky
      };

      renderer.render(physicalLayout, keyMapping, { showFingers: true });
      
      const key = container.querySelector('[data-key]');
      expect(key.getAttribute('data-finger')).toBe('1');
    });

    it('should mark key as correct', () => {
      const renderer = createKeyboardRenderer(container);
      const physicalLayout = {
        name: 'test',
        keys: [{ row: 0, col: 0, hand: 'left', isThumb: false }],
      };
      const keyMapping = { layers: [{ keys: ['a'] }] };

      renderer.render(physicalLayout, keyMapping);
      renderer.markKey('a', 'correct');
      
      const key = container.querySelector('[data-key].correct');
      expect(key).not.toBeNull();
    });

    it('should mark key as error', () => {
      const renderer = createKeyboardRenderer(container);
      const physicalLayout = {
        name: 'test',
        keys: [{ row: 0, col: 0, hand: 'left', isThumb: false }],
      };
      const keyMapping = { layers: [{ keys: ['a'] }] };

      renderer.render(physicalLayout, keyMapping);
      renderer.markKey('a', 'error');
      
      const key = container.querySelector('[data-key].error');
      expect(key).not.toBeNull();
    });

    it('should clear all highlights', () => {
      const renderer = createKeyboardRenderer(container);
      const physicalLayout = {
        name: 'test',
        keys: [{ row: 0, col: 0, hand: 'left', isThumb: false }],
      };
      const keyMapping = { layers: [{ keys: ['a'] }] };

      renderer.render(physicalLayout, keyMapping);
      renderer.highlightKey('a');
      renderer.clearHighlights();
      
      const activeKey = container.querySelector('[data-key].active');
      expect(activeKey).toBeNull();
    });

    it('should support split layout with gap between hands', () => {
      const renderer = createKeyboardRenderer(container);
      const physicalLayout = {
        name: 'split',
        split: true,
        keys: [
          { row: 0, col: 0, hand: 'left', isThumb: false },
          { row: 0, col: 0, hand: 'right', isThumb: false },
        ],
      };

      renderer.render(physicalLayout);
      
      const svg = container.querySelector('svg');
      const keys = container.querySelectorAll('[data-key]');
      
      // Right hand key should have greater x position
      const leftKey = container.querySelector('[data-key][data-hand="left"]');
      const rightKey = container.querySelector('[data-key][data-hand="right"]');
      
      const leftX = parseFloat(leftKey.querySelector('rect').getAttribute('x'));
      const rightX = parseFloat(rightKey.querySelector('rect').getAttribute('x'));
      
      expect(rightX).toBeGreaterThan(leftX + 50); // At least 50px gap
    });

    it('should render wider keys with correct width for non-split keyboards', () => {
      const renderer = createKeyboardRenderer(container);
      const physicalLayout = {
        name: 'non-split',
        split: false,
        keys: [
          { row: 0, col: 0, hand: 'left', width: 1.5, isThumb: false },
          { row: 0, col: 1.5, hand: 'left', width: 1, isThumb: false },
          { row: 0, col: 2.5, hand: 'left', width: 1, isThumb: false },
        ],
      };

      renderer.render(physicalLayout);
      
      const keys = container.querySelectorAll('[data-key] rect');
      expect(keys).toHaveLength(3);
      
      // First key should be wider (1.5 units)
      const firstKeyWidth = parseFloat(keys[0].getAttribute('width'));
      const secondKeyWidth = parseFloat(keys[1].getAttribute('width'));
      
      // 1.5 unit key should be ~1.5x the width of a 1 unit key
      expect(firstKeyWidth).toBeGreaterThan(secondKeyWidth * 1.3);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { $, $$, createElement, on, off } from './dom.js';

describe('DOM Utilities', () => {
  describe('$ (querySelector)', () => {
    it('should find element by selector', () => {
      document.body.innerHTML = '<div id="test">Hello</div>';
      const el = $('#test');
      expect(el).not.toBeNull();
      expect(el.textContent).toBe('Hello');
    });

    it('should return null if not found', () => {
      document.body.innerHTML = '';
      const el = $('#nonexistent');
      expect(el).toBeNull();
    });

    it('should search within a parent element', () => {
      document.body.innerHTML = '<div id="parent"><span class="child">Found</span></div><span class="child">Other</span>';
      const parent = $('#parent');
      const child = $('.child', parent);
      expect(child.textContent).toBe('Found');
    });
  });

  describe('$$ (querySelectorAll)', () => {
    it('should find all matching elements', () => {
      document.body.innerHTML = '<ul><li>1</li><li>2</li><li>3</li></ul>';
      const items = $$('li');
      expect(items).toHaveLength(3);
    });

    it('should return empty array if none found', () => {
      document.body.innerHTML = '';
      const items = $$('.nonexistent');
      expect(items).toHaveLength(0);
    });
  });

  describe('createElement', () => {
    it('should create element with tag', () => {
      const el = createElement('div');
      expect(el.tagName).toBe('DIV');
    });

    it('should set className', () => {
      const el = createElement('div', { className: 'my-class' });
      expect(el.className).toBe('my-class');
    });

    it('should set attributes', () => {
      const el = createElement('input', { attrs: { type: 'text', placeholder: 'Enter name' } });
      expect(el.getAttribute('type')).toBe('text');
      expect(el.getAttribute('placeholder')).toBe('Enter name');
    });

    it('should set text content', () => {
      const el = createElement('p', { text: 'Hello World' });
      expect(el.textContent).toBe('Hello World');
    });

    it('should set innerHTML', () => {
      const el = createElement('div', { html: '<span>Inner</span>' });
      expect(el.innerHTML).toBe('<span>Inner</span>');
    });

    it('should append children', () => {
      const child1 = createElement('span', { text: 'A' });
      const child2 = createElement('span', { text: 'B' });
      const parent = createElement('div', { children: [child1, child2] });
      expect(parent.children).toHaveLength(2);
    });

    it('should set data attributes', () => {
      const el = createElement('div', { data: { view: 'home', active: 'true' } });
      expect(el.dataset.view).toBe('home');
      expect(el.dataset.active).toBe('true');
    });
  });

  describe('on/off (event handling)', () => {
    it('should attach event listener', () => {
      const el = createElement('button');
      let clicked = false;
      const handler = () => { clicked = true; };
      
      on(el, 'click', handler);
      el.click();
      
      expect(clicked).toBe(true);
    });

    it('should remove event listener', () => {
      const el = createElement('button');
      let count = 0;
      const handler = () => { count++; };
      
      on(el, 'click', handler);
      el.click();
      off(el, 'click', handler);
      el.click();
      
      expect(count).toBe(1);
    });
  });
});

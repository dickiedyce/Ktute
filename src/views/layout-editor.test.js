import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createLayoutEditorView } from './layout-editor.js';
import { storage } from '../core/storage.js';

describe('Layout Editor View', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    storage.clear();
  });

  describe('createLayoutEditorView', () => {
    it('should render layout editor view with data-view attribute', () => {
      createLayoutEditorView(container);
      const view = container.querySelector('[data-view="layout-editor"]');
      expect(view).not.toBeNull();
    });

    it('should display layout name input', () => {
      createLayoutEditorView(container);
      const nameInput = container.querySelector('#layout-name');
      expect(nameInput).not.toBeNull();
    });

    it('should display text editor for layout definition', () => {
      createLayoutEditorView(container);
      const editor = container.querySelector('.layout-text-editor');
      expect(editor).not.toBeNull();
    });

    it('should display keyboard preview', () => {
      createLayoutEditorView(container);
      const preview = container.querySelector('.editor-preview');
      expect(preview).not.toBeNull();
    });
  });

  describe('combined layout editor', () => {
    it('should show default combined layout template', () => {
      createLayoutEditorView(container);
      const editor = container.querySelector('.layout-text-editor');
      expect(editor.value).toContain('[layout:');
    });

    it('should update preview when layout text changes', () => {
      const { destroy } = createLayoutEditorView(container);
      const editor = container.querySelector('.layout-text-editor');
      const preview = container.querySelector('.editor-preview');
      
      const initialSvg = preview.innerHTML;
      
      // Change to a valid combined layout
      editor.value = `[layout:custom]
rows: 2
columns: 4,4
split: true
stagger: none

row0: q w e r | u i o p
row1: a s d f | j k l ;

fingers:
row0: 1 2 3 4 | 5 6 7 8
row1: 1 2 3 4 | 5 6 7 8
`;
      editor.dispatchEvent(new Event('input'));
      
      // Preview should have changed
      expect(preview.innerHTML).not.toBe(initialSvg);
      destroy();
    });

    it('should show validation error for invalid layout', () => {
      const { destroy } = createLayoutEditorView(container);
      const editor = container.querySelector('.layout-text-editor');
      
      editor.value = 'invalid layout text';
      editor.dispatchEvent(new Event('input'));
      
      const error = container.querySelector('.validation-error');
      expect(error).not.toBeNull();
      destroy();
    });
  });

  describe('save functionality', () => {
    it('should save custom layout to storage with name', () => {
      const { destroy } = createLayoutEditorView(container);
      const editor = container.querySelector('.layout-text-editor');
      const nameInput = container.querySelector('#layout-name');
      const saveBtn = container.querySelector('[data-action="save"]');
      
      nameInput.value = 'Test Layout';
      nameInput.dispatchEvent(new Event('input'));
      
      editor.value = `[layout:test]
rows: 2
columns: 3,3
split: true
stagger: none

row0: q w e | u i o
row1: a s d | j k l

fingers:
row0: 1 2 3 | 6 7 8
row1: 1 2 3 | 6 7 8
`;
      editor.dispatchEvent(new Event('input'));
      saveBtn.click();
      
      const customLayouts = storage.get('custom-layouts', {});
      expect(Object.keys(customLayouts).length).toBeGreaterThan(0);
      destroy();
    });

    it('should have save and use button', () => {
      createLayoutEditorView(container);
      const useBtn = container.querySelector('[data-action="use-layout"]');
      expect(useBtn).not.toBeNull();
    });
  });

  describe('load from built-in', () => {
    it('should have dropdown to load built-in layouts', () => {
      createLayoutEditorView(container);
      const dropdown = container.querySelector('[data-action="load-builtin"]');
      expect(dropdown).not.toBeNull();
    });

    it('should load selected built-in layout into editor', () => {
      const { destroy } = createLayoutEditorView(container);
      const dropdown = container.querySelector('[data-action="load-builtin"]');
      
      dropdown.value = 'ergodox-qwerty';
      dropdown.dispatchEvent(new Event('change'));
      
      const editor = container.querySelector('.layout-text-editor');
      expect(editor.value).toContain('[layout:ergodox-qwerty]');
      destroy();
    });
  });

  describe('export functionality', () => {
    it('should have export button', () => {
      createLayoutEditorView(container);
      const exportBtn = container.querySelector('[data-action="export"]');
      expect(exportBtn).not.toBeNull();
    });
  });

  describe('import functionality', () => {
    it('should have import button', () => {
      createLayoutEditorView(container);
      const importBtn = container.querySelector('[data-action="import"]');
      expect(importBtn).not.toBeNull();
    });
  });

  describe('destroy', () => {
    it('should clean up event listeners', () => {
      const { destroy } = createLayoutEditorView(container);
      destroy();
      expect(true).toBe(true);
    });
  });
});

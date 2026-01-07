import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initApp } from './app.js';

describe('App Initialization', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'app';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should render the app container', () => {
    initApp();
    
    const app = document.getElementById('app');
    expect(app).not.toBeNull();
    expect(app.children.length).toBeGreaterThan(0);
  });

  it('should display the home view by default', () => {
    initApp();
    
    const homeView = document.querySelector('[data-view="home"]');
    expect(homeView).not.toBeNull();
  });
});

/**
 * Initialize the Ktute application
 */

import { createKeyboardHandler, createCommandMenu } from './events.js';
import { createRouter } from './router.js';
import { createPracticeView } from '../views/practice.js';
import { createKeyboardRenderer } from '../keyboard/renderer.js';
import { parsePhysicalLayout, parseKeyMapping } from '../keyboard/layout-parser.js';
import { CORNE } from '../keyboard/physical-layouts.js';
import { getBuiltinKeyMappings } from '../keyboard/key-mappings.js';

let keyboardHandler = null;
let commandMenu = null;
let router = null;

export function initApp() {
  const app = document.getElementById('app');
  if (!app) {
    console.error('App container not found');
    return;
  }

  // Set up command menu
  commandMenu = createCommandMenu({
    commands: [
      { id: 'practice', label: 'Start Practice', keywords: 'typing test', action: () => router?.navigate('/practice') },
      { id: 'lessons', label: 'Open Lessons', keywords: 'learn study', action: () => router?.navigate('/lessons') },
      { id: 'stats', label: 'View Statistics', keywords: 'stats history', action: () => router?.navigate('/stats') },
      { id: 'layout', label: 'Layout Editor', keywords: 'keyboard customize', action: () => router?.navigate('/layout') },
      { id: 'settings', label: 'Settings', keywords: 'preferences config', action: () => router?.navigate('/settings') },
    ],
  });

  // Set up global keyboard handler
  keyboardHandler = createKeyboardHandler({
    '/': () => commandMenu.open(),
    '?': () => showHelp(),
  });

  // Set up router
  router = createRouter({
    '/': () => renderHomeView(app),
    '/practice': () => renderPracticeView(app),
    '/lessons': () => renderView(app, 'lessons', 'Lessons'),
    '/stats': () => renderView(app, 'stats', 'Statistics'),
    '/layout': () => renderView(app, 'layout', 'Layout Editor'),
    '/settings': () => renderView(app, 'settings', 'Settings'),
  });
}

/**
 * Render the home view
 * @param {HTMLElement} container 
 */
function renderHomeView(container) {
  container.innerHTML = '';
  
  const homeView = document.createElement('main');
  homeView.setAttribute('data-view', 'home');
  homeView.className = 'home-view';
  
  homeView.innerHTML = `
    <header class="home-header">
      <h1>Ktute</h1>
      <p class="subtitle">Keyboard Typing Tutor</p>
      <p class="tagline">For split keyboards and alternative layouts</p>
    </header>
    <div class="keyboard-container">
      <h3>Corne • Colemak-DH</h3>
      <div id="keyboard-preview"></div>
    </div>
    <nav class="home-nav">
      <p class="hint">Press <kbd>/</kbd> to open command menu</p>
      <p class="hint">Press <kbd>?</kbd> for help</p>
    </nav>
  `;
  
  container.appendChild(homeView);

  // Render keyboard preview
  const keyboardContainer = document.getElementById('keyboard-preview');
  if (keyboardContainer) {
    const renderer = createKeyboardRenderer(keyboardContainer);
    const physicalLayout = parsePhysicalLayout(CORNE);
    const mappings = getBuiltinKeyMappings();
    const keyMapping = parseKeyMapping(mappings['colemak-dh']);
    renderer.render(physicalLayout, keyMapping, { showFingers: true });
  }
}

let practiceView = null;

/**
 * Render the practice view
 * @param {HTMLElement} container
 */
function renderPracticeView(container) {
  // Deactivate global keyboard handler during practice
  keyboardHandler?.deactivate();
  
  practiceView = createPracticeView(container, {
    wordCount: 20,
    onExit: () => {
      keyboardHandler?.activate();
      router?.navigate('/');
    },
    onComplete: (stats) => {
      console.log('Practice complete:', stats);
    },
  });
}

/**
 * Render a placeholder view
 * @param {HTMLElement} container
 * @param {string} viewName
 * @param {string} title
 */
function renderView(container, viewName, title) {
  container.innerHTML = '';
  
  const view = document.createElement('main');
  view.setAttribute('data-view', viewName);
  view.className = `${viewName}-view`;
  
  view.innerHTML = `
    <header class="view-header">
      <h1>${title}</h1>
    </header>
    <div class="view-content">
      <p>Coming soon...</p>
      <p class="hint">Press <kbd>/</kbd> to navigate</p>
    </div>
  `;
  
  container.appendChild(view);
}

/**
 * Show help modal
 */
function showHelp() {
  // TODO: Implement help modal
  console.log('Help requested');
}

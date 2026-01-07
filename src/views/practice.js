/**
 * Practice View
 * Main typing practice interface
 */
import { createTypingEngine } from '../engine/typing-engine.js';
import { createWordGenerator } from '../engine/word-generator.js';
import { createStatisticsTracker } from '../engine/statistics.js';
import { createKeyboardRenderer } from '../keyboard/renderer.js';
import { parsePhysicalLayout, parseKeyMapping } from '../keyboard/layout-parser.js';
import { CORNE } from '../keyboard/physical-layouts.js';
import { getBuiltinKeyMappings } from '../keyboard/key-mappings.js';

/**
 * Create the practice view
 * @param {HTMLElement} container - Container element
 * @param {Object} [options={}] - View options
 * @returns {Object} View controller
 */
export function createPracticeView(container, options = {}) {
  const {
    wordCount = 20,
    physicalLayout = CORNE,
    keyMappingName = 'colemak-dh',
    onComplete,
    onExit,
  } = options;

  let engine = null;
  let stats = null;
  let renderer = null;
  let parsedLayout = null;
  let parsedMapping = null;
  let isActive = false;

  // DOM elements
  let textDisplay = null;
  let statsDisplay = null;
  let keyboardContainer = null;

  /**
   * Initialize the view
   */
  function init() {
    // Parse layout and mapping
    parsedLayout = parsePhysicalLayout(physicalLayout);
    const mappings = getBuiltinKeyMappings();
    parsedMapping = parseKeyMapping(mappings[keyMappingName]);

    // Generate practice text
    const generator = createWordGenerator();
    const text = generator.generateText(wordCount);

    // Create engine with callbacks
    engine = createTypingEngine({
      onInput: handleInput,
      onComplete: handleComplete,
      onProgress: handleProgress,
    });
    engine.loadText(text);

    // Create stats tracker
    stats = createStatisticsTracker();

    // Render the view
    render();

    // Set up keyboard input
    isActive = true;
  }

  /**
   * Render the view
   */
  function render() {
    container.innerHTML = '';

    const view = document.createElement('main');
    view.className = 'practice-view';
    view.setAttribute('data-view', 'practice');

    view.innerHTML = `
      <header class="practice-header">
        <div class="stats-display">
          <span class="stat wpm"><span class="value">0</span> WPM</span>
          <span class="stat accuracy"><span class="value">100</span>%</span>
          <span class="stat progress"><span class="value">0</span>/${engine.getState().text.length}</span>
        </div>
        <button class="exit-btn" aria-label="Exit practice">✕</button>
      </header>
      <section class="text-area">
        <div class="text-display" aria-live="polite"></div>
      </section>
      <section class="keyboard-area">
        <div class="keyboard-container"></div>
      </section>
      <footer class="practice-footer">
        <p class="hint">Press <kbd>Esc</kbd> to exit</p>
      </footer>
    `;

    container.appendChild(view);

    // Get element references
    textDisplay = view.querySelector('.text-display');
    statsDisplay = view.querySelector('.stats-display');
    keyboardContainer = view.querySelector('.keyboard-container');

    // Set up exit button
    view.querySelector('.exit-btn').addEventListener('click', exit);

    // Render initial text
    updateTextDisplay();

    // Render keyboard
    renderer = createKeyboardRenderer(keyboardContainer);
    renderer.render(parsedLayout, parsedMapping, { showFingers: true });

    // Highlight first key
    highlightCurrentKey();
  }

  /**
   * Update the text display
   */
  function updateTextDisplay() {
    const state = engine.getState();
    const text = state.text;
    const position = state.position;
    const typed = state.typed;

    let html = '';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const displayChar = char === ' ' ? '␣' : char;
      
      if (i < position) {
        // Already typed
        const typedChar = typed[i];
        const correct = typedChar === char;
        html += `<span class="char ${correct ? 'correct' : 'error'}">${displayChar}</span>`;
      } else if (i === position) {
        // Current character
        html += `<span class="char current">${displayChar}</span>`;
      } else {
        // Not yet typed
        html += `<span class="char">${displayChar}</span>`;
      }
    }

    textDisplay.innerHTML = html;
  }

  /**
   * Update statistics display
   */
  function updateStatsDisplay() {
    const s = stats.getStats();
    const state = engine.getState();
    
    statsDisplay.querySelector('.wpm .value').textContent = s.wpm;
    statsDisplay.querySelector('.accuracy .value').textContent = s.accuracy;
    statsDisplay.querySelector('.progress .value').textContent = state.position;
  }

  /**
   * Highlight the current key on the keyboard
   */
  function highlightCurrentKey() {
    if (!renderer) return;
    
    renderer.clearHighlights();
    const currentChar = engine.getCurrentChar();
    if (currentChar) {
      renderer.highlightKey(currentChar, 'next');
    }
  }

  /**
   * Handle character input
   * @param {string} char
   * @param {boolean} correct
   */
  function handleInput(char, correct) {
    const expected = engine.getState().text[engine.getState().position - 1];
    stats.recordInput(char, correct, correct ? undefined : expected);
    
    // Flash the key
    if (renderer) {
      renderer.markKey(char, correct ? 'correct' : 'error');
      setTimeout(() => renderer.clearMarks(), 150);
    }
  }

  /**
   * Handle progress update
   */
  function handleProgress() {
    updateTextDisplay();
    updateStatsDisplay();
    highlightCurrentKey();
  }

  /**
   * Handle completion
   */
  function handleComplete() {
    stats.endSession();
    const finalStats = stats.getStats();
    
    if (onComplete) {
      onComplete(finalStats);
    }
    
    showCompletionScreen(finalStats);
  }

  /**
   * Show completion screen
   * @param {Object} finalStats
   */
  function showCompletionScreen(finalStats) {
    const view = container.querySelector('.practice-view');
    
    const overlay = document.createElement('div');
    overlay.className = 'completion-overlay';
    overlay.innerHTML = `
      <div class="completion-modal">
        <h2>Session Complete!</h2>
        <div class="final-stats">
          <div class="stat-large">
            <span class="value">${finalStats.wpm}</span>
            <span class="label">WPM</span>
          </div>
          <div class="stat-large">
            <span class="value">${finalStats.accuracy}%</span>
            <span class="label">Accuracy</span>
          </div>
        </div>
        <div class="stat-details">
          <p>Characters: ${finalStats.totalChars}</p>
          <p>Errors: ${finalStats.errorChars}</p>
          <p>Time: ${Math.round(finalStats.duration / 1000)}s</p>
        </div>
        <div class="actions">
          <button class="btn btn-primary restart-btn">Practice Again</button>
          <button class="btn btn-secondary exit-btn">Exit</button>
        </div>
      </div>
    `;

    view.appendChild(overlay);

    overlay.querySelector('.restart-btn').addEventListener('click', restart);
    overlay.querySelector('.exit-btn').addEventListener('click', exit);
  }

  /**
   * Handle keyboard input
   * @param {KeyboardEvent} event
   */
  function handleKeyDown(event) {
    if (!isActive) return;

    // Start tracking on first keystroke
    if (!stats.isRunning()) {
      stats.startSession();
    }

    if (event.key === 'Escape') {
      exit();
      return;
    }

    if (event.key === 'Backspace') {
      engine.backspace();
      handleProgress();
      return;
    }

    // Only handle printable characters
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
      engine.input(event.key);
    }
  }

  /**
   * Restart the practice session
   */
  function restart() {
    destroy();
    init();
  }

  /**
   * Exit the practice view
   */
  function exit() {
    destroy();
    if (onExit) {
      onExit();
    }
  }

  /**
   * Destroy the view
   */
  function destroy() {
    isActive = false;
    document.removeEventListener('keydown', handleKeyDown);
    container.innerHTML = '';
  }

  /**
   * Activate the view (start listening for input)
   */
  function activate() {
    isActive = true;
    document.addEventListener('keydown', handleKeyDown);
  }

  /**
   * Deactivate the view (stop listening for input)
   */
  function deactivate() {
    isActive = false;
    document.removeEventListener('keydown', handleKeyDown);
  }

  // Initialize
  init();
  activate();

  return {
    restart,
    exit,
    activate,
    deactivate,
    destroy,
    getStats: () => stats?.getStats(),
    getEngine: () => engine,
  };
}

/**
 * Typing Engine
 * Core typing logic, character matching, and input handling
 */

/**
 * Create a typing engine instance
 * @param {Object} [options={}] - Engine options
 * @param {Function} [options.onInput] - Callback for each input (char, correct)
 * @param {Function} [options.onComplete] - Callback when text is completed
 * @param {Function} [options.onProgress] - Callback for progress updates (state)
 * @returns {Object} Typing engine instance
 */
export function createTypingEngine(options = {}) {
  const { onInput, onComplete, onProgress } = options;

  let state = {
    text: '',
    typed: '',
    position: 0,
    errors: [],
    isComplete: false,
    wordIndex: 0,
  };

  /**
   * Load text for practice
   * @param {string} text
   */
  function loadText(text) {
    state = {
      text,
      typed: '',
      position: 0,
      errors: [],
      isComplete: false,
      wordIndex: 0,
    };
  }

  /**
   * Handle character input
   * @param {string} char - The character typed
   */
  function input(char) {
    if (state.isComplete) {
      return;
    }

    const expected = state.text[state.position];
    const correct = char === expected;

    if (!correct) {
      state.errors.push({
        position: state.position,
        expected,
        actual: char,
      });
    }

    state.typed += char;
    state.position++;

    // Update word index
    state.wordIndex = calculateWordIndex();

    // Check completion
    if (state.position >= state.text.length) {
      state.isComplete = true;
      onComplete?.();
    }

    onInput?.(char, correct);
    onProgress?.(getState());
  }

  /**
   * Handle backspace
   */
  function backspace() {
    if (state.position > 0) {
      state.position--;
      state.typed = state.typed.slice(0, -1);
      state.isComplete = false;
      state.wordIndex = calculateWordIndex();
    }
  }

  /**
   * Calculate current word index based on position
   * @returns {number}
   */
  function calculateWordIndex() {
    const textUpToPosition = state.text.slice(0, state.position);
    const words = textUpToPosition.split(' ');
    // If we just typed a space, we're starting a new word
    if (textUpToPosition.endsWith(' ')) {
      return words.length - 1;
    }
    return Math.max(0, words.length - 1);
  }

  /**
   * Get current expected character
   * @returns {string|null}
   */
  function getCurrentChar() {
    if (state.isComplete) {
      return null;
    }
    return state.text[state.position] || null;
  }

  /**
   * Get current word being typed
   * @returns {string}
   */
  function getCurrentWord() {
    const words = state.text.split(' ');
    return words[state.wordIndex] || '';
  }

  /**
   * Get remaining text to type
   * @returns {string}
   */
  function getRemainingText() {
    return state.text.slice(state.position);
  }

  /**
   * Reset engine state but keep the text
   */
  function reset() {
    const text = state.text;
    loadText(text);
  }

  /**
   * Get current state
   * @returns {Object}
   */
  function getState() {
    return { ...state };
  }

  return {
    loadText,
    input,
    backspace,
    getCurrentChar,
    getCurrentWord,
    getRemainingText,
    reset,
    getState,
  };
}

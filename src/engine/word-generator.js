/**
 * Word Generator
 * Generate practice words/text for typing exercises
 */

/**
 * Common English words for typing practice
 * Sorted roughly by frequency
 */
export const COMMON_WORDS = [
  // Most common
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  // Very common
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  // Common
  'been', 'call', 'are', 'was', 'were', 'has', 'had', 'did', 'does', 'done',
  'more', 'long', 'made', 'find', 'here', 'many', 'much', 'own', 'down', 'may',
  'life', 'still', 'such', 'where', 'great', 'through', 'world', 'every', 'under', 'need',
  'right', 'being', 'really', 'those', 'little', 'state', 'before', 'never', 'should', 'while',
  'last', 'might', 'again', 'same', 'another', 'around', 'must', 'house', 'three', 'small',
  // Useful practice words
  'type', 'fast', 'slow', 'hand', 'left', 'right', 'both', 'home', 'row', 'key',
  'learn', 'test', 'practice', 'start', 'stop', 'quick', 'brown', 'fox', 'jump', 'lazy',
  'dog', 'cat', 'bird', 'fish', 'tree', 'book', 'read', 'write', 'code', 'text',
  'word', 'letter', 'space', 'enter', 'shift', 'control', 'delete', 'move', 'next', 'back',
  'begin', 'end', 'open', 'close', 'save', 'load', 'run', 'wait', 'press', 'hold',
  // Additional common words
  'thing', 'place', 'case', 'week', 'company', 'system', 'program', 'question', 'during', 'point',
  'number', 'part', 'field', 'area', 'line', 'name', 'fact', 'sort', 'form', 'group',
  'within', 'rather', 'without', 'often', 'until', 'high', 'once', 'across', 'show', 'early',
  'enough', 'above', 'second', 'together', 'turn', 'change', 'keep', 'real', 'leave', 'certain',
];

/**
 * Simple seeded random number generator
 * @param {number} seed
 * @returns {Function} Random function returning 0-1
 */
function createSeededRandom(seed) {
  let state = seed;
  return function() {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

/**
 * Filter words that only contain specified keys
 * @param {string[]} keys - Allowed keys
 * @param {string[]} [wordList=COMMON_WORDS] - Word list to filter
 * @returns {string[]} Filtered words
 */
export function getWordsForKeys(keys, wordList = COMMON_WORDS) {
  const keySet = new Set(keys.map(k => k.toLowerCase()));
  return wordList.filter(word => {
    return word.split('').every(char => keySet.has(char));
  });
}

/**
 * Create a word generator instance
 * @param {Object} [options={}] - Generator options
 * @param {string[]} [options.allowedKeys] - Only use words with these keys
 * @param {number} [options.minLength] - Minimum word length
 * @param {number} [options.maxLength] - Maximum word length
 * @param {number} [options.seed] - Random seed for reproducible sequences
 * @param {string[]} [options.wordList] - Custom word list
 * @returns {Object} Word generator instance
 */
export function createWordGenerator(options = {}) {
  const { 
    allowedKeys, 
    minLength, 
    maxLength, 
    seed,
    wordList = COMMON_WORDS,
  } = options;

  // Set up random function
  const random = seed !== undefined 
    ? createSeededRandom(seed) 
    : Math.random.bind(Math);

  // Build filtered word list
  let words = wordList;

  // Filter by allowed keys
  if (allowedKeys && allowedKeys.length > 0) {
    words = getWordsForKeys(allowedKeys, words);
  }

  // Filter by length
  if (minLength !== undefined) {
    words = words.filter(w => w.length >= minLength);
  }
  if (maxLength !== undefined) {
    words = words.filter(w => w.length <= maxLength);
  }

  // Ensure we have words to work with
  if (words.length === 0) {
    words = ['a']; // Fallback
  }

  /**
   * Generate array of random words
   * @param {number} count - Number of words to generate
   * @returns {string[]}
   */
  function generate(count) {
    const result = [];
    for (let i = 0; i < count; i++) {
      const index = Math.floor(random() * words.length);
      result.push(words[index]);
    }
    return result;
  }

  /**
   * Generate text string with spaces
   * @param {number} count - Number of words
   * @returns {string}
   */
  function generateText(count) {
    return generate(count).join(' ');
  }

  /**
   * Get the current filtered word list
   * @returns {string[]}
   */
  function getWordList() {
    return [...words];
  }

  return {
    generate,
    generateText,
    getWordList,
  };
}

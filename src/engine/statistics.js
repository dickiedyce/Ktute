/**
 * Statistics Module
 * WPM, accuracy, per-key stats calculation
 */

/**
 * Calculate words per minute
 * Standard: 5 characters = 1 word
 * @param {number} charCount - Number of characters typed
 * @param {number} timeMs - Time in milliseconds
 * @returns {number} WPM
 */
export function calculateWPM(charCount, timeMs) {
  if (timeMs === 0) return 0;
  const minutes = timeMs / 60000;
  const words = charCount / 5;
  return Math.round(words / minutes);
}

/**
 * Calculate accuracy percentage
 * @param {number} totalChars - Total characters typed
 * @param {number} errorChars - Number of errors
 * @returns {number} Accuracy percentage (0-100)
 */
export function calculateAccuracy(totalChars, errorChars) {
  if (totalChars === 0) return 100;
  const accuracy = ((totalChars - errorChars) / totalChars) * 100;
  return Math.max(0, Math.round(accuracy));
}

/**
 * Create a statistics tracker instance
 * @returns {Object} Statistics tracker
 */
export function createStatisticsTracker() {
  let startTime = null;
  let running = false;
  let totalChars = 0;
  let correctChars = 0;
  let errorChars = 0;
  let lastInputTime = null;
  
  // Per-key statistics
  const keyStats = new Map();

  /**
   * Get or create key stats object
   * @param {string} key
   * @returns {Object}
   */
  function getOrCreateKeyStats(key) {
    if (!keyStats.has(key)) {
      keyStats.set(key, {
        total: 0,
        correct: 0,
        errors: 0,
        times: [],
        avgTime: 0,
        confusedWith: {},
      });
    }
    return keyStats.get(key);
  }

  /**
   * Start a new tracking session
   */
  function startSession() {
    startTime = Date.now();
    lastInputTime = startTime;
    running = true;
  }

  /**
   * End the current session
   */
  function endSession() {
    running = false;
  }

  /**
   * Check if session is running
   * @returns {boolean}
   */
  function isRunning() {
    return running;
  }

  /**
   * Get session duration in milliseconds
   * @returns {number}
   */
  function getDuration() {
    if (!startTime) return 0;
    return Date.now() - startTime;
  }

  /**
   * Record a character input
   * @param {string} char - Character that was typed
   * @param {boolean} correct - Whether it was correct
   * @param {string} [expected] - Expected character (for confusion tracking)
   */
  function recordInput(char, correct, expected) {
    const now = Date.now();
    const timeSinceLast = lastInputTime ? now - lastInputTime : 0;
    
    totalChars++;
    if (correct) {
      correctChars++;
    } else {
      errorChars++;
      
      // Track confusion if expected is provided
      if (expected) {
        const stats = getOrCreateKeyStats(expected);
        stats.confusedWith[char] = (stats.confusedWith[char] || 0) + 1;
      }
    }

    // Update per-key stats for the typed character
    const stats = getOrCreateKeyStats(char);
    stats.total++;
    if (correct) {
      stats.correct++;
    } else {
      stats.errors++;
    }
    
    // Track timing (skip first character)
    if (lastInputTime && timeSinceLast > 0) {
      stats.times.push(timeSinceLast);
      stats.avgTime = stats.times.reduce((a, b) => a + b, 0) / stats.times.length;
    }

    lastInputTime = now;
  }

  /**
   * Get statistics for a specific key
   * @param {string} key
   * @returns {Object}
   */
  function getKeyStats(key) {
    return getOrCreateKeyStats(key);
  }

  /**
   * Get overall statistics
   * @returns {Object}
   */
  function getStats() {
    const duration = getDuration();
    const rawWpm = calculateWPM(totalChars, duration);
    const netChars = Math.max(0, correctChars - errorChars);
    const wpm = calculateWPM(netChars, duration);
    const accuracy = calculateAccuracy(totalChars, errorChars);

    return {
      totalChars,
      correctChars,
      errorChars,
      duration,
      rawWpm,
      wpm,
      accuracy,
    };
  }

  /**
   * Reset all statistics
   */
  function reset() {
    startTime = null;
    running = false;
    totalChars = 0;
    correctChars = 0;
    errorChars = 0;
    lastInputTime = null;
    keyStats.clear();
  }

  return {
    startSession,
    endSession,
    isRunning,
    getDuration,
    recordInput,
    getKeyStats,
    getStats,
    reset,
  };
}

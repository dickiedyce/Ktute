/**
 * Session Management
 * Track typing sessions and persist history
 */

/**
 * Generate a unique session ID
 * @returns {string}
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

/**
 * Create a new session object
 * @param {Object} options - Session options
 * @param {string} options.text - Text to type
 * @param {string} [options.mode='practice'] - Session mode
 * @param {string} [options.layoutUsed] - Physical layout used
 * @param {string} [options.mappingUsed] - Key mapping used
 * @param {string} [options.lessonId] - Lesson ID if in lesson mode
 * @returns {Object} Session object
 */
export function createSession(options) {
  const {
    text,
    mode = 'practice',
    layoutUsed,
    mappingUsed,
    lessonId = null,
  } = options;

  return {
    id: generateId(),
    timestamp: Date.now(),
    text,
    mode,
    layoutUsed,
    mappingUsed,
    lessonId,
    duration: 0,
    wpm: 0,
    rawWpm: 0,
    accuracy: 100,
    totalChars: 0,
    errorChars: 0,
    errors: [],
    isComplete: false,
  };
}

/**
 * Create a session manager
 * @param {Object} [options={}] - Manager options
 * @param {Object} [options.storage] - Storage interface
 * @returns {Object} Session manager
 */
export function createSessionManager(options = {}) {
  const { storage } = options;
  const STORAGE_KEY = 'sessions';

  let activeSession = null;
  let sessions = loadSessions();

  /**
   * Load sessions from storage
   * @returns {Array}
   */
  function loadSessions() {
    if (!storage) return [];
    return storage.get(STORAGE_KEY) || [];
  }

  /**
   * Save sessions to storage
   */
  function saveSessions() {
    if (storage) {
      storage.set(STORAGE_KEY, sessions);
    }
  }

  /**
   * Start a new session
   * @param {Object} options - Session options
   * @returns {Object} The new session
   */
  function startSession(options) {
    activeSession = createSession(options);
    return activeSession;
  }

  /**
   * Get the currently active session
   * @returns {Object|null}
   */
  function getActiveSession() {
    return activeSession;
  }

  /**
   * End the active session and save it
   * @param {Object} stats - Final session statistics
   * @returns {Object} The completed session
   */
  function endSession(stats = {}) {
    if (!activeSession) return null;

    // Update session with final stats
    Object.assign(activeSession, stats);

    // Add to history
    sessions.push(activeSession);
    saveSessions();

    const completed = activeSession;
    activeSession = null;
    return completed;
  }

  /**
   * Get session history, sorted by most recent first
   * @returns {Array}
   */
  function getHistory() {
    return [...sessions].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }

  /**
   * Get average WPM across all completed sessions
   * @returns {number}
   */
  function getAverageWPM() {
    const completed = sessions.filter(s => s.isComplete);
    if (completed.length === 0) return 0;
    const total = completed.reduce((sum, s) => sum + (s.wpm || 0), 0);
    return Math.round(total / completed.length);
  }

  /**
   * Get average accuracy across all completed sessions
   * @returns {number}
   */
  function getAverageAccuracy() {
    const completed = sessions.filter(s => s.isComplete);
    if (completed.length === 0) return 0;
    const total = completed.reduce((sum, s) => sum + (s.accuracy || 0), 0);
    return Math.round(total / completed.length);
  }

  /**
   * Get best WPM ever achieved
   * @returns {number}
   */
  function getBestWPM() {
    if (sessions.length === 0) return 0;
    return Math.max(...sessions.map(s => s.wpm || 0));
  }

  /**
   * Get total practice time in milliseconds
   * @returns {number}
   */
  function getTotalTime() {
    return sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  }

  /**
   * Get total number of sessions
   * @returns {number}
   */
  function getTotalSessions() {
    return sessions.length;
  }

  /**
   * Clear all session history
   */
  function clearHistory() {
    sessions = [];
    saveSessions();
  }

  return {
    startSession,
    getActiveSession,
    endSession,
    getHistory,
    getAverageWPM,
    getAverageAccuracy,
    getBestWPM,
    getTotalTime,
    getTotalSessions,
    clearHistory,
  };
}

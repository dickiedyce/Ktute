/**
 * Simple hash-based router
 * Supports static routes and route parameters
 */

/**
 * Create a router
 * @param {Object} routes - Route definitions { path: handler }
 * @param {Object} [options={}] - Router options
 * @param {Function} [options.notFound] - Handler for unknown routes
 * @returns {Object} Router instance
 */
export function createRouter(routes, options = {}) {
  const { notFound = () => {} } = options;
  
  // Parse route patterns into regex
  const compiledRoutes = Object.entries(routes).map(([path, handler]) => {
    const paramNames = [];
    const pattern = path.replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    const regex = new RegExp(`^${pattern}$`);
    return { path, handler, regex, paramNames };
  });

  let currentRoute = '/';

  /**
   * Handle hash change
   */
  function handleHashChange() {
    const hash = window.location.hash.slice(1) || '/';
    matchAndExecute(hash);
  }

  /**
   * Match a path and execute the handler
   * @param {string} path
   */
  function matchAndExecute(path) {
    for (const route of compiledRoutes) {
      const match = path.match(route.regex);
      if (match) {
        currentRoute = path;
        const params = {};
        route.paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });
        route.handler(Object.keys(params).length ? params : undefined);
        return;
      }
    }
    // No match found
    currentRoute = path;
    notFound(path);
  }

  /**
   * Get current route
   * @returns {string}
   */
  function getCurrentRoute() {
    return currentRoute;
  }

  /**
   * Navigate to a route
   * @param {string} path
   */
  function navigate(path) {
    window.location.hash = path;
    matchAndExecute(path);
  }

  /**
   * Clean up event listeners
   */
  function destroy() {
    window.removeEventListener('hashchange', handleHashChange);
  }

  // Listen for hash changes
  window.addEventListener('hashchange', handleHashChange);

  // Initialize with current hash or default route
  const initialHash = window.location.hash.slice(1) || '/';
  matchAndExecute(initialHash);

  return {
    getCurrentRoute,
    navigate,
    destroy,
  };
}

/**
 * Initialize the Ktute application
 */
export function initApp() {
  const app = document.getElementById('app');
  if (!app) {
    console.error('App container not found');
    return;
  }

  // Render home view by default
  renderHomeView(app);
}

/**
 * Render the home view
 * @param {HTMLElement} container 
 */
function renderHomeView(container) {
  const homeView = document.createElement('main');
  homeView.setAttribute('data-view', 'home');
  homeView.className = 'home-view';
  
  homeView.innerHTML = `
    <header class="home-header">
      <h1>Ktute</h1>
      <p>Keyboard Typing Tutor</p>
    </header>
    <nav class="home-nav">
      <p class="hint">Press <kbd>/</kbd> to open command menu</p>
    </nav>
  `;
  
  container.appendChild(homeView);
}

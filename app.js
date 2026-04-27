// Beta Feedback Collector — app logic.
// Phase 5: up/down arrow reordering with persistence.

const STORAGE_KEY = 'beta-feedback-items';

// Maps each theme to a CSS class suffix used for the pill color.
// Edit here if a new theme is added.
const THEME_CLASSES = {
  'Bug': 'bug',
  'Usability/UX': 'usability',
  'Feature Request': 'feature',
  'General Reaction': 'reaction',
};

const form = document.getElementById('feedback-form');
const listEl = document.getElementById('feedback-list');
const confirmationEl = document.getElementById('form-confirmation');
const filterButtons = document.querySelectorAll('.filter-button');

// Which theme the PM has filtered to. "All" means show everything.
// Lives in memory only — refreshing the page resets to "All".
let activeFilter = 'All';

// ---------- Storage helpers ----------

// Return the full array of saved feedback (or an empty array on first load).
function loadFeedback() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

// Overwrite localStorage with the current array.
function saveFeedback(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ---------- Time formatting ----------

// Convert an ISO timestamp into a short human-readable phrase like "2 hours ago".
function formatRelativeTime(isoString) {
  const then = new Date(isoString);
  const seconds = Math.floor((Date.now() - then.getTime()) / 1000);

  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;

  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
}

// ---------- Reordering ----------

// Move an item up or down by swapping it with its nearest visible neighbor.
// "Visible" depends on the current filter. Hidden items stay where they are.
function moveItem(id, direction) {
  const items = loadFeedback();
  const currentIndex = items.findIndex((item) => item.id === id);
  if (currentIndex === -1) return;

  const isVisible = (item) =>
    activeFilter === 'All' || item.theme === activeFilter;

  // Walk through the global array looking for the next visible neighbor.
  let targetIndex = -1;
  if (direction === 'up') {
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (isVisible(items[i])) {
        targetIndex = i;
        break;
      }
    }
  } else {
    for (let i = currentIndex + 1; i < items.length; i++) {
      if (isVisible(items[i])) {
        targetIndex = i;
        break;
      }
    }
  }

  // No visible neighbor in that direction — already at the edge.
  if (targetIndex === -1) return;

  // Swap the two items in place. Hidden items between them don't move.
  [items[currentIndex], items[targetIndex]] = [items[targetIndex], items[currentIndex]];

  saveFeedback(items);
  renderList();
}

// ---------- Rendering ----------

// Wipe and re-draw the list, applying the active filter.
function renderList() {
  const items = loadFeedback();
  listEl.innerHTML = '';

  const visibleItems = activeFilter === 'All'
    ? items
    : items.filter((item) => item.theme === activeFilter);

  // Empty state: nothing to show, either because nothing exists or the filter hides everything.
  if (visibleItems.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'feedback-empty';
    empty.textContent = items.length === 0
      ? 'No feedback yet.'
      : 'No items match this filter.';
    listEl.appendChild(empty);
    return;
  }

  visibleItems.forEach((item, visibleIndex) => {
    const row = document.createElement('div');
    row.className = 'feedback-item';

    // The always-visible summary row.
    const summary = document.createElement('div');
    summary.className = 'item-summary';

    // Up/down arrows on the far left.
    const controls = document.createElement('div');
    controls.className = 'reorder-controls';

    const upButton = document.createElement('button');
    upButton.type = 'button';
    upButton.className = 'reorder-button';
    upButton.textContent = '▲';
    upButton.title = 'Move up';
    upButton.disabled = visibleIndex === 0;

    const downButton = document.createElement('button');
    downButton.type = 'button';
    downButton.className = 'reorder-button';
    downButton.textContent = '▼';
    downButton.title = 'Move down';
    downButton.disabled = visibleIndex === visibleItems.length - 1;

    // stopPropagation so the click doesn't also expand/collapse the row.
    upButton.addEventListener('click', (event) => {
      event.stopPropagation();
      moveItem(item.id, 'up');
    });
    downButton.addEventListener('click', (event) => {
      event.stopPropagation();
      moveItem(item.id, 'down');
    });

    controls.appendChild(upButton);
    controls.appendChild(downButton);

    const titleEl = document.createElement('span');
    titleEl.className = 'item-title';
    titleEl.textContent = item.title;

    const pillEl = document.createElement('span');
    const themeClass = THEME_CLASSES[item.theme] || 'reaction';
    pillEl.className = `theme-pill theme-pill--${themeClass}`;
    pillEl.textContent = item.theme;

    const nameEl = document.createElement('span');
    nameEl.className = 'item-name';
    nameEl.textContent = item.name;

    const timeEl = document.createElement('span');
    timeEl.className = 'item-time';
    timeEl.textContent = formatRelativeTime(item.createdAt);

    summary.appendChild(controls);
    summary.appendChild(titleEl);
    summary.appendChild(pillEl);
    summary.appendChild(nameEl);
    summary.appendChild(timeEl);

    // Description, hidden until the row is expanded.
    const description = document.createElement('div');
    description.className = 'item-description';
    if (item.description) {
      description.textContent = item.description;
    } else {
      description.textContent = 'No additional detail.';
      description.classList.add('item-description--empty');
    }

    summary.addEventListener('click', () => {
      row.classList.toggle('is-expanded');
    });

    row.appendChild(summary);
    row.appendChild(description);
    listEl.appendChild(row);
  });
}

// Show the "Thanks!" confirmation, then hide it after a few seconds.
function showConfirmation() {
  confirmationEl.textContent = 'Thanks! Your feedback was logged.';
  confirmationEl.classList.add('visible');
  setTimeout(() => {
    confirmationEl.classList.remove('visible');
  }, 2500);
}

// ---------- Form handling ----------

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const newItem = {
    id: crypto.randomUUID(),
    title: formData.get('title').trim(),
    description: formData.get('description').trim(),
    theme: formData.get('theme'),
    name: formData.get('name').trim(),
    createdAt: new Date().toISOString(),
  };

  const items = loadFeedback();
  items.push(newItem);
  saveFeedback(items);

  form.reset();
  showConfirmation();
  renderList();
});

// ---------- Filter handling ----------

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;

    // Update which button looks "active".
    filterButtons.forEach((b) => b.classList.remove('is-active'));
    button.classList.add('is-active');

    renderList();
  });
});

// ---------- Startup ----------

renderList();

console.log('Beta Feedback Collector loaded');

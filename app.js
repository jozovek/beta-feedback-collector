// Beta Feedback Collector — app logic.
// Shared by both views: the tester form (index.html) and the PM triage list (triage.html).
// Each page only has the elements it needs; the code detects which page it's on.

const STORAGE_KEY = 'beta-feedback-items';

// Maps each theme to a CSS class suffix used for the pill color.
const THEME_CLASSES = {
  'Bug': 'bug',
  'Usability/UX': 'usability',
  'Feature Request': 'feature',
  'General Reaction': 'reaction',
};

// Elements — some will be null depending on which page loaded this script.
const form = document.getElementById('feedback-form');
const listEl = document.getElementById('feedback-list');
const confirmationEl = document.getElementById('form-confirmation');
const filterButtons = document.querySelectorAll('.filter-button');

// Filter state (triage view only, lives in memory).
let activeFilter = 'All';

// ---------- Storage helpers ----------

function loadFeedback() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

function saveFeedback(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ---------- Time formatting ----------

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

// ---------- Reordering (triage view only) ----------

function moveItem(id, direction) {
  const items = loadFeedback();
  const currentIndex = items.findIndex((item) => item.id === id);
  if (currentIndex === -1) return;

  const isVisible = (item) =>
    activeFilter === 'All' || item.theme === activeFilter;

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

  if (targetIndex === -1) return;

  [items[currentIndex], items[targetIndex]] = [items[targetIndex], items[currentIndex]];

  saveFeedback(items);
  renderList();
}

// ---------- Rendering (triage view only) ----------

function renderList() {
  if (!listEl) return;

  const items = loadFeedback();
  listEl.innerHTML = '';

  const visibleItems = activeFilter === 'All'
    ? items
    : items.filter((item) => item.theme === activeFilter);

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

// ---------- Confirmation (tester view only) ----------

function showConfirmation() {
  if (!confirmationEl) return;
  confirmationEl.textContent = 'Thanks for sharing! Your feedback has been recorded.';
  confirmationEl.classList.add('visible');
  setTimeout(() => {
    confirmationEl.classList.remove('visible');
  }, 2500);
}

// ============================================================
//  Page-specific setup
//  The same script runs on both pages. Each block only activates
//  if the elements it needs are present in the HTML.
// ============================================================

// ---------- Tester view: wire up the form ----------

if (form) {
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
  });
}

// ---------- Triage view: wire up filters, render list, listen for updates ----------

if (listEl) {
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      filterButtons.forEach((b) => b.classList.remove('is-active'));
      button.classList.add('is-active');
      renderList();
    });
  });

  // Initial render.
  renderList();

  // Auto-update when another tab (the tester view) saves new feedback.
  // The "storage" event only fires in OTHER tabs, not the one that wrote.
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      renderList();
    }
  });
}

console.log('Beta Feedback Collector loaded');

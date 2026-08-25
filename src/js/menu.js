/**
 * Menu disclosure.
 *
 * A disclosure, not a modal: the panel expands in flow rather than covering
 * the page, so it needs no focus trap.
 *
 * The panel ships open in the markup so its links work without JavaScript.
 * This closes it on load and hands control to the toggle.
 *
 * State lives in aria-expanded and the hidden attribute — there is no
 * class-based copy of the same information to fall out of sync.
 */
export function initMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-menu-panel]');
  if (!toggle || !panel) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    if (open) panel.querySelector('a')?.focus();
  };

  // Close on load without moving focus.
  toggle.setAttribute('aria-expanded', 'false');
  panel.hidden = true;

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Escape closes and returns focus to the control that opened it.
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (toggle.getAttribute('aria-expanded') !== 'true') return;
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  });

  // Following a link closes the panel behind you. One listener on the panel
  // rather than one per link.
  panel.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

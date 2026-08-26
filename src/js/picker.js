/**
 * Garment picker.
 *
 * The radio group is the source of truth — this only shows the panel that
 * matches the checked input. Without it, every panel is visible and the page
 * still reads correctly.
 *
 * When a panel becomes active, its image gets a brief .is-entering class
 * that triggers the pop-in keyframe in components.css, then the class is
 * removed once the animation finishes — the image's resting state has no
 * dependency on that class ever being present.
 */
export function initPicker() {
  const group = document.querySelector('[data-picker]');
  const panels = document.querySelectorAll('[data-panel]');
  if (!group || !panels.length) return;

  const show = (value) => {
    panels.forEach((panel) => {
      const isActive = panel.dataset.panel === value;
      panel.hidden = !isActive;

      if (isActive) {
        const img = panel.querySelector('.picker__panel-img');
        if (img) {
          img.classList.remove('is-entering');
          // Force reflow so the class can be re-added even if the same
          // panel is somehow shown twice in a row.
          void img.offsetWidth;
          img.classList.add('is-entering');
        }
      }
    });
  };

  group.addEventListener('change', (event) => {
    show(event.target.value);
  });

  const checked = group.querySelector('input:checked');
  if (checked) show(checked.value);
}
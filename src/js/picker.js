/**
 * Garment picker. The radio group is the source of truth; this only shows the
 * panel matching the checked input. Without it every panel is visible and the
 * page still reads correctly.
 */
export function initPicker() {
  const group = document.querySelector('[data-picker]');
  const panels = document.querySelectorAll('[data-panel]');
  if (!group || !panels.length) return;

  const show = (value) => {
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== value;
    });
  };

  group.addEventListener('change', (event) => {
    show(event.target.value);
  });

  const checked = group.querySelector('input:checked');
  if (checked) show(checked.value);
}

/**
 * Take one corner off — the reader's turn.
 *
 * No GSAP in here, deliberately: this is an interaction, not an animation,
 * and main.js does not load the animation modules for a visitor who asked
 * for reduced motion. Building it on GSAP would have meant those readers got
 * a picture of some cloth and nothing to do with it. What motion it has is a
 * couple of class toggles animated in components.css, where the
 * reduced-motion backstop already applies to them.
 *
 * Progressive enhancement: the markup is a photograph of cloth, a paragraph,
 * and a toolbar carrying `hidden`. This inserts the canvas and only then
 * unhides the tools, so buttons never appear without a surface to operate.
 *
 * Strokes are kept as arrays of points rather than as pixels, because pixels
 * cannot be undone and do not survive a resize. Redrawing from the points
 * keeps the marks on the same part of the cloth after a rotation, and "undo"
 * is dropping the last array.
 */

// Which mark each choice makes. Colours are read from the design tokens at
// runtime rather than written here — see readToken().
const MARKS = {
  ink: { token: '--color-ink', width: 3, alpha: 1, dash: [] },
  chalk: { token: '--color-bg', width: 16, alpha: 0.75, dash: [] },
  thread: { token: '--color-ink', width: 4, alpha: 1, dash: [3, 11] },
};

// A mark is worth keeping once it is longer than an accidental tap.
const MIN_POINTS = 3;

// How far one arrow key moves the keyboard pen, as a fraction of the
// canvas — so it crosses the cloth in about the same number of presses
// whatever size the cloth is.
const KEY_STEP = 0.022;

const ARROWS = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

const clamp = (value) => Math.min(1, Math.max(0, value));

export function initDoodle() {
  const section = document.querySelector('[data-doodle]');
  const surface = section?.querySelector('[data-doodle-surface]');
  const cloth = surface?.querySelector('img');
  if (!section || !surface || !cloth) return;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return; // no 2D context: leave the plain cloth in place

  canvas.className = 'doodle__canvas';
  canvas.tabIndex = 0;
  canvas.setAttribute(
    'aria-label',
    'A length of gauze you can draw on. Drag across it to make a mark, ' +
      'or move the pen with the arrow keys and press space to draw.',
  );
  surface.append(canvas);

  // Where a keypress is about to draw. Pointer users never see it — it is
  // shown only while the canvas has focus.
  const pen = document.createElement('span');
  pen.className = 'doodle__pen';
  surface.append(pen);

  const tools = section.querySelector('[data-doodle-tools]');
  const status = section.querySelector('[data-doodle-status]');
  const note = section.querySelector('[data-doodle-note]');
  const undo = section.querySelector('[data-doodle-undo]');
  const clear = section.querySelector('[data-doodle-clear]');
  const keep = section.querySelector('[data-doodle-keep]');

  const strokes = []; // committed marks: [{ mark, points: [{x, y}] }]
  const keyPen = { x: 0.5, y: 0.5, down: false };
  const view = { width: 0, height: 0 };

  let current = null; // the mark being drawn, if any
  let mark = 'ink';

  // --- Painting --------------------------------------------------------

  // Points are stored 0–1 rather than in pixels: the cloth is fluid, so a
  // mark recorded at "38% across" is still on the same fold after a resize.
  function measure() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    // Cap the backing store at 2×: past that a phone is spending memory on
    // detail nobody can see, and a large canvas is what makes drawing lag.
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    view.width = rect.width;
    view.height = rect.height;
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    redraw();
    movePen();
  }

  function redraw() {
    context.clearRect(0, 0, view.width, view.height);
    strokes.forEach(paint);
    if (current) paint(current);
  }

  function paint(stroke) {
    const spec = MARKS[stroke.mark] ?? MARKS.ink;
    const points = stroke.points;
    if (!points.length) return;

    context.save();
    context.strokeStyle = readToken(spec.token);
    context.globalAlpha = spec.alpha;
    context.lineWidth = spec.width;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.setLineDash(spec.dash);

    const px = (point) => point.x * view.width;
    const py = (point) => point.y * view.height;

    context.beginPath();
    context.moveTo(px(points[0]), py(points[0]));

    if (points.length === 1) {
      // A single press still leaves something: a dot the width of the mark.
      context.lineTo(px(points[0]), py(points[0]));
    }

    // Each segment curves through the midpoint between two samples, with the
    // sample itself as the control point. Joining raw samples with straight
    // lines leaves a visible corner wherever the hand changed direction.
    for (let i = 1; i < points.length; i += 1) {
      const from = points[i - 1];
      const to = points[i];
      context.quadraticCurveTo(
        px(from),
        py(from),
        (px(from) + px(to)) / 2,
        (py(from) + py(to)) / 2,
      );
    }

    context.stroke();
    context.restore();
  }

  // --- Drawing ---------------------------------------------------------

  function begin(point) {
    current = { mark, points: [point] };
    redraw();
  }

  function extend(point) {
    if (!current) return;
    current.points.push(point);
    redraw();
  }

  function end() {
    if (!current) return;

    if (current.points.length >= MIN_POINTS) strokes.push(current);
    current = null;
    redraw();
    report();
  }

  function positionOf(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clamp((event.clientX - rect.left) / rect.width),
      y: clamp((event.clientY - rect.top) / rect.height),
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    // Ignore a second finger mid-stroke: two pointers on one canvas draw a
    // line between them, which is not what anybody means by it.
    if (current) return;

    canvas.setPointerCapture(event.pointerId);
    begin(positionOf(event));
  });

  canvas.addEventListener('pointermove', (event) => {
    if (!current) return;

    /*
     * The samples the browser batched into this frame keep a fast stroke a
     * curve, rather than the three or four points a 60Hz callback would see
     * of it. It can come back empty — a synthesised event has nothing to
     * coalesce — so fall back to the event itself.
     */
    const coalesced = event.getCoalescedEvents?.();
    const samples = coalesced?.length ? coalesced : [event];
    samples.forEach((sample) => extend(positionOf(sample)));
  });

  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  // --- Keyboard --------------------------------------------------------

  // Arrow keys move a pen, space puts it down and lifts it again. Not a
  // substitute for a hand, but a real way through the interaction — the
  // alternative was a section a keyboard visitor could only read about.
  function movePen() {
    pen.style.transform = `translate(${keyPen.x * view.width}px, ${
      keyPen.y * view.height
    }px)`;
    pen.dataset.drawing = String(keyPen.down);
  }

  canvas.addEventListener('keydown', (event) => {
    const step = ARROWS[event.key];

    if (step) {
      event.preventDefault();
      const amount = event.shiftKey ? KEY_STEP * 3 : KEY_STEP;
      keyPen.x = clamp(keyPen.x + step[0] * amount);
      keyPen.y = clamp(keyPen.y + step[1] * amount);

      if (keyPen.down) extend({ x: keyPen.x, y: keyPen.y });
      movePen();
      return;
    }

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      keyPen.down = !keyPen.down;

      if (keyPen.down) begin({ x: keyPen.x, y: keyPen.y });
      else end();

      movePen();
      return;
    }

    if (event.key === 'Escape' && keyPen.down) {
      keyPen.down = false;
      end();
      movePen();
    }
  });

  // Tabbing away mid-stroke would otherwise leave the pen down, and the
  // next arrow key would carry on a mark from wherever it was abandoned.
  canvas.addEventListener('blur', () => {
    if (!keyPen.down) return;
    keyPen.down = false;
    end();
    movePen();
  });

  // --- Tools -----------------------------------------------------------

  section
    .querySelector('[data-doodle-marks]')
    ?.addEventListener('change', (event) => {
      mark = event.target.value;
    });

  undo?.addEventListener('click', () => {
    strokes.pop();
    redraw();
    report();
  });

  clear?.addEventListener('click', () => {
    if (!strokes.length || canvas.classList.contains('is-clearing')) return;

    /*
     * The pixels go when the animation ends, not on the click, so the two
     * cannot get out of step. Whichever of animationend and the timeout
     * arrives first wins: a hidden tab suspends CSS animations, which would
     * otherwise leave the cloth invisible and the button dead. The fallback
     * is read off the animation rather than written down twice, so
     * reduced motion clears the cloth in a single frame.
     */
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;

      strokes.length = 0;
      current = null;
      canvas.classList.remove('is-clearing');
      redraw();
      report();
    };

    canvas.addEventListener('animationend', finish, { once: true });
    canvas.classList.add('is-clearing');

    const shake = parseFloat(getComputedStyle(canvas).animationDuration) || 0;
    setTimeout(finish, shake * 1000 + 80);
  });

  keep?.addEventListener('click', () => {
    const image = flatten(cloth, canvas, view);
    if (!image) return;

    const link = document.createElement('a');
    link.href = image;
    link.download = 'one-corner-off.png';
    link.click();
  });

  /** Counts, enables and announces. The one place that reads `strokes`. */
  function report() {
    const count = strokes.length;

    [undo, clear, keep].forEach((button) => {
      if (button) button.disabled = count === 0;
    });

    if (status) {
      status.textContent = count
        ? `${count} ${count === 1 ? 'mark' : 'marks'} on the cloth.`
        : 'Nothing on it yet.';
    }

    // The closing line only arrives once the reader has done the thing it
    // describes. Revealed, then left alone — clearing the cloth does not
    // take back the point.
    if (count >= 2 && note?.hidden) {
      note.hidden = false;
      requestAnimationFrame(() => note.classList.add('is-shown'));
    }
  }

  // --- Ready -----------------------------------------------------------

  if (tools) tools.hidden = false;
  report();
  measure();

  // The cloth is fluid and the tools wrap, so the canvas changes size for
  // reasons that are not window resizes. Watching the element itself
  // catches all of them, including the first layout after the image loads.
  new ResizeObserver(measure).observe(canvas);
}

/** Reads a colour from the design tokens, so no hex code lives in here. */
function readToken(name) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

/**
 * Cloth plus marks on one canvas, as a PNG data URL. The marks live on a
 * transparent canvas over an <img>, so exporting the canvas alone would hand
 * back a drawing of nothing. Both are same-origin, so composing them does
 * not taint the result.
 */
function flatten(cloth, canvas, view) {
  const output = document.createElement('canvas');
  output.width = canvas.width;
  output.height = canvas.height;

  const context = output.getContext('2d');
  if (!context) return null;

  const scale = canvas.width / view.width;
  context.scale(scale, scale);
  context.drawImage(cloth, 0, 0, view.width, view.height);
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.drawImage(canvas, 0, 0);

  return output.toDataURL('image/png');
}

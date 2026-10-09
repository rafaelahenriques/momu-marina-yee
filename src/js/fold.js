import { prefersReducedMotion } from './reduced-motion.js';

/**
 * Take one corner off. The reader folds back the corner of a finished page as
 * far as they choose, and the photograph under it shows through. The flap
 * stays where it is let go, because the mark is lived with, until it is
 * folded back. Runs for everyone, like the picker: this is the reader's own
 * hand, not motion, so reduced motion only drops the easing between states.
 *
 * Without it the page's corner is cut in CSS and the photograph is in the
 * markup, with its alt.
 *
 * The geometry: C is the page's top-right corner and P is where the reader
 * has brought it. The crease is the line halfway between them, square to the
 * line that joins them. Everything of the page on C's side of the crease is
 * folded over it; mirrored across the crease, that part becomes the flap.
 */

// Where the corner rests before anyone touches it, as a share of the page's
// shorter side: a dog-ear, enough to say the corner is loose.
const DOG_EAR = 0.12;

// How far an arrow key folds it, as a share of the way to the far corner.
const STEP = 0.06;

// How far it can fold, as a share of the way from its own corner to the
// opposite one. Any further and the page is folded off itself.
const REACH = 0.9;

// How far it has to be folded before the line about the method appears.
const NOTE_AT = 0.3;

export function initFold() {
  const stage = document.querySelector('[data-fold-stage]');
  const sheet = stage?.querySelector('[data-fold-sheet]');
  if (!stage || !sheet) return;

  const section = stage.closest('[data-fold]') ?? stage.parentElement;
  const note = section.querySelector('[data-fold-note]');
  const hint = stage.querySelector('.fold__hint');

  const { flap, face } = buildFlap();
  const corner = buildCorner();
  const reset = buildReset();
  stage.append(flap, corner);
  stage.after(reset);
  stage.classList.add('is-folding');
  if (hint) hint.hidden = false;

  // P, as shares of the page's width and height, so a resize keeps the fold
  // in the same place on the paper.
  let at = dogEar();
  let tween = 0;

  // Where the corner is headed while it eases there, so a run of key
  // presses each adds a full step rather than a step from mid-way.
  let goal = at;

  // Once the reader has had a hand on it, the page is theirs: the opening
  // lift below must not pull the corner back from under them.
  let touched = false;

  function size() {
    return { w: stage.clientWidth, h: stage.clientHeight };
  }

  function dogEar() {
    const { w, h } = size();
    if (!w || !h) return { x: 1 - DOG_EAR, y: DOG_EAR };
    const s = Math.min(w, h) * DOG_EAR;
    return { x: 1 - s / w, y: s / h };
  }

  // How far P is along the way from C to the opposite corner, 0 to 1.
  function progress(p = at) {
    const { w, h } = size();
    const reach = Math.hypot(w, h);
    return Math.hypot((1 - p.x) * w, p.y * h) / reach;
  }

  // The point that far along the diagonal, as shares.
  function along(t) {
    return { x: 1 - t, y: t };
  }

  // Kept on the page, and short of folding the page off itself.
  function clamp(p) {
    const x = Math.min(1, Math.max(0, p.x));
    const y = Math.min(1, Math.max(0, p.y));
    const t = progress({ x, y });
    if (t <= REACH) return { x, y };
    const k = REACH / t;
    return { x: 1 - (1 - x) * k, y: y * k };
  }

  function render() {
    const { w, h } = size();
    if (!w || !h) return;
    const p = { x: at.x * w, y: at.y * h };
    const d = { x: p.x - w, y: p.y };
    const length = d.x * d.x + d.y * d.y;

    corner.style.translate = `${p.x}px ${p.y}px`;
    const t = progress();
    corner.setAttribute('aria-valuenow', String(Math.round(t * 100)));
    corner.setAttribute(
      'aria-valuetext',
      t < 0.02 ? 'Not folded' : `Folded ${Math.round(t * 100)}% of the way`,
    );

    if (length < 1) {
      sheet.style.clipPath = 'none';
      flap.hidden = true;
      return;
    }

    // Which side of the crease a point is on: below zero is the corner's.
    const m = { x: (p.x + w) / 2, y: p.y / 2 };
    const side = (q) => (q.x - m.x) * d.x + (q.y - m.y) * d.y;
    const page = [
      { x: 0, y: 0 },
      { x: w, y: 0 },
      { x: w, y: h },
      { x: 0, y: h },
    ];

    const kept = cut(page, side, 1);
    const folded = cut(page, side, -1).map((q) => {
      const k = (2 * side(q)) / length;
      return { x: q.x - k * d.x, y: q.y - k * d.y };
    });

    sheet.style.clipPath = polygon(kept);
    face.style.clipPath = polygon(folded);
    flap.hidden = false;

    // The back of the page darkens into the crease and pales towards the
    // tip. CSS measures a gradient along a line through the box's centre,
    // so the two stops are placed on that line, in px.
    const unit = { x: d.x / Math.sqrt(length), y: d.y / Math.sqrt(length) };
    const span = Math.abs(w * unit.x) + Math.abs(h * unit.y);
    const onLine = (q) =>
      (q.x - w / 2) * unit.x + (q.y - h / 2) * unit.y + span / 2;
    const angle = (Math.atan2(unit.x, -unit.y) * 180) / Math.PI;
    face.style.setProperty('--fold-angle', `${angle}deg`);
    face.style.setProperty('--fold-crease', `${onLine(m)}px`);
    face.style.setProperty('--fold-tip', `${onLine(p)}px`);

    if (t > progress(dogEar()) + 0.05) reset.hidden = false;
    if (note && t >= NOTE_AT) note.hidden = false;
  }

  function set(p) {
    cancelAnimationFrame(tween);
    at = clamp(p);
    goal = at;
    render();
  }

  // Eased from where the corner is to where it is going; at once with
  // reduced motion.
  function moveTo(p, duration = 500) {
    cancelAnimationFrame(tween);
    const to = clamp(p);
    goal = to;
    if (prefersReducedMotion()) {
      set(to);
      return;
    }
    const from = { ...at };
    const start = performance.now();
    const frame = (now) => {
      const k = Math.min(1, (now - start) / duration);
      const e = 1 - (1 - k) ** 3;
      at = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e };
      render();
      if (k < 1) tween = requestAnimationFrame(frame);
    };
    tween = requestAnimationFrame(frame);
  }

  // --- Taking the corner --------------------------------------------

  let grab = null;

  corner.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    touched = true;
    corner.setPointerCapture(event.pointerId);
    const box = stage.getBoundingClientRect();
    const { w, h } = size();
    // Held where it was taken, not jumped to the pointer's centre.
    grab = {
      x: event.clientX - box.left - at.x * w,
      y: event.clientY - box.top - at.y * h,
    };
    stage.classList.add('is-held');
  });

  corner.addEventListener('pointermove', (event) => {
    if (!grab) return;
    const box = stage.getBoundingClientRect();
    const { w, h } = size();
    set({
      x: (event.clientX - box.left - grab.x) / w,
      y: (event.clientY - box.top - grab.y) / h,
    });
  });

  const letGo = () => {
    grab = null;
    stage.classList.remove('is-held');
  };
  corner.addEventListener('pointerup', letGo);
  corner.addEventListener('pointercancel', letGo);

  // A tap anywhere on the page brings the corner to it, for anyone who
  // would rather point than drag.
  stage.addEventListener('click', (event) => {
    if (event.target === corner) return;
    touched = true;
    const box = stage.getBoundingClientRect();
    moveTo({
      x: (event.clientX - box.left) / box.width,
      y: (event.clientY - box.top) / box.height,
    });
  });

  // Keys fold it along the diagonal, the way a slider moves.
  corner.addEventListener('keydown', (event) => {
    const t = progress(goal);
    const keys = {
      ArrowLeft: t + STEP,
      ArrowDown: t + STEP,
      ArrowRight: t - STEP,
      ArrowUp: t - STEP,
      PageDown: t + STEP * 3,
      PageUp: t - STEP * 3,
      Home: 0,
      End: REACH,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    touched = true;
    moveTo(along(Math.max(0, keys[event.key])), 250);
  });

  reset.addEventListener('click', () => moveTo(dogEar(), 700));

  new ResizeObserver(render).observe(stage);
  render();

  invite(
    stage,
    () => at,
    () => touched,
    moveTo,
  );
}

/**
 * One finite lift of the dog-ear the first time the page is in view, to say
 * the corner is loose. Nothing here repeats, so it needs no pause control.
 */
function invite(stage, current, touched, moveTo) {
  if (prefersReducedMotion()) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (touched()) return;
      const rest = current();
      moveTo({ x: rest.x - 0.08, y: rest.y + 0.07 }, 450);
      setTimeout(() => {
        if (!touched()) moveTo(rest, 600);
      }, 520);
    },
    { threshold: 0.6 },
  );
  observer.observe(stage);
}

// The page cut along the crease: the part of the polygon on one side of it
// (Sutherland–Hodgman, against a single edge).
function cut(points, side, sign) {
  const out = [];
  points.forEach((a, i) => {
    const b = points[(i + 1) % points.length];
    const fa = sign * side(a);
    const fb = sign * side(b);
    if (fa >= 0) out.push(a);
    if (fa >= 0 !== fb >= 0) {
      const k = fa / (fa - fb);
      out.push({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
    }
  });
  return out;
}

function polygon(points) {
  if (points.length < 3) return 'polygon(0 0, 0 0, 0 0)';
  return `polygon(${points.map((q) => `${q.x}px ${q.y}px`).join(', ')})`;
}

// Two elements, because clip-path also clips a filter on the same box: the
// outer one carries the shadow the flap casts, the inner one its shape.
function buildFlap() {
  const flap = document.createElement('div');
  flap.className = 'fold__flap';
  flap.setAttribute('aria-hidden', 'true');
  flap.hidden = true;
  const face = document.createElement('div');
  face.className = 'fold__flap-face';
  flap.append(face);
  return { flap, face };
}

// The corner itself, as a slider: what it sets is how far the page is
// folded, which is a value on a range, and the arrow keys move it.
function buildCorner() {
  const corner = document.createElement('span');
  corner.className = 'fold__corner';
  corner.setAttribute('role', 'slider');
  corner.setAttribute('tabindex', '0');
  corner.setAttribute('aria-label', 'Fold the corner of the page');
  corner.setAttribute('aria-valuemin', '0');
  corner.setAttribute('aria-valuemax', String(Math.round(REACH * 100)));
  return corner;
}

function buildReset() {
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'button fold__reset';
  reset.textContent = 'Fold it back';
  reset.hidden = true;
  return reset;
}

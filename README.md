# Marina Yee — One Corner Off

Interactive longread for MoMu Antwerp, story 1 of 6 on the Antwerp Six.
Devine (Howest) — ENG INT3, *Dress to Impress*.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into /dist
npm run preview  # serve the built version locally — test this before you deploy
```

`server.host` is on, so `npm run dev` also prints a network URL you can open on
your phone. Test on a real device early; the brief is graded on mobile Safari.

## Structure

```
index.html              the whole longread — one page, semantic sections
src/
  main.js               entry point: inits, and the pin ordering that matters
  css/
    main.css            imports the partials in cascade order
    base/fonts.css      @font-face declarations
    base/tokens.css     design tokens — colour, type, space, motion
    base.css            reset, typography, page layout
    components.css      one block per component
  js/
    reduced-motion.js   the prefers-reduced-motion check
    motion.js           GSAP setup, plus the shared scrub and hover helpers
    menu.js             menu disclosure          (always runs)
    picker.js           garment picker panels    (always runs)
    doodle.js           the drawing surface      (always runs)
    …                   everything else is motion-only, loaded on demand
public/
  images/               served from /images/…
    objects/            cut-out objects and scanned scribbles
  fonts/                served from /fonts/…
```

Three conventions worth keeping:

- **No hex codes or font names outside `base/tokens.css`.** That file is the
  design system; everything else references it. `doodle.js` needs two colours
  for the canvas and reads them out of the tokens at runtime rather than
  writing them down a second time.
- **No JavaScript in `index.html`** beyond the two-line `no-js` → `js` switch.
- **Interactions go above the reduced-motion check in `main.js`, animations
  below it.** If a reader can operate it, it runs for everyone.

## Progressive enhancement

The page is built so the content survives without JavaScript:

- `<html class="no-js">` is swapped to `js` before paint, so CSS can style both.
- Nothing starts hidden in CSS. GSAP sets the "from" state at runtime, so a
  failed script leaves the text visible rather than blank.
- Every pinned or animated section has a plain, readable default: the
  horizontal panels stack, the marquee wraps, the depth fly-through is a grid.
  Each one only gains `.is-enhanced` once its module has actually run.
- `prefers-reduced-motion` is respected twice: in `main.js`, which returns
  before GSAP is even imported, and in CSS as a backstop.
- The auto-scrolling detail strip ships a real pause button (WCAG 2.2.2) and
  also pauses on hover and keyboard focus.
- **Take One Corner Off** ships as a photograph of cloth and a paragraph.
  `doodle.js` inserts the `<canvas>` and only then unhides the toolbar, so
  the buttons can never appear without a surface to operate. It has no GSAP
  in it on purpose — a reader who asked for less motion should still get
  something to draw on — so its few moving parts are class toggles animated
  in `components.css`, where the reduced-motion backstop already covers them.

## Motion

`main.js` loads GSAP and the animation modules dynamically, so a reduced-motion
visitor never downloads them. **The order of the five pinned sections in
`main.js` is load-bearing** — each pin adds scroll distance to the page, so a
pin created before one above it measures against a page height that then
changes. The comments in `main.js` explain the ordering; keep it in DOM order
and keep the `refreshPriority` values.

`motion.js` holds what every module shares: the house ease, the two `scrub`
values, `canHover()`, and `ScrollTrigger.config({ ignoreMobileResize: true })`
— which is what stops a phone re-measuring all five pins every time the
address bar slides away.

Two things about the horizontal section are worth knowing before editing it:
the panels' contents are revealed through ScrollTrigger's `containerAnimation`,
so their `start`/`end` are horizontal (`'left 85%'`), measured along the slide
rather than down the page; and the decorative layers behind them travel in
multiples of the **viewport** width, not the track's — a fifth of a
five-screen track puts a layer off the left edge inside the first panel.

## Images

Put source files in `public/images/`. Give every `<img>` explicit
`width`/`height` matching the real file so nothing shifts as it loads, and
`loading="lazy"` on everything below the fold.

Images are resized to roughly 2× their largest CSS display size before being
committed — there is no build-time image pipeline, so oversized files ship as-is:

```bash
sips -s format jpeg -s formatOptions 80 --resampleWidth 900 source.jpg --out public/images/name.jpg
```

Cut-out objects and scribbles keep their alpha, so they stay PNG. Crop the
transparent margin off a scan before resizing it, or most of the file is
empty page:

```bash
sips -c 2320 2110 --cropOffset 430 70 scan.png --out cropped.png   # H W, then Y X
sips --resampleWidth 620 cropped.png --out public/images/objects/name.png
```

## Git

GitHub Flow: `main` always works. Branch per feature
(`feat/hero-animation`, `feat/pattern-interaction`), meaningful commit messages,
merge back when it runs.

## Still to do

- [ ] Source remaining archive images, with credits
- [ ] Test in Safari and Chrome, desktop and mobile
- [ ] Deploy, verify the live URL, freeze the repo at the deadline
- [ ] Process file (A4 PDF) + Toggl export

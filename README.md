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
    motion.js           registers GSAP + ScrollTrigger + SplitText
    menu.js             menu disclosure          (always runs)
    picker.js           garment picker panels    (always runs)
    …                   everything else is motion-only, loaded on demand
public/
  images/               served from /images/…
  fonts/                served from /fonts/…
```

Two conventions worth keeping:

- **No hex codes or font names outside `base/tokens.css`.** That file is the
  design system; everything else references it.
- **No JavaScript in `index.html`** beyond the two-line `no-js` → `js` switch.

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

## Motion

`main.js` loads GSAP and the animation modules dynamically, so a reduced-motion
visitor never downloads them. **The order of the four pinned sections in
`main.js` is load-bearing** — each pin adds scroll distance to the page, so a
pin created before one above it measures against a page height that then
changes. The comments in `main.js` explain the ordering; keep it in DOM order
and keep the `refreshPriority` values.

## Images

Put source files in `public/images/`. Give every `<img>` explicit
`width`/`height` matching the real file so nothing shifts as it loads, and
`loading="lazy"` on everything below the fold.

Images are resized to roughly 2× their largest CSS display size before being
committed — there is no build-time image pipeline, so oversized files ship as-is:

```bash
sips -s format jpeg -s formatOptions 80 --resampleWidth 900 source.jpg --out public/images/name.jpg
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

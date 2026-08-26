# Marina Yee — One Corner Off

An interactive longread about the Belgian fashion designer Marina Yee, built
for **MoMu, the Fashion Museum in Antwerp**.

University project for **Integration 3 (ENG INT3), Devine — Howest**.
Assignment: _Dress to Impress_.

## The brief

MoMu holds the largest collection of contemporary Belgian fashion in the
world. In 2026 the museum marks the 40th anniversary of the international
breakthrough of the **Antwerp Six** with its first exhibition dedicated to
them.

As the start of MoMu's digital marketing plan, the museum wants a series of
six interactive one-pagers — one per designer, published every two months —
that turn static archive material into something you read, explore and play
with. The stories are meant to build interest in the exhibition, reach people
who had not considered visiting, and let MoMu act as a knowledge centre.

Each student builds one story. **Mine is Marina Yee, and it is the first of
the six**, so the footer links out to the ones that follow.

The requirement was not to summarise a Wikipedia page but to find an angle.
This one takes Yee's own phrase — _"one corner off"_, making something appear
finished and then deliberately disturbing it — and uses it to read her whole
practice of reconstruction, reuse and alteration. The page is built so the
reader keeps doing the thing the story describes: crossing a label out,
choosing a garment to look closer at, and finally marking a length of cloth
themselves.

Assessed on storytelling, design, interaction, and the development topics
below: responsive mobile-first layout, progressive enhancement, deliberate
animation choices (GSAP / ScrollTrigger), optimised responsive images, Vite,
npm, and GitHub Flow.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into /dist
npm run preview  # serve the built version — do this before deploying
```

`server.host` is on, so `npm run dev` also prints a network URL you can open
on your phone. Test on a real device early; this is graded on mobile Safari.

### Quality gates

`npm run check` runs all of them plus the build, and is what should pass
before merging:

```bash
npm run lint         # ESLint
npm run lint:css     # Stylelint — valid CSS and BEM naming
npm run format       # Prettier, writes
npm run format:check # Prettier, reports only
npm run images       # regenerate responsive image variants
npm run check        # all of the above (check-only) + build
```

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
    nav.js              sticky bar, progress, scroll-spy  (always runs)
    picker.js           garment picker panels    (always runs)
    doodle.js           the drawing surface      (always runs)
    …                   everything else is motion-only, loaded on demand
scripts/
  generate-images.js    source images → responsive WebP variants
public/
  images/               source images, served from /images/…
    responsive/         generated variants (committed)
    objects/            cut-out objects and scanned scribbles
  fonts/                served from /fonts/…
```

Three conventions worth keeping:

- **No hex codes or font names outside `base/tokens.css`.** That file is the
  design system; everything else references it. `doodle.js` needs two colours
  for the canvas and reads them from the tokens at runtime rather than
  writing them down a second time.
- **No JavaScript in `index.html`** beyond the two-line `no-js` → `js` switch.
- **Interactions go above the reduced-motion check in `main.js`, animations
  below it.** If a reader can operate it or navigate by it, it runs for
  everyone.

## Progressive enhancement

The content survives without JavaScript:

- `<html class="no-js">` is swapped to `js` before paint, so CSS can style
  both cases.
- Nothing starts hidden in CSS. GSAP sets the "from" state at runtime, so a
  failed script leaves text visible rather than blank.
- Every pinned or animated section has a plain, readable default: the
  horizontal panels stack, the marquee wraps, the depth fly-through is a
  grid. Each gains `.is-enhanced` only once its module has actually run.
- `prefers-reduced-motion` is respected twice: in `main.js`, which returns
  before GSAP is even imported, and in CSS as a backstop. `nav.js` reads it
  too: those readers keep the bar on screen instead of having it slide.

- Both `.site-nav` and the menu panel are only sticky and only out of flow
  under `.js`. Without script the panel ships open and cannot be closed, so a
  stuck bar carrying it would eat the screen.
- The auto-scrolling detail strip ships a real pause button (WCAG 2.2.2) and
  also pauses on hover and keyboard focus.
- **Take One Corner Off** ships as a photograph of cloth and a paragraph.
  `doodle.js` inserts the `<canvas>` and only then unhides the toolbar, so
  buttons can never appear without a surface to operate. It uses no GSAP on
  purpose — a reader who asked for less motion should still get something to
  draw on.

## Navigation

The page runs to roughly 29,000px of scroll with five pinned sections, so the
chrome has to do more than link out. `nav.js` handles three things on one
rAF-throttled scroll listener:

- **A bar that gets out of the way.** It hides on a deliberate scroll down
  past 200px and returns on any upward scroll, so the menu is always one flick
  away. `.site-nav:focus-within` is ordered after `.site-nav--hidden` at equal
  specificity, which is what stops a keyboard reader tabbing to a bar that is
  parked off-screen.
- **Progress**, as a scaled 2px rule along the bottom edge. `scaleX` on a
  custom property, so it never touches layout.
- **Which section you are in**, marked with `aria-current="location"` in the
  panel and named in the bar above 64rem. The last section whose top has
  crossed 35% of the viewport wins.

`nav.js` also measures the bar into `--nav-height`, which `scroll-padding-top`
uses to keep anchor targets clear of it and the panel uses for its
`max-height`. A ResizeObserver keeps it right when the controls wrap.

## Motion

`main.js` loads GSAP and the animation modules dynamically, so a
reduced-motion visitor never downloads them.

**The order of the five pinned sections in `main.js` is load-bearing.** Each
pin adds scroll distance to the page, so a pin created before one above it
measures against a page height that then changes. Keep them in DOM order and
keep the `refreshPriority` values.

`motion.js` holds what every module shares: the house ease, the two `scrub`
values, `canHover()`, and `ScrollTrigger.config({ ignoreMobileResize: true })`
— which stops a phone re-measuring all five pins every time the address bar
slides away.

Two things about the horizontal section before editing it: the panels'
contents are revealed through ScrollTrigger's `containerAnimation`, so their
`start`/`end` are horizontal (`'left 85%'`), measured along the slide rather
than down the page; and the decorative layers behind them travel in multiples
of the **viewport** width, not the track's.

## Images

Source files go in `public/images/` at full size. They are the source of
truth, not what ships.

`scripts/generate-images.js` resizes each into a ladder of WebP variants under
`public/images/responsive/`, and every `<img>` points its `srcset` at those.
The variants are committed, so a deploy never has to run sharp:

```bash
npm run images   # after adding or replacing any source image
```

It only rewrites variants whose source is newer, so re-running is cheap.

Each `<img>` needs three things by hand:

- `width`/`height` matching the **source** file, so the box is reserved
  before anything loads;
- `sizes` describing how wide the image is actually painted, per breakpoint —
  get this wrong and the browser fetches the wrong variant;
- `src` left pointing at the original, as the fallback for anything that
  cannot do `srcset`.

Copy the `sizes` from whichever image sits beside it in the same layout.

Cut-out objects and scribbles keep their alpha; WebP carries transparency, so
they go through the same pipeline. Crop the transparent margin off a scan
before committing it, or most of the file is empty page:

```bash
sips -c 2320 2110 --cropOffset 430 70 scan.png --out cropped.png   # H W, then Y X
```

## Git

GitHub Flow: `main` always works. A branch per feature
(`feature/hero-animation`, `feature/responsive-images`), meaningful commit
messages, merged back when it runs.

## Credits

Story and design by Rafaela Henriques. Archive material and garments from
MoMu, Fashion Museum Antwerp. Sources are listed in the page footer.

Typefaces are trial licences (Reckless Wide, Roobert) — replace them before
any use beyond this assignment.

## Still to do

- [ ] Source remaining archive images, with credits
- [ ] Test in Safari and Chrome, desktop and mobile
- [ ] Deploy, verify the live URL, freeze the repo at the deadline
- [ ] Process file (A4 PDF) + Toggl export

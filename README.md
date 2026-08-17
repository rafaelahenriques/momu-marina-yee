# Marina Yee — MoMu Antwerp

Interactive longread for MoMu, story 1 of 6 on the Antwerp Six.
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
index.html            semantic longread skeleton
src/
  main.js             entry point — imports and inits, nothing else
  js/
    motion.js         registers GSAP + ScrollTrigger, reduced-motion check
    scroll-reveal.js  the [data-reveal] scroll animation
    compare.js        example interaction (before/after slider)
  css/
    main.css          imports the partials in cascade order
    base/             reset, design tokens, typography
    layout/           page structure, mobile-first
    components/       one file per component
public/
  images/             your optimised images (served from /images/…)
```

Two conventions worth keeping:

- **No hex codes or font names outside `base/tokens.css`.** That file is your
  design system; everything else references it.
- **No JavaScript in `index.html`** beyond the two-line `no-js` → `js` switch.
  Externalised JS is a hard requirement.

## Progressive enhancement

The page is built so the content survives without JavaScript:

- `<html class="no-js">` is swapped to `js` before paint, so CSS can style both.
- Nothing starts hidden in CSS. GSAP sets the "from" state at runtime, so a
  failed script leaves the text visible rather than blank.
- The example interaction uses a real `<input type="range">`, which means
  keyboard, touch and screen-reader support come for free.
- `prefers-reduced-motion` is respected twice: in JS before animations are
  registered, and in CSS as a backstop.

## Images

Put source files in `public/images/`. Ship AVIF and WebP with a JPEG fallback,
give every `<img>` explicit `width`/`height` to stop layout shift, and use
`loading="lazy"` on everything below the fold. See the `<picture>` block in
`index.html` for the pattern. A quick way to generate the sizes:

```bash
npx @squoosh/cli --resize '{"width":1280}' --avif auto --webp auto source.jpg
```

## Git

```bash
git init
git add .
git commit -m "chore: set up Vite project with GSAP and base styles"
```

Then push to a **private** repo and invite `wouterverweirder` and
`SimonVanherweghe` as collaborators. Check the day before the jury that both
invitations were accepted.

GitHub Flow: `main` always works. Branch per feature
(`feat/hero-animation`, `feat/pattern-interaction`), meaningful commit messages,
merge back when it runs.

## Still to do

- [ ] Define the angle — which period, collection or detail of Yee's work
- [ ] Moodboard and type choices, then fill in `tokens.css`
- [ ] Write the longread copy
- [ ] Build the real interactive moment (the slider here is a placeholder)
- [ ] Source and optimise archive images, with credits
- [ ] Series navigation to the other five stories
- [ ] Test in Safari and Chrome, desktop and mobile
- [ ] Deploy, verify the live URL, freeze the repo at the deadline
- [ ] Process file (A4 PDF) + Toggl export

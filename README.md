# Marina Yee — One Corner Off

An interactive longread about the Belgian designer Marina Yee, made for
[MoMu](https://www.momu.be/en/), the Fashion Museum Antwerp.

University project for Integration 3 at Devine (Howest), assignment
_Dress to Impress_.

## The idea

Yee described her process as _"one corner off"_: make something look finished,
then deliberately disturb it. The page follows that idea through her work with
existing garments and ends by handing the reader a piece of cloth to mark
themselves.

## Run it

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build into dist/
npm run preview  # check the build before deploying
npm run check    # lint, format check and build: run before merging
npm run images   # regenerate responsive images after adding a source image
```

## Built with

Vite, GSAP (ScrollTrigger, SplitText) and plain HTML, CSS and JavaScript. The
story reads fine without JavaScript, and animations are skipped for readers who
prefer reduced motion.

```
index.html     the page
src/main.js    entry point
src/js/        one file per interaction or animation
src/css/       design tokens, base styles, components
public/        images and fonts
```

## Workflow

GitHub Flow: `main` always works, and every change goes through its own branch
and pull request.

## Credits

Story and design by Rafaela Henriques. Archive material from MoMu, Fashion
Museum Antwerp; sources are listed in the page footer. Set in Archivo and
Reenie Beanie, both under the SIL Open Font License.

/**
 * The film, loaded only when asked for. Until the reader presses play the
 * frame is a poster linking to the film on YouTube, so nothing is loaded from
 * YouTube and no cookies are set; that link is also what a reader without
 * JavaScript gets. On a press the poster is swapped for YouTube's
 * privacy-enhanced player, starting where the link says to. Runs for
 * everyone: playback the reader starts is not motion.
 */

const PLAYER = 'https://www.youtube-nocookie.com/embed/';

export function initFilm() {
  document.querySelectorAll('[data-film]').forEach((poster) => {
    poster.addEventListener('click', (event) => {
      // A click with a modifier still opens YouTube, in a new tab or window,
      // as any link would.
      const modified =
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
      if (modified || event.button !== 0) return;

      event.preventDefault();
      const player = buildPlayer(poster.dataset);
      poster.replaceWith(player);

      // Keyboard readers carry on inside the player they asked for, rather
      // than from the top of the page where the removed link leaves focus.
      player.focus();
    });
  });
}

function buildPlayer({ film, filmStart, filmTitle }) {
  const src = new URL(PLAYER + encodeURIComponent(film));
  src.search = new URLSearchParams({
    start: filmStart ?? '0',
    autoplay: '1',
    playsinline: '1',
    rel: '0',
  }).toString();

  const player = document.createElement('iframe');
  player.className = 'film__player';
  player.src = src.toString();
  player.title = filmTitle || 'Film';
  player.allow =
    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  player.allowFullscreen = true;
  player.referrerPolicy = 'strict-origin-when-cross-origin';
  return player;
}

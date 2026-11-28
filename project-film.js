// The film at the top of a project page.
// Clicking it plays or pauses it. With a mouse, the cursor shows "Play" (a cream rounded button),
// and "Pause" (pink and wider) while the film plays. On touch screens the button sits on the film:
// while the film plays it fades away after a moment, so it doesn't cover the film.
// Keyboard focus shows the same word as the mouse.
// The "Full Screen" button opens the film full screen, with the browser's own controls (pause, sound, time)
// and a small "Close / Esc" button in the site's look to go back. It fades away while the film plays and
// the mouse rests, and comes back when the mouse moves. (iPhone opens its own full-screen player instead.)

// Pages with a film (the Virtual Wandering page has the game instead, see project-game.js)
if (document.querySelector(".project-film video")) setUpFilm();

function setUpFilm() {
  const projectFilm = document.querySelector(".project-film");
  const filmVideo = projectFilm.querySelector("video");
  const filmButton = projectFilm.querySelector(".film-play-button");
  const fullScreenButton = document.querySelector(".film-fullscreen-button");
  const filmFrame = document.querySelector(".film-frame");
  const exitButton = document.querySelector(".film-exit-button");

  const HIDE_BUTTON_AFTER = 1500; // milliseconds the "Pause" button stays on a playing film
  let hideButtonTimer = null;

  function filmIsPlaying() {
    return !filmVideo.paused;
  }

  function toggleFilm() {
    if (filmIsPlaying()) filmVideo.pause();
    else filmVideo.play();
  }

  // Keeps the word and the color in step with the film
  function updateFilmState() {
    const word = filmIsPlaying() ? "Pause" : "Play";
    projectFilm.classList.toggle("is-playing", filmIsPlaying());
    projectFilm.setAttribute("aria-label", word + " the film");
    filmButton.textContent = word;

    // The button shows, and while the film plays it fades away after a moment
    projectFilm.classList.remove("is-button-hidden");
    clearTimeout(hideButtonTimer);
    if (filmIsPlaying()) {
      hideButtonTimer = setTimeout(function () {
        projectFilm.classList.add("is-button-hidden");
      }, HIDE_BUTTON_AFTER);
    }

    if (projectFilm.matches(":hover, :focus-visible")) {
      siteCursor.showLabel(word);
      siteCursor.setPlaying(filmIsPlaying());
    }
  }

  projectFilm.addEventListener("click", function () {
    if (filmFrame.classList.contains("is-full")) return; // in full screen the browser's controls play and pause
    toggleFilm();
  });
  projectFilm.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleFilm();
    }
  });

  filmVideo.addEventListener("play", updateFilmState);
  filmVideo.addEventListener("pause", updateFilmState);

  projectFilm.addEventListener("pointerenter", function () {
    siteCursor.showLabel(filmIsPlaying() ? "Pause" : "Play");
    siteCursor.setPlaying(filmIsPlaying());
  });
  projectFilm.addEventListener("pointerleave", function () { siteCursor.hideLabel(); });

  projectFilm.addEventListener("focus", function () {
    if (!projectFilm.matches(":focus-visible")) return;
    siteCursor.moveTo(projectFilm);
    siteCursor.showLabel(filmIsPlaying() ? "Pause" : "Play");
    siteCursor.setPlaying(filmIsPlaying());
  });
  projectFilm.addEventListener("blur", siteCursor.leave);

  // ----- Full screen -----
  // The whole frame goes full screen (not only the video), so the "Close" button can be shown on top of the film
  const HIDE_EXIT_AFTER = 2000; // milliseconds without moving the mouse before "Close" fades, while the film plays
  let hideExitTimer = null;

  function openFullScreen() {
    if (filmFrame.requestFullscreen) {
      filmFrame.requestFullscreen().catch(function () {}); // if the browser refuses, the film simply plays on the page
    } else if (filmVideo.webkitEnterFullscreen) {
      filmVideo.webkitEnterFullscreen(); // iPhone: its own player
    }
    if (!filmIsPlaying()) filmVideo.play();
  }

  function closeFullScreen() {
    if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
  }

  // "Close" shows, and while the film plays it fades away after a moment without moving the mouse
  function showExitButton() {
    filmFrame.classList.remove("is-resting");
    clearTimeout(hideExitTimer);
    if (filmIsPlaying()) {
      hideExitTimer = setTimeout(function () { filmFrame.classList.add("is-resting"); }, HIDE_EXIT_AFTER);
    }
  }

  // In full screen the film gets the browser's controls and the "Close" button; back on the page it doesn't
  function onFullScreenChange() {
    const isFull = document.fullscreenElement === filmFrame;
    filmFrame.classList.toggle("is-full", isFull);
    filmVideo.controls = isFull;
    if (isFull) showExitButton();
    else { clearTimeout(hideExitTimer); filmFrame.classList.remove("is-resting"); }
  }

  // The browser's own full-screen button is left out: "Close" and Esc take its place
  filmVideo.setAttribute("controlslist", "nofullscreen");
  fullScreenButton.addEventListener("click", openFullScreen);
  exitButton.addEventListener("click", closeFullScreen);
  document.addEventListener("fullscreenchange", onFullScreenChange);
  filmFrame.addEventListener("pointermove", function () { if (filmFrame.classList.contains("is-full")) showExitButton(); });
  filmVideo.addEventListener("play", function () { if (filmFrame.classList.contains("is-full")) showExitButton(); });
  filmVideo.addEventListener("pause", function () { if (filmFrame.classList.contains("is-full")) showExitButton(); });
  filmVideo.addEventListener("webkitendfullscreen", function () { filmVideo.controls = false; }); // iPhone
}

// ----- Opening the page: the title rises, then the film rises out of a mask (styles.css) -----
// The page waits, hidden, until the loading screen is gone and the cream columns of the
// page change have gone all the way down (so the entrance isn't hidden behind them).
// People who turned off animations see it at once.
const projectPage = document.querySelector(".project");
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  projectPage.classList.add("is-waiting");
  const waitToOpen = setInterval(function () {
    const root = document.documentElement.classList;
    if (root.contains("is-loading") || root.contains("is-arriving") || root.contains("is-transitioning")) return;
    clearInterval(waitToOpen);
    // Two frames later: the hidden start has surely been drawn, so the browser animates from it
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { projectPage.classList.remove("is-waiting"); });
    });
  }, 50);
}

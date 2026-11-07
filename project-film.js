// The film at the top of a project page.
// Clicking it plays or pauses it. With a mouse, the cursor shows "Play" (a cream rounded button),
// and "Pause" (pink and wider) while the film plays. On touch screens the button sits on the film:
// while the film plays it fades away after a moment, so it doesn't cover the film.
// Keyboard focus shows the same word as the mouse.
// The "Full Screen" button opens the film full screen, with the browser's own controls.

const projectFilm = document.querySelector(".project-film");
const filmVideo = projectFilm.querySelector("video");
const filmButton = projectFilm.querySelector(".film-play-button");
const fullScreenButton = document.querySelector(".film-fullscreen-button");

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

projectFilm.addEventListener("click", toggleFilm);
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
function openFullScreen() {
  if (filmVideo.requestFullscreen) {
    filmVideo.requestFullscreen().catch(function () {}); // if the browser refuses, the film simply plays on the page
  } else if (filmVideo.webkitEnterFullscreen) {
    filmVideo.webkitEnterFullscreen(); // iPhone
  }
  if (!filmIsPlaying()) filmVideo.play();
}

// In full screen the film gets the browser's controls (pause, sound, time); back on the page it doesn't
function onFullScreenChange() {
  filmVideo.controls = document.fullscreenElement === filmVideo;
}

fullScreenButton.addEventListener("click", openFullScreen);
document.addEventListener("fullscreenchange", onFullScreenChange);
filmVideo.addEventListener("webkitendfullscreen", function () { filmVideo.controls = false; }); // iPhone

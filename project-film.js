// The film at the top of a project page.
// Clicking it plays or pauses it. With a mouse, the cursor shows "Play" (a cream rounded button),
// and "Pause" (pink and wider) while the film plays. On touch screens the button sits on the film.

const projectFilm = document.querySelector(".project-film");
const filmVideo = projectFilm.querySelector("video");
const filmButton = projectFilm.querySelector(".film-play-button");

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
  if (projectFilm.matches(":hover")) {
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

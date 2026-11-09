// The projects page: when the mouse is on a work's name, a short film of that work
// fades in behind the names and fills the screen. The name turns black (Title Sequence turns blue).
// Phones and tablets have no mouse, so there the films play by themselves, one after another,
// and the name of the film that is playing changes color. One tap on a name opens the project.

const works = document.querySelector(".works");
const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const projectsReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FADE_TIME = 800; // the same as --speed-reveal
const LOOP_TIME = 4000; // touch screens: how long each film plays before the next one, in milliseconds

let activeWork = null;
let currentFilm = null;
let topLayer = 1; // the newest film is always on top of the one before

function showWork(work) {
  if (activeWork === work) return;
  if (activeWork) activeWork.classList.remove("is-active");
  activeWork = work;
  work.classList.add("is-active");
  works.classList.add("has-active");

  const film = document.getElementById("film-" + work.dataset.film);
  topLayer += 1;
  film.style.zIndex = topLayer;
  film.currentTime = 0;
  if (!projectsReduceMotion) film.play().catch(function () {});
  film.classList.add("is-showing");

  // Films underneath stop once the new one has faded in over them,
  // unless another work was chosen in the meantime
  currentFilm = film;
  document.querySelectorAll(".film-preview").forEach(function (other) {
    if (other === film) return;
    setTimeout(function () {
      if (currentFilm === film) {
        other.classList.remove("is-showing");
        other.pause();
      }
    }, FADE_TIME);
  });
}

function hideWork() {
  if (!activeWork) return;
  activeWork.classList.remove("is-active");
  activeWork = null;
  currentFilm = null;
  works.classList.remove("has-active");
  document.querySelectorAll(".film-preview").forEach(function (film) {
    film.classList.remove("is-showing");
    setTimeout(function () {
      if (!film.classList.contains("is-showing")) film.pause();
    }, FADE_TIME);
  });
}

document.querySelectorAll(".work").forEach(function (work) {
  work.addEventListener("pointerenter", function (event) {
    if (event.pointerType === "mouse") showWork(work);
  });
  work.addEventListener("pointerleave", function (event) {
    if (event.pointerType === "mouse") hideWork();
  });
  // Keyboard only: a tap on some phones also focuses the link, and that must not count as the first tap
  work.addEventListener("focus", function () {
    if (work.matches(":focus-visible")) showWork(work);
  });
  work.addEventListener("blur", hideWork);

  // Works without a page yet don't go anywhere
  work.addEventListener("click", function (event) {
    if (work.getAttribute("href") === "#") event.preventDefault();
  });
});

// Touch screens: the films take turns by themselves
if (!hasMouse) {
  const allWorks = document.querySelectorAll(".work");
  let loopIndex = 0;
  function playNextInLoop() {
    showWork(allWorks[loopIndex]);
    loopIndex = (loopIndex + 1) % allWorks.length;
  }
  playNextInLoop();
  setInterval(playNextInLoop, LOOP_TIME);
}


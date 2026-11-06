// The projects page: when the mouse is on a work's name, a short film of that work
// fades in behind the names and fills the screen. The name turns black (Title Sequence turns blue).
// On a phone or tablet, the first tap plays the film and shows a "Go To" button;
// tapping the same name again (or the button) opens the project.

const works = document.querySelector(".works");
const goToButton = document.querySelector(".go-to-button");
const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const projectsReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FADE_TIME = 800; // the same as --speed-reveal

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

  if (!hasMouse) {
    goToButton.href = work.href;
    goToButton.classList.add("is-showing");
  }
}

function hideWork() {
  if (!activeWork) return;
  activeWork.classList.remove("is-active");
  activeWork = null;
  currentFilm = null;
  works.classList.remove("has-active");
  goToButton.classList.remove("is-showing");
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

  work.addEventListener("click", function (event) {
    const hasPage = work.getAttribute("href") !== "#";
    // On a touch screen, the first tap plays the film; a second tap on the same name opens the project
    if (!hasMouse) {
      if (activeWork === work && hasPage) return; // let the link open the project page
      event.preventDefault();
      showWork(work);
      return;
    }
    // Works without a page yet don't go anywhere
    if (!hasPage) event.preventDefault();
  });
});

// Touch screens: tapping anywhere else closes the film
document.addEventListener("click", function (event) {
  if (hasMouse) return;
  if (!event.target.closest(".work") && !event.target.closest(".go-to-button")) hideWork();
});

// The Go To button: works without a page yet don't go anywhere
goToButton.addEventListener("click", function (event) {
  if (goToButton.getAttribute("href") === "#") event.preventDefault();
});

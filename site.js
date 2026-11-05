// Shared by every page:
// 1. The loading screen: "loading..." on the first page of a visit.
// 2. The custom cursor: a small dot that grows on buttons and becomes a word on films and works.

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Puts every letter of a word in its own span, so the letters can move one after another
function makeLetters(word, className) {
  return Array.from(word).map(function (character, index) {
    return '<span class="' + className + '" style="--letter: ' + index + '">' + character + "</span>";
  }).join("");
}

// ----- 1. Loading screen -----
const LOADING_TIME = 2400; // the shortest time it stays on screen, in milliseconds
const loader = document.querySelector(".loader");
const pageRoot = document.documentElement;

loader.querySelector(".loader-button").innerHTML = makeLetters("loading...", "loader-letter");

function finishLoading() {
  loader.classList.add("is-done");
  pageRoot.classList.remove("is-loading"); // the page's own entrance starts now
  try {
    sessionStorage.setItem("seen-loader", "yes");
  } catch (error) {
    // Without storage the loading screen simply shows again next time
  }
}

if (pageRoot.classList.contains("no-loader") || reduceMotion) {
  finishLoading();
} else {
  // Hides after the page has loaded and the shortest time has passed
  const pageLoaded = new Promise(function (resolve) {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", resolve);
  });
  const shortestTime = new Promise(function (resolve) { setTimeout(resolve, LOADING_TIME); });
  Promise.all([pageLoaded, shortestTime]).then(finishLoading);
}

// ----- 2. Custom cursor -----
const cursor = document.querySelector(".site-cursor");
const cursorLabel = cursor.querySelector(".cursor-label");
const CURSOR_GLIDE = 55; // milliseconds; smaller = follows the mouse more tightly
let targetX = 0, targetY = 0, cursorX = 0, cursorY = 0, cursorStarted = false;
let press = 1, pressTarget = 1;

// Other scripts use these to change the cursor
const siteCursor = {
  // Shows a word in a rounded button, like "Play" or "Go To"
  showLabel: function (word, extraClass) {
    cursor.classList.remove("is-grow", "is-go-to", "is-playing");
    cursor.classList.add("has-label");
    if (extraClass) cursor.classList.add(extraClass);
    cursorLabel.innerHTML = makeLetters(word, "cursor-letter"); // new letters flip as they appear
  },
  hideLabel: function () {
    cursor.classList.remove("has-label", "is-go-to", "is-playing");
  },
  setPlaying: function (isPlaying) {
    cursor.classList.toggle("is-playing", isPlaying);
  }
};

document.addEventListener("pointermove", function (event) {
  if (event.pointerType !== "mouse") return;
  targetX = event.clientX;
  targetY = event.clientY;
  if (!cursorStarted) {
    cursorX = targetX;
    cursorY = targetY;
    cursorStarted = true;
  }
  cursor.classList.add("is-visible");
});

// Hide it when the mouse leaves the page
document.documentElement.addEventListener("mouseleave", function () {
  cursor.classList.remove("is-visible");
});

// It gets a little smaller while the mouse button is down
document.addEventListener("pointerdown", function () { pressTarget = 0.85; });
document.addEventListener("pointerup", function () { pressTarget = 1; });

// On menu buttons and other links it grows
document.querySelectorAll('.nav-logo, .nav-button, [data-cursor="grow"]').forEach(function (target) {
  target.addEventListener("pointerenter", function () { cursor.classList.add("is-grow"); });
  target.addEventListener("pointerleave", function () { cursor.classList.remove("is-grow"); });
});

// On some things it becomes a word, written in data-cursor-label:
// "Go To" on works (its words move to the right), "Watch It" on the showreel
document.querySelectorAll("[data-cursor-label]").forEach(function (target) {
  const word = target.dataset.cursorLabel;
  if (target.classList.contains("project-film")) return; // the film changes its own word (project-film.js)
  target.addEventListener("pointerenter", function () {
    siteCursor.showLabel(word, word === "Go To" ? "is-go-to" : null);
  });
  target.addEventListener("pointerleave", function () { siteCursor.hideLabel(); });
});

// The cursor glides after the mouse: fast at first, then it settles.
// The time between frames is counted, so the speed is the same on every screen.
function glide(current, target, milliseconds, glideTime) {
  return current + (target - current) * (1 - Math.exp(-milliseconds / glideTime));
}

let lastCursorFrame = performance.now();
function moveCursor(now) {
  const milliseconds = Math.min(now - lastCursorFrame, 100);
  lastCursorFrame = now;
  cursorX = glide(cursorX, targetX, milliseconds, CURSOR_GLIDE);
  cursorY = glide(cursorY, targetY, milliseconds, CURSOR_GLIDE);
  press = glide(press, pressTarget, milliseconds, CURSOR_GLIDE);
  cursor.style.transform =
    "translate3d(" + cursorX.toFixed(2) + "px, " + cursorY.toFixed(2) + "px, 0) translate(-50%, -50%) scale(" + press.toFixed(3) + ")";
  requestAnimationFrame(moveCursor);
}

if (!reduceMotion) requestAnimationFrame(moveCursor);

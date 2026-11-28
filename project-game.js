// The game on the Virtual Wandering page, in place of the film.
// The game's files are in game/ (they are big). Until Play is clicked the frame shows a picture,
// so the page stays quick. Play puts the game in the frame. On phones and tablets it says "Play on a computer".
// The game fills the frame, on the page and in full screen.

const projectGame = document.querySelector(".project-game");
const gameFrame = document.querySelector(".game-frame");
const gameWindow = projectGame.querySelector(".game-window");
const gameFullScreenButton = gameFrame.querySelector(".film-fullscreen-button");
const gameExitButton = gameFrame.querySelector(".film-exit-button");

let gameStarted = false;

// Phones and tablets: Unity games hardly run there, so the picture stays with "Play on a computer"
const isTouchScreen = !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
if (isTouchScreen) {
  gameFrame.classList.add("is-computer-only");
  projectGame.removeAttribute("role");
  projectGame.removeAttribute("tabindex");
  projectGame.setAttribute("aria-label", "The game plays on a computer");
  projectGame.querySelector(".film-play-button").textContent = "Play on a computer";
}

// ----- Play: the game comes into the frame -----
function startGame() {
  if (gameStarted || isTouchScreen) return;
  gameStarted = true;

  // A computer that can't draw 3D in the browser: straight to the invitation to itch.io
  if (!document.createElement("canvas").getContext("webgl2")) {
    showGameFallback();
    return;
  }

  const game = document.createElement("iframe");
  game.src = projectGame.dataset.gameSrc;
  game.title = "Shells to Collect, the game";
  game.allow = "autoplay; fullscreen; gamepad";
  gameWindow.appendChild(game);

  // From now on the frame is the game, not a button
  projectGame.classList.add("is-started");
  projectGame.removeAttribute("role");
  projectGame.removeAttribute("tabindex");
  projectGame.removeAttribute("aria-label");
  siteCursor.leave();

  // Inside the game the computer's own cursor shows, so ours steps aside
  game.addEventListener("pointerenter", siteCursor.leave);
  game.addEventListener("load", function () { game.focus(); }); // the keyboard goes straight to the game
}

// ----- When the game can't open: "Play on itch.io" -----
// The game is gone from the frame, and the picture comes back, darker, with the invitation on it.
function showGameFallback() {
  const game = gameWindow.querySelector("iframe");
  if (game) game.remove();
  projectGame.classList.add("is-fallback");
  if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
}

// The game's page says it couldn't open (game/index.html)
window.addEventListener("message", function (event) {
  if (gameStarted && event.data === "game-failed") showGameFallback();
});

projectGame.addEventListener("click", function (event) {
  if (event.target.closest(".game-fallback-link")) return; // the link opens itch.io
  startGame();
});
projectGame.addEventListener("keydown", function (event) {
  if (gameStarted) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    startGame();
  }
});

// The "Play" word on the cursor, as on the films
projectGame.addEventListener("pointerenter", function () { if (!gameStarted) siteCursor.showLabel("Play"); });
projectGame.addEventListener("pointerleave", function () { siteCursor.hideLabel(); });
projectGame.addEventListener("focus", function () {
  if (gameStarted || !projectGame.matches(":focus-visible")) return;
  siteCursor.moveTo(projectGame);
  siteCursor.showLabel("Play");
});
projectGame.addEventListener("blur", siteCursor.leave);

// ----- Full screen, with the "Close / Esc" button -----
// In a game the mouse is busy inside it, so "Close" stays on screen the whole time.
gameFullScreenButton.addEventListener("click", function () {
  startGame();
  if (gameFrame.requestFullscreen) gameFrame.requestFullscreen().catch(function () {});
});
gameExitButton.addEventListener("click", function () {
  if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
});
document.addEventListener("fullscreenchange", function () {
  gameFrame.classList.toggle("is-full", document.fullscreenElement === gameFrame);
});

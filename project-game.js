// The game on the Virtual Wandering page, in place of the film.
// Before Play: a picture of the game with how to move (arrows to walk, the mouse to look, Esc to leave)
// and a Play button in the middle. The game's files are big, so they load only after Play.
// Play opens the frame full screen and starts the game there. Leaving full screen (Esc, or "Close")
// ends the game and brings the picture back.
// On phones and tablets the game hardly runs, so Play says "Play on a computer".
// If the game can't open, the picture comes back with an invitation to play it on itch.io.

const projectGame = document.querySelector(".project-game");
const gameFrame = document.querySelector(".game-frame");
const gameWindow = projectGame.querySelector(".game-window");
const gamePlayButton = projectGame.querySelector(".game-play-button");
const gameExitButton = gameFrame.querySelector(".film-exit-button");

let gameStarted = false;

// ----- Phones and tablets: "Play on a computer" -----
const isTouchScreen = !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
if (isTouchScreen) {
  gameFrame.classList.add("is-computer-only");
  gamePlayButton.textContent = "Play on a computer";
  gamePlayButton.disabled = true;
}

// ----- Play: full screen, and the game comes into the frame -----
function startGame() {
  if (gameStarted || isTouchScreen) return;

  // A computer that can't draw 3D in the browser: straight to the invitation to itch.io
  if (!document.createElement("canvas").getContext("webgl2")) {
    showGameFallback();
    return;
  }

  gameStarted = true;
  // Full screen first (the browser allows it only right after the click)
  if (gameFrame.requestFullscreen) gameFrame.requestFullscreen().catch(function () {});

  const game = document.createElement("iframe");
  game.src = projectGame.dataset.gameSrc;
  game.title = "Shells to Collect, the game";
  game.allow = "autoplay; fullscreen; gamepad";
  gameWindow.appendChild(game);
  projectGame.classList.add("is-started");
  siteCursor.leave();

  // Inside the game the computer's own cursor shows, so ours steps aside
  game.addEventListener("pointerenter", siteCursor.leave);
  game.addEventListener("load", function () { game.focus(); }); // the keyboard goes straight to the game
}

// ----- The end: the game is gone and the picture with "how to wander" is back -----
function endGame() {
  const game = gameWindow.querySelector("iframe");
  if (game) game.remove();
  gameStarted = false;
  projectGame.classList.remove("is-started");
}

function leaveFullScreen() {
  if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
}

gamePlayButton.addEventListener("click", startGame);
gameExitButton.addEventListener("click", leaveFullScreen);

// Leaving full screen in any way (Esc, "Close") ends the game
document.addEventListener("fullscreenchange", function () {
  const isFull = document.fullscreenElement === gameFrame;
  gameFrame.classList.toggle("is-full", isFull);
  if (!isFull && gameStarted) endGame();
});

// ----- When the game can't open: "Play on itch.io" -----
function showGameFallback() {
  endGame();
  projectGame.classList.add("is-fallback");
  leaveFullScreen();
}

// The game's page says it couldn't open (game/index.html)
window.addEventListener("message", function (event) {
  if (gameStarted && event.data === "game-failed") showGameFallback();
});

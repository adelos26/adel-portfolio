// The red character on the home page:
// - its pupils follow the mouse (computer) or the finger (phone/tablet)
// - it blinks when its eyes are clicked, and by itself every few seconds
// - it is surprised (the pupils grow) while the mouse is on a menu button
// - after 6 seconds without movement it falls asleep: the eyes close, it breathes, and z's float up

const character = document.querySelector(".character");
const eyePair = character.querySelector(".eye-pair");
const characterReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const SLEEP_AFTER = 6000; // milliseconds without movement

// ----- Drawing the eyes -----
// Each eye has its own outline, because the outline itself changes as the eye closes.
let eyeCount = 0;
function makeEye() {
  eyeCount += 1;
  const clipId = "eye-clip-" + eyeCount;
  return `
  <svg class="eye" viewBox="0 0 127 69" aria-hidden="true">
    <defs><clipPath id="${clipId}"><path class="eye-clip-shape"></path></clipPath></defs>
    <path class="eye-white"></path>
    <g clip-path="url(#${clipId})">
      <g class="iris">
        <circle class="eye-iris" cx="63" cy="34" r="30"></circle>
        <g class="pupil">
          <path d="M77 34C77 37.5252 75.6701 40.9206 73.276 43.5081C70.8818 46.0956 67.5997 47.6847 64.0851 47.9579C60.5705 48.2311 57.0822 47.1684 54.3169 44.982C51.5516 42.7956 49.713 39.6464 49.1682 36.1636C48.6234 32.6807 49.4126 29.1206 51.3781 26.1942C53.3436 23.2678 56.3408 21.1906 59.7709 20.3775C63.2011 19.5644 66.8117 20.0753 69.8816 21.8081C72.9515 23.5409 75.2548 26.368 76.3313 29.7248L63 34H77Z" fill="black"></path>
          <path d="M77 34C77 32.4366 76.7381 30.8843 76.2253 29.4074L63 34H77Z" fill="white"></path>
        </g>
      </g>
    </g>
    <path class="eye-line"></path>
  </svg>`;
}

eyePair.innerHTML = makeEye() + makeEye();
const eyes = eyePair.querySelectorAll(".eye");
const irises = eyePair.querySelectorAll(".iris");

// Three small z's for when the character sleeps
const snore = document.createElement("div");
snore.className = "snore";
snore.innerHTML = '<i style="--letter: 0">z</i><i style="--letter: 1">z</i><i style="--letter: 2">z</i>';
character.appendChild(snore);

// The top curve of the eye when it is open, and the bottom curve it bends down to when it is closed
const TOP_CURVE = [[18.1569, 18.8844], [47.518, -6.3702], [79.876, -6.29186], [109.213, 19.1031]];
const BOTTOM_CURVE = [[18.1583, 50.1156], [47.518, 75.3702], [79.8775, 75.2919], [109.214, 49.8969]];
const LINE_THICKNESS = 2.4; // the middle of the closed-eye line, in the eye's own units (the eye is 127 wide)

// Draws the eyes at one amount of openness: 1 = fully open, 0 = closed.
// The top curve bends down until it meets the bottom curve, so the eye becomes a crescent, then a line.
function drawOpenness(openness) {
  const points = TOP_CURVE.map(function (point, index) {
    const y = BOTTOM_CURVE[index][1] + (point[1] - BOTTOM_CURVE[index][1]) * openness;
    return [point[0], y];
  });
  const asText = function (point) { return point[0].toFixed(2) + " " + point[1].toFixed(2); };
  const topCurve = "L" + asText(points[0]) + "C" + asText(points[1]) + " " + asText(points[2]) + " " + asText(points[3]) + "L127 34.5";
  const outline = "M127 34.5L109.214 49.8969C79.8775 75.2919 47.518 75.3702 18.1583 50.1156L0 34.5" + topCurve + "Z";

  // The dark red line grows only near the end of the closing, with no fade.
  // It is thin at both ends and a little thicker in the middle.
  const lineWidth = Math.max(0, (0.4 - openness) / 0.4) * LINE_THICKNESS;
  const lowered = points.map(function (point, index) {
    const amount = index === 0 || index === 3 ? 0.5 : 1;
    return [point[0], point[1] + lineWidth * amount];
  });
  const line = "M0 34.5" + topCurve + "L" + asText(lowered[3]) + "C" + asText(lowered[2]) + " " + asText(lowered[1]) + " " + asText(lowered[0]) + "Z";

  eyes.forEach(function (eye) {
    eye.querySelector(".eye-white").setAttribute("d", outline);
    eye.querySelector(".eye-clip-shape").setAttribute("d", outline);
    eye.querySelector(".eye-line").setAttribute("d", line);
  });
}
drawOpenness(1);

// ----- Opening and closing -----
// A list of moves: each one takes the eyes to an amount of openness in some time.
let openness = 1;
let moves = [];
let moveFrom = 1, moveStart = 0;

function moveEyes(newMoves) {
  moves = newMoves;
  moveFrom = openness;
  moveStart = performance.now();
}

// Starts and ends softly
function easeInOut(progress) {
  return progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
}

function updateOpenness(now) {
  if (moves.length === 0) return;
  const move = moves[0];
  const progress = Math.min((now - moveStart) / move.time, 1);
  openness = moveFrom + (move.to - moveFrom) * easeInOut(progress);
  drawOpenness(openness);
  if (progress === 1) {
    moves.shift();
    moveFrom = openness;
    moveStart = now;
  }
}

// A blink: closes quickly, opens a little slower
function blink() {
  if (characterReduceMotion || character.classList.contains("is-asleep")) return;
  moveEyes([{ to: 0, time: 110 }, { to: 1, time: 170 }]);
}
eyes.forEach(function (eye) { eye.addEventListener("click", blink); });

// It also blinks by itself every few seconds (not while it is still coming in)
let introRunning = !characterReduceMotion;
function blinkLater() {
  setTimeout(function () {
    if (!introRunning) blink();
    blinkLater();
  }, 2500 + Math.random() * 3500);
}
if (!characterReduceMotion) blinkLater();

// ----- Following the mouse -----
const LOOK_SIDEWAYS = 24; // how far the pupils can move, in the eye's own units (the eye is 127 wide)
const LOOK_UP_DOWN = 14;
let lookX = 0, lookY = 0, lookTargetX = 0, lookTargetY = 0;

// Both pupils move together, sideways more than up and down.
// The eyes are measured each time, because the character moves (it rises in, and breathes while asleep).
function lookAt(x, y) {
  const area = eyePair.getBoundingClientRect();
  const dx = x - (area.left + area.width / 2);
  const dy = y - (area.top + area.height / 2);
  const angle = Math.atan2(dy, dx);
  const strength = Math.min(Math.hypot(dx, dy) / (area.width / 2), 1);
  lastMouse = [x, y];
  if (introRunning) return; // while coming in, it looks where it wants
  lookTargetX = Math.cos(angle) * strength * LOOK_SIDEWAYS;
  lookTargetY = Math.sin(angle) * strength * LOOK_UP_DOWN;
  if (characterReduceMotion) drawLook(lookTargetX, lookTargetY);
}
let lastMouse = null;

// ----- Coming in -----
// It comes in from the edge with its eyes closed (the slide is in styles.css).
// Once it has arrived it opens its eyes, blinks twice, looks at the sentence, then at the mouse.
const INTRO_LOOK_TIME = 900; // how long it looks at the sentence, in milliseconds

function lookAtSentence() {
  const sentence = document.querySelector(".statement").getBoundingClientRect();
  const area = eyePair.getBoundingClientRect();
  const angle = Math.atan2(
    sentence.top + sentence.height / 2 - (area.top + area.height / 2),
    sentence.left + sentence.width / 2 - (area.left + area.width / 2)
  );
  lookTargetX = Math.cos(angle) * LOOK_SIDEWAYS;
  lookTargetY = Math.sin(angle) * LOOK_UP_DOWN;
}

function finishIntro() {
  introRunning = false;
  if (lastMouse) lookAt(lastMouse[0], lastMouse[1]);
  else { lookTargetX = 0; lookTargetY = 0; }
}

function startIntro() {
  if (introStarted) return;
  introStarted = true;
  moveEyes([
      { to: 1, time: 450 },   // opens its eyes
      { to: 1, time: 250 },   // a short pause
      { to: 0, time: 110 }, { to: 1, time: 170 }, // blink
      { to: 1, time: 120 },
      { to: 0, time: 110 }, { to: 1, time: 170 }  // blink again
  ]);
  setTimeout(lookAtSentence, 1400);
  setTimeout(finishIntro, 1400 + INTRO_LOOK_TIME);
}
let introStarted = false;

// It comes in only the first time the site is opened in a visit.
// After that (and after it has come in once) "has-entered" stops the slide from playing again,
// for example when it wakes up from sleeping.
let hasEnteredBefore = false;
try {
  hasEnteredBefore = sessionStorage.getItem("character-entered") === "yes";
} catch (error) {
  hasEnteredBefore = false;
}

if (characterReduceMotion || hasEnteredBefore) {
  character.classList.add("has-entered");
  introRunning = false;
} else {
  openness = 0;
  drawOpenness(0);
  // Starts when the slide in has ended
  character.addEventListener("animationend", function (event) {
    if (event.animationName !== "character-enter") return;
    character.classList.add("has-entered");
    try {
      sessionStorage.setItem("character-entered", "yes");
    } catch (error) {
      // Without storage it simply comes in again next time
    }
    startIntro();
  });
}

function drawLook(x, y) {
  irises.forEach(function (iris) {
    iris.setAttribute("transform", "translate(" + x.toFixed(2) + " " + y.toFixed(2) + ")");
  });
}

// ----- Sleeping and waking -----
let sleepTimer;

function fallAsleep() {
  character.style.transform = "";
  character.style.transition = "";
  character.classList.add("is-asleep");
  moveEyes([{ to: 0, time: 1000 }]);
  lookTargetX = 0;
  lookTargetY = 0;
}

// Any movement wakes it and starts the sleep timer again.
// It settles from wherever the breath stopped, so waking up has no jump.
function wake() {
  if (character.classList.contains("is-asleep")) {
    const breathNow = getComputedStyle(character).transform;
    character.classList.remove("is-asleep");
    moveEyes([{ to: 1, time: 450 }]);
    character.style.transition = "none";
    character.style.transform = breathNow === "none" ? "" : breathNow;
    void character.offsetWidth; // applies the line above before the next one
    character.style.transition = "transform var(--speed-reveal) var(--ease-main)";
    character.style.transform = "scale(1)";
  }
  clearTimeout(sleepTimer);
  if (!characterReduceMotion) sleepTimer = setTimeout(fallAsleep, SLEEP_AFTER);
}
wake();

document.addEventListener("pointermove", function (event) { wake(); lookAt(event.clientX, event.clientY); });
document.addEventListener("pointerdown", function (event) { wake(); lookAt(event.clientX, event.clientY); });

// Surprised while the mouse is on a menu button
document.querySelectorAll(".nav-logo, .nav-button").forEach(function (button) {
  button.addEventListener("pointerenter", function () { character.classList.add("is-surprised"); });
  button.addEventListener("pointerleave", function () { character.classList.remove("is-surprised"); });
});

// ----- One loop for the movement, once per screen refresh -----
const EYES_GLIDE = 120; // milliseconds; the eyes are a little lazier than the cursor
let lastEyesFrame = performance.now();

function animateCharacter(now) {
  const milliseconds = Math.min(now - lastEyesFrame, 100);
  lastEyesFrame = now;
  lookX += (lookTargetX - lookX) * (1 - Math.exp(-milliseconds / EYES_GLIDE));
  lookY += (lookTargetY - lookY) * (1 - Math.exp(-milliseconds / EYES_GLIDE));
  updateOpenness(now);
  // The pupils sink a little as the eye closes, like a real eye
  drawLook(lookX, lookY + (1 - openness) * 8);
  requestAnimationFrame(animateCharacter);
}

if (!characterReduceMotion) requestAnimationFrame(animateCharacter);

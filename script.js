// Makes the pupils look toward the mouse (computer) or the finger (phone/tablet),
// makes the eyes blink when clicked, and moves the custom mouse cursor.

const pupils = document.querySelectorAll(".eye-pupil");
const eyes = document.querySelectorAll(".eye");

// How far a pupil can move, as a part of the eye's width.
// Sideways it can move a lot; up and down only a little (the eye is narrow).
const MAX_MOVE_X = 0.24;
const MAX_MOVE_Y = 0.08;

// Moves both pupils toward the point (x, y) on the screen.
// Like real eyes, both pupils always move together: same direction, same distance.
function lookAt(x, y) {
  const eyesArea = document.querySelector(".eyes").getBoundingClientRect();
  const eyeWidth = document.querySelector(".eye").getBoundingClientRect().width;

  // The point between the two eyes
  const centerX = eyesArea.left + eyesArea.width / 2;
  const centerY = eyesArea.top + eyesArea.height / 2;

  // Direction and distance from there to the point
  const dx = x - centerX;
  const dy = y - centerY;
  const angle = Math.atan2(dy, dx);
  const distance = Math.hypot(dx, dy);

  // Close points move the pupils a little, far points move them all the way
  const strength = Math.min(distance / eyeWidth, 1);

  const moveX = Math.cos(angle) * strength * MAX_MOVE_X * eyeWidth;
  const moveY = Math.sin(angle) * strength * MAX_MOVE_Y * eyeWidth;

  pupils.forEach(function (pupil) {
    pupil.style.setProperty("--look-x", moveX + "px");
    pupil.style.setProperty("--look-y", moveY + "px");
  });
}

// Puts every pupil back in the middle
function lookStraight() {
  pupils.forEach(function (pupil) {
    pupil.style.setProperty("--look-x", "0px");
    pupil.style.setProperty("--look-y", "0px");
  });
}

// Computer: follow the mouse
document.addEventListener("pointermove", function (event) {
  lookAt(event.clientX, event.clientY);
});

// Phone/tablet: look where the screen was tapped
document.addEventListener("pointerdown", function (event) {
  lookAt(event.clientX, event.clientY);
});

// Computer: when the mouse leaves the page, look straight again
document.addEventListener("mouseout", function (event) {
  if (event.relatedTarget === null) {
    lookStraight();
  }
});

// ----- Blinking (when an eye is clicked) -----

// How long one blink takes, in milliseconds
const BLINK_DURATION = 250;

// People who turned off animations in their device settings won't see blinking
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Both eyes close and open together.
// Only the white part closes; the pupil keeps its size and is hidden behind the "eyelid".
function blink() {
  if (reduceMotion) return;

  const timing = { duration: BLINK_DURATION, easing: "ease-in-out" };

  eyes.forEach(function (eye) {
    // The white shape gets flat, then opens again
    eye.querySelector(".eye-shape").animate(
      [
        { transform: "scaleY(1)" },    // open
        { transform: "scaleY(0.02)" }, // closed
        { transform: "scaleY(1)" }     // open again
      ],
      timing
    );

    // The "window" that shows the pupil closes the same way,
    // so the pupil is covered without being squashed
    eye.querySelector(".eye-inside").animate(
      [
        { maskSize: "100% 100%", webkitMaskSize: "100% 100%" },
        { maskSize: "100% 2%", webkitMaskSize: "100% 2%" },
        { maskSize: "100% 100%", webkitMaskSize: "100% 100%" }
      ],
      timing
    );
  });
}

// Clicking (or tapping) an eye makes the eyes blink
eyes.forEach(function (eye) {
  eye.addEventListener("click", blink);
});

// ----- Custom mouse cursor (from Figma) -----

const cursor = document.querySelector(".custom-cursor");

// The cursor image follows the mouse
document.addEventListener("pointermove", function (event) {
  if (event.pointerType !== "mouse") return;
  cursor.style.setProperty("--cursor-x", event.clientX + "px");
  cursor.style.setProperty("--cursor-y", event.clientY + "px");
  cursor.classList.add("is-visible");
});

// Hide it when the mouse leaves the page
document.addEventListener("mouseout", function (event) {
  if (event.relatedTarget === null) {
    cursor.classList.remove("is-visible");
  }
});

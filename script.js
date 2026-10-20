// Makes the pupils look toward the mouse (computer) or the finger (phone/tablet).

const pupils = document.querySelectorAll(".eye-pupil");

// How far a pupil can move, as a part of the eye's width.
// Sideways it can move a lot; up and down only a little (the eye is narrow).
const MAX_MOVE_X = 0.24;
const MAX_MOVE_Y = 0.08;

// Moves every pupil toward the point (x, y) on the screen
function lookAt(x, y) {
  pupils.forEach(function (pupil) {
    const eye = pupil.closest(".eye").getBoundingClientRect();

    // The center of this eye
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;

    // Direction and distance from the eye to the point
    const dx = x - eyeCenterX;
    const dy = y - eyeCenterY;
    const angle = Math.atan2(dy, dx);
    const distance = Math.hypot(dx, dy);

    // Close points move the pupil a little, far points move it all the way
    const strength = Math.min(distance / eye.width, 1);

    const moveX = Math.cos(angle) * strength * MAX_MOVE_X * eye.width;
    const moveY = Math.sin(angle) * strength * MAX_MOVE_Y * eye.width;

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

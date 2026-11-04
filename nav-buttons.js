// Clicking a menu button plays the page transition: cream columns rise and cover the screen,
// the clicked button becomes the current one (round and in its own color),
// and the columns go down again.
// The Projects and Reach Out pages don't exist yet, so for now the click stays on this page.

const COLUMN_COUNT = 10;
const HOLD_TIME = 300; // how long the screen stays covered, in milliseconds

const navButtons = document.querySelectorAll(".nav-button");
const transitionReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Build the columns
const pageTransition = document.createElement("div");
pageTransition.className = "page-transition";
pageTransition.setAttribute("aria-hidden", "true");

for (let index = 0; index < COLUMN_COUNT; index++) {
  const column = document.createElement("div");
  column.className = "transition-column";
  column.style.setProperty("--column", index);
  pageTransition.appendChild(column);
}

document.body.appendChild(pageTransition);

const lastColumn = pageTransition.lastElementChild;
let isTransitionRunning = false;

// Makes one button round and colored, and the others normal
function setCurrentButton(button) {
  navButtons.forEach(function (otherButton) {
    otherButton.classList.remove("nav-button-current");
    otherButton.removeAttribute("aria-current");
  });

  button.classList.add("nav-button-current");
  button.setAttribute("aria-current", "page");
}

// Waits until the last column finishes moving, then runs the next step
function afterColumnsFinish(nextStep) {
  lastColumn.addEventListener("transitionend", nextStep, { once: true });
}

function playTransition(button) {
  isTransitionRunning = true;
  pageTransition.classList.add("is-covering"); // columns rise

  afterColumnsFinish(function () {
    setCurrentButton(button); // the screen is covered, so the change can't be seen

    setTimeout(function () {
      pageTransition.classList.remove("is-covering"); // columns go down

      afterColumnsFinish(function () {
        isTransitionRunning = false;
      });
    }, HOLD_TIME);
  });
}

navButtons.forEach(function (button) {
  button.addEventListener("click", function (event) {
    event.preventDefault();

    // Do nothing if this page is already open, or a transition is already running
    if (button.classList.contains("nav-button-current") || isTransitionRunning) {
      return;
    }

    if (transitionReduceMotion) {
      setCurrentButton(button);
    } else {
      playTransition(button);
    }
  });
});

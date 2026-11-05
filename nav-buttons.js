// Clicking a menu button plays the page transition: cream columns rise and cover the screen,
// "in a moment" rises on them in black, the clicked button becomes the current one
// (round and in its own color), and then the next page opens.
// On the new page the columns start out covering it and go down.
// Projects also works from inside a project page: it takes you back to the list of projects.

const COLUMN_COUNT = 10;
const HOLD_TIME = 300;    // how long the screen stays covered before the next page opens, in milliseconds
const ARRIVE_HOLD = 450;  // how long the new page stays covered before the columns go down

const navButtons = document.querySelectorAll(".nav-button");
// The menu, plus other links that should open their page with the same transition
const menuLinks = document.querySelectorAll(".nav-button, .nav-logo, [data-page-link]");
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

// "in a moment" in black, shown while the columns cover the screen.
// It rises out of a mask, like the sentence on the home page.
const transitionWord = document.createElement("div");
transitionWord.className = "transition-word";
transitionWord.innerHTML = '<span class="transition-mask"><span class="transition-line">in a moment</span></span>';
pageTransition.appendChild(transitionWord);

document.body.appendChild(pageTransition);

const allColumns = pageTransition.querySelectorAll(".transition-column");
const lastColumn = allColumns[allColumns.length - 1];
let isTransitionRunning = false;

// Makes one button round and colored, and the others normal
function setCurrentButton(button) {
  navButtons.forEach(function (otherButton) {
    otherButton.classList.remove("nav-button-current");
    otherButton.removeAttribute("aria-current");
  });

  if (button.classList.contains("nav-button")) {
    button.classList.add("nav-button-current");
    button.setAttribute("aria-current", "page");
  }
}

// Waits until the last column finishes moving, then runs the next step
function afterColumnsFinish(nextStep) {
  lastColumn.addEventListener("transitionend", nextStep, { once: true });
}

// True when the link leads to the page that is open now
function isThisPage(link) {
  const pageName = function (path) { return path.endsWith("/") ? path + "index.html" : path; };
  return pageName(new URL(link.href).pathname) === pageName(window.location.pathname);
}

// The columns cover the screen, then the next page opens
function goToPage(link) {
  isTransitionRunning = true;
  document.documentElement.classList.add("is-transitioning"); // hides the scrollbar, so the columns reach every edge
  pageTransition.classList.add("is-covering", "is-covered"); // columns rise, and "in a moment" rises with them

  afterColumnsFinish(function () {
    setCurrentButton(link); // the screen is covered, so the change can't be seen

    setTimeout(function () {
      // Tells the next page to start covered
      try {
        sessionStorage.setItem("arriving", "yes");
      } catch (error) {
        // Without storage the next page simply opens without the columns
      }
      window.location.href = link.href;
    }, HOLD_TIME);
  });
}

menuLinks.forEach(function (link) {
  link.addEventListener("click", function (event) {
    event.preventDefault();

    // Do nothing if this page is already open, or a transition is already running.
    // (On a project page, Projects is the current button but leads to another page, so it still works.)
    if (isThisPage(link) || isTransitionRunning) {
      return;
    }

    if (transitionReduceMotion) {
      window.location.href = link.href;
    } else {
      goToPage(link);
    }
  });
});

// Arriving from another page: the columns start out covering, then go down
let isArriving = false;
try {
  isArriving = sessionStorage.getItem("arriving") === "yes";
  sessionStorage.removeItem("arriving");
} catch (error) {
  isArriving = false;
}

if (isArriving && !transitionReduceMotion) {
  document.documentElement.classList.add("is-transitioning");
  pageTransition.classList.add("is-instant", "is-covering", "is-covered");
  void pageTransition.offsetWidth; // applies the covered state before the columns move
  pageTransition.classList.remove("is-instant");
  setTimeout(function () {
    pageTransition.classList.remove("is-covered");  // "in a moment" sinks back into its mask
    pageTransition.classList.remove("is-covering"); // columns go down
    afterColumnsFinish(function () {
      document.documentElement.classList.remove("is-transitioning");
    });
  }, ARRIVE_HOLD);
}

// Coming back with the browser's back button: the page may be restored still covered
window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    pageTransition.classList.remove("is-covering", "is-covered");
    document.documentElement.classList.remove("is-transitioning");
    isTransitionRunning = false;
  }
});

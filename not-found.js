// The 404 page: a grid of huge 4s and 0s, like a checkerboard, covers the screen.
// It stands still, then the rows jump sideways by one digit (one row right, the next left),
// stands still again, then the columns jump by one digit (one column up, the next down), and so on.
// The mouse on a digit turns it pink, orange or yellow, and the jumping waits while the mouse is on the digits.
//
// The trick: after each jump every moved digit goes back to its place at once and changes 4 <-> 0.
// On a checkerboard that looks exactly the same as where the jump ended, so the grid never runs out.
// Speeds, curves and sizes are in styles.css.

const notFoundGrid = document.querySelector(".not-found-grid");

if (notFoundGrid) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rootStyles = getComputedStyle(document.documentElement);
  const hold = parseFloat(rootStyles.getPropertyValue("--not-found-hold")) * 1000;
  const jumpTime = parseFloat(rootStyles.getPropertyValue("--speed-playful")) * 1000;
  const lineSpacing = parseFloat(rootStyles.getPropertyValue("--not-found-line"));

  let cells = [];        // cells[row][column] = the span of that digit
  let digitWidth = 0, rowHeight = 0;
  let nextJump = "rows"; // "rows" (sideways) and "columns" (up and down) take turns
  let mouseOnDigits = false;

  // ----- Build the grid: enough digits to cover the screen, plus one more on every side -----
  function build() {
    notFoundGrid.textContent = "";
    // One digit, to measure its size
    const probe = document.createElement("span");
    probe.className = "not-found-digit";
    probe.textContent = "0";
    probe.style.animation = "none";
    notFoundGrid.appendChild(probe);
    digitWidth = probe.getBoundingClientRect().width;
    rowHeight = probe.getBoundingClientRect().height * lineSpacing;
    probe.remove();

    const width = notFoundGrid.clientWidth, height = notFoundGrid.clientHeight;
    const columns = Math.ceil(width / digitWidth) + 2;
    const rows = Math.ceil(height / rowHeight) + 2;
    // Centered, with the extra digits just outside the screen
    const left = (width - columns * digitWidth) / 2;
    const top = (height - rows * rowHeight) / 2;

    cells = [];
    for (let row = 0; row < rows; row += 1) {
      const line = [];
      for (let column = 0; column < columns; column += 1) {
        const digit = document.createElement("span");
        digit.className = "not-found-digit";
        digit.textContent = (row + column) % 2 === 0 ? "4" : "0";
        digit.style.left = (left + column * digitWidth).toFixed(1) + "px";
        digit.style.top = (top + row * rowHeight - (rowHeight / lineSpacing - rowHeight) / 2).toFixed(1) + "px";
        digit.style.setProperty("--row", row - 1);
        notFoundGrid.appendChild(digit);
        line.push(digit);
      }
      cells.push(line);
    }
  }

  // ----- A jump -----
  function jump() {
    if (mouseOnDigits) return; // waits while the mouse is on the digits
    const sideways = nextJump === "rows";
    nextJump = sideways ? "columns" : "rows";

    cells.forEach(function (line, row) {
      line.forEach(function (digit, column) {
        // Rows: even rows go right, odd rows go left. Columns: even columns go up, odd columns go down.
        const direction = sideways ? (row % 2 === 0 ? 1 : -1) : (column % 2 === 0 ? -1 : 1);
        digit.classList.add("is-jumping");
        digit.style.translate = sideways
          ? (direction * digitWidth).toFixed(1) + "px 0"
          : "0 " + (direction * rowHeight).toFixed(1) + "px";
      });
    });

    // When the jump has ended: every digit back to its place at once, with the other digit
    setTimeout(function () {
      cells.forEach(function (line) {
        line.forEach(function (digit) {
          digit.classList.remove("is-jumping");
          digit.style.translate = "";
          digit.textContent = digit.textContent === "4" ? "0" : "4";
        });
      });
    }, jumpTime + 50);
  }

  // ----- The mouse -----
  // On a digit: it turns pink, orange or yellow (the colors are in styles.css). Over the digits: the jumping waits.
  const HOVER_COLORS = ["is-pink", "is-orange", "is-yellow"];
  notFoundGrid.addEventListener("pointerover", function (event) {
    const digit = event.target.closest(".not-found-digit");
    if (!digit || event.pointerType === "touch") return;
    mouseOnDigits = true;
    digit.classList.remove(...HOVER_COLORS);
    digit.classList.add(HOVER_COLORS[Math.floor(Math.random() * HOVER_COLORS.length)]);
  });
  notFoundGrid.addEventListener("pointerout", function (event) {
    const digit = event.target.closest(".not-found-digit");
    if (digit) digit.classList.remove(...HOVER_COLORS);
  });
  notFoundGrid.addEventListener("pointerleave", function () { mouseOnDigits = false; });

  // ----- Start -----
  build();
  window.addEventListener("resize", build);
  if (!reduceMotion) setInterval(jump, hold);
}

// The strip of projects on the home page.
// - It moves slowly by itself (--strip-speed in styles.css) and stops while the mouse is on it.
// - It can also be scrolled sideways: a finger swipes it, a trackpad scrolls it, and a mouse can drag it.
//   After someone scrolls it, it waits a moment (--strip-resume) and then moves by itself again.
// - The projects are written three times in a row, so it can go on forever in both directions:
//   when it reaches the end of a copy, it jumps back by exactly one copy, which can't be seen.
// - Clicking a project opens its page (a drag never does).

const projectsStrip = document.querySelector(".shorts");

if (projectsStrip) {
  const stripTrack = projectsStrip.querySelector(".shorts-track");
  const stripReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stripStyles = getComputedStyle(document.documentElement);
  const STRIP_SPEED = parseFloat(stripStyles.getPropertyValue("--strip-speed"));        // frame pixels per second
  const STRIP_RESUME = parseFloat(stripStyles.getPropertyValue("--strip-resume")) * 1000; // milliseconds

  // ----- Two more copies of the projects (only for the eyes: screen readers and the keyboard skip them) -----
  const originals = [...stripTrack.children];
  for (let copy = 0; copy < 2; copy++) {
    originals.forEach(function (project) {
      const clone = project.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.tabIndex = -1;
      stripTrack.appendChild(clone);
    });
  }

  // People who turned off animations see still pictures, and the strip only moves when they scroll it
  if (stripReduceMotion) stripTrack.querySelectorAll("video").forEach(function (video) { video.pause(); video.removeAttribute("autoplay"); });

  // The width of one copy: from the first project to the first project of the next copy
  function copyWidth() {
    return stripTrack.children[originals.length].offsetLeft - stripTrack.children[0].offsetLeft;
  }

  // Keeps the strip inside the middle copy, so there is always more on both sides
  let position = 0; // the scroll position, with fractions, so a slow movement stays smooth
  function wrap() {
    const width = copyWidth();
    if (width <= 0) return;
    if (position < width * 0.5) position += width;
    else if (position > width * 1.5) position -= width;
    projectsStrip.scrollLeft = position;
    lastSet = projectsStrip.scrollLeft;
  }

  // The size of one frame pixel (the page is drawn from a 1474, 834 or 390 wide frame)
  function frameUnit() {
    const width = document.documentElement.clientWidth;
    return width / (width <= 600 ? 390 : width <= 900 ? 834 : 1474);
  }

  // ----- Moving by itself -----
  let isHovered = false;
  let isDragging = false;
  let lastTouched = -Infinity; // when someone last scrolled it
  let lastFrame = performance.now();
  let lastSet = -1;            // where this script last put it, to tell its own scrolling from a person's

  function move(now) {
    const seconds = Math.min((now - lastFrame) / 1000, 0.1);
    lastFrame = now;
    const resting = isHovered || isDragging || now - lastTouched < STRIP_RESUME;
    if (!stripReduceMotion && !resting) {
      position += STRIP_SPEED * frameUnit() * seconds;
      wrap();
    }
    requestAnimationFrame(move);
  }

  // A person scrolled it (a swipe or a trackpad): remember where it is, and rest for a moment
  projectsStrip.addEventListener("scroll", function () {
    if (Math.abs(projectsStrip.scrollLeft - lastSet) <= 1) return; // that was this script
    position = projectsStrip.scrollLeft;
    lastTouched = performance.now();
    wrap();
  }, { passive: true });

  projectsStrip.addEventListener("pointerenter", function (event) { if (event.pointerType === "mouse") isHovered = true; });
  projectsStrip.addEventListener("pointerleave", function () { isHovered = false; });

  // ----- Dragging with a mouse -----
  let dragStartX = 0, dragStartPosition = 0, dragMoved = 0;
  projectsStrip.addEventListener("pointerdown", function (event) {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    event.preventDefault(); // no dragging of the link itself, and no text selection
    isDragging = true;
    dragStartX = event.clientX;
    dragStartPosition = position;
    dragMoved = 0;
  });
  window.addEventListener("pointermove", function (event) {
    if (!isDragging) return;
    dragMoved = Math.max(dragMoved, Math.abs(event.clientX - dragStartX));
    if (dragMoved > 5) projectsStrip.classList.add("is-dragging");
    position = dragStartPosition - (event.clientX - dragStartX);
    wrap();
    // After a jump by one copy, the drag continues from the new place
    dragStartPosition = position + (event.clientX - dragStartX);
  });
  window.addEventListener("pointerup", function () {
    if (!isDragging) return;
    isDragging = false;
    lastTouched = performance.now();
    // Let the click that ends a drag pass first, then projects can be clicked again
    setTimeout(function () { projectsStrip.classList.remove("is-dragging"); }, 0);
  });
  // A drag never opens a project
  projectsStrip.addEventListener("click", function (event) {
    if (dragMoved > 5) { event.preventDefault(); event.stopImmediatePropagation(); dragMoved = 0; }
  }, true);

  // ----- Start in the middle copy -----
  function start() {
    position = copyWidth();
    wrap();
    lastFrame = performance.now();
    requestAnimationFrame(move);
  }
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start);
  window.addEventListener("resize", wrap);
}

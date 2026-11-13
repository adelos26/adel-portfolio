// The moving strip of short works on the home page, and opening one full screen like a story:
// - the strip moves by itself (styles.css) and stops on hover
// - clicking a short opens it with sound; bars on top show where you are
// - the left and right halves of the story (or the arrow keys) go back and forward
// - after the last short it closes by itself; × or Esc close it too

const shortsStrip = document.querySelector(".shorts");
const storyViewer = document.querySelector(".story-viewer");

if (shortsStrip && storyViewer) {
  const storiesReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const track = shortsStrip.querySelector(".shorts-track");
  const originals = [...track.querySelectorAll(".short")];

  // Every short, in order: its video and its shape
  const shorts = originals.map(function (button) {
    return {
      video: button.querySelector("video").getAttribute("src"),
      ratio: button.style.getPropertyValue("--ratio"),
    };
  });
  originals.forEach(function (button, index) { button.dataset.index = index; });

  // ----- The strip -----
  // A second copy of the list follows the first, so the strip can loop with no jump.
  // The copy is only for the eyes: screen readers and the keyboard skip it.
  if (!storiesReduceMotion) {
    originals.forEach(function (button) {
      const copy = button.parentElement.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.querySelector(".short").tabIndex = -1;
      track.appendChild(copy);
    });
  }

  const stripVideos = track.querySelectorAll("video");
  function playStrip(play) {
    stripVideos.forEach(function (video) {
      if (play && !storiesReduceMotion) video.play().catch(function () {});
      else video.pause();
    });
  }
  // People who turned off animations see the still pictures instead of moving videos
  if (storiesReduceMotion) playStrip(false);

  // ----- The story -----
  const frame = storyViewer.querySelector(".story-frame");
  const storyVideo = storyViewer.querySelector(".story-video");
  const bars = storyViewer.querySelector(".story-bars");
  const closeButton = storyViewer.querySelector(".story-close");
  let current = 0;
  let openedFrom = null;

  // One bar for each short
  bars.innerHTML = shorts.map(function () {
    return '<span class="story-bar"><span class="story-bar-fill"></span></span>';
  }).join("");
  const fills = bars.querySelectorAll(".story-bar-fill");

  function showShort(index) {
    current = index;
    frame.style.setProperty("--ratio", shorts[index].ratio);
    // Bars before this one are full, the ones after are empty
    fills.forEach(function (fill, n) { fill.style.setProperty("--progress", n < index ? 1 : 0); });
    storyVideo.src = shorts[index].video;
    storyVideo.muted = false;
    storyVideo.play().catch(function () {
      // If the browser doesn't allow sound yet, it plays without it
      storyVideo.muted = true;
      storyVideo.play().catch(function () {});
    });
  }

  function next() {
    if (current < shorts.length - 1) showShort(current + 1);
    else closeStory(); // after the last one, back to the strip
  }

  function back() {
    showShort(Math.max(current - 1, 0));
  }

  // The × is black on light videos and cream on dark ones.
  // A few times a second, the corner of the video under the × is shrunk to a few pixels and its brightness is measured.
  const corner = document.createElement("canvas");
  corner.width = 8;
  corner.height = 8;
  const cornerPaint = corner.getContext("2d", { willReadFrequently: true });
  const LIGHT_ENOUGH = 0.6; // brightness from 0 (black) to 1 (white) where the × turns black
  let lastCheck = 0;

  function checkCornerBrightness(now) {
    if (now - lastCheck < 250 || storyVideo.readyState < 2) return;
    lastCheck = now;
    const width = storyVideo.videoWidth, height = storyVideo.videoHeight;
    // The top right corner: the last fifth of the width, the first fifth of the height
    cornerPaint.drawImage(storyVideo, width * 0.8, 0, width * 0.2, height * 0.2, 0, 0, 8, 8);
    const pixels = cornerPaint.getImageData(0, 0, 8, 8).data;
    let brightness = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      brightness += (0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2]) / 255;
    }
    brightness /= pixels.length / 4;
    storyViewer.classList.toggle("is-on-light", brightness > LIGHT_ENOUGH);
  }

  // The current bar fills as the short plays
  function drawProgress(now) {
    if (!storyViewer.classList.contains("is-open")) return;
    if (storyVideo.duration) fills[current].style.setProperty("--progress", storyVideo.currentTime / storyVideo.duration);
    checkCornerBrightness(now);
    requestAnimationFrame(drawProgress);
  }
  storyVideo.addEventListener("ended", next);

  function openStory(index, button) {
    openedFrom = button;
    shortsStrip.classList.add("is-paused");
    playStrip(false);
    // Only the story can be used while it is open
    document.querySelectorAll("main, header").forEach(function (part) { part.inert = true; });
    storyViewer.inert = false;
    storyViewer.classList.add("is-open");
    if (typeof siteCursor !== "undefined") siteCursor.hideLabel(); // the cursor stops saying "Watch It"
    showShort(index);
    closeButton.focus();
    requestAnimationFrame(drawProgress);
  }

  function closeStory() {
    storyViewer.classList.remove("is-open");
    storyViewer.inert = true;
    storyVideo.pause();
    document.querySelectorAll("main, header").forEach(function (part) { part.inert = false; });
    shortsStrip.classList.remove("is-paused");
    playStrip(true);
    if (openedFrom) openedFrom.focus({ preventScroll: true });
  }

  track.addEventListener("click", function (event) {
    const button = event.target.closest(".short");
    if (button) openStory(Number(button.dataset.index), button);
  });
  storyViewer.querySelector(".story-tap.is-back").addEventListener("click", back);
  storyViewer.querySelector(".story-tap.is-next").addEventListener("click", next);
  closeButton.addEventListener("click", closeStory);
  // A click on the dark area around the story closes it
  storyViewer.addEventListener("click", function (event) {
    if (event.target === storyViewer) closeStory();
  });
  document.addEventListener("keydown", function (event) {
    if (!storyViewer.classList.contains("is-open")) return;
    if (event.key === "Escape") closeStory();
    if (event.key === "ArrowRight") next();
    if (event.key === "ArrowLeft") back();
  });
}

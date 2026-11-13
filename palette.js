// The color palettes on the project pages: a row of rounded color pills.
// One pill is wide; every half second the wide one moves to the next color.
// After the last color it goes back to the first and rests for a moment, then starts again.
// It starts when the palette comes into view. The timings are in styles.css (--palette-step, --palette-rest).

const palettes = document.querySelectorAll(".color-palette");
const paletteReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const paletteStyles = getComputedStyle(document.documentElement);
const PALETTE_STEP = parseFloat(paletteStyles.getPropertyValue("--palette-step")) * 1000;
const PALETTE_REST = parseFloat(paletteStyles.getPropertyValue("--palette-rest")) * 1000;

palettes.forEach(function (palette) {
  const swatches = palette.querySelectorAll(".color-swatch");
  let wide = 0;
  let timer = null;

  function showWide() {
    swatches.forEach(function (swatch, index) { swatch.classList.toggle("is-wide", index === wide); });
  }

  // Move to the next color; after the last one, back to the first, then rest
  function next() {
    wide = (wide + 1) % swatches.length;
    showWide();
    timer = setTimeout(next, wide === 0 ? PALETTE_REST : PALETTE_STEP);
  }

  showWide(); // the first color is wide from the start

  if (paletteReduceMotion) return; // no movement: the first color simply stays wide

  // Moves only while it can be seen
  new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      clearTimeout(timer);
      if (entry.isIntersecting) timer = setTimeout(next, PALETTE_STEP);
    });
  }, { threshold: 0.4 }).observe(palette);
});

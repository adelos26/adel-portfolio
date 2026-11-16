// The color palettes on the project pages: a row of rounded color pills.
// One pill is wide. Pointing at a color with the mouse (or tapping it on a phone) makes that one wide.
// It doesn't move by itself. The movement's speed is in styles.css (on .color-swatch).

document.querySelectorAll(".color-palette").forEach(function (palette) {
  const swatches = palette.querySelectorAll(".color-swatch");

  function makeWide(chosen) {
    swatches.forEach(function (swatch) { swatch.classList.toggle("is-wide", swatch === chosen); });
  }

  makeWide(swatches[0]); // the first color is wide from the start

  swatches.forEach(function (swatch) {
    // The mouse: the color under it opens. A finger: the tapped color opens.
    swatch.addEventListener("pointerenter", function (event) {
      if (event.pointerType === "mouse") makeWide(swatch);
    });
    swatch.addEventListener("click", function () { makeWide(swatch); });
  });
});

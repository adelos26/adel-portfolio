// Project pages: short shots from the film, in place of still pictures.
// Each one plays without sound, again and again, but only while it can be seen,
// so the page stays light. People who turned off animations see its still picture instead.

const processClips = document.querySelectorAll(".process-clip");
const clipsReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!clipsReduceMotion) {
  const clipWatcher = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) entry.target.play().catch(function () {});
      else entry.target.pause();
    });
  }, { threshold: 0.25 });

  processClips.forEach(function (clip) { clipWatcher.observe(clip); });
}

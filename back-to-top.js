// The blue "back to top" button on the project pages.
// It shows once the page has been scrolled past the first screen,
// and a click glides the page back to the top (at once, for people who turned off animations).

const backToTop = document.querySelector(".back-to-top");

if (backToTop) {
  const backReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function showOrHide() {
    backToTop.classList.toggle("is-shown", window.scrollY > window.innerHeight * 0.8);
  }
  window.addEventListener("scroll", showOrHide, { passive: true });
  showOrHide();

  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: backReduceMotion ? "auto" : "smooth" });
    backToTop.blur();
  });
}

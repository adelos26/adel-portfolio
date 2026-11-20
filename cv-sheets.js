// Hi page: the CV behind the photo.
// With a mouse, pointing at the photo brings the sheets out and a click opens the CV.
// Phones and tablets have no mouse, so (like the folders on Reach Out) the first tap brings the sheets out
// and a second tap opens the CV. A tap anywhere else puts them back.

const photoCv = document.querySelector(".photo-cv");

if (photoCv) {
  const cvTouchScreen = !window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  photoCv.addEventListener("click", function (event) {
    if (!cvTouchScreen) return;
    if (photoCv.classList.contains("is-open")) return; // second tap: let the CV open
    event.preventDefault();
    photoCv.classList.add("is-open");
  });

  document.addEventListener("click", function (event) {
    if (cvTouchScreen && !event.target.closest(".photo-cv")) photoCv.classList.remove("is-open");
  });

  // Coming back from the CV with the back button: start closed
  window.addEventListener("pageshow", function () { photoCv.classList.remove("is-open"); });
}

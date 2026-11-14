// Reach Out: the folders.
//
// Phones and tablets have no mouse, so a tap can't "hover". There the first tap on a folder
// opens it (its sheets come out), and a second tap on the same folder opens the link:
// Instagram, LinkedIn, a new email, or dialing the phone. A tap anywhere else closes it.
//
// With a mouse, the Phone folder can't dial, so a click brings its sheet with the number
// further out and makes it a little bigger. It goes back when the mouse (or keyboard focus) leaves.

const contactFolders = document.querySelectorAll(".contact-folder");
const isTouchScreen = !window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// ----- Phones and tablets: first tap opens, second tap follows the link -----
function closeFolders() {
  contactFolders.forEach(function (folder) { folder.classList.remove("is-open"); });
}

contactFolders.forEach(function (folder) {
  folder.addEventListener("click", function (event) {
    if (!isTouchScreen) return;
    if (folder.classList.contains("is-open")) return; // second tap: let the link open
    event.preventDefault();
    closeFolders();
    folder.classList.add("is-open");
  });
});

document.addEventListener("click", function (event) {
  if (isTouchScreen && !event.target.closest(".contact-folder")) closeFolders();
});

// Coming back from Instagram or LinkedIn with the back button: start with all folders closed
window.addEventListener("pageshow", closeFolders);

// ----- With a mouse: the Phone folder's sheet comes closer -----
const phoneFolder = document.querySelector('.contact-folder[href^="tel:"]');
const phonePaper = phoneFolder.querySelector(".folder-paper");

phoneFolder.addEventListener("click", function (event) {
  if (isTouchScreen) return; // a phone dials (on the second tap, above)
  event.preventDefault();
  phonePaper.classList.toggle("is-close");
});

function putPaperBack() {
  phonePaper.classList.remove("is-close");
}

phoneFolder.addEventListener("pointerleave", putPaperBack);
phoneFolder.addEventListener("blur", putPaperBack);

// ----- E-Mail: a click also copies the address -----
// Not every computer has a mail app set up, so the click copies the address too,
// and the sheet says "Copied!" for a moment (--email-copied-time in styles.css). Then the new email opens, if it can.
const emailFolder = document.querySelector('.contact-folder[href^="mailto:"]');
const emailPaper = emailFolder.querySelector(".folder-paper");
const emailAddress = emailPaper.textContent;
const EMAIL_COPIED_TIME = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--email-copied-time")) * 1000;
let emailCopiedTimer = null;

emailFolder.addEventListener("click", function (event) {
  if (event.defaultPrevented) return; // a first tap on a phone or tablet only opened the folder
  if (navigator.clipboard) navigator.clipboard.writeText(emailAddress).catch(function () {});
  emailPaper.textContent = "Copied!";
  clearTimeout(emailCopiedTimer);
  emailCopiedTimer = setTimeout(function () { emailPaper.textContent = emailAddress; }, EMAIL_COPIED_TIME);
});

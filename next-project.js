// The title under "Next Project": its letters jump up one after another, like the sentence
// on the home page. The wave plays when the mouse comes onto the title and when it is clicked
// (then the page transition covers the screen and the next project opens), and on keyboard focus.

const nextTitle = document.querySelector(".project-next-title");
const nextLetters = [];

// Screen readers read the title as one word, not letter by letter
nextTitle.setAttribute("aria-label", nextTitle.textContent.trim());

// Every letter in its own span; the letters of a word sit together so a line only wraps between words
const titleWords = nextTitle.textContent.trim().split(" ");
nextTitle.textContent = "";
titleWords.forEach(function (word, index) {
  const wordElement = document.createElement("span");
  wordElement.className = "statement-word";
  wordElement.setAttribute("aria-hidden", "true");
  for (const character of word) {
    const letter = document.createElement("span");
    letter.className = "statement-letter";
    letter.textContent = character;
    letter.style.setProperty("--letter", nextLetters.length);
    wordElement.appendChild(letter);
    nextLetters.push(letter);
  }
  nextTitle.appendChild(wordElement);
  if (index < titleWords.length - 1) nextTitle.appendChild(document.createTextNode(" "));
});

function startWave() {
  nextTitle.classList.add("is-waving");
}

nextTitle.addEventListener("mouseenter", startWave);
nextTitle.addEventListener("click", startWave);
// Keyboard: the same wave when the title gets focus
nextTitle.addEventListener("focus", function () {
  if (nextTitle.matches(":focus-visible")) startWave();
});

// When the last letter lands, get ready for the next wave
nextLetters[nextLetters.length - 1].addEventListener("animationend", function () {
  nextTitle.classList.remove("is-waving");
});

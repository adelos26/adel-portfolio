// Makes the letters of the sentence jump up one after another when the mouse is on it.
// The wave always finishes, even if the mouse leaves in the middle.

const statement = document.querySelector(".statement");
const statementLines = document.querySelectorAll(".statement-line");
const letterElements = [];

// Screen readers read the whole sentence, not letter by letter
statement.setAttribute("aria-label", statement.textContent.replace(/\s+/g, " ").trim());

// Put every letter in its own span. --letter is its place in the sentence.
statementLines.forEach(function (line) {
  const text = line.textContent;
  line.textContent = "";
  line.setAttribute("aria-hidden", "true");

  for (const character of text) {
    const letter = document.createElement("span");
    letter.className = "statement-letter";
    letter.textContent = character;
    letter.style.setProperty("--letter", letterElements.length);
    line.appendChild(letter);
    letterElements.push(letter);
  }
});

// Mouse on the sentence: start the wave
statement.addEventListener("mouseenter", function () {
  statement.classList.add("is-waving");
});

// When the last letter finishes, get ready for the next wave
letterElements[letterElements.length - 1].addEventListener("animationend", function () {
  statement.classList.remove("is-waving");
});

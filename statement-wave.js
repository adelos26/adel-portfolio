// Makes the letters of the sentence jump up one after another when the mouse is on it.
// The wave always finishes, even if the mouse leaves in the middle.

const statement = document.querySelector(".statement");
const statementLines = document.querySelectorAll(".statement-line");
const letterElements = [];

// Screen readers read the whole sentence, not letter by letter
statement.setAttribute("aria-label", statement.textContent.replace(/\s+/g, " ").trim());

// Put every letter in its own span. --letter is its place in the sentence.
// The letters of each word sit together in a word span, so a line can only wrap between words.
function addLetter(parent, character) {
  const letter = document.createElement("span");
  letter.className = "statement-letter";
  letter.textContent = character;
  letter.style.setProperty("--letter", letterElements.length);
  parent.appendChild(letter);
  letterElements.push(letter);
}

statementLines.forEach(function (line) {
  const words = line.textContent.trim().split(" ");
  line.textContent = "";
  line.setAttribute("aria-hidden", "true");

  words.forEach(function (word) {
    const wordElement = document.createElement("span");
    wordElement.className = "statement-word";
    for (const character of word) addLetter(wordElement, character);
    line.appendChild(wordElement);

    // The space after the word (after the last word it separates this line from the next)
    line.appendChild(document.createTextNode(" "));
  });
});

// Mouse on the sentence: start the wave
statement.addEventListener("mouseenter", function () {
  statement.classList.add("is-waving");
});

// When the last letter finishes, get ready for the next wave
letterElements[letterElements.length - 1].addEventListener("animationend", function () {
  statement.classList.remove("is-waving");
});

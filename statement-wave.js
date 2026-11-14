// Makes the letters of a big title jump up one after another when the mouse is on it:
// the opening sentence on the home page, the title of the strip of shorts, and "Hi I’m Adel" on the Hi page.
// The wave always finishes, even if the mouse leaves in the middle.

document.querySelectorAll(".statement, .shorts-title, .about-title").forEach(function (title) {
  const lines = title.querySelectorAll(".statement-line");
  const letterElements = [];

  // Screen readers read the whole title, not letter by letter
  title.setAttribute("aria-label", title.textContent.replace(/\s+/g, " ").trim());

  // Put every letter in its own span. --letter is its place in the title.
  // The letters of each word sit together in a word span, so a line can only wrap between words.
  function addLetter(parent, character) {
    const letter = document.createElement("span");
    letter.className = "statement-letter";
    letter.textContent = character;
    letter.style.setProperty("--letter", letterElements.length);
    parent.appendChild(letter);
    letterElements.push(letter);
  }

  lines.forEach(function (line) {
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

  // Mouse on the title: start the wave
  title.addEventListener("mouseenter", function () {
    title.classList.add("is-waving");
  });

  // When the last letter finishes, get ready for the next wave
  letterElements[letterElements.length - 1].addEventListener("animationend", function () {
    title.classList.remove("is-waving");
  });
});

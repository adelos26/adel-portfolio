// Makes the letters of a big title jump up one after another when the mouse is on it
// (on the home page only my name plays, see below):
// the opening sentence on the home page, the title of the strip of shorts, and "Hi I’m Adel" on the Hi page.
// The wave always finishes, even if the mouse leaves in the middle.

document.querySelectorAll(".statement, .shorts-title, .about-title").forEach(function (title) {
  const lines = title.querySelectorAll(".statement-line");
  const letterElements = [];

  // Screen readers read the whole title, not letter by letter
  title.setAttribute("aria-label", title.textContent.replace(/\s+/g, " ").trim());

  // Put every letter in its own span. --letter is its place in the title.
  // The letters of each word sit together in a word span, so a line can only wrap between words.
  const nameLetters = [];
  function addLetter(parent, character, isName) {
    const letter = document.createElement("span");
    letter.className = isName ? "statement-letter statement-name-letter" : "statement-letter";
    letter.textContent = character;
    letter.style.setProperty("--letter", letterElements.length);
    if (isName) { letter.style.setProperty("--name-letter", nameLetters.length); nameLetters.push(letter); }
    parent.appendChild(letter);
    letterElements.push(letter);
  }

  lines.forEach(function (line) {
    // Every character of the line, and whether it is part of my name (.statement-name)
    const characters = [];
    line.childNodes.forEach(function (node) {
      const isName = node.nodeType === 1 && node.classList.contains("statement-name");
      for (const character of node.textContent) characters.push({ character: character, isName: isName });
    });
    // Split into words at the spaces
    const words = [[]];
    characters.forEach(function (c) {
      if (c.character.trim() === "") { if (words[words.length - 1].length) words.push([]); }
      else words[words.length - 1].push(c);
    });
    line.textContent = "";
    line.setAttribute("aria-hidden", "true");

    words.filter(function (word) { return word.length; }).forEach(function (word) {
      const wordElement = document.createElement("span");
      wordElement.className = "statement-word";
      word.forEach(function (c) { addLetter(wordElement, c.character, c.isName); });
      line.appendChild(wordElement);

      // The space after the word (after the last word it separates this line from the next)
      line.appendChild(document.createTextNode(" "));
    });
  });

  // A title with my name in it: on hover only the name plays (it jumps and runs through the folder colors).
  // Any other title: all its letters do the wave.
  const playName = nameLetters.length > 0;
  const playClass = playName ? "is-name-playing" : "is-waving";

  // Mouse on the title: start
  title.addEventListener("mouseenter", function () {
    title.classList.add(playClass);
  });

  // When the last letter finishes (for the name: its colors), get ready for the next time
  const lastLetter = playName ? nameLetters[nameLetters.length - 1] : letterElements[letterElements.length - 1];
  lastLetter.addEventListener("animationend", function (event) {
    if (playName && event.animationName !== "name-colors") return;
    title.classList.remove(playClass);
  });
});

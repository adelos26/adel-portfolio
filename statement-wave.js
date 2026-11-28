// Makes the letters of a big title move when the mouse is on it:
// the title of the strip of shorts and "Hi I’m Adel" on the Hi page do a wave, one letter after another
// (the wave always finishes, even if the mouse leaves in the middle).
// The opening sentence on the home page is different: only the letters near the mouse jump, each in a color (see the end).

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

  // The home sentence: the letters near the mouse jump and take a color for a moment (below)
  if (title.classList.contains("statement")) {
    setUpHops(title, letterElements);
    return;
  }

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

// ----- The home sentence: letters near the mouse (or a finger) jump and take a color -----
// Each letter close to the pointer gets "is-hopping" and one of the site's colors; it settles back
// to cream a moment after the pointer moves on (styles.css: .is-hopping, letter-hop).
const HOP_COLORS = ["var(--color-page-home)", "var(--color-folder-orange)", "var(--color-page-reach-out)", "var(--color-page-projects)"];
const HOP_RADIUS = 0.8; // how close, in letter heights
const HOP_HOLD = 450;   // milliseconds a letter stays changed after the pointer moves on

function setUpHops(title, letters) {
  title.addEventListener("pointermove", function (event) {
    const reach = parseFloat(getComputedStyle(title).fontSize) * HOP_RADIUS;
    letters.forEach(function (letter) {
      const box = letter.getBoundingClientRect();
      const distance = Math.hypot(box.left + box.width / 2 - event.clientX, box.top + box.height / 2 - event.clientY);
      if (distance > reach) return;
      if (letter.classList.contains("is-hopping")) {
        clearTimeout(letter.hopTimer); // still near: stay a little longer
      } else {
        letter.style.setProperty("--hop-color", HOP_COLORS[Math.floor(Math.random() * HOP_COLORS.length)]);
        letter.classList.add("is-hopping");
      }
      letter.hopTimer = setTimeout(function () { letter.classList.remove("is-hopping"); }, HOP_HOLD);
    });
  });
}

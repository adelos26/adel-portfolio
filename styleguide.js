// Style guide: reads the variables straight from styles.css and fills the page.
// Nothing here holds a design value; every color and size comes from the stylesheet.

// 1. All the variable names in the first :root of styles.css, in the order they are written
function readRootVariables() {
  const names = [];
  for (const sheet of document.styleSheets) {
    if (!sheet.href || !sheet.href.endsWith("styles.css")) continue;
    for (const rule of sheet.cssRules) {
      if (rule.selectorText !== ":root") continue;
      for (const name of rule.style) {
        if (name.startsWith("--")) names.push(name);
      }
      return names; // only the first :root (the one at the top)
    }
  }
  return names;
}

// The value as written in styles.css right now (it can change on tablet and phone)
function rawValue(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// A hidden helper measures a variable in pixels
const probe = document.createElement("div");
probe.className = "styleguide-probe";
document.body.appendChild(probe);

function measure(name) {
  probe.style.width = "var(" + name + ")";
  const pixels = probe.getBoundingClientRect().width;
  probe.style.width = "";
  return pixels;
}

const variables = readRootVariables();

// 2. Colors: one tile for every --color- variable
function showColors() {
  const list = document.getElementById("styleguide-colors");
  list.innerHTML = "";
  for (const name of variables.filter((n) => n.startsWith("--color-"))) {
    const item = document.createElement("div");
    item.className = "styleguide-color";
    item.innerHTML =
      '<div class="styleguide-color-tile"></div>' +
      '<p class="project-label"></p><p class="project-small"></p>';
    item.querySelector(".styleguide-color-tile").style.setProperty("--swatch", "var(" + name + ")");
    item.querySelector(".project-label").textContent = name;
    item.querySelector(".project-small").textContent = rawValue(name);
    list.appendChild(item);
  }
}

// 3. Spaces: every variable whose name says it is a space (gap, side, top, bottom, padding),
//    measured on this screen and shown smallest first
const spaceName = /^--space-|-(gap|side|top|bottom|padding)$/;

function showSpaces() {
  const list = document.getElementById("styleguide-spaces");
  list.innerHTML = "";
  const spaces = variables
    .filter((name) => spaceName.test(name))
    .map((name) => ({ name, pixels: measure(name) }))
    .filter((space) => space.pixels > 0) // leaves out plain numbers that are not sizes
    .sort((a, b) => a.pixels - b.pixels);

  for (const space of spaces) {
    const row = document.createElement("div");
    row.className = "styleguide-row";
    row.innerHTML =
      '<p class="project-small"><span class="project-label"></span> <span></span></p>' +
      '<div class="styleguide-space-bar"></div>';
    row.querySelector(".project-label").textContent = space.name;
    row.querySelector(".project-label + span").textContent =
      "· " + rawValue(space.name) + " = " + Math.round(space.pixels) + "px on this screen";
    row.querySelector(".styleguide-space-bar").style.setProperty("--space", "var(" + space.name + ")");
    list.appendChild(row);
  }
}

// 4. Text styles: write the size variable and the measured font values next to each example
function showTextStyles() {
  for (const row of document.querySelectorAll("[data-text-style]")) {
    const sample = row.querySelector(".styleguide-sample > *");
    const style = getComputedStyle(sample);
    const font = style.fontFamily.split(",")[0].replace(/"/g, "");
    row.querySelector("[data-specs]").textContent =
      "· " + row.dataset.textStyle + " · " + font + " " + style.fontWeight +
      " · " + Math.round(parseFloat(style.fontSize)) + "px" +
      " · line " + style.lineHeight + " · spacing " + style.letterSpacing;
  }
}

// 5. The menu: split the words into letters, like on the site, so the hover animations work
function splitLetters(element, letterClass) {
  const text = element.textContent;
  element.textContent = "";
  [...text].forEach((character, index) => {
    const letter = document.createElement("span");
    letter.className = letterClass;
    letter.style.setProperty("--letter", index);
    letter.textContent = character;
    element.appendChild(letter);
  });
}

for (const element of document.querySelectorAll('[data-letters="nav"]')) {
  splitLetters(element, "nav-letter");
}

// "Hi| I’m Adel": before the | always shows, after it opens on hover
for (const element of document.querySelectorAll('[data-letters="logo"]')) {
  const [always, more] = element.textContent.split("|");
  element.textContent = "";
  const first = document.createElement("span");
  first.textContent = always;
  splitLetters(first, "logo-letter");
  const rest = document.createElement("span");
  rest.className = "nav-logo-more";
  rest.textContent = more;
  splitLetters(rest, "logo-letter");
  // Continue the letter count, so the wave goes on from "Hi"
  rest.querySelectorAll(".logo-letter").forEach((letter, index) => {
    letter.style.setProperty("--letter", always.length + index);
  });
  element.append(...first.childNodes, rest);
}

// Fill everything now, and again when the screen size changes (the values change with it)
function showAll() {
  showColors();
  showSpaces();
  showTextStyles();
}

showAll();
document.fonts.ready.then(showTextStyles);
window.addEventListener("resize", showAll);

// The Hi page: the row of tool icons.
// The icons pop in one after another when the row comes into view (after the page has opened).
// Pointing at an icon with the mouse shows its name above it, with no click.
// A finger can't point, so on a phone or tablet a tap shows the name for a moment (--tool-name-time in styles.css).

const toolRow = document.querySelector(".tools");

if (toolRow) {
  const toolSlots = toolRow.querySelectorAll(".tool-slot");
  const rootStyles = getComputedStyle(document.documentElement);
  const NAME_TIME = parseFloat(rootStyles.getPropertyValue("--tool-name-time")) * 1000;
  const SETTLE_TIME = (toolSlots.length * parseFloat(rootStyles.getPropertyValue("--reveal-step"))
    + parseFloat(rootStyles.getPropertyValue("--speed-playful"))) * 1000;
  let nameTimer = null;

  // ----- Pop in when the row comes into view -----
  new IntersectionObserver(function (entries, observer) {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    // Wait until the page has opened (after the loading screen or the page change)
    const waitForPage = setInterval(function () {
      const root = document.documentElement.classList;
      if (root.contains("is-loading") || root.contains("is-arriving")) return;
      clearInterval(waitForPage);
      toolRow.classList.add("is-shown");
      // After the last one has popped in, the icons answer the pointer without waiting their turn
      setTimeout(function () { toolRow.classList.add("is-settled"); }, SETTLE_TIME);
    }, 100);
  }, { threshold: 0.3 }).observe(toolRow);

  // ----- Show one icon's name -----
  function showName(slot) {
    toolSlots.forEach(function (other) { other.classList.toggle("is-named", other === slot); });
  }

  toolSlots.forEach(function (slot) {
    // A mouse (or pen) pointing at the icon shows the name, and moving away hides it
    slot.addEventListener("pointerenter", function (event) {
      if (event.pointerType !== "touch") showName(slot);
    });
    slot.addEventListener("pointerleave", function (event) {
      if (event.pointerType !== "touch") slot.classList.remove("is-named");
    });
    // A finger can't point, so a tap shows the name for a moment
    slot.addEventListener("pointerup", function (event) {
      if (event.pointerType !== "touch") return;
      showName(slot);
      clearTimeout(nameTimer);
      nameTimer = setTimeout(function () { slot.classList.remove("is-named"); }, NAME_TIME);
    });
  });
}

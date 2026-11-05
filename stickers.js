// The word stickers on the Hi page can be dragged anywhere on the page,
// with the mouse or with a finger. The one being dragged is always on top.

let topSticker = 1;

document.querySelectorAll(".sticker").forEach(function (sticker) {
  let startX = 0, startY = 0;   // where the pointer was when the drag started
  let movedX = 0, movedY = 0;   // how far the sticker has been moved so far
  let baseX = 0, baseY = 0;

  sticker.addEventListener("pointerdown", function (event) {
    sticker.setPointerCapture(event.pointerId);
    startX = event.clientX;
    startY = event.clientY;
    baseX = movedX;
    baseY = movedY;
    topSticker += 1;
    sticker.style.zIndex = topSticker;
    sticker.classList.add("is-dragging");
  });

  sticker.addEventListener("pointermove", function (event) {
    if (!sticker.classList.contains("is-dragging")) return;
    movedX = baseX + event.clientX - startX;
    movedY = baseY + event.clientY - startY;
    sticker.style.translate = movedX + "px " + movedY + "px";
  });

  function stopDragging() {
    sticker.classList.remove("is-dragging");
  }
  sticker.addEventListener("pointerup", stopDragging);
  sticker.addEventListener("pointercancel", stopDragging);
});

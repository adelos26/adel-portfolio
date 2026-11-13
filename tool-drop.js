// The Hi page: the icons of the tools I use fall from above about a second after the page opens,
// tumble and pile up at the bottom, like real objects with gravity.
// They can be picked up and thrown with the mouse or a finger.
//
// No library: this file is a tiny physics engine for square boxes.
// Each step: gravity pulls, touching boxes push each other apart (with a little bounce and friction),
// then every icon is drawn where its box is.

const toolLayer = document.querySelector(".tools");

if (toolLayer) {
  const toolsReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = toolLayer.parentElement; // .about-main: the icons stay inside it

  // ----- Feel (the sizes are in styles.css) -----
  const GRAVITY = 2.4;          // in page heights per second, per second
  const BOUNCE = 0.18;          // 0 = no bounce, 1 = bounces back fully
  const FRICTION = 0.55;        // how much touching icons and the floor hold each other
  const STEP = 1 / 120;         // seconds; small steps keep the pile steady
  const SOLVER_ROUNDS = 10;     // more rounds = a steadier pile
  const PUSH_APART = 0.35;      // how much of an overlap is fixed in one step
  const ALLOWED_OVERLAP = 0.5;  // pixels
  const DROP_AFTER = 1000;      // milliseconds after the page has opened
  const DROP_GAP = 140;         // milliseconds between one icon and the next
  const WALL = 1000;            // the walls and the floor are thick boxes just outside the page
  const MAX_THROW = 4;          // the fastest throw, in page heights per second

  // ----- A box: where it is, how it turns, how it moves -----
  function makeBox(x, y, halfWidth, halfHeight, isStatic) {
    const mass = isStatic ? 0 : halfWidth * halfHeight;
    return {
      x, y, angle: 0, vx: 0, vy: 0, spin: 0,
      halfWidth, halfHeight,
      inverseMass: isStatic ? 0 : 1 / mass,
      inverseTurn: isStatic ? 0 : 3 / (mass * (halfWidth * halfWidth + halfHeight * halfHeight)),
    };
  }

  // The two directions a box faces, after it has turned
  function axesOf(box) {
    const c = Math.cos(box.angle), s = Math.sin(box.angle);
    return [[c, s], [-s, c]];
  }
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
  const cross = (a, b) => a[0] * b[1] - a[1] * b[0];

  // ----- Do two boxes touch? If so: the direction to push, and the touching points -----
  function touching(a, b) {
    const axesA = axesOf(a), axesB = axesOf(b);
    const between = [b.x - a.x, b.y - a.y];
    const extentsA = [a.halfWidth, a.halfHeight], extentsB = [b.halfWidth, b.halfHeight];
    let best = null;
    // Look along each of the four directions for the smallest overlap
    [[a, 0], [a, 1], [b, 0], [b, 1]].forEach(function ([owner, index]) {
      const axis = (owner === a ? axesA : axesB)[index];
      const reachA = extentsA[0] * Math.abs(dot(axesA[0], axis)) + extentsA[1] * Math.abs(dot(axesA[1], axis));
      const reachB = extentsB[0] * Math.abs(dot(axesB[0], axis)) + extentsB[1] * Math.abs(dot(axesB[1], axis));
      const overlap = reachA + reachB - Math.abs(dot(between, axis));
      // A small preference for a's own sides keeps the result steady from step to step
      const score = owner === a ? overlap : overlap * 1.02 + 0.01;
      if (!best || score < best.score) best = { score, overlap, owner, index, axis };
    });
    if (best.overlap <= 0) return null;

    // The push direction, from a to b
    const flip = dot(between, best.axis) < 0 ? -1 : 1;
    const normal = [best.axis[0] * flip, best.axis[1] * flip];

    // The side doing the pushing ("reference") and the side being pushed ("incident")
    const reference = best.owner, incident = reference === a ? b : a;
    const referenceAxes = reference === a ? axesA : axesB;
    const incidentAxes = reference === a ? axesB : axesA;
    const referenceExtents = reference === a ? extentsA : extentsB;
    const incidentExtents = reference === a ? extentsB : extentsA;
    const faceNormal = reference === a ? normal : [-normal[0], -normal[1]];
    const faceDepth = referenceExtents[best.index];
    const faceCenter = [reference.x + faceNormal[0] * faceDepth, reference.y + faceNormal[1] * faceDepth];
    const sideAxis = referenceAxes[1 - best.index];
    const sideLength = referenceExtents[1 - best.index];

    // The incident box's side that faces the reference side the most
    let incidentFace = null;
    [0, 1].forEach(function (index) {
      [1, -1].forEach(function (sign) {
        const direction = [incidentAxes[index][0] * sign, incidentAxes[index][1] * sign];
        const facing = dot(direction, faceNormal);
        if (!incidentFace || facing < incidentFace.facing) incidentFace = { facing, direction, index };
      });
    });
    const along = incidentAxes[1 - incidentFace.index];
    const alongLength = incidentExtents[1 - incidentFace.index];
    const middle = [
      incident.x + incidentFace.direction[0] * incidentExtents[incidentFace.index],
      incident.y + incidentFace.direction[1] * incidentExtents[incidentFace.index],
    ];
    let points = [
      [middle[0] + along[0] * alongLength, middle[1] + along[1] * alongLength],
      [middle[0] - along[0] * alongLength, middle[1] - along[1] * alongLength],
    ];

    // Cut that side to the length of the reference side
    [1, -1].forEach(function (sign) {
      const limit = sideLength;
      const distance = points.map((p) => sign * dot([p[0] - faceCenter[0], p[1] - faceCenter[1]], sideAxis) - limit);
      if (distance[0] > 0 && distance[1] > 0) { points = []; return; }
      if (distance[0] > 0 || distance[1] > 0) {
        const t = distance[0] / (distance[0] - distance[1]);
        const cut = [points[0][0] + (points[1][0] - points[0][0]) * t, points[0][1] + (points[1][1] - points[0][1]) * t];
        points = distance[0] > 0 ? [cut, points[1]] : [points[0], cut];
      }
    });

    // Keep only the points that are really inside the reference box
    const contacts = [];
    points.forEach(function (p) {
      const depth = -dot([p[0] - faceCenter[0], p[1] - faceCenter[1]], faceNormal);
      if (depth >= 0) contacts.push({ x: p[0], y: p[1], depth });
    });
    return contacts.length ? { normal, contacts } : null;
  }

  // ----- Push two touching boxes apart, with bounce and friction -----
  function pushApart(a, b, hit) {
    const n = hit.normal;
    hit.contacts.forEach(function (contact) {
      const ra = [contact.x - a.x, contact.y - a.y];
      const rb = [contact.x - b.x, contact.y - b.y];
      const relative = [
        b.vx - b.spin * rb[1] - (a.vx - a.spin * ra[1]),
        b.vy + b.spin * rb[0] - (a.vy + a.spin * ra[0]),
      ];
      const closing = dot(relative, n);
      if (closing > 0) return; // already moving apart
      const weight = a.inverseMass + b.inverseMass + cross(ra, n) ** 2 * a.inverseTurn + cross(rb, n) ** 2 * b.inverseTurn;
      const bounce = closing < -60 ? BOUNCE : 0; // slow touches don't bounce, so the pile settles
      const push = (-(1 + bounce) * closing) / weight / hit.contacts.length;
      applyPush(a, b, ra, rb, [n[0] * push, n[1] * push]);

      // Friction: slows the sliding along the touching sides
      const slide = [relative[0] - n[0] * closing, relative[1] - n[1] * closing];
      const slideSpeed = Math.hypot(slide[0], slide[1]);
      if (slideSpeed < 0.0001) return;
      const t = [slide[0] / slideSpeed, slide[1] / slideSpeed];
      const tWeight = a.inverseMass + b.inverseMass + cross(ra, t) ** 2 * a.inverseTurn + cross(rb, t) ** 2 * b.inverseTurn;
      const hold = Math.min(slideSpeed / tWeight / hit.contacts.length, push * FRICTION);
      applyPush(a, b, ra, rb, [-t[0] * hold, -t[1] * hold]);
    });
  }

  function applyPush(a, b, ra, rb, impulse) {
    a.vx -= impulse[0] * a.inverseMass; a.vy -= impulse[1] * a.inverseMass;
    a.spin -= cross(ra, impulse) * a.inverseTurn;
    b.vx += impulse[0] * b.inverseMass; b.vy += impulse[1] * b.inverseMass;
    b.spin += cross(rb, impulse) * b.inverseTurn;
  }

  // ----- The page: the icons, and the floor and walls -----
  const icons = [...toolLayer.querySelectorAll(".tool")];
  let boxes = [];          // one box for each icon, in the same order
  let walls = [];
  let width = 0, height = 0, iconSize = 0;
  let dropped = 0;         // how many icons have started falling

  // The icons stay inside the screen: its sides, its bottom, and (once they have fallen in) its top
  let ceiling = null;
  function measurePage() {
    width = page.clientWidth;
    height = Math.min(page.clientHeight, window.innerHeight);
    iconSize = icons[0].offsetWidth;
    walls = [
      makeBox(width / 2, height + WALL, width * 2, WALL, true),  // floor: the bottom of the screen
      makeBox(-WALL, 0, WALL, height * 50, true),                // left, very tall so a throw can't go over it
      makeBox(width + WALL, 0, WALL, height * 50, true),         // right
    ];
    ceiling = makeBox(width / 2, -WALL, width * 2, WALL, true);  // top of the screen
  }

  // A new icon starts above the top of the page, somewhere across it, a little turned
  function dropIcon(index) {
    const icon = icons[index];
    const halfWidth = icon.offsetWidth / 2, halfHeight = icon.offsetHeight / 2;
    const box = makeBox(
      halfWidth + Math.random() * (width - halfWidth * 2),
      -halfHeight * 2 - Math.random() * height * 0.3,
      halfWidth, halfHeight, false
    );
    box.angle = (Math.random() - 0.5) * 0.8;
    box.spin = (Math.random() - 0.5) * 3;
    boxes[index] = box;
    icon.classList.add("is-falling");
    dropped = Math.max(dropped, index + 1);
  }

  // ----- Picking an icon up -----
  let held = null; // { index, pointerId, grabX, grabY (on the icon), toX, toY (the pointer) }

  function pagePoint(event) {
    const area = page.getBoundingClientRect();
    return [event.clientX - area.left, event.clientY - area.top];
  }

  icons.forEach(function (icon, index) {
    icon.addEventListener("pointerdown", function (event) {
      const box = boxes[index];
      if (!box) return;
      event.preventDefault();
      icon.setPointerCapture(event.pointerId);
      const [px, py] = pagePoint(event);
      // Where on the icon it was grabbed, in the icon's own turned directions
      const [ax0, ax1] = axesOf(box);
      const offset = [px - box.x, py - box.y];
      held = { index, pointerId: event.pointerId, grabX: dot(offset, ax0), grabY: dot(offset, ax1), toX: px, toY: py };
      icon.classList.add("is-held");
      startLoop();
    });
    icon.addEventListener("pointermove", function (event) {
      if (!held || held.pointerId !== event.pointerId) return;
      [held.toX, held.toY] = pagePoint(event);
    });
    function letGo(event) {
      if (!held || held.pointerId !== event.pointerId) return;
      icon.classList.remove("is-held");
      held = null; // it keeps its speed, so a quick drag throws it
    }
    icon.addEventListener("pointerup", letGo);
    icon.addEventListener("pointercancel", letGo);
  });

  // The held icon follows the pointer: the grabbed spot is pulled toward it
  function followPointer() {
    if (!held) return;
    const box = boxes[held.index];
    const [ax0, ax1] = axesOf(box);
    const grab = [ax0[0] * held.grabX + ax1[0] * held.grabY, ax0[1] * held.grabX + ax1[1] * held.grabY];
    const pull = [held.toX - (box.x + grab[0]), held.toY - (box.y + grab[1])];
    box.vx = pull[0] * 18;
    box.vy = pull[1] * 18;
    // Not faster than a strong throw
    const speed = Math.hypot(box.vx, box.vy);
    const fastest = height * MAX_THROW;
    if (speed > fastest) { box.vx *= fastest / speed; box.vy *= fastest / speed; }
    // It hangs from the grabbed spot: it turns so that spot is above its middle
    box.spin = box.spin * 0.9 - (grab[0] / (iconSize * iconSize)) * 12;
  }

  // ----- One step of the world -----
  function step() {
    const pull = GRAVITY * height;
    followPointer();
    const moving = boxes.filter(Boolean);
    moving.forEach(function (box) {
      box.vy += pull * STEP;
      box.spin *= 0.995;
    });

    // Find every touching pair once, then push them apart a few rounds
    const hits = [];
    moving.forEach(function (box) { box.isTouching = false; });
    moving.forEach(function (box, i) {
      for (let j = i + 1; j < moving.length; j += 1) {
        const other = moving[j];
        const near = (box.halfWidth + other.halfWidth) * 1.5;
        if (Math.abs(box.x - other.x) > near || Math.abs(box.y - other.y) > near) continue;
        const hit = touching(box, other);
        if (hit) { hits.push([box, other, hit]); box.isTouching = other.isTouching = true; }
      }
      // The top of the screen counts only after the icon has fallen all the way in
      if (!box.isInside && box.y - box.halfHeight * 1.5 > 0) box.isInside = true;
      (box.isInside ? walls.concat([ceiling]) : walls).forEach(function (wall) {
        const hit = touching(wall, box);
        if (hit) { hits.push([wall, box, hit]); box.isTouching = true; }
      });
    });
    for (let round = 0; round < SOLVER_ROUNDS; round += 1) {
      hits.forEach(function ([a, b, hit]) { pushApart(a, b, hit); });
    }

    moving.forEach(function (box) {
      box.x += box.vx * STEP;
      box.y += box.vy * STEP;
      box.angle += box.spin * STEP;
      // If an icon still gets out of the page somehow, it falls in again from the top
      if (box.x < 0 || box.x > width || box.y > height + box.halfHeight * 2) {
        box.x = box.halfWidth + Math.random() * (width - box.halfWidth * 2);
        box.y = -box.halfHeight * 2;
        box.vx = 0; box.vy = 0;
        box.isInside = false;
      }
    });

    // Fix what still overlaps, a little at a time
    hits.forEach(function ([a, b, hit]) {
      const deepest = Math.max(...hit.contacts.map((c) => c.depth));
      const amount = Math.max(deepest - ALLOWED_OVERLAP, 0) * PUSH_APART / (a.inverseMass + b.inverseMass);
      a.x -= hit.normal[0] * amount * a.inverseMass; a.y -= hit.normal[1] * amount * a.inverseMass;
      b.x += hit.normal[0] * amount * b.inverseMass; b.y += hit.normal[1] * amount * b.inverseMass;
    });

    // Very slow icons that rest on something stop completely, so the pile doesn't tremble
    moving.forEach(function (box, index) {
      if (held && boxes[held.index] === box) return;
      if (box.isTouching && Math.abs(box.vx) < 2 && Math.abs(box.vy) < 2 && Math.abs(box.spin) < 0.02) {
        box.vx = 0; box.vy = 0; box.spin = 0;
      }
    });
  }

  function draw() {
    boxes.forEach(function (box, index) {
      if (!box) return;
      const icon = icons[index];
      icon.style.transform =
        "translate(" + (box.x - box.halfWidth).toFixed(1) + "px, " + (box.y - box.halfHeight).toFixed(1) + "px) " +
        "rotate(" + box.angle.toFixed(4) + "rad)";
    });
  }

  // Everything has stopped (and nothing is held or still to fall): the loop can rest
  function isAtRest() {
    if (held || dropped < icons.length) return false;
    return boxes.every((box) => box.vx === 0 && box.vy === 0 && box.spin === 0);
  }

  let running = false, lastTime = 0, leftover = 0;
  function loop(now) {
    leftover += Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    while (leftover >= STEP) { step(); leftover -= STEP; }
    draw();
    if (isAtRest()) { running = false; return; }
    requestAnimationFrame(loop);
  }
  function startLoop() {
    if (running) return;
    running = true;
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  // ----- Start -----
  measurePage();

  if (toolsReduceMotion) {
    // No falling: the pile is worked out at once, and the icons simply appear in it
    icons.forEach((icon, index) => dropIcon(index));
    for (let i = 0; i < 1200; i += 1) step();
    draw();
  } else {
    // Wait until the page has opened (after the loading screen or the page change), then a second more
    const opened = function () {
      const root = document.documentElement.classList;
      return !root.contains("is-loading") && !root.contains("is-arriving");
    };
    const waitForPage = setInterval(function () {
      if (!opened()) return;
      clearInterval(waitForPage);
      icons.forEach(function (icon, index) {
        setTimeout(function () { dropIcon(index); startLoop(); }, DROP_AFTER + index * DROP_GAP);
      });
    }, 100);
  }

  // A new screen size: new floor and walls, and the icons are kept inside
  window.addEventListener("resize", function () {
    measurePage();
    boxes.forEach(function (box) {
      if (!box) return;
      box.x = Math.min(Math.max(box.x, box.halfWidth), width - box.halfWidth);
      box.y = Math.min(box.y, height - box.halfHeight);
      box.vx = 0; box.vy = 1;
    });
    startLoop();
  });
}

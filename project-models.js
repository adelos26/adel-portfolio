// The objects on the Virtual Wandering page.
// Five small models turn in a row (short clips). A click on one brings it up into the big frame,
// where it grows in and can be turned with the mouse or a finger (three.js, in vendor/three).
// People who turned off animations see still pictures, and the big model doesn't turn by itself.

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const rootStyle = getComputedStyle(document.documentElement);
function cssColor(name) { return new THREE.Color(rootStyle.getPropertyValue(name).trim()); }

// ----- The small models: a clip of each one turning -----
const picks = document.querySelectorAll(".model-pick");

function setClip(video, model) {
  video.poster = "images/models/" + model + "-clay.jpg";
  if (reduceMotion) return; // the picture only
  video.src = "videos/models/" + model + "-clay.mp4";
  video.play().catch(function () {});
}
picks.forEach(function (pick) { setClip(pick.querySelector("video"), pick.dataset.model); });

// ----- The big frame -----
const stage = document.querySelector(".model-stage");
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
stage.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = cssColor("--color-black");
scene.add(new THREE.HemisphereLight(0xffffff, 0x332233, 1.4)); // soft light from above
const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
keyLight.position.set(2, 3, 2);
scene.add(keyLight);
const backLight = new THREE.DirectionalLight(cssColor("--color-model-light"), 1.2); // pink, from behind
backLight.position.set(-3, 1, -2);
scene.add(backLight);

const camera = new THREE.PerspectiveCamera(30, 2, 0.01, 100);
camera.position.set(0, 0.3, 0.95);

// Turning by dragging; no zoom, so the page still scrolls normally
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;
controls.enableDamping = true;
controls.autoRotate = !reduceMotion; // it turns slowly by itself until it's dragged
controls.autoRotateSpeed = 1.5;

const clay = new THREE.MeshStandardMaterial({ color: cssColor("--color-model-clay"), roughness: 0.55, side: THREE.DoubleSide });

const loader = new GLTFLoader();
const loadedModels = {}; // each model is loaded once
let shownModel = null;   // the one in the big frame

// Growing in: 0.8 seconds, starting fast and settling slowly (the site's "reveal" timing)
const GROW_TIME = parseFloat(rootStyle.getPropertyValue("--speed-reveal")) * 1000 || 800;
let growStart = 0;
let growing = false;
function easeOut(t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }

// Each model: centered, the same size as the others, in clay
function prepareModel(gltf) {
  const holder = new THREE.Group();
  const model = gltf.scene;
  const box = new THREE.Box3().setFromObject(model);
  model.position.sub(box.getCenter(new THREE.Vector3()));
  holder.userData.size = 2 / box.getSize(new THREE.Vector3()).length(); // 1 unit across from the middle
  holder.scale.setScalar(holder.userData.size);
  model.traverse(function (part) {
    if (!part.isMesh) return;
    if (!part.geometry.attributes.normal) part.geometry.computeVertexNormals();
    part.material = clay;
  });
  holder.add(model);
  return holder;
}

function showModel(name) {
  function place(holder) {
    if (shownModel) scene.remove(shownModel);
    shownModel = holder;
    scene.add(holder);
    growing = !reduceMotion;
    growStart = performance.now();
    if (!growing) holder.scale.setScalar(holder.userData.size);
  }
  if (loadedModels[name]) { place(loadedModels[name]); return; }
  loader.load("models/" + name + ".glb", function (gltf) {
    loadedModels[name] = prepareModel(gltf);
    place(loadedModels[name]);
  });
}

// A click on a small model: it becomes the chosen one and grows into the big frame
picks.forEach(function (pick) {
  pick.addEventListener("click", function () {
    picks.forEach(function (other) {
      other.classList.toggle("is-active", other === pick);
      other.setAttribute("aria-pressed", other === pick ? "true" : "false");
    });
    showModel(pick.dataset.model);
  });
});

// The model always fits the frame, wide (computer) or square (phone)
function fitFrame() {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  const halfView = Math.min(THREE.MathUtils.degToRad(15), Math.atan(Math.tan(THREE.MathUtils.degToRad(15)) * camera.aspect));
  camera.position.setLength(0.8 / Math.sin(halfView));
  camera.updateProjectionMatrix();
}
new ResizeObserver(fitFrame).observe(stage);

// Drawing: only while the frame is on screen, so the page stays light
let onScreen = false;
new IntersectionObserver(function (entries) { onScreen = entries[0].isIntersecting; }).observe(stage);

renderer.setAnimationLoop(function (now) {
  if (!onScreen) return;
  if (shownModel && growing) {
    const t = Math.min(1, (now - growStart) / GROW_TIME);
    shownModel.scale.setScalar(shownModel.userData.size * (0.5 + 0.5 * easeOut(t)));
    if (t >= 1) growing = false;
  }
  controls.update();
  renderer.render(scene, camera);
});

showModel(document.querySelector(".model-pick.is-active").dataset.model);

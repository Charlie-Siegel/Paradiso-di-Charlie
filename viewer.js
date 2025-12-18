// =======================================
// viewer.js – GLB Viewer (GitHub /models)
// =======================================

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

console.log("viewer.js läuft");

// -------------------------------------------------
// Szene
// -------------------------------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

// -------------------------------------------------
// Kamera
// -------------------------------------------------
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);

// -------------------------------------------------
// Renderer
// -------------------------------------------------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// -------------------------------------------------
// Licht
// -------------------------------------------------
scene.add(new THREE.AmbientLight(0xffffff, 0.8));

const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(10, 15, 10);
scene.add(dirLight);

// -------------------------------------------------
// OrbitControls
// -------------------------------------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;

controls.enableZoom = true;
controls.enablePan = true;
controls.enableRotate = true;

controls.mouseButtons = {
  LEFT: THREE.MOUSE.ROTATE,
  MIDDLE: THREE.MOUSE.DOLLY,
  RIGHT: THREE.MOUSE.PAN
};

controls.target.set(0, 0, 0);
controls.update();

// -------------------------------------------------
// GLB Loader
// -------------------------------------------------
const loader = new GLTFLoader();
let currentModel = null;

// -------------------------------------------------
// GLB aus /models laden
// -------------------------------------------------
function loadModelFromRepo(filename) {

  if (currentModel) {
    scene.remove(currentModel);
    currentModel = null;
  }

  const path = "./models/" + filename;

  loader.load(
    path,
    (gltf) => {
      const model = gltf.scene;
      scene.add(model);
      currentModel = model;

      // --- Modell zentrieren ---
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());

      model.position.sub(center);

      // --- Kamera passend setzen ---
      camera.position.set(
        size * 0.8,
        size * 0.6,
        size * 0.8
      );
      camera.lookAt(0, 0, 0);

      controls.target.set(0, 0, 0);
      controls.update();

      console.log("GLB geladen:", filename);
    },
    undefined,
    (error) => {
      console.error("GLB Ladefehler:", error);
    }
  );
}

// -------------------------------------------------
// Buttons verbinden
// -------------------------------------------------
document.querySelectorAll("#modelUI button").forEach(btn => {
  btn.addEventListener("click", () => {
    const file = btn.dataset.model;
    loadModelFromRepo(file);
  });
});

// -------------------------------------------------
// Render-Loop
// -------------------------------------------------
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// -------------------------------------------------
// Resize
// -------------------------------------------------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

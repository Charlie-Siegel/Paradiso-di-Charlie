// =======================================
// viewer.js – Paradiso di Charlie
// Blender-Collections wie Ebenen
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
  3000
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
scene.add(new THREE.AmbientLight(0xffffff, 0.7));

const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(10, 15, 10);
scene.add(dirLight);

// -------------------------------------------------
// OrbitControls (Maus + Touch)
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
// GLB laden
// -------------------------------------------------
const loader = new GLTFLoader();
let modelRoot = null;

loader.load(
  "./models/magazzino2.glb",   // ggf. anpassen
  (gltf) => {
    modelRoot = gltf.scene;
    scene.add(modelRoot);

    // --- Modell zentrieren ---
    const box = new THREE.Box3().setFromObject(modelRoot);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    modelRoot.position.sub(center);

    // --- Kamera ausrichten ---
    camera.position.set(size * 0.8, size * 0.6, size * 0.8);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();

    // Debug: Collections ausgeben
    modelRoot.traverse(obj => {
      if (obj.isGroup && obj.name) {
        console.log("Collection:", obj.name);
      }
    });

    console.log("GLB geladen");
  },
  undefined,
  (error) => {
    console.error("GLB Ladefehler:", error);
  }
);

// -------------------------------------------------
// Blender-Collection ein/ausblenden
// -------------------------------------------------
function toggleCollection(collectionName, visible) {
  if (!modelRoot) return;

  modelRoot.traverse(obj => {
    if (obj.name === collectionName) {
      obj.visible = visible;
    }
  });
}

// -------------------------------------------------
// UI mit Collections verbinden
// -------------------------------------------------
document.querySelectorAll("#layerUI input").forEach(cb => {
  cb.addEventListener("change", () => {
    toggleCollection(cb.dataset.layer, cb.checked);
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



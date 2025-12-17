// =======================================
// viewer.js – Paradiso di Charlie
// Varianten-Viewer (nur eine sichtbar)
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

// explizite Mausbelegung (Laptop intuitiv)
controls.mouseButtons = {
  LEFT: THREE.MOUSE.ROTATE,
  MIDDLE: THREE.MOUSE.DOLLY,
  RIGHT: THREE.MOUSE.PAN
};

controls.target.set(0, 0, 0);
controls.update();

// -------------------------------------------------
// Varianten-Konfiguration
// -------------------------------------------------
const variants = {
  A: "./models/rundhaus_A.glb",
  B: "./models/rundhaus_B.glb",
  C: "./models/rundhaus_C.glb"
};

const variantModels = {};
let activeVariant = null;

// -------------------------------------------------
// GLB Loader
// -------------------------------------------------
const loader = new GLTFLoader();

// -------------------------------------------------
// Variante laden (einmalig)
// -------------------------------------------------
Object.entries(variants).forEach(([key, path]) => {
  loader.load(
    path,
    (gltf) => {
      const model = gltf.scene;

      // --- Modell zentrieren ---
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      model.position.sub(center);
      model.visible = false;

      scene.add(model);
      variantModels[key] = {
        model,
        size: size.length()
      };

      console.log("Variante geladen:", key);

      // erste geladene Variante aktivieren
      if (!activeVariant) {
        setActiveVariant(key);
      }
    },
    undefined,
    (error) => {
      console.error("GLB Ladefehler (" + key + "):", error);
    }
  );
});

// -------------------------------------------------
// Aktive Variante setzen (NUR EINE sichtbar)
// -------------------------------------------------
function setActiveVariant(key) {
  Object.keys(variantModels).forEach(k => {
    variantModels[k].model.visible = false;
  });

  const entry = variantModels[key];
  if (!entry) return;

  entry.model.visible = true;
  activeVariant = key;

  // Kamera sinnvoll positionieren
  const d = entry.size;
  camera.position.set(d * 0.8, d * 0.6, d * 0.8);
  camera.lookAt(0, 0, 0);

  controls.target.set(0, 0, 0);
  controls.update();

  console.log("Aktive Variante:", key);
}

// -------------------------------------------------
// UI-Buttons verbinden
// -------------------------------------------------
document.querySelectorAll("#variantUI button").forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.variant;
    if (variantModels[key]) {
      setActiveVariant(key);
    }
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

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(5, 5, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Licht
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dir = new THREE.DirectionalLight(0xffffff, 0.6);
dir.position.set(5, 10, 7);
scene.add(dir);

// Daten
let modelRoot = null;
let layerMap = {};

// Config laden
fetch("config.json")
  .then(r => r.json())
  .then(cfg => loadModel(cfg));

function loadModel(cfg) {
  const loader = new GLTFLoader();
  loader.load(cfg.model, gltf => {
    modelRoot = gltf.scene;
    scene.add(modelRoot);

    // Layer erfassen
    modelRoot.traverse(obj => {
      if (!obj.isMesh) return;
      cfg.layers.forEach(layer => {
        if (obj.name.includes(layer)) {
          layerMap[layer] ??= [];
          layerMap[layer].push(obj);
        }
      });
    });

    setupUI();
  });
}

// UI Layer-Schalter
function setupUI() {
  document.querySelectorAll("input[data-layer]").forEach(cb => {
    cb.addEventListener("change", () => {
      const layer = cb.dataset.layer;
      (layerMap[layer] || []).forEach(obj => {
        obj.visible = cb.checked;
      });
    });
  });
}

// Renderloop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

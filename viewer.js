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

function fitCameraToObject(camera, controls, object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

  cameraZ *= 1.5; // Abstandsfaktor

  camera.position.set(
    center.x + cameraZ,
    center.y + cameraZ,
    center.z + cameraZ
  );

  camera.near = cameraZ / 100;
  camera.far = cameraZ * 100;
  camera.updateProjectionMatrix();

  controls.target.copy(center);
  controls.update();
}


function loadModel(cfg) {
  const loader = new GLTFLoader();
loader.load(
  cfg.model,
  gltf => {
    console.log("GLTF geladen:", gltf);

    modelRoot = gltf.scene;
    scene.add(modelRoot);

    console.log("Kinder im Modell:", modelRoot.children.length);

    // DEBUG: roter Würfel zum Vergleich
    const testGeo = new THREE.BoxGeometry(1, 1, 1);
    const testMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const testCube = new THREE.Mesh(testGeo, testMat);
    testCube.position.set(0, 0.5, 0);
    scene.add(testCube);

    fitCameraToObject(camera, controls, modelRoot);
    setupUI();
  },
  undefined,
  error => {
    console.error("GLTF Fehler:", error);
  }
);



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


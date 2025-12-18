import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// -------------------------------------------------
// Szene, Kamera, Renderer
// -------------------------------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Licht
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const light = new THREE.DirectionalLight(0xffffff, 1.0);
light.position.set(10, 15, 10);
scene.add(light);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.mouseButtons = {
  LEFT: THREE.MOUSE.ROTATE,
  MIDDLE: THREE.MOUSE.DOLLY,
  RIGHT: THREE.MOUSE.PAN
};
controls.update();

// Loader
const loader = new GLTFLoader();
let currentModel = null;

// -------------------------------------------------
// Modell laden
// -------------------------------------------------
function loadModel(filename) {

  if (currentModel) {
    scene.remove(currentModel);
  }

  loader.load("./models/" + filename, gltf => {
    currentModel = gltf.scene;
    scene.add(currentModel);

    const box = new THREE.Box3().setFromObject(currentModel);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    currentModel.position.sub(center);

    camera.position.set(size * 0.8, size * 0.6, size * 0.8);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();
  });
}

// -------------------------------------------------
// models.json laden → Buttons erzeugen
// -------------------------------------------------
fetch("./models/models.json")
  .then(res => res.json())
  .then(list => {
    const ui = document.getElementById("modelUI");

    list.forEach((entry, index) => {
      const btn = document.createElement("button");
      btn.textContent = entry.label;
      btn.onclick = () => loadModel(entry.file);
      ui.appendChild(btn);

      // erstes Modell automatisch laden
      if (index === 0) {
        loadModel(entry.file);
      }
    });
  });

// -------------------------------------------------
// Render Loop
// -------------------------------------------------
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

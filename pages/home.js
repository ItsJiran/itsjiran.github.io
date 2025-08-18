import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import Stats from "three/examples/jsm/libs/stats.module";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
loader.setDRACOLoader(dracoLoader);

let models = [];
let lights = [];
let animates = [];

// Shaders for post-processing effects
const GrayscaleShader = {
  uniforms: {
    tDiffuse: { value: null },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      float l = (0.299 * texel.r + 0.587 * texel.g + 0.114 * texel.b);
      gl_FragColor = vec4(l, l, l, texel.a);
    }
  `,
};

const PixelationShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
    pixelSize: { value: 8.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float pixelSize;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv;
      vec2 pixelSizeUV = vec2(pixelSize) / resolution;
      vec2 pixelatedUV = floor(uv / pixelSizeUV) * pixelSizeUV;
      gl_FragColor = texture2D(tDiffuse, pixelatedUV);
    }
  `,
};

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Import custom modules
import * as routing from "/scripts/routing";
import { appState } from "/scripts/state_manager";
import * as promises from "/scripts/vite/promises";

// Three.js main components
let scene, camera, renderer, composer, controls, model, stats, gizmo;

let container;
let isControlling = false;

// Initialize the Three.js scene and components
function setupScene() {
  container = document.getElementById("three-container");
  if (!container) {
    console.error("Three.js container not found!");
    return;
  }

  scene = new THREE.Scene();
  // scene.add(new THREE.AxesHelper(5));

  camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000,
  );

  // camera.position.set(5, 10, 0);
  camera.position.set(0.8, 1.4, 1.0);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // Stats for performance monitoring
  // stats = new Stats();
  // container.appendChild(stats.dom);
}

// Setup lighting
function setupLighting() {
  // const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  // scene.add(ambientLight);
  // ambientLight.position.set(6, -2, 0);

  const pointLight = new THREE.PointLight(0xffffff, 10);
  pointLight.position.set(3.7, 4.6, 3);

  scene.add(pointLight);
  lights.push(pointLight);

  animates.push(setupLimitedRotation(pointLight));
  animateFloating(pointLight);

  // var control = createTransformControls(
  //   pointLight,
  //   scene,
  //   camera,
  //   container,
  //   true,
  // );
  // animates.push(setupLimitedRotation(control.getHelper()));

  const pointLight3 = new THREE.PointLight(0xffffff, 5);
  pointLight3.position.set(2.7, 4.6, -3);

  scene.add(pointLight3);
  lights.push(pointLight3);

  animates.push(setupLimitedRotation(pointLight3));
  animateFloating(pointLight3);

  // var control = createTransformControls(
  //   pointLight3,
  //   scene,
  //   camera,
  //   container,
  //   true,
  // );
  // animates.push(setupLimitedRotation(control.getHelper()));

  const pointLight2 = new THREE.PointLight(0xb1e1ff, 5);
  pointLight2.position.set(8.1, 2.1, -1.9);

  scene.add(pointLight2);
  lights.push(pointLight2);

  animates.push(setupLimitedRotation(pointLight2));
  animateFloating(pointLight2);

  // var control2 = createTransformControls(
  //   pointLight2,
  //   scene,
  //   camera,
  //   container,
  //   true,
  // );
  // animates.push(setupLimitedRotation(control2.getHelper()));

  // var control = createTransformControls(ambientLight, scene, camera, container);
  // animates.push(setupLimitedRotation(control.getHelper()));

  // Create a new AmbientLight
  // The constructor takes three arguments: sky color, ground color, and intensity.
  const skyColor = 0xb1e1ff; // A light blue color for the sky
  const groundColor = 0xb97a20; // A brownish color for the ground
  const intensity = 1; // A value between 0 and 1, with 1 being full intensity

  const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
  // hemiLight.position.set(6, -2, 0);
  // // var control = createTransformControls(
  // //   hemiLight,
  // //   scene,
  // //   camera,
  // //   container,
  // //   true,
  // // );
  // // animates.push(setupLimitedRotation(control.getHelper()));

  // // Add the light to the scene
  // scene.add(hemiLight);
}

function createTransformControls(
  object,
  scene,
  camera,
  domElement,
  isLog = false,
) {
  // Check if the provided object is a valid THREE.Object3D
  if (!object || !object.isObject3D) {
    console.error(
      "Invalid object provided. The object must be a THREE.Object3D instance.",
    );
    return null;
  }

  // Create the TransformControls instance
  const controls = new TransformControls(camera, domElement);

  // Add the controls gizmo to the scene
  scene.add(controls.getHelper());

  // Attach the controls to the specified object
  controls.attach(object);

  // Optional: Add a 'change' event listener to log the object's properties
  controls.addEventListener("change", () => {
    // You can uncomment these lines to see the live updates in your console
    if (isLog) {
      console.log("--- Object Properties ---");
      console.log("Position:", object.position);
      console.log("Rotation:", object.rotation);
      console.log("Scale:", object.scale);
    }
  });

  document.addEventListener("keydown", function (event) {
    switch (event.key) {
      case "r":
        controls.setMode("rotate");
        break;
      case "s":
        controls.setMode("scale");
        break;
    }
  });

  // Optional: Listen for the 'dragging-changed' event to disable OrbitControls while transforming
  controls.addEventListener("dragging-changed", (event) => {
    // This is useful if you have OrbitControls enabled, as it prevents camera movement
    // while the user is actively using the TransformControls.
    // If you have a global OrbitControls instance, you can do this:
    // orbitControls.enabled = !event.value;
  });

  return controls;
}

// Setup orbit controls
function setupControls() {
  gizmo = new TransformControls(camera, renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 1, 0);
  controls.minDistance = 8;
  controls.maxDistance = 16;
  controls.enablePan = false;
  controls.enableZoom = false; // Disable zoom by default
  controls.enableRotate = false; // Disable zoom by default

  controls.maxPolarAngle = Math.PI / 2; // (90 degrees)

  // Limit horizontal rotation to a 90-degree arc
  controls.minAzimuthAngle = -Math.PI / 4; // (-45 degrees)
  controls.maxAzimuthAngle = Math.PI / 4; // (45 degrees)

  // Call update() after changing any control properties
  controls.update();
}

// Setup post-processing effects
function setupPostProcessing() {
  composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // const grayscalePass = new ShaderPass(GrayscaleShader);
  // composer.addPass(grayscalePass);

  // You can uncomment this to enable the pixelation effect
  // const pixelationPass = new ShaderPass(PixelationShader);
  // composer.addPass(pixelationPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);
}

// Load a 3D model
async function loadModelFBX(modelPath, postProcessFBX = null) {
  return new Promise((resolve, reject) => {
    const fbxLoader = new FBXLoader();
    fbxLoader.load(
      modelPath,
      (fbx) => {
        if (postProcessFBX) postProcessFBX(fbx);

        scene.add(fbx);
        models.push(fbx);
        resolve(fbx);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.error("An error happened during model loading", error);
        reject(error);
      },
    );
  });
}

async function loadModelGLTF(modelPath, postProcess = null) {
  return new Promise((resolve, reject) => {
    loader.load(
      // The path to your glb file
      modelPath,
      // A callback function that runs when the model is loaded
      function (gltf) {
        if (postProcess) postProcess(gltf.scene);

        // Add the loaded scene to your Three.js scene
        models.push(gltf.scene);
        scene.add(gltf.scene);
        console.log("Model loaded successfully!");
        resolve(gltf);
      },
      // An optional function to track loading progress
      undefined,
      // A callback function that runs if there's an error loading the model
      function (error) {
        console.error("An error occurred:", error);
      },
    );
  });
}

// Handle window resizing
function onWindowResize() {
  if (!container || !camera || !renderer) return;

  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
  // composer.setSize(container.clientWidth, container.clientHeight);
}

function setupLimitedRotation(mesh) {
  const maxRotation = Math.PI / 7; // Max rotation of 45 degrees
  const easeFactor = 0.05; // How smoothly the object follows the mouse

  let mouse = { x: 0, y: 0 };
  const initialRotation = mesh.rotation.clone();

  // Set up the mouse listener
  window.addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (-(event.clientY / window.innerHeight) * 2 + 1) * -1;
  });

  // This function would be called inside your main animation loop
  const updateRotation = () => {
    const targetX = initialRotation.x + mouse.y * maxRotation;
    const targetY = initialRotation.y + mouse.x * maxRotation;

    // Smoothly interpolate the mesh's current rotation towards the target rotation
    mesh.rotation.x += (targetX - mesh.rotation.x) * easeFactor;
    mesh.rotation.y += (targetY - mesh.rotation.y) * easeFactor;
  };

  return updateRotation;
}

const animateFloating = (object, amplitude = 0.5, speed = 1) => {
  const initialY = object.position.y;
  object.userData.floating = {
    amplitude,
    speed,
    initialY,
  };
};

const updateFloating = (object) => {
  if (object.userData.floating) {
    const { amplitude, speed, initialY } = object.userData.floating;
    object.position.y =
      initialY + Math.sin(Date.now() * 0.001 * speed) * amplitude;
  }
};

// Main initialization function for Three.js
export async function InitThreeJS(resolve = null) {
  // Create a cube to see the effect of the light

  try {
    setupScene();
    setupLighting();
    setupControls();
    // setupPostProcessing();

    // Load the 3D model and wait for it to finish
    await loadModelGLTF("3d/test.compressed.glb", (fbx) => {
      // Center and scale the model
      const box = new THREE.Box3().setFromObject(fbx);
      const center = box.getCenter(new THREE.Vector3());

      const scaleFactor = 3;
      fbx.scale.set(scaleFactor, scaleFactor, scaleFactor);
      fbx.rotation.set(0, 6, 0);
    });

    // console.log(models);
    models[0].position.set(4, 2, 0);
    controls.target.copy(models[0].position);
    models[0].position.set(6, -0.5, 0);

    const float = animateFloating(models[0]);

    const updateModels0 = setupLimitedRotation(models[0]);
    animates.push(updateModels0);

    const size = 6;
    const divisions = 8;
    const colorCenterLine = "#5e5e5e"; // Red center line
    const colorGrid = "#5e5e5e";
    const gridHelper = new THREE.GridHelper(
      size,
      divisions,
      colorCenterLine,
      colorGrid,
    );
    gridHelper.position.set(6, -2, 0);
    scene.add(gridHelper);

    const updateGrid = setupLimitedRotation(gridHelper);
    animates.push(updateGrid);

    // Add resize listener
    window.addEventListener("resize", onWindowResize);

    // Start the animation loop

    const animate = () => {
      requestAnimationFrame(animate);

      if (controls) {
        controls.update();
      }

      if (stats) {
        stats.update();
      }

      for (var anime of animates) {
        anime();
      }

      // udpate lfoating
      updateFloating(models[0]);
      lights.forEach((child) => {
        updateFloating(child);
      });

      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    animate();

    if (resolve) resolve();
  } catch (error) {
    console.error("Failed to initialize Three.js:", error);
    if (resolve) resolve(); // Resolve even on error to not block the page
  }
}

// Initialize the main page with GSAP and Three.js
export async function InitPage(resolve = null) {
  // GSAP ScrollTrigger setup

  // ScrollTrigger.create({
  //   trigger: "#my-section",
  //   pin: true,
  //   start: "top top",
  //   endTrigger: "#container",
  //   end: "bottom bottom",
  //   markers: true,
  //   smooth: 1,
  //   onLeave: () => {
  //     gsap.set("#my-section", {
  //       position: "absolute",
  //       top: "0",
  //       bottom: 0,
  //     });
  //   },
  // });

  await InitThreeJS();
  // Acknowledge the request
  // Instead of a fixed timeout, we use requestAnimationFrame to wait for the browser to settle.
  // This is a more reliable and non-blocking way to ensure the CPU is ready for the next task.
  let framesToWait = 30;
  const waitForRender = () => {
    console.log("wait designated frame");
    if (framesToWait > 0) {
      framesToWait--;
      requestAnimationFrame(waitForRender);
    } else {
      // window.InitPageAnimation();
      if (resolve) resolve();
    }
  };
  requestAnimationFrame(waitForRender);

  // Initial position for the overlay, as GSAP needs a starting point.
  // This style is added dynamically so it doesn't interfere with Tailwind classes.
  const overlay = document.getElementById("page-transition-overlay");
  gsap.set(overlay, { y: "100vh" });
  const closeButton = document.getElementById("close-button");
  const newPageContent = document.getElementById("new-page-content");

  /**
   * Asynchronous function to handle the page transition.
   * It's triggered when an a tag with `data-page-link` is clicked.
   * @param {Event} event The click event object.
   */
  async function handlePageTransition(event) {
    // Prevent the default navigation behavior of the anchor tag
    event.preventDefault();

    // Get the overlay, loader, and content elements
    const loader = document.getElementById("skeleton-loader");

    // Get the target URL from the data-page-link attribute
    const url = event.currentTarget.getAttribute("data-page-link");
    // Use GSAP to animate the overlay up from the bottom of the screen
    // This makes the transition smooth and visually appealing
    gsap.to(overlay, {
      y: "0vh", // Move the overlay to the top of the screen
      duration: 0.8,
      ease: "power3.inOut",
      onStart: () => {
        window.lenis.stop();
        document.getElementsByTagName('html')[0].classList.add('overflow-y-hidden');
        // Immediately show the skeleton loader and clear any old content
        loader.classList.remove("hidden");
        newPageContent.classList.add("hidden");
        newPageContent.innerHTML = "";
      },
    });

    // Use a try-catch block for robust error handling during the fetch call
    try {
      // Fetch the HTML content from the specified URL
      const response = await fetch(url);

      // Check if the response was successful (status code 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Extract the HTML content as a string
      const htmlContent = await response.text();

      // Inject the fetched content into the new page content container
      newPageContent.innerHTML = htmlContent;

      // Hide the skeleton loader and show the new content
      loader.classList.add("hidden");
      newPageContent.classList.remove("hidden");
    } catch (error) {
      // Handle any errors that occur during the fetch
      console.error("Failed to fetch page content:", error);

      // Display a user-friendly error message
      newPageContent.innerHTML = `<div class="p-8 text-center text-red-400">
            <h2 class="text-2xl font-bold">Error Loading Page</h2>
            <p class="mt-2 text-red-300">Could not load the content from ${url}. Please try again.</p>
          </div>`;

      // Ensure the loader is hidden and content is shown
      loader.classList.add("hidden");
      newPageContent.classList.remove("hidden");
    }
  }

  /**
   * Function to close the overlay and return to the main page.
   */
  function closePage() {
    gsap.to(overlay, {
      y: "100vh", // Slide the overlay down and off the screen
      duration: 0.8,
      ease: "power3.inOut",
      onComplete: () => {
        // Clear the content after the transition is complete
        document.getElementsByTagName('html')[0].classList.remove('overflow-y-hidden');
        newPageContent.innerHTML = "";
        window.lenis.start();
      },
    });
  }

  // Find all the anchor tags with the `data-page-link` attribute
  const pageLinks = document.querySelectorAll("a[data-page-link]");

  // Loop through each link and add the event listener
  pageLinks.forEach((link) => {
    link.addEventListener("click", handlePageTransition);
  });

  // Add a click event listener to the new close button
  closeButton.addEventListener("click", closePage);

  // if (resolve) resolve();
}

// GSAP animations for page elements
export function InitPageAnimation() {
  console.log("Running home page animation.");

  gsap.fromTo(
    ".home-element",
    { opacity: 0, y: 150 },
    { opacity: 1, y: 0, duration: 1 },
  );
}

// Expose functions to the window object for global access
window.InitPage = InitPage;
window.InitPageAnimation = InitPageAnimation;

export async function render(container, resolve = null) {
  console.log('loading homeapge content..')
  await window.loadPage('/');

  console.log('initiating homeapge content..')
  await InitPage(resolve);
}
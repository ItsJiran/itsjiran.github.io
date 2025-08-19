// main.js

import { gsap } from "gsap";
import * as routing from "/scripts/routing";
import { appState } from "/scripts/state_manager";
import * as promises from "/scripts/vite/promises";

const loadingScreen = document.getElementById("loading-screen");
const appContent = document.getElementById("app");

const jsFilesToWatch = [
  // { src: "/scripts/routing.js", id: "routing-script" },
  // { src: "/scripts/other-utility.js", id: "other-utility-script" },
];

// Create an array of Promises to track the loading of each JS file
const jsFilePromises = jsFilesToWatch.map(
  (file) =>
    new Promise((resolve, reject) => {
      // Check if the script is already in the document
      if (document.getElementById(file.id)) {
        console.log(`${file.src} is already in the document.`);
        return resolve();
      }

      const script = document.createElement("script");
      script.id = file.id;
      script.src = file.src;
      script.onload = () => {
        console.log(`${file.src} is loaded.`);
        resolve();
      };
      script.onerror = () => {
        console.error(`${file.src} failed to load.`);
        reject(`${file.src} not found`);
      };
      document.body.appendChild(script);
    }),
);

// Chain the promises
const allWatchedPromises = [
  ...jsFilePromises,

  // add prosmises to loading the page
  new Promise((resolve) => {
    window.handleRouting(resolve);
  }),
];

promises
  .runPromisesSequentially(allWatchedPromises)
  .then(async () => {
    console.log("All dependencies loaded. Hiding loading screen.");

    const tl = gsap.timeline({
      onComplete: () => {
        // Once animation is complete, remove the overlay and allow scrolling
        loadingScreen.style.display = "none";
        document.body.style.overflow = "auto";
        window.InitPageAnimation();
      },
    });


    tl.to(
      document.getElementById('main-loading-svg'),
      {
        opacity: 0, // Fade in the main content
        duration: 1, // Animation duration
        ease: "power2.out", // Easing function
      },
      "-=50",
    );

    tl.to(
      document.getElementById('main-loading-finish-svg'),
      {
        opacity: 1, // Fade in the main content
        duration: 2, // Animation duration
        ease: "power2.out", // Easing function
      },
      "-=50",
    );

    // Animate the loading overlay to slide down
    tl.to(loadingScreen, {
      yPercent: 100, // Moves the element down by 100% of its own height
        delay:1,
        duration: 1.2, // Animation duration
      ease: "power3.inOut", // Easing function for smooth animation
    });

    // Animate the main content to fade in simultaneously
    tl.to(
      appContent,
      {
        opacity: 1, // Fade in the main content
        duration: 1, // Animation duration
        ease: "power2.out", // Easing function
      },
      "-=1",
    );

    // Show the main content
    appContent.classList.remove("hidden");

    const cursor = document.querySelector(".custom-cursor");

    // Mouse move event to update the cursor position
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });

    // Mouse down event to activate the click effect
    document.addEventListener("mousedown", () => {
      cursor.classList.add("active");
    });

    // Mouse up event to deactivate the click effect
    document.addEventListener("mouseup", () => {
      cursor.classList.remove("active");
    });

    const interactiveElements = document.querySelectorAll(
      "a:not(.custom-cursor), button, .clickable",
    ); // Select all interactive elements

    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("hover-effect");
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("hover-effect");
      });
    });
  })
  .catch((error) => {
    console.error("Failed to load some dependencies:", error);
    loadingScreen.innerHTML =
      '<span class="text-red-500">An error occurred during loading.</span>';
  });

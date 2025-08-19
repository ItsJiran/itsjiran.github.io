// main.js

import "lazysizes";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { appState } from "/scripts/state_manager";
import * as promises from "/scripts/vite/promises";
const loadingScreen = document.getElementById("loading-screen");
const appContent = document.getElementById("app");

const lenis = new Lenis({
  wheelMultiplier: 0.4, // This value controls the scroll speed.
  // ... other options
});
gsap.registerPlugin(ScrollTrigger);

window.lenis = lenis;

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

const sidebar = document.getElementById("menu-sidebar");
const sidebar_menu = document.getElementById("sidebar-button");
const sidebar_menu_close = document.getElementById("close-button-sidebar");

function openNavbar() {
  gsap.to(sidebar, {
    x: "0vw", // Slide the overlay down and off the screen
    duration: 0.8,
    ease: "power3.inOut",
  });
}

function closeNavbar() {
  gsap.to(sidebar, {
    x: "100vw", // Slide the overlay down and off the screen
    duration: 0.8,
    ease: "power3.inOut",
  });
}

gsap.set(sidebar, {
  x: "100vw", // Slide the overlay down and off the screen
  duration: 0.8,
  ease: "power3.inOut",
});

sidebar_menu_close.addEventListener("click", () => {
  closeNavbar();
});

sidebar_menu.addEventListener("click", () => {
  openNavbar();
});

function isTailwindLoaded() {
  const testElement = document.createElement("div");
  testElement.classList.add("flex");
  document.body.appendChild(testElement);
  const isFlex = getComputedStyle(testElement).display === "flex";
  document.body.removeChild(testElement);
  return isFlex;
}

// Array of JavaScript files to be dynamically loaded and watched
const jsFilesToWatch = [
  // { src: "/scripts/routing.js", id: "routing-script" },
  // { src: "/scripts/loading.js", id: "loading-script" },
  //   { src: "/scripts/other-utility.js", id: "other-utility-script" },
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

const coreDependencies = [
  
  // Watcher for GSAP
  new Promise((resolve, reject) => {
    if (gsap) {
      console.log("GSAP is loaded.");
      resolve();
    } else {
      console.error("GSAP failed to load.");
      reject("GSAP not found");
    }
  }),

  // Watcher for Tailwind CSS
  new Promise((resolve, reject) => {
    const checkTailwind = () => {
      if (isTailwindLoaded()) {
        console.log("Tailwind CSS is loaded.");
        resolve();
      } else {
        setTimeout(checkTailwind, 50); // Retry check
      }
    };
    checkTailwind();
  }),

  // Example: Wait for an external resource like an image
  new Promise((resolve) => {
    gsap.to(document.body, {
      opacity: 1,
      duration: 0,
      onComplete: resolve,
    });
  }),

];

// Combine all promises (JS files + core dependencies)
const allWatchedPromises = [...jsFilePromises, ...coreDependencies];

// Choose your execution method:
// Option 1: Run all promises concurrently (fastest for loading)
promises
  .runPromisesConcurrently(allWatchedPromises)
  .then(() => {
    console.log(
      "All dependencies loaded concurrently. Showing loading screen.",
    );

    document.body.style.opacity = "1";

    let mm = gsap.matchMedia();

    mm.add({
      // Tailwind's default breakpoints
      isSmall: "(min-width: 640px)",     // sm
      isMedium: "(min-width: 768px)",    // md
      isLarge: "(min-width: 1024px)",    // lg
      isXLarge: "(min-width: 1280px)",   // xl
      is2XLarge: "(min-width: 1536px)" , // 2xl
      isMobile: "(max-width: 639px)"     // Below sm
    }, (context) => {
      let { isSmall, isMedium, isLarge, isXLarge, is2XLarge, isMobile } = context.conditions;
    
      
      if(isSmall){
        ScrollTrigger.create({
          start: "top -100", // Change this value to adjust when the animation triggers
          end: 99999, // A large number to make sure it only triggers once
          onEnter: () => {
            navbar.classList.add("bg-[#101010]");
            navbar.classList.add("border");
          },
          onLeaveBack: () => {
            navbar.classList.remove("bg-[#101010]");
            navbar.classList.remove("border");
          },
        });
      }

      if(isMobile){
        ScrollTrigger.create({
          start: "top -100", // Change this value to adjust when the animation triggers
          end: 99999, // A large number to make sure it only triggers once
          onEnter: () => {
            gsap.to(navbar, { y: -20, duration: 0.5 });
            navbar.classList.add("bg-[#101010]");
            navbar.classList.add("border-b");
          },
          onLeaveBack: () => {
            gsap.to(navbar, { y: 0, duration: 0.5 });
            navbar.classList.remove("bg-[#101010]");
            navbar.classList.remove("border-b");
          },
        });
      }

    });



  })
  .catch((error) => {
    console.error("Failed to load some dependencies:", error);
    loadingScreen.innerHTML =
      '<span class="text-red-500">An error occurred during loading.</span>';
  });

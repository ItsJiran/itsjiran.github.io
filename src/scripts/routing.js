// main.js
import { appState } from "/scripts/state_manager";
import * as promises from "/scripts/vite/promises";

const app = document.getElementById("app");
const PAGE_SCRIPT_ID = "page-script";

const routes = {
  '/': () => import('/pages/home.js'),
  // '/about': () => import('src//pages/scripts/about.js'),
};

const display = {
  '/' : 'home.html'
}

async function handleRouting(resolve = null) {
  const path = window.location.pathname;
  const pageLoader = routes[path] || (() => import('/pages/404.js'));

  const { render } = await pageLoader();
  await render(document.getElementById('app'), resolve);
}

export async function runPageInit(path, resolve = null) {}

export async function loadPage(path, resolve = null) {
  const pageName = display[path] || display["404"];

  try {
    const response = await fetch(`/pages/display/${pageName}`);

    if (!response.ok) {
      throw new Error(`Failed to load page: ${response.statusText}`);
    }

    const htmlContent = await response.text();
    app.innerHTML = htmlContent;

    return await promises
      .runPromisesSequentially([])
      .then(() => {
        console.log(`Content for ${path} loaded.`);
        if (resolve) resolve();
      })
      .catch((error) => {
        console.error("Error loading page content:", error);
      });
  } catch (error) {
    app.innerHTML = `<h1 class="text-red-500 text-center">404 - Page Not Found</h1><p class="text-gray-400 text-center">${error.message}</p>`;
    console.error("Error loading page:", error);
    throw error;
  }
}

// Function to handle link clicks

window.addEventListener('popstate', handleRouting);

export function route(event) {
  event = event || window.event;
  event.preventDefault();
  window.history.pushState({}, "", event.target.href);
  // loadPage(window.location.pathname);
  handleRouting();
}

// window.addEventListener("popstate", () => {
//   loadPage(window.location.pathname);
// });

// Make the route function available globally
window.route = route;
window.loadPage = loadPage;
window.handleRouting = handleRouting;
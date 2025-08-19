// vite.config.js
import { defineConfig } from "vite";
import { viteStaticCopy } from 'vite-plugin-static-copy';

import tailwindcss from "@tailwindcss/vite"; // Import the Tailwind CSS Vite plugin
import { resolve } from 'path';


// The `plugins` array is now conditionally populated
let plugins = [tailwindcss];

// Check if the current mode is production
if (process.env.NODE_ENV === 'production') {
  plugins.push(
    viteStaticCopy({
      targets: [
        {
          src: 'pages/*.js', // This glob pattern finds all .js files in all subdirectories of 'src'
          dest: 'pages', // Copies them to the root of the 'dist' directory, maintaining their original folder structure
        },
        {
          src: 'pages/contents', // This glob pattern finds all .js files in all subdirectories of 'src'
          dest: 'pages', // Copies them to the root of the 'dist' directory, maintaining their original folder structure
        },
        {
          src: 'pages/display', // This glob pattern finds all .js files in all subdirectories of 'src'
          dest: 'pages', // Copies them to the root of the 'dist' directory, maintaining their original folder structure
        },
      ],
    }),
  );
}

export default defineConfig({
  root: resolve(__dirname, 'src'),
  publicDir: "public", // Vite looks for this folder inside the root, so it's 'src/public'
  build: {
    outDir: "./dist",
    rollupOptions: {
      // Define the entry point for the application.
      // Vite will bundle all dependencies starting from this file.
      input: {
        main: resolve(__dirname, 'src/index.html'),
        // home: resolve(__dirname, 'src/pages/home.js')
      },
    },
  },
  plugins: plugins,
});

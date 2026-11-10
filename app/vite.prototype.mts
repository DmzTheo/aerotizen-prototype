/// <reference types="node" />
// Builds the prototype's TV page: the real launcher (this folder is AeroTizen launcher 2.7.0 with the theme
// proposal applied), in its browser preview, into ../tv. Same compiler settings as vite.config.mts.
import preact from "@preact/preset-vite";
import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL("./", import.meta.url));
const source = path.join(root, "launcher");
const output = path.join(root, "..", "tv");
const backgrounds = path.join(root, "..", "backgrounds");

const prototypeAssets: Plugin = {
  name: "aerotizen-prototype-assets",
  apply: "build",
  async buildStart() {
    await rm(output, { recursive: true, force: true });
    // Sources, the TV service and the launcher's own docs (AGENTS.md, CHANGELOG.md) stay out of the page.
    const skipped = new Set([path.join(source, "src"), path.join(source, "service")]);
    const isDoc = (file: string) => path.dirname(file) === source && file.endsWith(".md");
    await cp(source, output, { recursive: true, filter: (file) => !skipped.has(file) && !isDoc(file) });
    // The animated Stage wallpaper is a plain script shared with backgrounds/test.html.
    await cp(path.join(backgrounds, "stage.js"), path.join(output, "js", "stage.js"));
    await mkdir(path.join(output, "licenses"), { recursive: true });
    await cp(path.join(root, "LICENSE"), path.join(output, "licenses/aerotizen.txt"));
    await cp(path.join(root, "node_modules/preact/LICENSE"), path.join(output, "licenses/preact.txt"));
    await cp(path.join(root, "node_modules/i18next/LICENSE"), path.join(output, "licenses/i18next.txt"));
    await cp(path.join(root, "node_modules/lucide-preact/LICENSE"), path.join(output, "licenses/lucide-preact.txt"));
  },
};

export default defineConfig({
  root: source,
  base: "./",
  publicDir: false,
  css: {
    transformer: "lightningcss",
    lightningcss: { targets: { chrome: 69 << 16 } },
  },
  plugins: [preact({ devToolsEnabled: false }), prototypeAssets],
  build: {
    target: ["chrome69", "es2018"],
    cssTarget: "chrome69",
    outDir: path.join(output, "js"),
    emptyOutDir: false,
    minify: true,
    lib: {
      entry: path.join(source, "src/prototype.ts"),
      name: "AeroTizenLauncher",
      formats: ["iife"],
      fileName: () => "launcher-ui.js",
      cssFileName: "launcher-ui",
    },
  },
});

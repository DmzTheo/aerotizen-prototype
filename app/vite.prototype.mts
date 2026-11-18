/// <reference types="node" />
// Builds the prototype's TV page: the launcher in its browser preview, with the proposals, into ../tv (or
// PROTOTYPE_OUT). Same compiler settings as vite.config.mts.
import preact from "@preact/preset-vite";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { build, defineConfig } from "vite";

import launcherBrowser from "./launcher-browser.json" with { type: "json" };

const root = fileURLToPath(new URL("./", import.meta.url));
const source = path.join(root, "launcher");
const output = process.env.PROTOTYPE_OUT ? path.resolve(process.env.PROTOTYPE_OUT) : path.join(root, "..", "tv");
const TV_CHROMIUM_MAJOR = launcherBrowser.chromiumMajor;
const TV_BROWSER_TARGET = "chrome" + TV_CHROMIUM_MAJOR;
// The page loads these two plain scripts before the launcher, as on the TV.
const RUNTIME_SCRIPTS = {
  "build-info.js": { entry: "buildInfo.ts", globalName: "AeroBuildInfo" },
  "launcher-diagnostics.js": { entry: "diagnostics/early.ts", globalName: "AeroTizenDiagnostics" },
} as const;

const compileRuntimeScript = async ({ entry, globalName }: { entry: string; globalName: string }) => {
  const result = await build({
    configFile: false,
    root,
    publicDir: false,
    logLevel: "silent",
    build: {
      write: false,
      target: [TV_BROWSER_TARGET, "es2018"],
      rolldownOptions: { output: { generatedCode: { preset: "es5", symbols: false } } },
      minify: true,
      lib: { entry: path.join(source, "src", entry), formats: ["iife"], name: globalName },
    },
  });
  const builds = Array.isArray(result) ? result : [result];
  const chunk = builds.flatMap((item) => ("output" in item ? item.output : [])).find((item) => item.type === "chunk");
  if (!chunk) {
    throw new Error("Runtime build produced no script: " + entry);
  }
  return chunk.code;
};

const prototypeAssets: Plugin = {
  name: "aerotizen-prototype-assets",
  apply: "build",
  async buildStart() {
    await rm(output, { recursive: true, force: true });
    // Sources, the TV service, a stray dependency folder and the launcher's own docs (AGENTS.md, CHANGELOG.md) stay
    // out of the page.
    const skipped = new Set(["src", "service", "node_modules"].map((name) => path.join(source, name)));
    const isDoc = (file: string) => path.dirname(file) === source && file.endsWith(".md");
    await cp(source, output, { recursive: true, filter: (file) => !skipped.has(file) && !isDoc(file) });
    await mkdir(path.join(output, "js"), { recursive: true });
    for (const [file, script] of Object.entries(RUNTIME_SCRIPTS)) {
      await writeFile(path.join(output, "js", file), await compileRuntimeScript(script));
    }
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
  // Vite's cache stays with the dependencies, out of the launcher folder that the page is copied from.
  cacheDir: path.join(root, "node_modules", ".vite-prototype"),
  css: {
    transformer: "lightningcss",
    lightningcss: { targets: { chrome: TV_CHROMIUM_MAJOR << 16 } },
  },
  plugins: [preact({ devToolsEnabled: false }), prototypeAssets],
  build: {
    target: [TV_BROWSER_TARGET, "es2018"],
    cssTarget: TV_BROWSER_TARGET,
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

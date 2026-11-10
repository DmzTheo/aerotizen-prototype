// Messages with the prototype shell. The TV page reports the settings that differ from a fresh start, the simulated
// TV and the panel's strings in the launcher's language; the shell writes them into its URL, so a link reproduces a
// setup. Only the page that embeds this one, on the same site, is talked to and listened to.
import { defaultTemperatureUnit } from "../platform/tizen/defaultTemperatureUnit";
import { createSettingsService } from "../services/createSettingsService";
import { resolveLanguage } from "../shared/i18n/catalogues";

import { prototypeState } from "./state";

const runtime = window.AeroTizen;
const embedded = window.parent !== window;
// A file:// page has an opaque origin, which postMessage cannot target; the source window is still checked.
const FILE = location.protocol === "file:";
const TARGET_ORIGIN = FILE ? "*" : location.origin;
const fromShell = (event: MessageEvent) =>
  embedded &&
  event.source === window.parent &&
  (FILE ? event.origin === "null" || event.origin === "file://" : event.origin === location.origin);

// What a fresh start would show: the same service, with nothing saved.
const memory = new Map<string, string>();
const fresh = createSettingsService({
  defaults: runtime.config.DEFAULTS,
  storageKey: "prototype.defaults",
  legacyStorageKeys: [],
  storage: { getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => void memory.set(key, value) },
  speedRange: runtime.config.SPEED,
  locale: {
    timeFormat: () => runtime.clock.defaultTimeFormat(),
    tempUnit: () =>
      defaultTemperatureUnit(navigator.languages?.length ? navigator.languages : [navigator.language], Intl),
  },
});
fresh.load();
const defaults = fresh.getSnapshot() as unknown as Record<string, unknown>;

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const changed = () => {
  const current = runtime.settings.getSnapshot() as unknown as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(current)) {
    if (key !== "homeInitialized" && !same(current[key], defaults[key])) {
      out[key] = current[key];
    }
  }
  return out;
};

const post = (message: Record<string, unknown>) => {
  if (embedded) {
    window.parent.postMessage({ source: "aerotizen-tv", ...message }, TARGET_ORIGIN);
  }
};
let queued = false;
const report = () => {
  if (queued) {
    return;
  }
  queued = true;
  void Promise.resolve().then(() => {
    queued = false;
    const settings = runtime.settings.getSnapshot();
    post({
      type: "state",
      settings: changed(),
      demo: prototypeState.demo,
      language: resolveLanguage(settings.language, navigator.languages),
      strings: {
        continueWatching: runtime.translate("home.continueWatching"),
        languageAuto: runtime.translate("settings.language.auto"),
      },
    });
  });
};
runtime.settings.subscribe(report);
report();

window.addEventListener("message", (event: MessageEvent<unknown>) => {
  const data = event.data as { source?: unknown; type?: unknown } | null;
  if (fromShell(event) && data && data.source === "aerotizen-shell" && data.type === "focus") {
    window.focus();
  }
});

// The shell shows its panel handle while the mouse moves over the TV.
let lastPointer = 0;
document.addEventListener(
  "mousemove",
  () => {
    const now = Date.now();
    if (now - lastPointer > 400) {
      lastPointer = now;
      post({ type: "pointer" });
    }
  },
  { passive: true },
);

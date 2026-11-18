// The setup in the URL is the whole state of the prototype: each load starts from the launcher's browser-preview
// defaults plus that setup, never from what an earlier visit saved.
import { launcherRuntime as runtime } from "../app/initializeLauncherRuntime";
import { DEFAULT_SETTINGS } from "../services/preferences/defaults";

import { prototypeState } from "./state";

const config = runtime.config;

// The shell keeps settings as text; their type is the type of the default value. A null default (Home apps, weather
// location, units) holds either a list or record, written as JSON, or a word such as "12".
const defaults: Record<string, unknown> = { ...DEFAULT_SETTINGS, ...config.DEFAULTS };
const parse = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};
const typed = (key: string, raw: string): unknown => {
  const fallback = defaults[key];
  if (typeof fallback === "string") {
    return raw;
  }
  if (fallback === null) {
    const value = parse(raw);
    return typeof value === "object" && value !== null ? value : raw;
  }
  return parse(raw);
};
const saved: Record<string, unknown> = {};
for (const [key, raw] of Object.entries(prototypeState.settings)) {
  if (key in defaults) {
    saved[key] = typed(key, raw);
  }
}
try {
  if (Object.keys(saved).length) {
    localStorage.setItem(config.STORAGE_KEY, JSON.stringify(saved));
  } else {
    localStorage.removeItem(config.STORAGE_KEY);
  }
} catch {
  // Without storage the launcher starts from its defaults.
}

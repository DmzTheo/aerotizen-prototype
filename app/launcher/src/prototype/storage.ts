// The setup in the URL is the whole state of the prototype: each load starts from the launcher's browser-preview
// defaults plus that setup, never from what an earlier visit saved.
import { DEFAULT_SETTINGS } from "../services/preferences/defaults";

import { prototypeState } from "./state";

const runtime = window.AeroTizen;
const config = runtime.config;

// A shorter Continue Watching list, as on an account with fewer programmes.
const feed = runtime.continueWatching as { items?: unknown[] } | undefined;
if (feed && Array.isArray(feed.items)) {
  feed.items = feed.items.slice(0, prototypeState.demo.continueItems);
}

// The shell keeps settings as text; their type is the type of the default value. A null default (Home apps, weather
// location, theme, units) holds either a list or record, written as JSON, or a word such as "halo" or "12".
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

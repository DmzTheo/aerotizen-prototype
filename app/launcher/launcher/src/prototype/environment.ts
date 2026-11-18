// The simulated TV's languages, set before the launcher starts.
import { prototypeState } from "./state";

const { demo } = prototypeState;

// On a TV, navigator.languages are the TV's languages: they drive "Use TV language", the date formats and the
// automatic 12/24 h and °C/°F choices.
try {
  Object.defineProperty(navigator, "languages", { configurable: true, get: () => [demo.tvLanguage] });
  Object.defineProperty(navigator, "language", { configurable: true, get: () => demo.tvLanguage });
} catch {
  // The browser's own languages are used instead.
}

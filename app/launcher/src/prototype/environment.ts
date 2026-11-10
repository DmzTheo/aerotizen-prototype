// The simulated TV, set before the launcher starts.
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

// The inputs.js browser stub lists HDMI 1 to 3. A TV with fewer ports drops the last ones; a fourth port is an
// empty HDMI 4, like HDMI 2.
const inputs = window.AeroTizen.inputs as unknown as {
  load(): void;
  refresh(): void;
  sources?: { type: string; number: number; connected?: boolean; editName?: string }[];
};
const load = inputs.load;
inputs.load = function () {
  load.call(inputs);
  if (!inputs.sources || "tizen" in window) {
    return;
  }
  const hdmi = inputs.sources.filter((source) => source.type === "HDMI" && source.number <= demo.hdmiPorts);
  if (demo.hdmiPorts === 4) {
    hdmi.push({ type: "HDMI", number: 4, connected: false });
  }
  inputs.sources = [...hdmi, ...inputs.sources.filter((source) => source.type !== "HDMI")];
  inputs.refresh();
};

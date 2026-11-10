// The setup the prototype shell passes in the TV page's URL hash: #<encoded JSON {settings, demo}>.
// `settings` holds raw strings from the shell's own URL; they are typed against the defaults in storage.ts.
// `demo` describes the simulated TV, which the launcher cannot change itself.

export interface PrototypeDemo {
  readonly continueItems: number;
  readonly hdmiPorts: number;
  readonly tvLanguage: string;
}

export const DEMO_DEFAULTS: PrototypeDemo = {
  continueItems: 5, // devContinueWatching.ts has five programmes
  hdmiPorts: 3, // the inputs.js browser stub has HDMI 1 to 3, plus Live TV
  tvLanguage: "en-GB",
};

const whole = (value: unknown, min: number, max: number, fallback: number) => {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isInteger(number) && number >= min && number <= max ? number : fallback;
};

const read = () => {
  let parsed: { settings?: unknown; demo?: unknown } = {};
  try {
    const text = decodeURIComponent(location.hash.slice(1));
    parsed = text ? (JSON.parse(text) as typeof parsed) : {};
  } catch {
    parsed = {};
  }
  const settings: Record<string, string> = {};
  if (parsed.settings && typeof parsed.settings === "object") {
    for (const [key, value] of Object.entries(parsed.settings as Record<string, unknown>)) {
      settings[key] = typeof value === "string" ? value : JSON.stringify(value);
    }
  }
  const demo = (parsed.demo && typeof parsed.demo === "object" ? parsed.demo : {}) as Record<string, unknown>;
  return {
    settings,
    demo: {
      continueItems: whole(demo.continueItems, 0, 5, DEMO_DEFAULTS.continueItems),
      hdmiPorts: whole(demo.hdmiPorts, 1, 4, DEMO_DEFAULTS.hdmiPorts),
      tvLanguage:
        typeof demo.tvLanguage === "string" && /^[a-z]{2}(-[A-Z]{2})?$/.test(demo.tvLanguage)
          ? demo.tvLanguage
          : DEMO_DEFAULTS.tvLanguage,
    },
  };
};

export const prototypeState: { readonly settings: Readonly<Record<string, string>>; readonly demo: PrototypeDemo } =
  read();

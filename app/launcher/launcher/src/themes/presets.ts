import type { SettingsValues, Theme } from "../contracts/preferences";

// A preset sets the interface theme, the wallpaper, the Home layout and the clock in one choice. The app size and every
// other setting stay the user's.
export interface Preset {
  readonly background: string;
  // "classic" is the compact clock; the others are the custom clock's styles.
  readonly clock: "classic" | SettingsValues["aeroClockStyle"];
  readonly homeAppLayout: SettingsValues["homeAppLayout"];
  readonly theme: Theme;
}

// AeroTizen's own preset first, then one per proposed Home layout, each with its own wallpaper and interface theme.
export const PRESET_IDS = ["aerotizen", "pop", "morning", "nacre", "peaks", "sound", "nightfall"] as const;
export type PresetId = (typeof PRESET_IDS)[number];

export const PRESETS: Readonly<Record<PresetId, Preset>> = {
  aerotizen: { theme: "classic", background: "aurora", homeAppLayout: "grid", clock: "classic" },
  pop: { theme: "pop", background: "prism", homeAppLayout: "lounge", clock: "classic" },
  morning: { theme: "frost", background: "pastel", homeAppLayout: "moment", clock: "classic" },
  nacre: { theme: "gloss", background: "afterglow", homeAppLayout: "diptych", clock: "minimal" },
  peaks: { theme: "amethyst", background: "twilightpeaks", homeAppLayout: "billboard", clock: "classic" },
  sound: { theme: "mint", background: "stage", homeAppLayout: "lounge", clock: "classic" },
  nightfall: { theme: "halo", background: "borealis", homeAppLayout: "quay", clock: "vertical" },
};

type PresetSettings = Pick<SettingsValues, "theme" | "background" | "homeAppLayout" | "clockLayout" | "aeroClockStyle">;

const sameClock = (preset: Preset, settings: PresetSettings) =>
  preset.clock === "classic"
    ? settings.clockLayout === "classic"
    : settings.clockLayout === "custom" && settings.aeroClockStyle === preset.clock;

// The preset the settings match, if any: a preset stops matching as soon as one of its settings changes.
export const currentPreset = (settings: PresetSettings) =>
  PRESET_IDS.find((id) => {
    const preset = PRESETS[id];
    return (
      preset.theme === settings.theme &&
      preset.background === settings.background &&
      preset.homeAppLayout === settings.homeAppLayout &&
      sameClock(preset, settings)
    );
  });

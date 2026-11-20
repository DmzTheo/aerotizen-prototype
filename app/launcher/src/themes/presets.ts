import type { SettingsValues, Theme } from "../contracts/preferences";
import type { HomeLayoutId } from "../shared/homeLayout";

// A preset sets the interface theme, the wallpaper, the Home layout and the clock in one choice. The app size and every
// other setting stay the user's.
export interface Preset {
  readonly background: string;
  // "classic" is the compact clock; the others are the custom clock's styles.
  readonly clock: "classic" | SettingsValues["aeroClockStyle"];
  // The app arrangement, for a preset on the Standard layout.
  readonly homeAppLayout?: SettingsValues["homeAppLayout"];
  readonly homeLayout: HomeLayoutId;
  readonly theme: Theme;
}

// AeroTizen's own preset first, then one per proposed Home layout, each with its own wallpaper and interface theme.
export const PRESET_IDS = ["aerotizen", "pop", "morning", "nacre", "peaks", "sound", "nightfall"] as const;
export type PresetId = (typeof PRESET_IDS)[number];

export const PRESETS: Readonly<Record<PresetId, Preset>> = {
  aerotizen: {
    theme: "classic",
    background: "aurora",
    homeLayout: "standard",
    homeAppLayout: "grid",
    clock: "classic",
  },
  pop: { theme: "pop", background: "prism", homeLayout: "lounge", clock: "classic" },
  morning: { theme: "frost", background: "pastel", homeLayout: "moment", clock: "classic" },
  nacre: { theme: "gloss", background: "afterglow", homeLayout: "diptych", clock: "minimal" },
  peaks: { theme: "amethyst", background: "twilightpeaks", homeLayout: "billboard", clock: "classic" },
  sound: { theme: "mint", background: "stage", homeLayout: "lounge", clock: "classic" },
  nightfall: { theme: "halo", background: "borealis", homeLayout: "quay", clock: "vertical" },
};

type PresetSettings = Pick<
  SettingsValues,
  "theme" | "background" | "homeAppLayout" | "homeLayout" | "clockLayout" | "aeroClockStyle"
>;

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
      preset.homeLayout === settings.homeLayout &&
      (preset.homeAppLayout === undefined || preset.homeAppLayout === settings.homeAppLayout) &&
      sameClock(preset, settings)
    );
  });

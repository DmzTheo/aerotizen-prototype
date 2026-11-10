import type { SettingsValues, ThemeId } from "../contracts/preferences";

// Theme proposal: presets set the interface, the wallpaper, the Home layout and the clock in
// one choice. The card size and every other setting stay the user's.
export interface Preset {
  readonly background: string;
  // "classic" is the compact clock; the others are the custom clock's styles.
  readonly clock: "classic" | SettingsValues["aeroClockStyle"];
  readonly homeAppLayout: SettingsValues["homeAppLayout"];
  readonly theme: ThemeId;
}

// AeroTizen's own preset first, then one per proposed Home layout, each with its own wallpaper and interface theme.
// The Settings list the interface themes, the Home layouts and the proposed wallpapers in this same order.
export const PRESET_IDS = ["aerotizen", "pop", "morning", "nacre", "peaks", "sound", "nightfall"] as const;
export type PresetId = (typeof PRESET_IDS)[number];

export const PRESETS: Readonly<Record<PresetId, Preset>> = {
  // AeroTizen's own defaults.
  aerotizen: { theme: "classic", background: "aurora", homeAppLayout: "grid", clock: "classic" },
  // Bold colours and big rows of tiles (the Lounge keeps the compact clock, which leaves its first rows whole).
  pop: { theme: "pop", background: "prism", homeAppLayout: "lounge", clock: "classic" },
  // A light, quiet interface in pastel: a greeting with the date, the time and the weather (Moment).
  morning: { theme: "frost", background: "pastel", homeAppLayout: "moment", clock: "classic" },
  // Glossy and rosy like nacre (Gloss over the coral wallpaper): titles set large beside the pictures, a thin clock.
  nacre: { theme: "gloss", background: "coral", homeAppLayout: "diptych", clock: "minimal" },
  // What to resume as a billboard, over twilight mountains.
  peaks: { theme: "amethyst", background: "twilightpeaks", homeAppLayout: "billboard", clock: "classic" },
  // What to resume first, then the apps and the inputs, over the animated stage.
  sound: { theme: "mint", background: "stage", homeAppLayout: "lounge", clock: "classic" },
  // Night: the aurora as the view, a large clock on the side, the apps in a glass band (Quay).
  nightfall: { theme: "halo", background: "borealis", homeAppLayout: "quay", clock: "vertical" },
};

type PresetSettings = Pick<SettingsValues, "theme" | "background" | "homeAppLayout" | "clockLayout" | "aeroClockStyle">;

const sameClock = (preset: Preset, settings: PresetSettings) =>
  preset.clock === "classic"
    ? settings.clockLayout === "classic"
    : settings.clockLayout === "custom" && settings.aeroClockStyle === preset.clock;

// The preset the settings match, if any (a preset stops matching as soon as one of its settings is changed).
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

import type { Store } from "../shared/state/createStore";

export type TimeFormat = "12" | "24";
export type TemperatureUnit = "C" | "F";
// Theme proposal: Classic and Glass are the existing appearances; the others are Glass with a theme stylesheet.
export type ThemeId = "classic" | "glass" | "halo" | "amethyst" | "gloss" | "frost" | "pop" | "mint";
export type DateFormat = "compact" | "short" | "long" | "numeric-short" | "numeric" | "iso" | "none";
export interface CustomGradient {
  readonly angle: number;
  readonly end: string;
  readonly start: string;
}
export interface WeatherLocation {
  readonly country_code?: string;
  readonly label?: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly name: string;
}
export interface SettingsValues {
  aeroClockStyle: "vertical" | "horizontal" | "minimal" | "bold";
  background: string;
  clockLayout: "classic" | "custom";
  continueWatching: boolean;
  continueWatchingApps: string[];
  customColour: string;
  customGradient: CustomGradient;
  dateFormat: DateFormat | "auto" | "weekday" | "dmy" | "mdy";
  glassSettings: boolean;
  hdmiKeepVisible: Record<string, boolean>;
  hideDisconnectedHdmi: boolean;
  home: string[];
  // Theme proposal: Lounge, Moment, Diptych, Billboard and Quay are the proposed Home layouts.
  homeAppLayout: "grid" | "scroll" | "lounge" | "moment" | "diptych" | "billboard" | "quay";
  homeCardColumns: number;
  inputNames: Record<string, string>;
  language: string;
  numerals: "latn" | "arab";
  showLiveTv: boolean;
  showNetwork: boolean;
  showTime: boolean;
  showWeather: boolean;
  speed: number;
  tempUnit: TemperatureUnit;
  theme: ThemeId;
  timeFormat: TimeFormat;
  weatherLocation: WeatherLocation | null;
  weatherPhoto: boolean;
  weatherShowLocation: boolean;
}
export type SettingsSnapshot = Readonly<
  Omit<SettingsValues, "home" | "inputNames" | "weatherLocation" | "continueWatchingApps" | "hdmiKeepVisible">
> & {
  readonly home: readonly string[];
  readonly homeInitialized: boolean;
  readonly continueWatchingApps: readonly string[];
  readonly hdmiKeepVisible: Readonly<Record<string, boolean>>;
  readonly inputNames: Readonly<Record<string, string>>;
  readonly weatherLocation: Readonly<WeatherLocation> | null;
};
export type SettingsPreferences = Omit<SettingsValues, "home"> & { home: string[] | null };
export type SettingsDefaults = Omit<SettingsPreferences, "tempUnit" | "timeFormat" | "theme"> & {
  tempUnit: TemperatureUnit | null;
  // null follows glassSettings: Glass or Classic.
  theme: ThemeId | null;
  timeFormat: TimeFormat | null;
};
export interface SettingsStore extends Store<SettingsSnapshot> {
  update(patch: Partial<SettingsPreferences>): void;
}
export interface SettingsService extends SettingsStore {
  dispose(): void;
  load(): void;
}

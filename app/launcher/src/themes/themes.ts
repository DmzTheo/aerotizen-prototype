import type { ThemeId } from "../contracts/preferences";

// Theme proposal. Classic and Glass are the existing appearances. Each other theme is
// the Glass interface plus one stylesheet of theme tokens (css/themes/<id>.css), applied through body[data-theme].
// They follow the order of the Themes section (src/themes/presets.ts).
export const THEME_IDS: readonly ThemeId[] = ["classic", "glass", "pop", "frost", "gloss", "amethyst", "mint", "halo"];

export const PROPOSAL_THEMES: ReadonlySet<ThemeId> = new Set<ThemeId>([
  "pop",
  "frost",
  "gloss",
  "amethyst",
  "mint",
  "halo",
]);

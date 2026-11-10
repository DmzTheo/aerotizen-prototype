import type { SettingsSnapshot } from "../../contracts/preferences";
import type { Page } from "../types";

type Layout = SettingsSnapshot["homeAppLayout"];

// Theme proposal: where a Home layout puts the clock. Moment shows it in its page, under the
// greeting. Quay and the Diptych fill the height under the header, so a custom clock, which would make the header too
// tall for them, moves into their page too, at the top on the start side. Quay's header puts its shortcuts last (and
// its compact clock first); the others keep 2.7.0's header.
const SHORTCUTS_LAST: ReadonlySet<Layout> = new Set<Layout>(["quay"]);
const CLOCK_IN_PAGE: ReadonlySet<Layout> = new Set<Layout>(["moment"]);
const CUSTOM_CLOCK_IN_PAGE: ReadonlySet<Layout> = new Set<Layout>(["quay", "diptych"]);

export const shortcutsLast = (layout: Layout) => SHORTCUTS_LAST.has(layout);

export const clockPlace = (settings: Pick<SettingsSnapshot, "homeAppLayout" | "clockLayout">, page: Page) => {
  const layout = settings.homeAppLayout;
  const headerPlace = shortcutsLast(layout) ? "first" : "last";
  const customInPage = settings.clockLayout === "custom" && CUSTOM_CLOCK_IN_PAGE.has(layout);
  // All apps has no room for it in its page: the clock stays in the header.
  const inPage = page === "home" && (CLOCK_IN_PAGE.has(layout) || customInPage);
  return inPage ? "page" : headerPlace;
};

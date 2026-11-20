import type { SettingsSnapshot } from "../../contracts/preferences";
import { getHomeLayout } from "../../shared/homeLayout";
import type { Page } from "../types";

export const shortcutsLast = (settings: Pick<SettingsSnapshot, "homeLayout">) =>
  getHomeLayout(settings.homeLayout).header === "clockFirst";

export const clockPlace = (settings: Pick<SettingsSnapshot, "homeLayout" | "clockLayout">, page: Page) => {
  const { clock } = getHomeLayout(settings.homeLayout);
  const headerPlace = shortcutsLast(settings) ? "first" : "last";
  const inPage =
    page === "home" && (clock === "page" || (clock === "pageWhenCustom" && settings.clockLayout === "custom"));
  return inPage ? "page" : headerPlace;
};

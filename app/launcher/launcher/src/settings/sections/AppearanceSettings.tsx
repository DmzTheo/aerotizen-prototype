import type { BackgroundOption } from "../../contracts/launcher";
import { APP_CARD_SIZE_OPTIONS } from "../../shared/apps/appCardSizes";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { currentPreset, PRESET_IDS, PRESETS } from "../../themes/presets";
import { ChoiceGroup } from "../components/ChoiceGroup";
import { ControlGroup } from "../components/ControlGroup/ControlGroup";
import { SettingsSection } from "../components/SettingsSection/SettingsSection";
import type { SettingsSectionProps } from "../types";

import { PresetOption } from "./appearance/PresetOption/PresetOption";

const APPEARANCE_OPTIONS = [
  { value: "classic", labelKey: "appearance.classic" },
  { value: "glass", labelKey: "appearance.glass" },
  { value: "pop", labelKey: "appearance.pop" },
  { value: "frost", labelKey: "appearance.frost" },
  { value: "gloss", labelKey: "appearance.gloss" },
  { value: "amethyst", labelKey: "appearance.amethyst" },
  { value: "mint", labelKey: "appearance.mint" },
  { value: "halo", labelKey: "appearance.halo" },
] as const;

const HOME_APP_LAYOUT_OPTIONS = [
  { value: "grid", labelKey: "appearance.grid" },
  { value: "scroll", labelKey: "appearance.scroll" },
  { value: "lounge", labelKey: "appearance.lounge" },
  { value: "moment", labelKey: "appearance.moment" },
  { value: "diptych", labelKey: "appearance.diptych" },
  { value: "billboard", labelKey: "appearance.billboard" },
  { value: "quay", labelKey: "appearance.quay" },
] as const;

const PERFORMANCE_OPTIONS = [
  { value: false, labelKey: "common.off" },
  { value: true, labelKey: "common.on" },
] as const;

// The Themes section shows each preset's wallpaper through its Settings swatch.
export const AppearanceSettings = ({
  settings,
  actions,
  backgrounds,
}: SettingsSectionProps & { backgrounds: readonly BackgroundOption[] }) => {
  const { t } = useTranslation();
  // No preset is selected once one of its settings has been changed.
  const preset = currentPreset(settings);
  return (
    <>
      <SettingsSection title={t("presets.title")} description={t("presets.description")}>
        <ControlGroup id="settings-presets" label={t("presets.title")}>
          {PRESET_IDS.map((id) => {
            const background = backgrounds.find((option) => option.id === PRESETS[id].background);
            return (
              <PresetOption
                key={id}
                focusKey={"settings-presets:" + id}
                label={t(`presets.${id}`)}
                preset={PRESETS[id]}
                preview={background ? background.preview : ""}
                light={Boolean(background?.lightBackground)}
                selected={preset === id}
                onSelect={() => actions.applyPreset(id)}
              />
            );
          })}
        </ControlGroup>
      </SettingsSection>
      <SettingsSection title={t("appearance.title")}>
        <ChoiceGroup
          id="settings-appearance"
          label={t("appearance.title")}
          value={settings.theme}
          options={APPEARANCE_OPTIONS}
          onSelect={actions.setTheme}
        />
      </SettingsSection>
      <SettingsSection title={t("appearance.size")}>
        <ChoiceGroup
          id="home-card-columns"
          label={t("appearance.size")}
          value={String(settings.homeCardColumns)}
          options={APP_CARD_SIZE_OPTIONS}
          onSelect={(value) => actions.setHomeCardColumns(Number(value))}
        />
      </SettingsSection>
      <SettingsSection title={t("appearance.homeLayout")}>
        <ChoiceGroup
          id="home-app-layout"
          label={t("appearance.homeLayout")}
          value={settings.homeAppLayout}
          options={HOME_APP_LAYOUT_OPTIONS}
          onSelect={actions.setHomeAppLayout}
        />
      </SettingsSection>
      <SettingsSection title={t("appearance.performanceMode")} description={t("appearance.performanceHint")}>
        <ChoiceGroup
          id="performance-mode"
          label={t("appearance.performanceMode")}
          value={settings.performanceMode}
          options={PERFORMANCE_OPTIONS}
          onSelect={actions.setPerformanceMode}
        />
      </SettingsSection>
    </>
  );
};

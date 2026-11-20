import type { BackgroundOption } from "../../contracts/launcher";
import { APP_CARD_SIZE_OPTIONS } from "../../shared/apps/appCardSizes";
import { getHomeLayout, HOME_LAYOUT_OPTIONS } from "../../shared/homeLayout";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { currentPreset, PRESET_IDS, PRESETS } from "../../themes/presets";
import { ChoiceGroup } from "../components/ChoiceGroup";
import { ControlGroup } from "../components/ControlGroup/ControlGroup";
import { SettingsField } from "../components/SettingsField/SettingsField";
import { SettingsSection } from "../components/SettingsSection/SettingsSection";
import { SettingsToggle } from "../components/SettingsToggle/SettingsToggle";
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
] as const;

const PROPOSED_LAYOUTS: readonly string[] = ["lounge", "moment", "diptych", "billboard", "quay"];
const LAYOUT_OPTIONS = HOME_LAYOUT_OPTIONS.map((option) =>
  PROPOSED_LAYOUTS.includes(option.value) ? { ...option, badgeKey: "proposal.new" as const } : option,
);

const SIZE_OPTIONS = APP_CARD_SIZE_OPTIONS.map((option) =>
  option.value === "6" ? { ...option, badgeKey: "proposal.new" as const } : option,
);

export const AppearanceSettings = ({
  settings,
  actions,
  backgrounds,
}: SettingsSectionProps & { backgrounds: readonly BackgroundOption[] }) => {
  const { t } = useTranslation();
  const appArrangement = getHomeLayout(settings.homeLayout).appArrangement;
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
      <SettingsField title={t("appearance.launcherLayout")}>
        <ChoiceGroup
          id="home-layout"
          label={t("appearance.launcherLayout")}
          value={settings.homeLayout}
          options={LAYOUT_OPTIONS}
          onSelect={actions.setHomeLayout}
        />
      </SettingsField>
      <SettingsField title={t("appearance.title")} topAligned>
        <ChoiceGroup
          id="settings-appearance"
          label={t("appearance.title")}
          value={settings.theme}
          options={APPEARANCE_OPTIONS}
          onSelect={actions.setTheme}
        />
      </SettingsField>
      <SettingsField title={t("appearance.size")}>
        <ChoiceGroup
          id="home-card-columns"
          label={t("appearance.size")}
          value={String(settings.homeCardColumns)}
          options={SIZE_OPTIONS}
          onSelect={(value) => actions.setHomeCardColumns(Number(value))}
        />
      </SettingsField>
      <SettingsField title={t("appearance.homeLayout")} hidden={appArrangement !== "preference"}>
        <ChoiceGroup
          id="home-app-layout"
          label={t("appearance.homeLayout")}
          value={settings.homeAppLayout}
          options={HOME_APP_LAYOUT_OPTIONS}
          onSelect={actions.setHomeAppLayout}
        />
      </SettingsField>
      <SettingsField title={t("appearance.performanceMode")} description={t("appearance.performanceHint")}>
        <SettingsToggle
          focusKey="performance-mode"
          label={t("appearance.performanceMode")}
          checked={settings.performanceMode}
          onChange={actions.setPerformanceMode}
        />
      </SettingsField>
    </>
  );
};

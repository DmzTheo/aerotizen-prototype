import type { BackgroundOption } from "../../contracts/launcher";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { currentPreset, PRESET_IDS, PRESETS } from "../../themes/presets";
import { PROPOSAL_THEMES, THEME_IDS } from "../../themes/themes";
import { ChoiceGroup } from "../components/ChoiceGroup";
import { ControlGroup } from "../components/ControlGroup/ControlGroup";
import { SettingsSection } from "../components/SettingsSection/SettingsSection";
import type { SettingsSectionProps } from "../types";

import { PresetOption } from "./appearance/PresetOption/PresetOption";

// Theme proposal: Classic and Glass, then the proposed themes, each marked as new.
const THEME_OPTIONS = THEME_IDS.map((theme) => {
  const labelKey = `appearance.${theme}` as const;
  return PROPOSAL_THEMES.has(theme)
    ? { value: theme, labelKey, badgeKey: "proposal.new" as const }
    : { value: theme, labelKey };
});

const HOME_CARD_COLUMNS_OPTIONS = [
  // Theme proposal: a smaller size, six apps a row in the Grid.
  { value: "6", labelKey: "appearance.verySmall", badgeKey: "proposal.new" },
  { value: "5", labelKey: "appearance.small" },
  { value: "4", labelKey: "appearance.medium" },
  { value: "3", labelKey: "appearance.large" },
] as const;

const HOME_APP_LAYOUT_OPTIONS = [
  { value: "grid", labelKey: "appearance.grid" },
  { value: "scroll", labelKey: "appearance.scroll" },
  // Theme proposal: the proposed Home layouts, in the order of the Themes section that uses them.
  { value: "lounge", labelKey: "appearance.lounge", badgeKey: "proposal.new" },
  { value: "moment", labelKey: "appearance.moment", badgeKey: "proposal.new" },
  { value: "diptych", labelKey: "appearance.diptych", badgeKey: "proposal.new" },
  { value: "billboard", labelKey: "appearance.billboard", badgeKey: "proposal.new" },
  { value: "quay", labelKey: "appearance.quay", badgeKey: "proposal.new" },
] as const;

// Theme proposal: the miniatures of the Themes section show each wallpaper through its Settings swatch.
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
                light={Boolean(background && background.light)}
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
          options={THEME_OPTIONS}
          onSelect={actions.setTheme}
        />
      </SettingsSection>
      <SettingsSection title={t("appearance.size")}>
        <ChoiceGroup
          id="home-card-columns"
          label={t("appearance.size")}
          value={String(settings.homeCardColumns)}
          options={HOME_CARD_COLUMNS_OPTIONS}
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
    </>
  );
};

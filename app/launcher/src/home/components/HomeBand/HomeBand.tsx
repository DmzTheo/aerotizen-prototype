import type { InputSource, InstalledApp } from "../../../contracts/launcher";
import type { SettingsSnapshot } from "../../../contracts/preferences";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { bandAppsWidth } from "../../presentation/bandApps";
import type { HomeEnvironment } from "../../types";
import { AppGrid } from "../AppGrid/AppGrid";
import { InputCard } from "../InputCard/InputCard";

import styles from "./HomeBand.module.css";

// The glass band at the bottom of the Quay and Moment layouts. The apps
// run in one row that scrolls inside it, at the App size; the inputs close it after a divider, in two rows, always in
// view.
export const HomeBand = ({
  env,
  ids,
  apps,
  inputs,
  settings,
  active,
}: {
  env: HomeEnvironment;
  ids: readonly string[];
  apps: readonly InstalledApp[];
  inputs: readonly InputSource[];
  settings: SettingsSnapshot;
  active: boolean;
}) => {
  const { t } = useTranslation();
  // Rows under 130px (Small and below, or no apps beside them) hold slim pills.
  const pills = settings.homeCardColumns >= 6 || !ids.length;
  if (!ids.length && !inputs.length) {
    return null;
  }
  return (
    <div
      class={styles.band}
      data-columns={settings.homeCardColumns}
      data-apps={ids.length ? "true" : "false"}
      style={{ "--band-apps-width": bandAppsWidth(settings.homeCardColumns, ids.length, inputs.length) + "px" }}
    >
      {ids.length ? (
        <section class={styles.apps} data-home-section="apps" data-layout-block="apps">
          <AppGrid
            env={env}
            ids={ids}
            apps={apps}
            settings={settings}
            page="home"
            shown
            active={active}
            label={t("home.homeApps")}
          />
        </section>
      ) : null}
      {inputs.length ? (
        <section class={styles.inputs} data-home-section="inputs" data-layout-block="inputs">
          <div class={styles.inputGrid} data-many={inputs.length > 4 ? "true" : "false"}>
            {inputs.map((source) => (
              <InputCard
                key={env.runtime.inputs.portName(source)}
                env={env}
                source={source}
                compact={false}
                variant={pills ? "pill" : "tile"}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};

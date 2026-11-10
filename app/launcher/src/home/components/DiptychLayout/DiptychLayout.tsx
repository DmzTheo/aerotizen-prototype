import type { ContinueItem, InputSource, InstalledApp } from "../../../contracts/launcher";
import type { SettingsSnapshot } from "../../../contracts/preferences";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { clockPlace } from "../../presentation/clockPlace";
import type { HomeEnvironment } from "../../types";
import { AppGrid } from "../AppGrid/AppGrid";
import { ContinueScroller } from "../ContinueScroller";
import { FocusCaption } from "../FocusCaption/FocusCaption";
import { InputCard } from "../InputCard/InputCard";
import { PageClock } from "../PageClock/PageClock";

import styles from "./DiptychLayout.module.css";

// Theme proposal: the Diptych Home layout. A column of text on the left names what is
// in focus, in the theme's display font; pictures only on the right (what to resume, then the apps), running off the
// edge; the inputs close the text column. A custom clock comes down into the page, at the top of the text column.
export const DiptychLayout = ({
  env,
  ids,
  apps,
  items,
  inputs,
  settings,
  active,
}: {
  env: HomeEnvironment;
  ids: readonly string[];
  apps: readonly InstalledApp[];
  items: readonly ContinueItem[];
  inputs: readonly InputSource[];
  settings: SettingsSnapshot;
  active: boolean;
}) => {
  const { t } = useTranslation();
  const manyInputs = inputs.length > 4;
  const clockInPage = clockPlace(settings, "home") === "page";
  return (
    <div
      class={styles.layout}
      data-items={items.length ? "true" : "false"}
      data-columns={env.columns(settings)}
      data-clock={clockInPage ? "page" : "header"}
    >
      <div class={styles.text}>
        {clockInPage ? <PageClock env={env} settings={settings} className={styles.clock} /> : null}
        <FocusCaption env={env} ids={ids} apps={apps} items={items} inputs={inputs} className={styles.caption} />
        {inputs.length ? (
          <section class={styles.inputs} data-home-section="inputs" data-layout-block="inputs">
            <div class={styles.inputGrid} data-many={manyInputs ? "true" : "false"}>
              {inputs.map((source) => (
                <InputCard
                  key={env.runtime.inputs.portName(source)}
                  env={env}
                  source={source}
                  glass={settings.glassSettings}
                  compact={false}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
      <div class={styles.pictures}>
        {items.length ? (
          <div class={styles.programmes} data-layout-block="continue">
            <ContinueScroller env={env} items={items} trackClass={styles.programmeTrack} />
          </div>
        ) : null}
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
      </div>
    </div>
  );
};

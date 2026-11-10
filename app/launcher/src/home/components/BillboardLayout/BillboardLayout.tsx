import { Play } from "lucide-preact";

import type { ContinueItem, InputSource, InstalledApp } from "../../../contracts/launcher";
import type { SettingsSnapshot } from "../../../contracts/preferences";
import { useStore } from "../../../shared/hooks/useStore";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Icon } from "../../../shared/icons/Icon/Icon";
import type { HomeEnvironment } from "../../types";
import { AppGrid } from "../AppGrid/AppGrid";
import { BillboardBanner } from "../BillboardBanner/BillboardBanner";
import { ContinueScroller } from "../ContinueScroller";
import { ContinueWatchingCard } from "../ContinueWatchingCard/ContinueWatchingCard";
import { HomeSectionHeading } from "../HomeSectionHeading/HomeSectionHeading";
import { InputCard } from "../InputCard/InputCard";

import styles from "./BillboardLayout.module.css";

// Theme proposal: the Billboard Home layout. The first Continue Watching item fills a hero,
// the others sit in two rows beside it; below, the apps run in one band next to the inputs.
export const BillboardLayout = ({
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
  const { selected } = useStore(env.state);
  const [hero, ...side] = items;
  const homeApps = ids
    .map((id) => apps.find((app) => app.id === id))
    .filter((app): app is InstalledApp => app !== undefined);
  const bannerApp = homeApps.find((app) => "app:" + app.id === selected) || homeApps[0];
  const manyInputs = inputs.length > 4;
  return (
    <div
      class={styles.layout}
      data-columns={env.columns(settings)}
      data-apps={ids.length ? "true" : "false"}
      data-inputs={inputs.length ? "true" : "false"}
    >
      <div class={styles.top}>
        {hero ? (
          <div class={styles.hero} data-layout-block="hero">
            <ContinueWatchingCard env={env} item={hero}>
              <div class={styles.kicker}>{t("home.continueWatching")}</div>
              <div class={styles.resume} aria-hidden="true">
                <Icon icon={Play} />
                <span>{t("home.continue")}</span>
              </div>
            </ContinueWatchingCard>
          </div>
        ) : null}
        {!hero && bannerApp ? <BillboardBanner env={env} app={bannerApp} /> : null}
        {side.length ? (
          <div class={styles.side} data-layout-block="side">
            <ContinueScroller env={env} items={side} trackClass={styles.sideTrack} />
          </div>
        ) : null}
      </div>
      <div class={styles.bottom}>
        {ids.length ? (
          <section class={styles.apps} data-home-section="apps" data-layout-block="apps">
            <HomeSectionHeading title={t("settings.apps.title")} />
            <AppGrid
              env={env}
              ids={ids}
              apps={apps}
              settings={settings}
              page="home"
              shown
              active={active}
              label={t("home.homeApps")}
              extraData={{ "data-inputs": inputs.length ? "true" : "false" }}
            />
          </section>
        ) : null}
        {inputs.length ? (
          <section class={styles.inputs} data-home-section="inputs" data-layout-block="inputs">
            <HomeSectionHeading title={t("common.inputs")} />
            <div id="inputs" class={styles.inputGrid} data-many={manyInputs ? "true" : "false"}>
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
    </div>
  );
};

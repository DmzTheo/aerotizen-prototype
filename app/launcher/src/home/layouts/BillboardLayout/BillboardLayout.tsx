import { Play } from "lucide-preact";

import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Icon } from "../../../shared/icons/Icon/Icon";
import { AppGrid } from "../../components/AppGrid/AppGrid";
import { ContinueScroller } from "../../components/ContinueScroller";
import { ContinueWatchingCard } from "../../components/ContinueWatchingCard/ContinueWatchingCard";
import { FocusCaption } from "../../components/FocusCaption/FocusCaption";
import { HomeSectionHeading } from "../../components/HomeSectionHeading/HomeSectionHeading";
import { InputCard } from "../../components/InputCard/InputCard";
import type { HomeLayoutPageProps } from "../types";

import styles from "./BillboardLayout.module.css";

// The Billboard Home layout. The first Continue Watching item fills a hero,
// the others sit in two rows beside it; below, the apps run in one band next to the inputs.
export const BillboardLayout = ({ env, ids, apps, items, inputs, settings, active }: HomeLayoutPageProps) => {
  const { t } = useTranslation();
  const [hero, ...side] = items;
  const manyInputs = inputs.length > 4;
  return (
    <div
      class={styles.layout}
      data-columns={settings.homeCardColumns}
      data-apps={ids.length ? "true" : "false"}
      data-inputs={inputs.length ? "true" : "false"}
      data-side={side.length ? "true" : "false"}
    >
      <div class={styles.top}>
        {hero ? (
          <div class={styles.hero} data-layout-block="hero">
            <ContinueWatchingCard env={env} item={hero} variant="hero">
              <div class={styles.kicker}>{t("home.continueWatching")}</div>
              <div class={styles.resume} aria-hidden="true">
                <Icon icon={Play} />
                <span>{t("home.continue")}</span>
              </div>
            </ContinueWatchingCard>
          </div>
        ) : (
          <FocusCaption
            env={env}
            ids={ids}
            apps={apps}
            items={items}
            inputs={inputs}
            className={styles.caption}
            size="large"
            kicker={false}
          />
        )}
        {side.length ? (
          <div class={styles.side} data-layout-block="side">
            <ContinueScroller
              coverArt={settings.continueWatchingCoverArt}
              env={env}
              items={side}
              trackClass={styles.sideTrack}
              variant="side"
            />
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
                  compact={false}
                  variant={manyInputs ? "pill" : "row"}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};

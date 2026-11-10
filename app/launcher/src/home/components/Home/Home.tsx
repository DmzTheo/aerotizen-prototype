import { ArrowUp } from "lucide-preact";
import { useLayoutEffect } from "preact/hooks";

import { useStore } from "../../../shared/hooks/useStore";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Icon } from "../../../shared/icons/Icon/Icon";
import type { HomeEnvironment } from "../../types";
import { AppActionsMenu } from "../AppActionsMenu/AppActionsMenu";
import { AppGrid } from "../AppGrid/AppGrid";
import { BillboardLayout } from "../BillboardLayout/BillboardLayout";
import { ContinueWatchingRow } from "../ContinueWatchingRow/ContinueWatchingRow";
import { DiptychLayout } from "../DiptychLayout/DiptychLayout";
import { HomeControl } from "../HomeControl/HomeControl";
import { HomeHeader } from "../HomeHeader/HomeHeader";
import { HomeSectionHeading } from "../HomeSectionHeading/HomeSectionHeading";
import { InputDock } from "../InputDock/InputDock";
import { MomentLayout } from "../MomentLayout/MomentLayout";
import { QuayLayout } from "../QuayLayout/QuayLayout";

import styles from "./Home.module.css";

// Theme proposal: the layouts that draw the whole Home page themselves.
const OWN_LAYOUTS = {
  moment: MomentLayout,
  diptych: DiptychLayout,
  billboard: BillboardLayout,
  quay: QuayLayout,
} as const;
const ownLayout = (layout: string) =>
  layout in OWN_LAYOUTS ? OWN_LAYOUTS[layout as keyof typeof OWN_LAYOUTS] : undefined;

export const Home = ({ env }: { env: HomeEnvironment }) => {
  const { t } = useTranslation();
  const settings = useStore(env.settings);
  const { page, active, appsEndOffset, draft, scroll } = useStore(env.state);
  const { apps, inputs, items, ready } = useStore(env.inventory);
  const home = draft || (settings.homeInitialized ? settings.home : [env.runtime.config.FIREPLACE_ID]);
  const visibleHome = home.filter(
    (id) => id === env.runtime.config.FIREPLACE_ID || !ready || apps.some((app) => app.id === id),
  );
  const showContinueWatching = page === "home" && settings.continueWatching && items.length > 0;
  // Theme proposal: a proposed layout draws the page (Moment, Diptych, Billboard, Quay) or
  // puts the real rows in a new order (Lounge); 2.7.0's Grid and Scroll keep their page.
  const Layout = ownLayout(settings.homeAppLayout);
  const drawsPage = Boolean(Layout);
  const loungeLayout = settings.homeAppLayout === "lounge";
  const standardLayout = !drawsPage && !loungeLayout;
  // Theme proposal: a layout that draws the page fills the height left under the header, whatever the clock layout.
  const fills = drawsPage && page === "home";
  const dockInputs =
    standardLayout &&
    page === "home" &&
    inputs.length > 0 &&
    !showContinueWatching &&
    visibleHome.length > 0 &&
    (settings.homeAppLayout === "scroll" || visibleHome.length <= env.columns(settings));
  const atAppsEnd = page === "apps" && scroll === appsEndOffset;
  useLayoutEffect(() => {
    env.bridge.focus();
  }, [
    env,
    page,
    apps,
    inputs,
    items,
    ready,
    settings.home,
    settings.homeInitialized,
    draft,
    settings.homeCardColumns,
    settings.homeAppLayout,
    settings.clockLayout,
    settings.aeroClockStyle,
  ]);
  return (
    <div class={styles.home} data-home data-expanded={settings.clockLayout === "custom" ? "true" : "false"}>
      <HomeHeader env={env} />
      <div
        class={styles.viewport}
        data-home-viewport
        data-scrolled={scroll > 0 ? "true" : "false"}
        data-at-apps-end={atAppsEnd ? "true" : "false"}
        aria-hidden={!active}
      >
        <div class={styles.mask} data-home-mask data-scrolled={scroll > 0 && !atAppsEnd ? "true" : "false"}>
          <main
            id="rows"
            class={styles.rows}
            data-home-content
            data-page={page}
            data-docked={dockInputs ? "true" : "false"}
            data-fill={fills ? "true" : "false"}
            ref={env.rows}
            style={{ "--home-offset": -scroll + "px", "--apps-end-offset": appsEndOffset + "px" }}
          >
            <div
              class={styles.page}
              data-home-page
              data-page={page}
              data-docked={dockInputs ? "true" : "false"}
              data-fill={fills ? "true" : "false"}
              data-home-layout={settings.homeAppLayout}
            >
              {Layout && page === "home" ? (
                <Layout
                  env={env}
                  ids={visibleHome}
                  apps={apps}
                  items={showContinueWatching ? items : []}
                  inputs={inputs}
                  settings={settings}
                  active={active}
                />
              ) : null}
              {loungeLayout ? <ContinueWatchingRow env={env} items={items} visible={showContinueWatching} /> : null}
              {loungeLayout ? (
                <section data-home-section="apps" hidden={page !== "home" || !visibleHome.length}>
                  <HomeSectionHeading title={t("settings.apps.title")} />
                  <AppGrid
                    env={env}
                    ids={visibleHome}
                    apps={apps}
                    settings={settings}
                    page="home"
                    shown={page === "home"}
                    active={active}
                    label={t("home.homeApps")}
                  />
                </section>
              ) : null}
              {standardLayout ? (
                <AppGrid
                  env={env}
                  ids={visibleHome}
                  apps={apps}
                  settings={settings}
                  page="home"
                  shown={page === "home"}
                  active={active}
                  label={t("home.homeApps")}
                />
              ) : null}
              <AppGrid
                env={env}
                ids={apps.map((app) => app.id)}
                apps={apps}
                settings={settings}
                page="apps"
                shown={page === "apps"}
                active={active}
                label={t("home.allApps")}
              />
              <p id="apps-empty" class={styles.empty} hidden={page === "home" || apps.length > 0}>
                {t("home.emptyApps")}
              </p>
              {standardLayout ? <ContinueWatchingRow env={env} items={items} visible={showContinueWatching} /> : null}
              {!drawsPage ? (
                <InputDock env={env} inputs={inputs} visible={page === "home"} glass={settings.glassSettings} />
              ) : null}
            </div>
            {page === "apps" && apps.length > 0 && (
              <HomeControl
                env={env}
                controlKey="back-to-top"
                className={styles.backToTop}
                title={t("home.backToTop")}
                preserveSelection
              >
                <Icon icon={ArrowUp} />
              </HomeControl>
            )}
          </main>
        </div>
      </div>
      <AppActionsMenu env={env} />
    </div>
  );
};

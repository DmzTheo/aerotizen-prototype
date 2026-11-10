import type { InstalledApp } from "../../../contracts/launcher";
import type { SettingsSnapshot } from "../../../contracts/preferences";
import { useStore } from "../../../shared/hooks/useStore";
import type { HomeEnvironment, Page } from "../../types";
import { AppCard } from "../AppCard";
import { FireplaceCard } from "../FireplaceCard/FireplaceCard";
import { HorizontalScroller } from "../HorizontalScroller/HorizontalScroller";

import styles from "./AppGrid.module.css";

export const AppGrid = ({
  env,
  ids,
  apps,
  settings,
  page,
  shown,
  active,
  label,
  extraData,
}: {
  env: HomeEnvironment;
  ids: readonly string[];
  apps: readonly InstalledApp[];
  settings: SettingsSnapshot;
  page: Page;
  shown: boolean;
  active: boolean;
  label: string;
  // Theme proposal: data a layout adds to the track (the Billboard band knows whether inputs sit beside it).
  extraData?: Readonly<Record<`data-${string}`, string>>;
}) => {
  const { appOffset } = useStore(env.state);
  // Theme proposal: the proposed layouts keep the Home apps on one sideways row, like Scroll.
  const scroll = page === "home" && settings.homeAppLayout !== "grid";
  return (
    <HorizontalScroller
      id={shown ? "grid" : page + "-grid-parked"}
      label={label}
      enabled={scroll}
      visible={shown}
      trackClass={styles.grid}
      trackData={{
        "data-app-grid": "",
        "data-columns": env.columns(settings),
        "data-page": page,
        "data-expanded": settings.clockLayout === "custom" ? "true" : "false",
        "data-scroll": scroll ? "true" : "false",
        "data-layout": page === "home" ? settings.homeAppLayout : "grid",
        ...extraData,
      }}
      trackRef={page === "home" ? env.appItems : undefined}
      viewportRef={page === "home" ? env.appViewport : undefined}
      offset={appOffset}
      onOffsetChange={(offset) => env.state.set({ ...env.state.getSnapshot(), appOffset: offset })}
    >
      {ids.map((id) => {
        if (id === env.runtime.config.FIREPLACE_ID) {
          return <FireplaceCard key={id} env={env} registered={shown} />;
        }
        const app = apps.find((app) => app.id === id) || { id, name: id, icon: "" };
        return <AppCard key={id} env={env} app={app} active={active && shown} />;
      })}
    </HorizontalScroller>
  );
};

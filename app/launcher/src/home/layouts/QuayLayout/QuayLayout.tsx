import { HomeBand } from "../../components/HomeBand/HomeBand";
import { PageClock } from "../../components/PageClock/PageClock";
import { PictureShelf } from "../../components/PictureShelf/PictureShelf";
import { clockPlace } from "../../presentation/clockPlace";
import type { HomeLayoutPageProps } from "../types";

import styles from "./QuayLayout.module.css";

// The Quay Home layout. The wallpaper keeps the screen, like a view:
// the apps and the inputs sit in a glass band at the bottom, what to resume on the other side from the clock, above
// the band. The header puts the clock first and its shortcuts last (HomeHeader); a custom clock comes down into the
// page, at the top on the start side.
export const QuayLayout = ({ env, ids, apps, items, inputs, settings, active }: HomeLayoutPageProps) => (
  <div class={styles.layout} data-columns={settings.homeCardColumns}>
    <div class={styles.top}>
      {clockPlace(settings, "home") === "page" ? (
        <PageClock env={env} settings={settings} className={styles.clock} />
      ) : null}
      {items.length ? (
        <PictureShelf coverArt={settings.continueWatchingCoverArt} env={env} items={items} className={styles.shelf} />
      ) : null}
    </div>
    <HomeBand env={env} ids={ids} apps={apps} inputs={inputs} settings={settings} active={active} />
  </div>
);

import type { ContinueItem, InputSource, InstalledApp } from "../../../contracts/launcher";
import type { SettingsSnapshot } from "../../../contracts/preferences";
import { clockPlace } from "../../presentation/clockPlace";
import type { HomeEnvironment } from "../../types";
import { HomeBand } from "../HomeBand/HomeBand";
import { PageClock } from "../PageClock/PageClock";
import { PictureShelf } from "../PictureShelf/PictureShelf";

import styles from "./QuayLayout.module.css";

// Theme proposal: the Quay Home layout. The wallpaper keeps the screen, like a view:
// the apps and the inputs sit in a glass band at the bottom, what to resume on the other side from the clock, above
// the band. The header puts the clock first and its shortcuts last (HomeHeader); a custom clock comes down into the
// page, at the top on the start side.
export const QuayLayout = ({
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
}) => (
  <div class={styles.layout}>
    <div class={styles.top}>
      {clockPlace(settings, "home") === "page" ? (
        <PageClock env={env} settings={settings} className={styles.clock} />
      ) : null}
      {items.length ? <PictureShelf env={env} items={items} className={styles.shelf} /> : null}
    </div>
    <HomeBand env={env} ids={ids} apps={apps} inputs={inputs} settings={settings} active={active} />
  </div>
);

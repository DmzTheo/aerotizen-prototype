import { useMemo } from "preact/hooks";

import type { InstalledApp } from "../../../contracts/launcher";
import type { HomeEnvironment } from "../../types";
import { AppArtwork } from "../AppArtwork/AppArtwork";

import styles from "./BillboardBanner.module.css";

// Theme proposal: without Continue Watching items, the Billboard top shows the app focused
// in the apps band (the first Home app otherwise) in its fallback look. It is not focusable, and swaps instantly:
// a crossfade doubled the GPU work on the TV.
export const BillboardBanner = ({ env, app }: { env: HomeEnvironment; app: InstalledApp }) => {
  const brand = useMemo(() => env.describe(app), [env, app]);
  return (
    <div
      class={styles.banner}
      data-billboard-banner
      aria-hidden="true"
      style={{ "--app-background": brand.background }}
    >
      <div class={styles.art}>
        <AppArtwork app={app} brand={brand} active />
      </div>
      <div class={styles.title}>{brand.title}</div>
    </div>
  );
};

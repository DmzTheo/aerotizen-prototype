import type { ContinueItem } from "../../contracts/launcher";
import { useStore } from "../../shared/hooks/useStore";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { HomeEnvironment } from "../types";

import { ContinueWatchingCard } from "./ContinueWatchingCard/ContinueWatchingCard";
import { HorizontalScroller } from "./HorizontalScroller/HorizontalScroller";

// Theme proposal: Continue Watching as a sideways row inside a proposed layout, bound to the
// Home state like 2.7.0's own row (its refs and its remembered offset). The layout gives the track its look.
export const ContinueScroller = ({
  env,
  items,
  trackClass,
}: {
  env: HomeEnvironment;
  items: readonly ContinueItem[];
  trackClass: string;
}) => {
  const { t } = useTranslation();
  const { continueOffset } = useStore(env.state);
  return (
    <HorizontalScroller
      id="continue-items"
      label={t("home.continueWatching")}
      trackClass={trackClass}
      trackRef={env.continueItems}
      viewportRef={env.continueViewport}
      offset={continueOffset}
      onOffsetChange={(offset) => env.state.set({ ...env.state.getSnapshot(), continueOffset: offset })}
    >
      {items.map((item) => (
        <ContinueWatchingCard key={item.key} env={env} item={item} />
      ))}
    </HorizontalScroller>
  );
};

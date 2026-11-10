import { Play } from "lucide-preact";
import { useLayoutEffect, useRef } from "preact/hooks";

import type { ContinueItem, InputSource, InstalledApp } from "../../../contracts/launcher";
import { useStore } from "../../../shared/hooks/useStore";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Icon } from "../../../shared/icons/Icon/Icon";
import { getInputPresentation } from "../../presentation/inputs";
import type { HomeEnvironment } from "../../types";

import styles from "./FocusCaption.module.css";

interface Caption {
  readonly action?: string;
  readonly kicker: string;
  readonly meta?: string;
  readonly progress?: number;
  readonly title: string;
}

const inputKey = (source: InputSource) => "input:" + source.type + ":" + source.number;

// Theme proposal: names what is in focus (a programme, an app or an input) in the theme's
// display font, painted on the wallpaper like the section headings, with its details and its action (the Diptych's
// column). It keeps the last item while the focus is in the header. Decorative: the focused card carries the
// accessible name.
export const FocusCaption = ({
  env,
  ids,
  apps,
  items,
  inputs,
  className = "",
}: {
  env: HomeEnvironment;
  ids: readonly string[];
  apps: readonly InstalledApp[];
  items: readonly ContinueItem[];
  inputs: readonly InputSource[];
  className?: string;
}) => {
  const { t } = useTranslation();
  const { selected } = useStore(env.state);
  const shown = useRef("");
  const onContent = /^(continue|app|input):/.test(selected);
  useLayoutEffect(() => {
    if (onContent) {
      shown.current = selected;
    }
  }, [onContent, selected]);
  const firstKey = (): string => {
    if (items.length) {
      return "continue:" + items[0].key;
    }
    return ids.length ? "app:" + ids[0] : "";
  };
  const key = onContent ? selected : shown.current || firstKey();
  const captionFor = (): Caption | null => {
    const item = items.find((candidate) => "continue:" + candidate.key === key);
    if (item) {
      const episode =
        item.season > 0 && item.episode > 0
          ? t("continue.episode", { season: item.season, episode: item.episode })
          : "";
      return {
        kicker: t("home.continueWatching"),
        title: item.title,
        meta: episode ? episode + " · " + item.sourceName : item.sourceName,
        progress: item.duration > 0 ? Math.min(100, (item.playback / item.duration) * 100) : 0,
        action: t("home.continue"),
      };
    }
    if (key.startsWith("app:")) {
      const id = key.slice(4);
      const app = apps.find((candidate) => candidate.id === id);
      const isFireplace = id === env.runtime.config.FIREPLACE_ID;
      const appTitle = app ? env.describe(app).title : id;
      const title = isFireplace ? t("common.fireplace") : appTitle;
      return { kicker: t("settings.apps.title"), title, action: t("layout.open", { app: title }) };
    }
    const source = inputs.find((candidate) => inputKey(candidate) === key);
    if (source) {
      const label = env.runtime.inputs.label(source, source.type === "TV" ? t("inputs.liveTv") : undefined);
      const port = env.runtime.inputs.portName(source);
      const { statusLabel } = getInputPresentation(source, label, {
        recognized: Boolean(env.runtime.inputs.hasRecognizedDevice?.(source)),
        pinned: Boolean(env.runtime.inputs.alwaysVisible?.(source)),
      });
      const showsPort = label !== port && source.type !== "TV";
      const meta = showsPort ? port + " · " + t(statusLabel) : t(statusLabel);
      return { kicker: t("common.inputs"), title: label, meta };
    }
    return null;
  };
  const caption = captionFor();
  return (
    <div class={styles.caption + " " + className} aria-hidden="true">
      {caption ? (
        <>
          <div class={styles.kicker}>{caption.kicker}</div>
          <div class={styles.title}>{caption.title}</div>
          {caption.meta ? <div class={styles.meta}>{caption.meta}</div> : null}
          {caption.progress ? (
            <div class={styles.progress}>
              <div class={styles.progressFill} style={{ width: caption.progress + "%" }} />
            </div>
          ) : null}
          {caption.action ? (
            <div class={styles.action}>
              <Icon icon={Play} />
              <span>{caption.action}</span>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

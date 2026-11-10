import { House, Settings } from "lucide-preact";

import { useStore } from "../../../shared/hooks/useStore";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Icon } from "../../../shared/icons/Icon/Icon";
import { HeaderStatus } from "../../../status/HeaderStatus/HeaderStatus";
import { NetworkStatus } from "../../../status/NetworkStatus/NetworkStatus";
import { clockPlace, shortcutsLast } from "../../presentation/clockPlace";
import type { HomeEnvironment } from "../../types";
import { HeaderFocusIndicator } from "../HeaderFocusIndicator/HeaderFocusIndicator";
import { HomeControl } from "../HomeControl/HomeControl";

import styles from "./HomeHeader.module.css";

export const HomeHeader = ({ env }: { env: HomeEnvironment }) => {
  const { t } = useTranslation();
  const { page, active } = useStore(env.state);
  const { unread } = useStore(env.updates);
  const settings = useStore(env.settings);
  const settingsTitle = t(unread ? "settings.about.homeNotice" : "common.settings");
  // Theme proposal: where the Home layout puts the clock and the shortcuts.
  const place = clockPlace(settings, page);
  const shortcuts = shortcutsLast(settings.homeAppLayout) ? "last" : "first";
  return (
    <header
      class={styles.header}
      data-home-header
      data-expanded={settings.clockLayout === "custom" ? "true" : "false"}
      data-clock-place={place}
      data-shortcuts={shortcuts}
      aria-hidden={!active}
    >
      <div class={styles.shortcuts} data-header-shortcuts>
        {/* Theme proposal: the plate is placed again when the shortcuts change sides. */}
        <HeaderFocusIndicator key={shortcuts} env={env} />
        <HomeControl
          env={env}
          id="gear"
          controlKey="gear"
          className={styles.shortcut}
          preserveSelection
          title={settingsTitle}
        >
          <Icon icon={Settings} />
          {unread && <span class={styles.notice} data-home-update-notice aria-hidden="true" />}
        </HomeControl>
        <HomeControl
          env={env}
          id="samsung-home-shortcut"
          controlKey="samsung-home-shortcut"
          className={styles.shortcut + " " + styles.nativeShortcut}
          title={t("common.samsungHome")}
        >
          <Icon icon={House} />
        </HomeControl>
        <NetworkStatus status={env.status} />
      </div>
      <nav class={styles.tabs} data-header-tabs aria-label={t("home.views")}>
        <HeaderFocusIndicator env={env} group="tabs" />
        <HomeControl
          env={env}
          id="home-tab"
          controlKey="home-tab"
          className={styles.tab}
          title={t("home.home")}
          pressed={page === "home"}
        >
          {t("home.home")}
        </HomeControl>
        <HomeControl
          env={env}
          id="apps-tab"
          controlKey="apps-tab"
          className={styles.tab}
          title={t("home.allApps")}
          pressed={page === "apps"}
        >
          {t("home.allApps")}
        </HomeControl>
      </nav>
      <HeaderStatus settings={env.settings} status={env.status} clock={env.runtime.clock} />
    </header>
  );
};

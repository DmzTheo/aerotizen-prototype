import type { RefObject } from "preact";
import { useLayoutEffect, useState } from "preact/hooks";

import { useStore } from "../../../shared/hooks/useStore";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useLoadedFonts } from "../../hooks/useLoadedFonts";
import { useSettingsEnvironment } from "../../hooks/useSettingsEnvironment";

import styles from "./SettingsFocusIndicator.module.css";

export const SettingsFocusIndicator = ({
  container,
  sidebar = false,
}: {
  container: RefObject<HTMLDivElement>;
  sidebar?: boolean;
}) => {
  const { language } = useTranslation();
  const { navigation, drawer, settings } = useSettingsEnvironment();
  const key = useStore(navigation);
  const state = useStore(drawer);
  // Theme proposal: a theme brings its own font and spacing, so the indicator is placed again when a setting
  // changes and when a font has loaded.
  const values = useStore(settings);
  const fonts = useLoadedFonts();
  const [style, setStyle] = useState({
    transform: "",
    width: "0px",
    height: "0px",
    borderRadius: "17px",
  });
  const [visible, setVisible] = useState(false);
  useLayoutEffect(() => {
    const host = container.current;
    const target = navigation.current();
    if (!host || !target || !host.contains(target)) {
      setVisible(false);
      return;
    }
    const rect = target.getBoundingClientRect();
    const parent = host.getBoundingClientRect();
    // Theme proposal: the indicator is placed from the host's padding edge. clientLeft counts the scrollbar,
    // which sits on the left in right-to-left languages.
    setStyle({
      transform:
        "translate3d(" +
        (rect.left - parent.left - host.clientLeft + host.scrollLeft) +
        "px," +
        (rect.top - parent.top - host.clientTop + host.scrollTop) +
        "px,0)",
      width: rect.width + "px",
      height: rect.height + "px",
      borderRadius: getComputedStyle(target).borderRadius,
    });
    setVisible(Boolean(rect.width && rect.height));
  }, [container, key, navigation, state, language, values, fonts]);
  return (
    <div
      aria-hidden="true"
      class={styles.indicator + " " + (sidebar ? styles.sidebar : styles.content)}
      data-settings-focus={sidebar ? "sidebar" : "content"}
      data-visible={visible ? "true" : undefined}
      style={style}
    />
  );
};

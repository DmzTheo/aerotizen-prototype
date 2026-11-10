import type { ComponentChildren } from "preact";

import text from "../../../shared/styles/text.module.css";
import { SettingsControl } from "../SettingsControl/SettingsControl";

import styles from "./ChoiceOption.module.css";

interface Props {
  // Theme proposal: a short mark such as “New”, shown in the corner.
  badge?: ComponentChildren;
  children: ComponentChildren;
  id: string;
  inline?: boolean;
  onSelect(): void;
  selected?: boolean;
  truncate?: boolean;
}

export const ChoiceOption = ({
  id,
  selected = false,
  onSelect,
  children,
  badge,
  inline = false,
  truncate = false,
}: Props) => {
  return (
    <SettingsControl class={styles.option} focusKey={id} role="button" aria-pressed={selected} onClick={onSelect}>
      <span
        class={
          styles.label +
          (inline ? " " + styles.inline : "") +
          (truncate ? " " + styles.singleLine + " " + text.truncate : "")
        }
      >
        {children}
      </span>
      {badge ? (
        <span class={styles.badge} data-choice-badge>
          {badge}
        </span>
      ) : null}
    </SettingsControl>
  );
};

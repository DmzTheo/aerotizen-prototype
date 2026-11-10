import type { JSX } from "preact";

import type { SettingsValues } from "../../../../contracts/preferences";
import type { Preset } from "../../../../themes/presets";
import { SelectionIndicator } from "../../../components/SelectionIndicator/SelectionIndicator";
import { SettingsControl } from "../../../components/SettingsControl/SettingsControl";

import styles from "./PresetOption.module.css";

interface Props {
  focusKey: string;
  label: string;
  // Whether the wallpaper is light: the sketch then turns dark on it, like the Home text.
  light: boolean;
  onSelect(): void;
  preset: Preset;
  // The wallpaper's Settings swatch.
  preview: string;
  selected: boolean;
}

const shapes = (count: number, className: string) =>
  Array.from({ length: count }, (_, index) => <span key={index} class={className} />);
const focused = (className: string) => <span class={className + " " + styles.focus} />;
// A section heading ("Applications", "Sources") as a line of text.
const heading = () => <span class={styles.heading} />;

// Every miniature shows the same apps, in the Home's order (their colours in the CSS), so the layouts compare: five,
// one row of the Grid at the small size, which leaves Continue Watching and the inputs on screen as on the TV.
const APP_COUNT = 5;

// Continue Watching's programmes, the demo's five in its order, each pictured by its index in the CSS.
const programme = (index: number, className: string) => <span key={index} class={className} data-programme={index} />;
const programmes = (first: number, count: number) =>
  Array.from({ length: count }, (_, offset) => programme(first + offset, styles.card));

// The Continue Watching caption (Billboard and Diptych): its label, title, episode, progress and Resume button.
const caption = () => (
  <>
    <span class={styles.kicker} />
    <span class={styles.title} />
    <span class={styles.subtitle} />
    <span class={styles.progress} />
    <span class={styles.button} />
  </>
);

// The glass band of Quay and Moment: the apps, the first one ringed, then the inputs after a divider.
const band = () => (
  <span class={styles.band}>
    <span class={styles.apps}>
      {focused(styles.tile)}
      {shapes(APP_COUNT - 1, styles.tile)}
    </span>
    <span class={styles.inputs}>{shapes(4, styles.input)}</span>
  </span>
);

// Each Home layout at the scale of the miniature (about 1:8) with the small app size, as the demo shows it: the apps in
// their colours, the programmes as their pictures, the inputs, and the first item ringed like the theme's focus.
const grid = () => (
  <span class={styles.grid}>
    <span class={styles.apps}>
      {focused(styles.tile)}
      {shapes(APP_COUNT - 1, styles.tile)}
    </span>
    {heading()}
    <span class={styles.programmes}>{programmes(0, 5)}</span>
    {heading()}
    <span class={styles.inputs}>{shapes(4, styles.input)}</span>
  </span>
);

const SKETCHES: Readonly<Record<SettingsValues["homeAppLayout"], () => JSX.Element>> = {
  grid,
  scroll: grid,
  billboard: () => (
    <span class={styles.billboard}>
      <span class={styles.stage}>
        <span class={styles.hero + " " + styles.focus} data-programme={0}>
          {caption()}
        </span>
        <span class={styles.programmes}>{programmes(1, 4)}</span>
      </span>
      <span class={styles.lower}>
        <span class={styles.section}>
          {heading()}
          <span class={styles.apps}>{shapes(APP_COUNT, styles.tile)}</span>
        </span>
        <span class={styles.section}>
          {heading()}
          <span class={styles.inputs}>{shapes(4, styles.input)}</span>
        </span>
      </span>
    </span>
  ),
  lounge: () => (
    <span class={styles.lounge}>
      {heading()}
      <span class={styles.programmes}>
        {programme(0, styles.card + " " + styles.focus)}
        {programmes(1, 4)}
      </span>
      {heading()}
      <span class={styles.apps}>{shapes(APP_COUNT, styles.tile)}</span>
      {heading()}
      <span class={styles.inputs}>{shapes(4, styles.input)}</span>
    </span>
  ),
  diptych: () => (
    <span class={styles.diptych}>
      <span class={styles.column}>
        {caption()}
        <span class={styles.inputs}>{shapes(4, styles.input)}</span>
      </span>
      <span class={styles.shelf}>
        <span class={styles.programmes}>
          {programme(0, styles.card + " " + styles.focus)}
          {programmes(1, 2)}
        </span>
        <span class={styles.apps}>{shapes(APP_COUNT, styles.tile)}</span>
      </span>
    </span>
  ),
  quay: () => (
    <span class={styles.quay}>
      <span class={styles.programmes}>{programmes(0, 2)}</span>
      {band()}
    </span>
  ),
  // The greeting: the date, the greeting itself and the time.
  moment: () => (
    <span class={styles.moment}>
      <span class={styles.middle}>
        <span class={styles.greeting}>
          <span class={styles.subtitle} />
          <span class={styles.title} />
          <span class={styles.subtitle} />
        </span>
        <span class={styles.programmes}>{programmes(0, 2)}</span>
      </span>
      {band()}
    </span>
  ),
};

// The clock in its style, in the theme's display font, with the date, the weather and its place. The time is a sample:
// the one watch makers show. Every custom style but Horizontal stacks the hours over the minutes.
const clock = (style: Preset["clock"]) => {
  const stacked = style !== "classic" && style !== "horizontal";
  return (
    <span class={styles.clock}>
      <span class={styles.time}>
        {stacked ? (
          <>
            <span>10</span>
            <span>09</span>
          </>
        ) : (
          "10:09"
        )}
      </span>
      <span class={styles.date} />
      <span class={styles.weather} />
      <span class={styles.place} />
    </span>
  );
};

// Theme proposal: a theme of the Themes section shown as a miniature of the Home screen it
// sets (its wallpaper, the interface's colours, corners and font through [data-theme-preview], which receives the
// theme's variables, the clock in its style and a sketch of the Home layout), with its name below. Only the miniature
// takes the focus, so the Settings focus ring follows its shape; the button carries the name.
export const PresetOption = ({ focusKey, label, light, onSelect, preset, preview, selected }: Props) => {
  return (
    <div class={styles.option}>
      <SettingsControl
        class={styles.frame}
        focusKey={focusKey}
        role="button"
        aria-label={label}
        aria-pressed={selected}
        onClick={onSelect}
      >
        <span
          class={styles.screen}
          data-theme-preview={preset.theme}
          data-clock={preset.clock}
          data-layout={preset.homeAppLayout}
          data-light={light ? "true" : undefined}
          style={{ background: preview }}
          aria-hidden="true"
        >
          <span class={styles.icons}>{shapes(3, styles.icon)}</span>
          <span class={styles.tabs} />
          {clock(preset.clock)}
          <span class={styles.content}>{SKETCHES[preset.homeAppLayout]()}</span>
        </span>
        {selected ? <SelectionIndicator small /> : null}
      </SettingsControl>
      <span class={styles.name} aria-hidden="true">
        {label}
      </span>
    </div>
  );
};

// How many whole apps the Quay and Moment band shows beside its inputs, so that no card is cut at the divider: the
// others scroll in. The sizes are the band's own (HomeBand.module.css) and the apps' at each App size
// (AppGrid.module.css).
const CONTENT_WIDTH = 1792;
const BAND_FRAME = 2 * 28 + 2;
const INPUTS_FRAME = 28 + 28 + 1;
const INPUT_COLUMN = 272;
const INPUT_COLUMN_MANY = 224;
const INPUT_GAP = 16;
const APP_GAP = 24;
const MANY_INPUTS = 4;
const APP_CARD_WIDTHS: Readonly<Record<number, number>> = { 3: 400, 4: 368, 5: 332, 6: 265, 7: 225, 8: 184 };

const inputsWidth = (inputs: number) => {
  if (!inputs) {
    return 0;
  }
  const columns = Math.ceil(inputs / 2);
  const column = inputs > MANY_INPUTS ? INPUT_COLUMN_MANY : INPUT_COLUMN;
  return INPUTS_FRAME + columns * column + (columns - 1) * INPUT_GAP;
};

export const bandVisibleApps = (homeColumns: number, apps: number, inputs: number) => {
  const card = APP_CARD_WIDTHS[homeColumns] ?? APP_CARD_WIDTHS[3];
  const room = CONTENT_WIDTH - BAND_FRAME - inputsWidth(inputs);
  return Math.max(1, Math.min(apps, Math.floor((room + APP_GAP) / (card + APP_GAP))));
};

// The width of the band's apps window: its whole cards and the gaps between them.
export const bandAppsWidth = (homeColumns: number, apps: number, inputs: number) => {
  const card = APP_CARD_WIDTHS[homeColumns] ?? APP_CARD_WIDTHS[3];
  const count = bandVisibleApps(homeColumns, apps, inputs);
  return count * card + (count - 1) * APP_GAP;
};

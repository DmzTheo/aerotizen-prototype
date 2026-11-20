import type { MessageKey } from "./i18n/catalogues";

export type HomeSection = "apps" | "continueWatching" | "inputs";
export type HomeAppArrangement = "grid" | "scroll";

export interface HomeLayoutDefinition {
  readonly appArrangement: HomeAppArrangement | "preference";
  readonly appsBesideInputs: boolean;
  readonly belowFold: readonly HomeSection[];
  readonly bottomAligned: boolean;
  readonly clock: "header" | "page" | "pageWhenCustom";
  readonly dockInputsWhenSpaceAllows: boolean;
  readonly header: "tabsFirst" | "clockFirst";
  readonly labelKey: MessageKey;
  readonly main: readonly HomeSection[];
  readonly navigation: "rows" | "nearest";
  readonly rememberMoves: boolean;
  readonly scroll: "offset" | "native";
}

const STANDARD_RULES = {
  appsBesideInputs: false,
  bottomAligned: false,
  clock: "header",
  header: "tabsFirst",
  navigation: "rows",
  rememberMoves: false,
} as const;

const BAND_RULES = {
  appArrangement: "scroll",
  appsBesideInputs: true,
  belowFold: [],
  bottomAligned: true,
  dockInputsWhenSpaceAllows: false,
  navigation: "nearest",
  rememberMoves: true,
  scroll: "offset",
} as const;

const homeLayouts = {
  standard: {
    ...STANDARD_RULES,
    appArrangement: "preference",
    belowFold: [],
    dockInputsWhenSpaceAllows: true,
    labelKey: "appearance.standardLayout",
    main: ["apps", "continueWatching", "inputs"],
    scroll: "offset",
  },
  cinema: {
    ...STANDARD_RULES,
    appArrangement: "scroll",
    belowFold: ["apps", "inputs"],
    dockInputsWhenSpaceAllows: false,
    labelKey: "appearance.cinemaLayout",
    main: ["continueWatching"],
    scroll: "native",
  },
  lounge: {
    appArrangement: "scroll",
    appsBesideInputs: false,
    belowFold: [],
    bottomAligned: true,
    clock: "header",
    dockInputsWhenSpaceAllows: false,
    header: "tabsFirst",
    labelKey: "appearance.lounge",
    main: ["continueWatching", "apps", "inputs"],
    navigation: "rows",
    rememberMoves: true,
    scroll: "offset",
  },
  moment: {
    ...BAND_RULES,
    clock: "page",
    header: "tabsFirst",
    labelKey: "appearance.moment",
    main: ["apps", "inputs", "continueWatching"],
  },
  diptych: {
    ...BAND_RULES,
    clock: "pageWhenCustom",
    header: "tabsFirst",
    labelKey: "appearance.diptych",
    main: ["continueWatching", "apps", "inputs"],
  },
  billboard: {
    ...BAND_RULES,
    clock: "header",
    header: "tabsFirst",
    labelKey: "appearance.billboard",
    main: ["continueWatching", "apps", "inputs"],
  },
  quay: {
    ...BAND_RULES,
    clock: "pageWhenCustom",
    header: "clockFirst",
    labelKey: "appearance.quay",
    main: ["apps", "inputs", "continueWatching"],
  },
} as const satisfies Readonly<Record<string, HomeLayoutDefinition>>;

export type HomeLayoutId = keyof typeof homeLayouts;

export const DEFAULT_HOME_LAYOUT: HomeLayoutId = "standard";
export const HOME_LAYOUT_IDS: readonly HomeLayoutId[] = Object.keys(homeLayouts) as HomeLayoutId[];
export const HOME_LAYOUT_OPTIONS = HOME_LAYOUT_IDS.map((value) => ({ value, labelKey: homeLayouts[value].labelKey }));

export const getHomeLayout = (id: HomeLayoutId): HomeLayoutDefinition => homeLayouts[id];

export const usesHomeAppRail = (settings: { homeAppLayout: HomeAppArrangement; homeLayout: HomeLayoutId }) => {
  const { appArrangement } = getHomeLayout(settings.homeLayout);
  return appArrangement === "scroll" || (appArrangement === "preference" && settings.homeAppLayout === "scroll");
};

export const homeAppGridLayout = (settings: { homeAppLayout: HomeAppArrangement; homeLayout: HomeLayoutId }) =>
  getHomeLayout(settings.homeLayout).appArrangement === "preference" ? settings.homeAppLayout : settings.homeLayout;

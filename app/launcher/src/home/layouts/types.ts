import type { ComponentType, VNode } from "preact";

import type { ContinueItem, InputSource, InstalledApp } from "../../contracts/launcher";
import type { SettingsSnapshot } from "../../contracts/preferences";
import type { HomeLayoutDefinition, HomeSection } from "../../shared/homeLayout";
import type { HomeEnvironment } from "../types";

export interface HomeLayoutSectionsProps {
  readonly definition: HomeLayoutDefinition;
  readonly sections: Readonly<Record<HomeSection, { readonly content: VNode; readonly visible: boolean }>>;
}

export interface HomeLayoutPageProps {
  readonly active: boolean;
  readonly apps: readonly InstalledApp[];
  readonly env: HomeEnvironment;
  readonly ids: readonly string[];
  readonly inputs: readonly InputSource[];
  readonly items: readonly ContinueItem[];
  readonly settings: SettingsSnapshot;
}

interface ProgrammeFeatureProps {
  readonly env: HomeEnvironment;
  readonly items: readonly ContinueItem[];
  onBackdropVisibilityChange(visible: boolean): void;
}

export interface HomeLayoutView {
  readonly Page?: ComponentType<HomeLayoutPageProps>;
  readonly ProgrammeFeature?: ComponentType<ProgrammeFeatureProps>;
  readonly rootClass?: string;
  readonly Sections: ComponentType<HomeLayoutSectionsProps>;
  readonly showProgrammeDetails: boolean;
}

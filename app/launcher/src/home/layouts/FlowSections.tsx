import type { HomeLayoutSectionsProps } from "./types";

export const FlowSections = ({ definition, sections }: HomeLayoutSectionsProps) => (
  <>{[...definition.main, ...definition.belowFold].map((section) => sections[section].content)}</>
);

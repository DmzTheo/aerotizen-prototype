import type { HomeLayoutId } from "../../shared/homeLayout";

import { BillboardLayout } from "./BillboardLayout/BillboardLayout";
import { cinemaLayout } from "./CinemaLayout/CinemaLayout";
import { DiptychLayout } from "./DiptychLayout/DiptychLayout";
import { FlowSections } from "./FlowSections";
import { loungeLayout } from "./LoungeLayout/LoungeLayout";
import { MomentLayout } from "./MomentLayout/MomentLayout";
import { QuayLayout } from "./QuayLayout/QuayLayout";
import type { HomeLayoutView } from "./types";

const pageLayout = (Page: NonNullable<HomeLayoutView["Page"]>): HomeLayoutView => ({
  Page,
  Sections: FlowSections,
  showProgrammeDetails: true,
});

const homeLayoutViews: Readonly<Record<HomeLayoutId, HomeLayoutView>> = {
  standard: { Sections: FlowSections, showProgrammeDetails: true },
  cinema: cinemaLayout,
  lounge: loungeLayout,
  moment: pageLayout(MomentLayout),
  diptych: pageLayout(DiptychLayout),
  billboard: pageLayout(BillboardLayout),
  quay: pageLayout(QuayLayout),
};

export const getHomeLayoutView = (id: HomeLayoutId): HomeLayoutView => homeLayoutViews[id];

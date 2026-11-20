import { useTranslation } from "../../../shared/i18n/useTranslation";
import { HomeSectionHeading } from "../../components/HomeSectionHeading/HomeSectionHeading";
import type { HomeLayoutSectionsProps, HomeLayoutView } from "../types";

const LoungeSections = ({ definition, sections }: HomeLayoutSectionsProps) => {
  const { t } = useTranslation();
  return (
    <>
      {definition.main.map((section) =>
        section === "apps" ? (
          <section key={section} data-home-section="apps" hidden={!sections.apps.visible}>
            <HomeSectionHeading title={t("settings.apps.title")} />
            {sections.apps.content}
          </section>
        ) : (
          sections[section].content
        ),
      )}
    </>
  );
};

export const loungeLayout: HomeLayoutView = { Sections: LoungeSections, showProgrammeDetails: true };

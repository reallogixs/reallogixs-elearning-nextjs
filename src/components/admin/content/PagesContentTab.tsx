"use client";

import type { ReactElement } from "react";

import type { SiteContent } from "@/types/domain";
import { authPageCopySchema, coursePageSchema, pageCopySchema } from "@/lib/validation/content";
import { saveContentBlock } from "@/server/actions/content";

import { ContentSection } from "./ContentSection";
import { AUTH_PAGE_FIELDS, PAGE_FIELDS } from "./sectionFields";

/** Page intros (Courses, Track enrolment, Log in, Sign up) and the course page labels. */
export function PagesContentTab({ content }: { content: SiteContent }): ReactElement {
  const { pages } = content;
  return (
    <>
      <ContentSection
        title="Courses page"
        description="Intro at the top of /courses."
        value={pages.courses}
        fields={PAGE_FIELDS}
        schema={pageCopySchema}
        onSave={(value) => saveContentBlock({ key: "pages.courses", value })}
      />
      <ContentSection
        title="Track enrolment page"
        description="Intro at the top of /track."
        value={pages.track}
        fields={PAGE_FIELDS}
        schema={pageCopySchema}
        onSave={(value) => saveContentBlock({ key: "pages.track", value })}
      />
      <ContentSection
        title="Verify certificate page"
        description="Intro at the top of /verify."
        value={pages.verify}
        fields={PAGE_FIELDS}
        schema={pageCopySchema}
        onSave={(value) => saveContentBlock({ key: "pages.verify", value })}
      />
      <ContentSection
        title="Log in page"
        value={pages.login}
        fields={AUTH_PAGE_FIELDS}
        schema={authPageCopySchema}
        onSave={(value) => saveContentBlock({ key: "pages.login", value })}
      />
      <ContentSection
        title="Sign up page"
        value={pages.signup}
        fields={AUTH_PAGE_FIELDS}
        schema={authPageCopySchema}
        onSave={(value) => saveContentBlock({ key: "pages.signup", value })}
      />
      <ContentSection
        title="Course page"
        description="Labels and the note under the price on every course page. Course details themselves are edited in Courses."
        value={content.coursePage}
        fields={[
          { key: "aboutLabel", label: "Description label" },
          { key: "outcomesLabel", label: "Outcomes label" },
          { key: "instructorLabel", label: "Instructor label" },
          { key: "enrolNote", label: "Note under the Enrol button", kind: "multiline" },
        ]}
        schema={coursePageSchema}
        onSave={(value) => saveContentBlock({ key: "coursePage", value })}
      />
    </>
  );
}

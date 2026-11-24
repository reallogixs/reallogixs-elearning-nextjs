import { Suspense, type ReactElement } from "react";

import { buildMetadata } from "@/lib/seo";
import { ContentPageIntro } from "@/components/site/ContentPageIntro";
import { CourseCatalogue } from "@/components/courses/CourseCatalogue";
import { Skeleton } from "@/components/ui/Skeleton";

export const metadata = buildMetadata({
  title: "Courses",
  description:
    "Browse live courses in web development, AI, design and digital marketing. Filter by category and learn online or on campus in Lahore.",
  path: "/courses",
});

export default function CoursesPage(): ReactElement {
  return (
    <>
      <ContentPageIntro page="courses" />
      <section className="shell pt-10 pb-section lg:pt-12">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <CourseCatalogue />
        </Suspense>
      </section>
    </>
  );
}

import { Suspense, type ReactElement } from "react";

import { buildMetadata } from "@/lib/seo";
import { PageIntro } from "@/components/site/PageIntro";
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
      <PageIntro
        label="Courses"
        title="Find your next skill"
        body="Live, mentor-led batches with real projects. Pick a category, choose online or on campus, and enrol in minutes."
      />
      <section className="shell pt-10 pb-section lg:pt-12">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <CourseCatalogue />
        </Suspense>
      </section>
    </>
  );
}

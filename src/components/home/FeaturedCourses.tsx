"use client";

import type { ReactElement } from "react";

import { useDb } from "@/lib/store/hooks";
import { publishedCourses } from "@/lib/store/selectors";
import { ConnectedCourseCard } from "@/components/courses/ConnectedCourseCard";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function FeaturedCourses(): ReactElement {
  const featured = publishedCourses(useDb())
    .filter((course) => course.featured)
    .slice(0, 3);
  return (
    <Section labelledBy="featured-title">
      <SectionHeading
        id="featured-title"
        label="Featured courses"
        title="Next batches starting soon"
        description="Small, live batches with a mentor who ships real client work."
        action={
          <Button href="/courses" variant="secondary" arrow>
            All courses
          </Button>
        }
      />
      <Reveal stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featured.map((course) => (
          <ConnectedCourseCard key={course.id} course={course} />
        ))}
      </Reveal>
    </Section>
  );
}

"use client";

import type { ReactElement } from "react";

import { useDb } from "@/lib/store/hooks";
import { publishedCourses } from "@/lib/store/selectors";
import { ConnectedCourseCard } from "@/components/courses/ConnectedCourseCard";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

import { ContentHeading } from "./ContentHeading";

export function FeaturedCourses(): ReactElement {
  const db = useDb();
  const featured = publishedCourses(db)
    .filter((course) => course.featured)
    .slice(0, 3);
  return (
    <Section labelledBy="featured-title">
      <ContentHeading
        id="featured-title"
        copy={db.content.sections.featured}
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

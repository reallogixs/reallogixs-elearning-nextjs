"use client";

import type { ReactElement } from "react";

import { useCatalogue, useContent } from "@/components/data/SiteData";
import { ConnectedCourseCard } from "@/components/courses/ConnectedCourseCard";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

import { ContentHeading } from "./ContentHeading";

export function FeaturedCourses(): ReactElement | null {
  const { sections } = useContent();
  const { courses } = useCatalogue();
  const featured = courses.filter((course) => course.featured).slice(0, 3);
  if (featured.length === 0) return null;
  return (
    <Section labelledBy="featured-title">
      <ContentHeading
        id="featured-title"
        copy={sections.featured}
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

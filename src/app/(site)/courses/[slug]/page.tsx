import type { ReactElement } from "react";
import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import { CourseDetail } from "@/components/courses/CourseDetail";
import { createSeed } from "@/mocks/seed";

interface Props {
  params: Promise<{ slug: string }>;
}

/** MOCK: metadata comes from the seed; Supabase will provide the live course. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = createSeed().courses.find((candidate) => candidate.slug === slug);
  return buildMetadata({
    title: course?.title ?? "Course",
    description: course?.summary,
    path: `/courses/${slug}`,
  });
}

export default async function CoursePage({ params }: Props): Promise<ReactElement> {
  const { slug } = await params;
  return <CourseDetail slug={slug} />;
}

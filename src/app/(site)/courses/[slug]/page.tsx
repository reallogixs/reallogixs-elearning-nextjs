import type { ReactElement } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { CatalogueCourse } from "@/types/catalogue";
import { buildMetadata } from "@/lib/seo";
import { CourseDetail } from "@/components/courses/CourseDetail";
import { getCourseText, getPublicCatalogue } from "@/server/queries/catalogue";

interface Props {
  params: Promise<{ slug: string }>;
}

async function find(params: Props["params"]): Promise<CatalogueCourse> {
  const { slug } = await params;
  const { courses } = await getPublicCatalogue();
  return courses.find((course) => course.slug === slug) ?? notFound();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await find(params);
  return buildMetadata({
    title: course.title,
    description: course.summary,
    path: `/courses/${course.slug}`,
  });
}

export default async function CoursePage({ params }: Props): Promise<ReactElement> {
  const course = await find(params);
  const text = (await getCourseText(course.id)) ?? notFound();
  return <CourseDetail course={course} text={text} />;
}

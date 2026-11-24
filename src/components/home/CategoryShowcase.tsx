"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BrainCircuit,
  Code2,
  Megaphone,
  PenTool,
  Shapes,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/cn";
import { buildCategoryTree, descendantIds } from "@/lib/domain/categories";
import { useDb } from "@/lib/store/hooks";
import { publishedCourses } from "@/lib/store/selectors";
import { Reveal } from "@/components/motion/Reveal";
import { Section } from "@/components/ui/Section";

import { ContentHeading } from "./ContentHeading";

/** Icons for the seeded top-level categories; anything new falls back to a generic shape. */
const ICONS: Record<string, LucideIcon> = {
  development: Code2,
  "ai-data": BrainCircuit,
  design: PenTool,
  "digital-marketing": Megaphone,
};

/** Bento grid of top-level categories; the first tile is the large dark one. */
export function CategoryShowcase(): ReactElement {
  const db = useDb();
  const courses = publishedCourses(db);
  const tree = buildCategoryTree(db.categories);
  // The large first tile fills two rows; with an odd number of small tiles beside it,
  // the last one spans two columns so the grid has no empty cell.
  const widenLast = tree.length <= 5 && (tree.length - 1) % 2 === 1;

  return (
    <Section tone="mist" labelledBy="categories-title">
      <ContentHeading id="categories-title" copy={db.content.sections.categories} />
      <Reveal stagger className="grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tree.map((category, index) => {
          const Icon = ICONS[category.slug] ?? Shapes;
          const ids = descendantIds(db.categories, category.id);
          const count = courses.filter((course) => ids.has(course.categoryId)).length;
          const feature = index === 0;
          return (
            <Link
              key={category.id}
              href={`/courses?category=${category.slug}`}
              className={cn(
                "group relative flex flex-col justify-between gap-8 overflow-hidden rounded-lg border p-6 transition-[transform,box-shadow,border-color] duration-base ease-out-expo hover:-translate-y-1 hover:shadow-card",
                feature
                  ? "on-dark border-transparent bg-mesh text-white lg:row-span-2"
                  : "border-line bg-white hover:border-sky-400",
                widenLast && index === tree.length - 1 && "lg:col-span-2",
              )}
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "flex size-12 items-center justify-center rounded-md",
                    feature ? "glass text-sky-300" : "bg-sky-100 text-teal-700",
                  )}
                >
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className={cn(
                    "size-5 transition-transform duration-base group-hover:translate-x-1 group-hover:-translate-y-1",
                    feature ? "text-white" : "text-teal-600",
                  )}
                />
              </div>
              <div className="flex flex-col gap-3">
                <p
                  className={cn(
                    "font-mono text-label uppercase",
                    feature ? "text-sky-300" : "text-ink-soft",
                  )}
                >
                  {count === 1 ? "1 course" : `${count} courses`}
                </p>
                <h3 className={cn(feature ? "text-h2 text-white" : "text-h3")}>{category.name}</h3>
                {category.description ? (
                  <p className={cn("text-small", feature ? "text-on-dark" : "text-ink-soft")}>
                    {category.description}
                  </p>
                ) : null}
                <ul className="mt-1 flex flex-wrap gap-2">
                  {category.children.map((child) => (
                    <li
                      key={child.id}
                      className={cn(
                        "rounded-pill px-3 py-1 text-tag",
                        feature ? "glass text-white" : "border border-line text-ink-soft",
                      )}
                    >
                      {child.name}
                    </li>
                  ))}
                </ul>
              </div>
            </Link>
          );
        })}
      </Reveal>
    </Section>
  );
}

"use client";

import { useMemo, useState, type ReactElement } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SearchX } from "lucide-react";

import type { CourseMode } from "@/types/domain";
import { buildCategoryTree, descendantIds } from "@/lib/domain/categories";
import { useDb } from "@/lib/store/hooks";
import { publishedCourses } from "@/lib/store/selectors";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";

import { CategoryTreeNav } from "./CategoryTreeNav";
import { ConnectedCourseCard } from "./ConnectedCourseCard";

type ModeFilter = CourseMode | "all";

const MODE_OPTIONS: { value: ModeFilter; label: string }[] = [
  { value: "all", label: "All modes" },
  { value: "online", label: "Online" },
  { value: "physical", label: "On campus" },
];

export function CourseCatalogue(): ReactElement {
  const db = useDb();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const activeSlug = params.get("category");
  const [mode, setMode] = useState<ModeFilter>("all");
  const [query, setQuery] = useState("");

  const courses = publishedCourses(db);
  const tree = useMemo(() => buildCategoryTree(db.categories), [db.categories]);

  /** Course count per category, including everything nested under it. */
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const category of db.categories) {
      const ids = descendantIds(db.categories, category.id);
      map.set(category.id, courses.filter((course) => ids.has(course.categoryId)).length);
    }
    return map;
  }, [db.categories, courses]);

  const visible = useMemo(() => {
    const active = db.categories.find((category) => category.slug === activeSlug);
    const allowed = active ? descendantIds(db.categories, active.id) : null;
    const needle = query.trim().toLowerCase();
    return courses.filter(
      (course) =>
        (!allowed || allowed.has(course.categoryId)) &&
        (mode === "all" || course.mode === mode) &&
        (!needle || `${course.title} ${course.summary}`.toLowerCase().includes(needle)),
    );
  }, [courses, db.categories, activeSlug, mode, query]);

  function selectCategory(slug: string | null): void {
    router.replace(slug ? `${pathname}?category=${slug}` : pathname, { scroll: false });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
      <aside className="lg:sticky lg:top-[calc(var(--rl-header-h)+1.5rem)] lg:self-start">
        <CategoryTreeNav
          nodes={tree}
          activeSlug={activeSlug}
          counts={counts}
          onSelect={selectCategory}
        />
      </aside>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <ChipGroup label="Course mode" options={MODE_OPTIONS} value={mode} onChange={setMode} />
          <div className="relative md:w-72">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-soft"
            />
            <Input
              type="search"
              aria-label="Search courses"
              placeholder="Search courses"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-11"
            />
          </div>
        </div>
        <p aria-live="polite" className="text-small text-ink-soft">
          {visible.length === 1 ? "1 course" : `${visible.length} courses`}
        </p>
        {visible.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-5" />}
            title="No courses match"
            body="Try another category or clear the search."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((course) => (
              <ConnectedCourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

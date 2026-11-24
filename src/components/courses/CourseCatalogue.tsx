"use client";

import { useMemo, useState, type ReactElement } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SearchX } from "lucide-react";

import type { CourseMode } from "@/types/domain";
import { buildCategoryTree, descendantIds } from "@/lib/domain/categories";
import { useDb } from "@/lib/store/hooks";
import { publishedCourses } from "@/lib/store/selectors";
import { Button } from "@/components/ui/Button";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterButton } from "@/components/ui/FilterButton";
import { FilterChip } from "@/components/ui/FilterChip";
import { Input } from "@/components/ui/Input";

import { CategoryTreeNav } from "./CategoryTreeNav";
import { ConnectedCourseCard } from "./ConnectedCourseCard";
import { MODE_LABEL } from "./courseLabels";

type ModeFilter = CourseMode | "all";

const MODE_OPTIONS: { value: ModeFilter; label: string }[] = [
  { value: "all", label: "All modes" },
  { value: "online", label: "Online" },
  { value: "physical", label: "On campus" },
];

/** Catalogue with filters: a sidebar on desktop, a drawer on phones and tablets. */
export function CourseCatalogue(): ReactElement {
  const db = useDb();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const activeSlug = params.get("category");
  const [mode, setMode] = useState<ModeFilter>("all");
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const courses = publishedCourses(db);
  const tree = useMemo(() => buildCategoryTree(db.categories), [db.categories]);
  const activeCategory = db.categories.find((category) => category.slug === activeSlug);

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
    const allowed = activeCategory ? descendantIds(db.categories, activeCategory.id) : null;
    const needle = query.trim().toLowerCase();
    return courses.filter(
      (course) =>
        (!allowed || allowed.has(course.categoryId)) &&
        (mode === "all" || course.mode === mode) &&
        (!needle || `${course.title} ${course.summary}`.toLowerCase().includes(needle)),
    );
  }, [courses, db.categories, activeCategory, mode, query]);

  const activeCount = (activeCategory ? 1 : 0) + (mode === "all" ? 0 : 1);

  function selectCategory(slug: string | null): void {
    router.replace(slug ? `${pathname}?category=${slug}` : pathname, { scroll: false });
  }

  function clearAll(): void {
    setMode("all");
    selectCategory(null);
  }

  const categoryNav = (
    <CategoryTreeNav
      nodes={tree}
      activeSlug={activeSlug}
      counts={counts}
      onSelect={selectCategory}
    />
  );
  const hasModes = new Set(courses.map((course) => course.mode)).size > 1;
  const modeChips = (
    <ChipGroup label="Course mode" options={MODE_OPTIONS} value={mode} onChange={setMode} />
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-10">
      <aside className="hidden lg:sticky lg:top-[calc(var(--rl-header-h)+1.5rem)] lg:block lg:self-start">
        {categoryNav}
      </aside>

      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="hidden lg:block">{hasModes ? modeChips : null}</div>
          <div className="flex gap-2 lg:w-72">
            <FilterButton
              count={activeCount}
              expanded={filtersOpen}
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden"
            />
            <div className="relative min-w-0 flex-1">
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
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <p aria-live="polite" className="mr-1 text-small text-ink-soft">
            {visible.length === 1 ? "1 course" : `${visible.length} courses`}
          </p>
          {activeCategory ? (
            <FilterChip label={activeCategory.name} onRemove={() => selectCategory(null)} />
          ) : null}
          {mode !== "all" ? (
            <FilterChip label={MODE_LABEL[mode]} onRemove={() => setMode("all")} />
          ) : null}
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-5" />}
            title="No courses match"
            body="Try another category or clear the search."
            action={
              activeCount ? (
                <Button size="sm" variant="secondary" onClick={clearAll}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((course) => (
              <ConnectedCourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>

      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        side="left"
        footer={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={clearAll}
              disabled={activeCount === 0}
            >
              Clear
            </Button>
            <Button className="flex-1" onClick={() => setFiltersOpen(false)}>
              Show {visible.length}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-6 p-5">
          {hasModes ? (
            <div className="flex flex-col gap-3">
              <p className="text-small font-semibold">Mode</p>
              {modeChips}
            </div>
          ) : null}
          <div className="flex flex-col gap-3">
            <p className="text-small font-semibold">Category</p>
            {categoryNav}
          </div>
        </div>
      </Drawer>
    </div>
  );
}

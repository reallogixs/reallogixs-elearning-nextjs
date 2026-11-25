"use client";

import type { CSSProperties, ReactElement } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { courseEnrolment } from "@/lib/domain/catalogue";
import { formatShortDate } from "@/lib/domain/format";
import { useCatalogue, useContent } from "@/components/data/SiteData";
import { Grain } from "@/components/motion/Grain";
import { Button } from "@/components/ui/Button";
import { MODE_LABEL } from "@/components/courses/courseLabels";

function delay(ms: number): CSSProperties {
  return { "--delay": `${ms}ms` } as CSSProperties;
}

/**
 * Home hero in the main site's style: dark night sky, a glowing planet horizon rising
 * from the bottom, centred copy with a line-by-line reveal, and the next classes.
 * The header turns transparent over it (data-header-tone="dark").
 */
export function HomeHero(): ReactElement {
  const { hero } = useContent();
  const { courses } = useCatalogue();
  const upcoming = courses
    .filter((course) => courseEnrolment(course) === "open")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, 3);

  return (
    <section
      data-header-tone="dark"
      className="relative isolate -mt-header flex min-h-[92svh] flex-col overflow-hidden bg-hero-night pt-header text-on-dark"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid-dark opacity-60" />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 -z-10 aspect-square w-[220%] -translate-x-1/2 translate-y-[calc(100%-var(--rim))] rounded-full globe-horizon [--rim:19rem] sm:w-[160%] sm:[--rim:12rem] lg:w-[120%]"
      />
      <Grain />

      <div className="shell flex flex-1 flex-col items-center pt-14 pb-12 text-center sm:pt-20 lg:pt-24">
        <span className="inline-flex animate-fade-up items-center gap-2 rounded-pill border border-white/15 bg-white/5 py-1.5 pr-4 pl-1.5 text-small backdrop-blur-sm">
          <span className="rounded-pill bg-white px-2.5 py-0.5 font-mono text-[0.6875rem] tracking-[0.12em] text-navy-900 uppercase">
            {hero.badge}
          </span>
          {hero.eyebrow}
        </span>

        <h1 className="mt-7 text-display text-white sm:text-display-xl">
          {[hero.title, hero.highlight].map((line, index) => (
            <span key={line} className="line-mask">
              <span
                className={
                  index === 1
                    ? "mx-auto block w-fit animate-line-up text-gradient-light"
                    : "mx-auto block w-fit animate-line-up"
                }
                style={{ "--i": index } as CSSProperties}
              >
                {line}
              </span>
            </span>
          ))}
        </h1>

        <p
          className="mt-7 max-w-[56ch] animate-fade-up text-body-lg text-on-dark"
          style={delay(250)}
        >
          {hero.subtitle}
        </p>

        <div
          className="mt-9 flex animate-fade-up flex-wrap justify-center gap-3"
          style={delay(350)}
        >
          <Button href="/courses" tone="dark" size="lg" arrow>
            {hero.primaryCta}
          </Button>
          <Button href="/track" tone="dark" size="lg" variant="secondary">
            {hero.secondaryCta}
          </Button>
        </div>

        {upcoming.length ? (
          <div className="mt-auto w-full animate-fade-up pt-16" style={delay(500)}>
            <p className="font-mono text-label text-on-dark-soft uppercase">{hero.upcomingLabel}</p>
            <ul className="mx-auto mt-4 grid max-w-4xl gap-3 sm:grid-cols-3">
              {upcoming.map((course) => (
                <li key={course.id}>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="group flex h-full items-center justify-between gap-3 rounded-md glass px-4 py-3 text-left transition-colors hover:bg-white/12"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-small font-medium text-white">
                        {course.title}
                      </span>
                      <span className="block text-[0.8125rem] text-on-dark-soft">
                        {formatShortDate(course.startsAt)} · {MODE_LABEL[course.mode]}
                      </span>
                    </span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 shrink-0 text-sky-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

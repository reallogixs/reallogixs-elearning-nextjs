"use client";

import type { ReactElement } from "react";

import { useDb } from "@/lib/store/hooks";
import { enabledPaymentMethods, publishedCourses } from "@/lib/store/selectors";
import { PaymentMethodLogo } from "@/components/payments/PaymentMethodLogo";
import { Button } from "@/components/ui/Button";

import { HeroVisual } from "./HeroVisual";
import { StatsStrip } from "./StatsStrip";

export function HomeHero(): ReactElement {
  const db = useDb();
  const { hero, stats } = db.content;
  const next = publishedCourses(db)
    .filter((course) => course.featured && course.enrolmentOpen)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
  const methods = enabledPaymentMethods(db);

  return (
    <section className="relative overflow-hidden bg-gradient-soft">
      <div aria-hidden="true" className="absolute inset-0 bg-grid" />
      <div className="relative shell grid items-center gap-12 pt-10 pb-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pt-16 lg:pb-16">
        <div className="rl-stagger flex flex-col items-start gap-6">
          <p className="inline-flex items-center gap-2 rounded-pill border border-line bg-white/80 py-1 pr-4 pl-1.5 text-small font-medium text-ink shadow-card backdrop-blur">
            <span className="rounded-pill bg-navy-900 px-2.5 py-0.5 font-mono text-[0.6875rem] tracking-[0.12em] text-white uppercase">
              New
            </span>
            {hero.eyebrow}
          </p>
          <h1 className="text-display">
            {hero.title} <span className="text-gradient">{hero.highlight}</span>
          </h1>
          <p className="max-w-xl text-body-lg text-ink-soft">{hero.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Button href="/courses" size="lg" arrow>
              {hero.primaryCta}
            </Button>
            <Button href="/track" size="lg" variant="secondary">
              {hero.secondaryCta}
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex -space-x-2">
              {methods.slice(0, 5).map((method) => (
                <PaymentMethodLogo
                  key={method.id}
                  name={method.name}
                  logoUrl={method.logoUrl}
                  className="size-9 rounded-pill ring-2 ring-white"
                />
              ))}
            </div>
            <p className="text-small text-ink-soft">
              Pay by mobile wallet or bank transfer, then upload your receipt.
            </p>
          </div>
        </div>
        {next ? (
          <div className="animate-fade-up [--delay:250ms]">
            <HeroVisual course={next} />
          </div>
        ) : null}
      </div>
      <div className="relative shell pb-12 lg:pb-16">
        <StatsStrip stats={stats} />
      </div>
    </section>
  );
}

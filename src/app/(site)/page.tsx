import type { ReactElement } from "react";
import type { Metadata } from "next";

import { buildMetadata, SITE } from "@/lib/seo";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { FaqSection } from "@/components/home/FaqSection";
import { FeaturedCourses } from "@/components/home/FeaturedCourses";
import { HomeHero } from "@/components/home/HomeHero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Testimonials } from "@/components/home/Testimonials";

export const metadata: Metadata = {
  ...buildMetadata({ title: SITE.name, path: "/" }),
  title: { absolute: `${SITE.name} — Live courses in software & AI` },
};

export default function HomePage(): ReactElement {
  return (
    <>
      <HomeHero />
      <FeaturedCourses />
      <CategoryShowcase />
      <HowItWorks />
      <Testimonials />
      <FaqSection />
    </>
  );
}

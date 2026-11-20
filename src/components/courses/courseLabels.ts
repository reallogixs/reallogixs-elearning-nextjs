import type { CourseLevel, CourseMode } from "@/types/domain";

export const MODE_LABEL: Record<CourseMode, string> = {
  physical: "On campus",
  online: "Online (live)",
};
export const LEVEL_LABEL: Record<CourseLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

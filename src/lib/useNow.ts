"use client";

import { useState } from "react";

/** The time the component mounted, so date maths during render stays pure and stable. */
export function useNow(): Date {
  const [now] = useState(() => new Date());
  return now;
}

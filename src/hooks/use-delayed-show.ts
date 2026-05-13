"use client";

import { useEffect, useState } from "react";

export function useDelayedShow(delayMs: number): boolean {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (delayMs <= 0) {
      setShow(true);
      return;
    }
    const t = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  return show;
}

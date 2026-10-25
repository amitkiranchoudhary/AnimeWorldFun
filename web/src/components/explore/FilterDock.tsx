"use client";

import { useEffect, useState, type ReactNode } from "react";
import s from "./explore.module.css";

/**
 * Shows its (server-rendered) contents as a floating glass dock while the
 * element `watchId` has scrolled up out of view, and hides it again once
 * `endId` (the end of the results) comes on screen so it never covers the
 * pagination or footer. Hidden = inert, so it can't be tabbed into.
 */
export default function FilterDock({ watchId, endId, children }: { watchId: string; endId: string; children: ReactNode }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const watched = document.getElementById(watchId);
    if (!watched) return;
    const end = document.getElementById(endId);
    let past = false;
    let atEnd = false;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === watched) past = !e.isIntersecting && e.boundingClientRect.top < 0;
        else atEnd = e.isIntersecting;
      }
      setShow(past && !atEnd);
    });
    io.observe(watched);
    if (end) io.observe(end);
    return () => io.disconnect();
  }, [watchId, endId]);

  return (
    <div className={`glass ${s.dock}`} data-show={show || undefined} inert={!show}>
      {children}
    </div>
  );
}

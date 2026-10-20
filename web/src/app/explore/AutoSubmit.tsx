"use client";

import { useEffect, useRef } from "react";

// Submits the surrounding filter form whenever a select or checkbox changes,
// so filters apply instantly, and keeps empty fields out of the URL.
// Without JS the form's "Apply" button still works.
export default function AutoSubmit() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const onChange = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t instanceof HTMLSelectElement || (t instanceof HTMLInputElement && t.type === "checkbox")) {
        form.requestSubmit();
      }
    };
    // Leave blank fields out of the URL (?genre=Romance instead of ?q=&sort=&…&genre=Romance)
    const onSubmit = () => {
      const blanks = [...form.elements].filter(
        (el): el is HTMLInputElement | HTMLSelectElement =>
          (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) && !!el.name && el.value === "",
      );
      blanks.forEach((el) => (el.disabled = true));
      setTimeout(() => blanks.forEach((el) => (el.disabled = false)));
    };
    form.addEventListener("change", onChange);
    form.addEventListener("submit", onSubmit);
    return () => {
      form.removeEventListener("change", onChange);
      form.removeEventListener("submit", onSubmit);
    };
  }, []);

  return <span ref={ref} hidden />;
}

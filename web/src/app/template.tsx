import type { ReactNode } from "react";

// Re-mounts on every navigation, so each page fades in as you arrive.
// Opacity only — a transform or filter here would turn this wrapper into the
// containing block for the pages' fixed-position layers (sky canvases).
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}

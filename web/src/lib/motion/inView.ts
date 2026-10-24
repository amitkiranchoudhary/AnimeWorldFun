// One shared IntersectionObserver for every reveal on the page (cheaper than
// one observer per element). `watch` calls `onShow` the first time the element
// scrolls into view and returns a function that stops watching.

type Callback = () => void;

const callbacks = new WeakMap<Element, Callback>();
let observer: IntersectionObserver | null = null;

function getObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const cb = callbacks.get(e.target);
        if (cb) {
          cb();
          callbacks.delete(e.target);
          observer?.unobserve(e.target);
        }
      }
    },
    // start a little before the element is fully on screen
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  return observer;
}

export function watch(el: Element, onShow: Callback) {
  // no observer support (very old browsers): just show it
  if (typeof IntersectionObserver === "undefined") {
    onShow();
    return () => {};
  }
  callbacks.set(el, onShow);
  getObserver().observe(el);
  return () => {
    callbacks.delete(el);
    observer?.unobserve(el);
  };
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const hasFinePointer = () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

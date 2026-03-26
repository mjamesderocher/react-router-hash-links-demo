import type { RefObject } from "react";

export type ScrollFocusOptions = {
  /**
   * Request smooth `scrollIntoView`. Omitted or false uses `auto` (instant / CSS-driven).
   * Always treated as false when `prefers-reduced-motion: reduce` is set.
   */
  smoothScroll?: boolean;
};

function scrollBehaviorForRequest(smoothRequested: boolean): ScrollBehavior {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "auto";
  }
  return smoothRequested ? "smooth" : "auto";
}

/** Double rAF scroll + focus pattern shared by ref-based demo controls. */
export function scheduleScrollAndFocus(
  focusRef: RefObject<Element | null>,
  options?: ScrollFocusOptions,
) {
  const smoothRequested = options?.smoothScroll === true;

  const run = () => {
    const el = focusRef.current;
    if (!(el instanceof HTMLElement)) return;

    el.scrollIntoView({
      block: "start",
      behavior: scrollBehaviorForRequest(smoothRequested),
    });

    const hadTabIndex = el.hasAttribute("tabindex");
    if (!hadTabIndex) {
      el.setAttribute("tabindex", "-1");
    }
    el.focus({ preventScroll: true });
    if (!hadTabIndex) {
      el.addEventListener(
        "blur",
        () => {
          el.removeAttribute("tabindex");
        },
        { once: true },
      );
    }
  };
  requestAnimationFrame(() => {
    requestAnimationFrame(run);
  });
}

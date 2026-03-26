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

function applyFocusToTarget(el: HTMLElement) {
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
}

/**
 * Aligns the element’s top edge with the top of the viewport by setting window scroll
 * (no `scrollIntoView`). Assumes the page scrolls on the window; nested scroll containers
 * are not walked.
 */
function scrollWindowToElementTop(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const documentY = window.scrollY + rect.top;
  window.scrollTo({ left: window.scrollX, top: documentY, behavior: "auto" });
}

/**
 * Manual `window.scrollTo` + focus, run **synchronously** in the click turn (no
 * double rAF). Deferred scrolling left a window where the activating control
 * could still be focused; the UA then scrolled it back into view (often smooth).
 */
export function scheduleManualScrollAndFocus(
  focusRef: RefObject<Element | null>,
) {
  const el = focusRef.current;
  if (!(el instanceof HTMLElement)) return;

  scrollWindowToElementTop(el);
  applyFocusToTarget(el);
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
    applyFocusToTarget(el);
  };
  requestAnimationFrame(run);
}

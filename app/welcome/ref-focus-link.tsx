import { forwardRef, type MouseEvent, type RefObject, useCallback } from "react";
import {
  createPath,
  type LinkProps,
  useHref,
  useLocation,
  useNavigate,
  useResolvedPath,
} from "react-router";

const ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

function isModifiedEvent(event: MouseEvent<HTMLAnchorElement>) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

/** Match React Router `Link` — only primary unmodified clicks use client navigation. */
function shouldProcessLinkClick(
  event: MouseEvent<HTMLAnchorElement>,
  target: string | undefined,
) {
  return (
    event.button === 0 &&
    (!target || target === "_self") &&
    !isModifiedEvent(event)
  );
}

function scheduleScrollAndFocus(focusRef: RefObject<Element | null>) {
  const run = () => {
    const el = focusRef.current;
    if (!(el instanceof HTMLElement)) return;

    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    el.scrollIntoView({
      block: "start",
      behavior: smooth ? "smooth" : "auto",
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

export type RefFocusLinkProps = LinkProps & {
  /** Element to scroll into view and focus (attach this ref to the target). */
  focusRef: RefObject<Element | null>;
};

/**
 * In-app navigation without `Link`: updates the URL via `navigate`, then scrolls and focuses
 * `focusRef.current` so behavior is consistent for mouse and keyboard (activation uses `click`).
 */
export const RefFocusLink = forwardRef<HTMLAnchorElement, RefFocusLinkProps>(
  function RefFocusLink(props, forwardedRef) {
    const {
      to,
      focusRef,
      onClick,
      discover: _discover,
      prefetch: _prefetch,
      relative,
      reloadDocument,
      replace: replaceProp,
      unstable_mask: _unstable_mask,
      state,
      target,
      preventScrollReset,
      viewTransition,
      unstable_defaultShouldRevalidate: _unstable_defaultShouldRevalidate,
      ...rest
    } = props;

    const href = useHref(to, { relative });
    const navigate = useNavigate();
    const location = useLocation();
    const path = useResolvedPath(to, { relative });

    const isAbsolute = typeof to === "string" && ABSOLUTE_URL_REGEX.test(to);

    const handleClick = useCallback(
      (e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (e.defaultPrevented) return;

        if (reloadDocument || isAbsolute) {
          return;
        }

        if (!shouldProcessLinkClick(e, target)) {
          return;
        }

        e.preventDefault();
        const replace =
          replaceProp !== undefined
            ? replaceProp
            : createPath(location) === createPath(path);
        navigate(to, {
          replace,
          state,
          preventScrollReset:
            preventScrollReset !== undefined ? preventScrollReset : true,
          relative,
          viewTransition,
        });
        scheduleScrollAndFocus(focusRef);
      },
      [
        focusRef,
        isAbsolute,
        location,
        navigate,
        onClick,
        path,
        preventScrollReset,
        relative,
        replaceProp,
        reloadDocument,
        state,
        target,
        to,
        viewTransition,
      ],
    );

    return (
      <a
        {...rest}
        ref={forwardedRef}
        href={href}
        target={target}
        onClick={handleClick}
      />
    );
  },
);

RefFocusLink.displayName = "RefFocusLink";

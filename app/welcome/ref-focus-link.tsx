import { forwardRef, type MouseEvent, type RefObject, useCallback } from "react";
import {
  createPath,
  type LinkProps,
  useHref,
  useLocation,
  useNavigate,
  useResolvedPath,
} from "react-router";
import { scheduleScrollAndFocus } from "./scroll-focus-target";

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

export type RefFocusLinkProps = LinkProps & {
  /** Element to scroll into view and focus (attach this ref to the target). */
  focusRef: RefObject<Element | null>;
  /**
   * Request smooth scroll; ignored when `prefers-reduced-motion: reduce` (defaults to false).
   */
  smoothScroll?: boolean;
};

/**
 * In-app navigation with `Link`-style URL updates via `navigate`, then scrolls and focuses
 * `focusRef.current` so behavior is consistent for mouse and keyboard (activation uses `click`).
 */
export const RefFocusLink = forwardRef<HTMLAnchorElement, RefFocusLinkProps>(
  function RefFocusLink(props, forwardedRef) {
    const {
      to,
      focusRef,
      smoothScroll = false,
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
        scheduleScrollAndFocus(focusRef, { smoothScroll });
      },
      [
        focusRef,
        isAbsolute,
        smoothScroll,
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

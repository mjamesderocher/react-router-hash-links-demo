import {
  forwardRef,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  useCallback,
} from "react";
import { scheduleScrollAndFocus } from "./scroll-focus-target";

/** Visually match inline links; `type="button"` avoids form submit. */
const buttonResetClassName =
  "inline cursor-pointer appearance-none border-0 bg-transparent p-0 font-inherit";

/** After reset so UA `button` text color does not override link styling from `className`. */
const linkTextClassName = "text-blue-600 dark:text-blue-400";

export type RefFocusButtonProps = {
  focusRef: RefObject<Element | null>;
  className?: string;
  children?: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /**
   * Request smooth scroll; ignored when `prefers-reduced-motion: reduce` (defaults to false).
   */
  smoothScroll?: boolean;
};

/**
 * Button-only control: scrolls to and focuses `focusRef.current`.
 * Does not use React Router or change the URL / history.
 */
export const RefFocusButton = forwardRef<
  HTMLButtonElement,
  RefFocusButtonProps
>(function RefFocusButton(props, forwardedRef) {
  const { focusRef, smoothScroll = false, onClick, className, children } =
    props;

  const mergedClassName = [
    className,
    buttonResetClassName,
    linkTextClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      scheduleScrollAndFocus(focusRef, { smoothScroll });
    },
    [focusRef, onClick, smoothScroll],
  );

  return (
    <button
      type="button"
      ref={forwardedRef}
      className={mergedClassName}
      onClick={handleClick}
    >
      {children}
    </button>
  );
});

RefFocusButton.displayName = "RefFocusButton";

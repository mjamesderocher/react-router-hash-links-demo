import {
  forwardRef,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  useCallback,
} from "react";
import { scheduleManualScrollAndFocus } from "./scroll-focus-target";

/** Visually match inline links; `type="button"` avoids form submit. */
const buttonResetClassName =
  "inline cursor-pointer appearance-none border-0 bg-transparent p-0 font-inherit";

const linkTextClassName = "text-blue-600 dark:text-blue-400";

export type RefFocusManualButtonProps = {
  focusRef: RefObject<Element | null>;
  className?: string;
  children?: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

/**
 * Button-only: moves the window scroll position so the target’s top meets the viewport top
 * (`window.scrollTo`), then focuses — no `scrollIntoView`, no history change.
 */
export const RefFocusManualButton = forwardRef<
  HTMLButtonElement,
  RefFocusManualButtonProps
>(function RefFocusManualButton(props, forwardedRef) {
  const { focusRef, onClick, className, children } = props;

  const mergedClassName = [
    className,
    buttonResetClassName,
    linkTextClassName,
  ]
    .filter(Boolean)
    .join(" ");

  /** Stops the button taking focus on mouse down so :focus stays off it during rAF + scroll. */
  const handleMouseDown = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  }, []);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      scheduleManualScrollAndFocus(focusRef);
    },
    [focusRef, onClick],
  );

  return (
    <button
      type="button"
      ref={forwardedRef}
      className={mergedClassName}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {children}
    </button>
  );
});

RefFocusManualButton.displayName = "RefFocusManualButton";

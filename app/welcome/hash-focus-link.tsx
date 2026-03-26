import {
  type ComponentProps,
  type MouseEvent,
  useCallback,
} from "react";
import { Link } from "react-router";

type LinkProps = ComponentProps<typeof Link>;

function hashFromTo(to: LinkProps["to"]): string | null {
  if (typeof to === "string") {
    if (to.startsWith("#") && to.length > 1) return to;
    const i = to.indexOf("#");
    if (i >= 0 && i < to.length - 1) return to.slice(i);
    return null;
  }
  if (to && typeof to === "object" && "hash" in to && to.hash) {
    const h = String(to.hash);
    return h.startsWith("#") ? h : `#${h}`;
  }
  return null;
}

/** Run after hash navigation / scroll so the target node exists and layout is settled. */
function scheduleFocusHashTarget(hash: string) {
  let id: string;
  try {
    id = decodeURIComponent(hash.slice(1));
  } catch {
    id = hash.slice(1);
  }
  const run = () => {
    const el = document.getElementById(id);
    if (!(el instanceof HTMLElement)) return;
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

/**
 * Same as `Link`, but after in-page hash navigation the target element receives focus
 * (with a temporary `tabindex="-1"` when it is not naturally focusable).
 */
export function HashFocusLink({ to, onClick, ...rest }: LinkProps) {
  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      const hash = hashFromTo(to);
      if (hash) scheduleFocusHashTarget(hash);
    },
    [onClick, to],
  );
  return <Link {...rest} to={to} onClick={handleClick} />;
}

import type { RefObject } from "react";
import { Link } from "react-router";
import { HashFocusLink } from "./hash-focus-link";
import { RefFocusButton } from "./ref-focus-button";
import { RefFocusLink } from "./ref-focus-link";

const stackClassName =
  "flex w-full max-w-md flex-col items-center gap-4 text-sm";

const itemClassName =
  "text-center text-blue-600 underline underline-offset-2 hover:no-underline dark:text-blue-400";

export function HashLinksToBottom({
  bottomTargetRef,
}: {
  bottomTargetRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className={stackClassName}>
      <a href="#bottom" className={itemClassName}>
        Bottom Anchor Tag
      </a>
      <Link to="#bottom" className={itemClassName}>
        Bottom Link
      </Link>
      <HashFocusLink to="#bottom" className={itemClassName}>
        Bottom Link Modified
      </HashFocusLink>
      <RefFocusLink
        to="#bottom"
        focusRef={bottomTargetRef}
        className={itemClassName}
      >
        Bottom RefFocusLink (RR navigate)
      </RefFocusLink>
      <RefFocusButton focusRef={bottomTargetRef} className={itemClassName}>
        Bottom RefFocusButton (scroll only)
      </RefFocusButton>
    </div>
  );
}

export function HashLinksToTop({
  topTargetRef,
}: {
  topTargetRef: RefObject<HTMLElement | null>;
}) {
  return (
    <div className={stackClassName}>
      <a href="#top" className={itemClassName}>
        Top Anchor Tag
      </a>
      <Link to="#top" className={itemClassName}>
        Top Link
      </Link>
      <HashFocusLink to="#top" className={itemClassName}>
        Top Link Modified
      </HashFocusLink>
      <RefFocusLink
        to="#top"
        focusRef={topTargetRef}
        className={itemClassName}
      >
        Top RefFocusLink (RR navigate)
      </RefFocusLink>
      <RefFocusButton focusRef={topTargetRef} className={itemClassName}>
        Top RefFocusButton (scroll only)
      </RefFocusButton>
    </div>
  );
}

import type { RefObject } from "react";
import { Link } from "react-router";
import { HashFocusLink } from "./hash-focus-link";
import { RefFocusButton } from "./ref-focus-button";
import { RefFocusManualButton } from "./ref-focus-manual-button";
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
        Bottom Link Modified to Focus
      </HashFocusLink>
      <RefFocusLink
        to="#bottom"
        focusRef={bottomTargetRef}
        className={itemClassName}
      >
        Bottom Link Modified to Focus using Ref
      </RefFocusLink>
      <RefFocusButton focusRef={bottomTargetRef} className={itemClassName}>
        Bottom Button that focuses and scrolls using scrollIntoView
      </RefFocusButton>
      <RefFocusManualButton focusRef={bottomTargetRef} className={itemClassName}>
        Bottom Button that focuses and scrolls using window.scrollTo
      </RefFocusManualButton>
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
        Top Link Modified to Focus
      </HashFocusLink>
      <RefFocusLink
        to="#top"
        focusRef={topTargetRef}
        className={itemClassName}
      >
        Top Link Modified to Focus using Ref
      </RefFocusLink>
      <RefFocusButton focusRef={topTargetRef} className={itemClassName}>
        Top Button that focuses and scrolls using scrollIntoView
      </RefFocusButton>
      <RefFocusManualButton focusRef={topTargetRef} className={itemClassName}>
        Top Button that focuses and scrolls using window.scrollTo
      </RefFocusManualButton>
    </div>
  );
}

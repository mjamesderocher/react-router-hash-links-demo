import { useRef } from "react";
import { DemoSiteNav } from "./demo-site-nav";
import { HashLinksToBottom, HashLinksToTop } from "./hash-demo-link-stacks";

/**
 * Static hash-link probe: same link types as the chaos page, no timers or layout churn.
 */
export function SimpleHashDemo() {
  const topTargetRef = useRef<HTMLElement>(null);
  const bottomTargetRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <DemoSiteNav page="simple" />

      <header
        ref={topTargetRef}
        className="flex flex-col items-center gap-9"
        id="top"
      >
        <p className="max-w-md text-center text-sm text-gray-600 dark:text-gray-400">
          Minimal page for Safari / hash / scroll debugging — no chaos timers or
          heavy widgets.
        </p>
        <HashLinksToBottom bottomTargetRef={bottomTargetRef} />
      </header>

      <div className="flex w-full max-w-3xl flex-col gap-4 px-4 pb-8">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Static filler between anchors (no re-rendering stress).
        </p>
      </div>

      <div className="h-[800px]" />
      <div ref={bottomTargetRef} id="bottom" className="pb-[200px]">
        <HashLinksToTop topTargetRef={topTargetRef} />
      </div>
    </>
  );
}

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
        <HashLinksToBottom bottomTargetRef={bottomTargetRef} />
      </header>
      <div className="h-[800px]" />
      <div ref={bottomTargetRef} id="bottom" className="pb-[200px]">
        <HashLinksToTop topTargetRef={topTargetRef} />
      </div>
    </>
  );
}

import { Link } from "react-router";
import { SmoothScrollProvider } from "./smooth-scroll-context";
import { SmoothScrollToggle } from "./smooth-scroll-toggle";

type DemoSiteNavProps = {
  /** Which page we’re on: the other hash demo is linked in the second slot. */
  page: "simple" | "chaos";
};

/** Home + cross-link between the simple and chaos hash test pages. */
export function DemoSiteNav({ page }: DemoSiteNavProps) {
  const other =
    page === "simple"
      ? { to: "/chaos", label: "Chaos demo" }
      : { to: "/simple", label: "Simple demo" };

  return (
    <SmoothScrollProvider>
      <header className="flex w-full max-w-2xl flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
        <nav className="flex flex-wrap justify-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <Link to="/" className="underline-offset-2 hover:underline">
            Home
          </Link>
          <span aria-hidden className="opacity-40">
            ·
          </span>
          <Link to={other.to} className="underline-offset-2 hover:underline">
            {other.label}
          </Link>
        </nav>
        <SmoothScrollToggle />
      </header>
    </SmoothScrollProvider>
  );
}

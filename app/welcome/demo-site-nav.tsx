import { Link } from "react-router";

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
  );
}

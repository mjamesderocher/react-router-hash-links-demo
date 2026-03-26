import type { Route } from "./+types/home";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Hash link demos" },
    { name: "description", content: "Pick a demo: minimal or chaos stress page." },
  ];
}

export default function Home() {
  return (
    <main className="flex min-h-[50vh] items-center justify-center px-4 pt-16 pb-4">
      <div className="flex max-w-md flex-col gap-6 text-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Hash link demos
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Compare Safari scroll behavior on a static page versus the full chaos
          stress layout.
        </p>
        <ul className="flex flex-col gap-3 text-sm">
          <li>
            <Link
              to="/simple"
              className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
            >
              Simple demo
            </Link>
            <span className="mt-1 block text-gray-500 dark:text-gray-500">
              Plain layout, same hash / RefFocusLink controls.
            </span>
          </li>
          <li>
            <Link
              to="/chaos"
              className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
            >
              Chaos demo
            </Link>
            <span className="mt-1 block text-gray-500 dark:text-gray-500">
              Original welcome with timers, grids, and images.
            </span>
          </li>
        </ul>
      </div>
    </main>
  );
}

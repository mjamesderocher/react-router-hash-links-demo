import { useDemoSmoothScroll } from "./smooth-scroll-context";

export function SmoothScrollToggle() {
  const { enabled, setEnabled } = useDemoSmoothScroll();

  return (
    <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => setEnabled(e.target.checked)}
        className="size-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500 dark:border-gray-500 dark:text-blue-500"
      />
      <span>CSS smooth scroll</span>
    </label>
  );
}

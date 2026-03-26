import type { Route } from "./+types/simple";
import { SimpleHashDemo } from "../welcome/simple-hash-demo";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Simple hash demo" },
    { name: "description", content: "Minimal hash / RefFocusLink test page." },
  ];
}

export default function SimpleRoute() {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex min-h-0 flex-1 flex-col items-center gap-16">
        <SimpleHashDemo />
      </div>
    </main>
  );
}

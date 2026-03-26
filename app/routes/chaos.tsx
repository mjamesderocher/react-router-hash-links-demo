import type { Route } from "./+types/chaos";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chaos hash demo" },
    { name: "description", content: "Hash links with render / re-render stress UI." },
  ];
}

export default function ChaosRoute() {
  return (
    <Welcome
      chaosTitle="Chaos probes (parent-driven title prop)"
      chaosContentClassName="ring-1 ring-gray-400/15 dark:ring-gray-500/20"
    />
  );
}

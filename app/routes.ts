import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("simple", "routes/simple.tsx"),
  route("chaos", "routes/chaos.tsx"),
] satisfies RouteConfig;

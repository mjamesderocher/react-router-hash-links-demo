import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { DemoSiteNav } from "./demo-site-nav";
import { HashLinksToBottom, HashLinksToTop } from "./hash-demo-link-stacks";

/** Passed from `Welcome` on a random timer so every chaos child gets prop churn. */
type ParentDriveProps = { parentBurst: number };

function ParentPropNote({ parentBurst }: ParentDriveProps) {
  return (
    <p className="mt-2 border-t border-black/10 pt-2 text-[10px] text-current opacity-50 tabular-nums dark:border-white/10">
      Welcome prop burst: {parentBurst}
    </p>
  );
}

/** Re-renders on a new random delay after each tick (50ms–1.2s). */
function RandomIntervalChaos({ parentBurst }: ParentDriveProps) {
  const [tick, setTick] = useState(0);
  const [nextDelayMs, setNextDelayMs] = useState<number | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const ms = 50 + Math.random() * 1150;
      setNextDelayMs(ms);
      timeoutId = setTimeout(() => {
        setTick((n) => n + 1);
        schedule();
      }, ms);
    };

    schedule();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div
      className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 font-mono text-xs text-amber-950 dark:text-amber-100"
      data-welcome-burst={parentBurst}
    >
      <p className="font-semibold text-amber-800 dark:text-amber-200">
        Random-interval chaos
      </p>
      <p>ticks: {tick}</p>
      <p>next delay: {nextDelayMs != null ? `${nextDelayMs.toFixed(0)} ms` : "—"}</p>
      <ParentPropNote parentBurst={parentBurst} />
    </div>
  );
}

/** One setState per animation frame (~60+ Hz). */
function RafChaos({ parentBurst }: ParentDriveProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setFrame((f) => f + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const hue = frame % 360;
  return (
    <div
      className="rounded-lg border p-3 font-mono text-xs"
      data-welcome-burst={parentBurst}
      style={{
        borderColor: `hsl(${(hue + parentBurst * 3) % 360} 70% 45%)`,
        backgroundColor: `hsl(${hue} 35% 15% / 0.35)`,
      }}
    >
      <p className="font-semibold">rAF spam (every frame)</p>
      <p>frame: {frame}</p>
      <ParentPropNote parentBurst={parentBurst} />
    </div>
  );
}

function ChaosGridCell({ i, pulse }: { i: number; pulse: number }) {
  const mod = (i + pulse) % 7;
  return (
    <span
      className="inline-block size-2 rounded-sm"
      style={{
        backgroundColor: `hsl(${(i * 17 + pulse) % 360} 65% 55%)`,
        opacity: 0.35 + mod * 0.1,
      }}
    />
  );
}

/** Fast interval + 48 cells = many child commits per parent update. */
function BurstGridChaos({ parentBurst }: ParentDriveProps) {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPulse((p) => p + 1), 8);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="rounded-lg border border-violet-500/40 bg-violet-500/5 p-3 font-mono text-xs"
      data-welcome-burst={parentBurst}
    >
      <p className="mb-2 font-semibold text-violet-900 dark:text-violet-200">
        Burst grid (8ms interval × 48 children)
      </p>
      <p className="mb-2">pulse: {pulse}</p>
      <div className="flex max-w-xs flex-wrap gap-1">
        {Array.from({ length: 48 }, (_, i) => (
          <ChaosGridCell
            key={i}
            i={i}
            pulse={pulse + (parentBurst % 3)}
          />
        ))}
      </div>
      <ParentPropNote parentBurst={parentBurst} />
    </div>
  );
}

const ChaosTickContext = createContext(0);

function ChaosCtxLeaf({ i, parentBurst }: { i: number } & ParentDriveProps) {
  const tick = useContext(ChaosTickContext);
  return (
    <span className="inline-block min-w-6 text-[10px] text-cyan-950/80 dark:text-cyan-100/90">
      {(tick + i + parentBurst) % 1000}
    </span>
  );
}

/** One fast provider value bump → dozens of consumer re-renders. */
function ContextFanoutChaos({ parentBurst }: ParentDriveProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="rounded-lg border border-cyan-500/40 bg-cyan-500/5 p-3 font-mono text-xs"
      data-welcome-burst={parentBurst}
    >
      <p className="mb-2 font-semibold text-cyan-900 dark:text-cyan-200">
        Context fan-out (10ms × 36 consumers)
      </p>
      <p className="mb-2">tick: {tick}</p>
      <ChaosTickContext.Provider value={tick}>
        <div className="flex max-w-full flex-wrap gap-x-1 gap-y-0.5">
          {Array.from({ length: 36 }, (_, i) => (
            <ChaosCtxLeaf key={i} i={i} parentBurst={parentBurst} />
          ))}
        </div>
      </ChaosTickContext.Provider>
      <ParentPropNote parentBurst={parentBurst} />
    </div>
  );
}

function RemountedHeavyChild({ parentBurst }: ParentDriveProps) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN((x) => x + 1), 25);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="text-rose-200">
      inner {n % 1000} · pb {parentBurst % 100} ·{" "}
      {Array.from({ length: 12 }, (_, j) => (n + j + parentBurst) % 10).join("")}
    </span>
  );
}

/** Random remounts wipe subscriptions and rebuild a chatty subtree. */
function RemountRouletteChaos({ parentBurst }: ParentDriveProps) {
  const [mountKey, setMountKey] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() < 0.35) setMountKey((k) => k + 1);
    }, 80);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="rounded-lg border border-rose-500/40 bg-rose-500/5 p-3 font-mono text-xs text-rose-950 dark:text-rose-50"
      data-welcome-burst={parentBurst}
    >
      <p className="font-semibold text-rose-800 dark:text-rose-200">
        Remount roulette (~35% / 80ms)
      </p>
      <p className="text-rose-900/80 dark:text-rose-100/80">
        mountKey: {mountKey}
      </p>
      <p className="mt-1 break-all">
        <RemountedHeavyChild key={mountKey} parentBurst={parentBurst} />
      </p>
      <ParentPropNote parentBurst={parentBurst} />
    </div>
  );
}

/** Deep microtask chain; new burst each frame (rAF yield so the tab stays responsive). */
function MicrotaskBurstChaos({ parentBurst }: ParentDriveProps) {
  const [wave, setWave] = useState(0);
  const [depthCount, setDepthCount] = useState(0);

  useEffect(() => {
    let alive = true;
    let raf = 0;

    const runBurst = () => {
      if (!alive) return;
      let depth = 0;
      const step = () => {
        if (!alive) return;
        if (depth >= 40) {
          setDepthCount(40);
          setWave((w) => w + 1);
          raf = requestAnimationFrame(() => {
            if (alive) queueMicrotask(runBurst);
          });
          return;
        }
        depth += 1;
        setDepthCount(depth);
        queueMicrotask(step);
      };
      queueMicrotask(step);
    };

    raf = requestAnimationFrame(() => queueMicrotask(runBurst));
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className="rounded-lg border border-lime-500/40 bg-lime-500/5 p-3 font-mono text-xs text-lime-950 dark:text-lime-100"
      data-welcome-burst={parentBurst}
    >
      <p className="font-semibold text-lime-900 dark:text-lime-200">
        Microtask burst (40 deep / wave)
      </p>
      <p>waves: {wave}</p>
      <p>last depth: {depthCount}</p>
      <p className="text-[10px] opacity-60">depth + burst mod: {(depthCount + parentBurst) % 100}</p>
      <ParentPropNote parentBurst={parentBurst} />
    </div>
  );
}

/** Several unrelated timers fighting each other. */
function TimerStackChaos({ parentBurst }: ParentDriveProps) {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);

  useEffect(() => {
    const i1 = setInterval(() => setA((x) => x + 1), 11);
    const i2 = setInterval(() => setB((x) => x + 2), 17);
    const i3 = setInterval(() => setC((x) => x + 3), 23);
    return () => {
      clearInterval(i1);
      clearInterval(i2);
      clearInterval(i3);
    };
  }, []);

  return (
    <div
      className="rounded-lg border border-orange-500/40 bg-orange-500/5 p-3 font-mono text-xs text-orange-950 dark:text-orange-50"
      data-welcome-burst={parentBurst}
    >
      <p className="font-semibold text-orange-900 dark:text-orange-200">
        Coprime intervals (11 / 17 / 23 ms)
      </p>
      <p>
        a={a} b={b} c={c} sum={a + b + c + parentBurst}
      </p>
      <ParentPropNote parentBurst={parentBurst} />
    </div>
  );
}

/**
 * Blocks the main thread for hundreds of ms (a real “long task”), on a slow random cadence.
 * Unlike the fast timers/rAF probes, this is meant to stall paints, rAF, and React updates.
 */
function LongMainThreadTaskChaos({ parentBurst }: ParentDriveProps) {
  const [runs, setRuns] = useState(0);
  const [lastBlockMs, setLastBlockMs] = useState<number | null>(null);
  const [nextWaitMs, setNextWaitMs] = useState<number | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const waitMs = 6000 + Math.random() * 14000;
      const targetBlockMs = 250 + Math.random() * 550;
      setNextWaitMs(waitMs);

      timeoutId = setTimeout(() => {
        const start = performance.now();
        const deadline = start + targetBlockMs;
        while (performance.now() < deadline) {
          /* synchronous CPU spin — intentionally empty */
        }
        setLastBlockMs(Math.round(performance.now() - start));
        setRuns((n) => n + 1);
        schedule();
      }, waitMs);
    };

    schedule();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div
      className="rounded-lg border border-red-600/50 bg-red-600/10 p-3 font-mono text-xs text-red-950 dark:border-red-500/40 dark:bg-red-950/30 dark:text-red-100"
      data-welcome-burst={parentBurst}
    >
      <p className="font-semibold text-red-900 dark:text-red-200">
        Long main-thread task (blocking spin)
      </p>
      <p className="mt-1 text-[11px] opacity-90">
        Every ~6–20s, runs one synchronous slice ~250–800ms. Expect UI freezes and
        delayed rAF / transitions.
      </p>
      <p className="mt-2 tabular-nums">
        runs: {runs}
        {lastBlockMs != null ? ` · last block ≈ ${lastBlockMs} ms` : ""}
      </p>
      <p className="text-[10px] opacity-70">
        next scheduled gap:{" "}
        {nextWaitMs != null ? `~${Math.round(nextWaitMs / 1000)}s` : "—"}{" "}
        (then block)
      </p>
      <ParentPropNote parentBurst={parentBurst} />
    </div>
  );
}

function LongListRow({
  i,
  tick,
  parentBurst,
}: {
  i: number;
  tick: number;
} & ParentDriveProps) {
  const v = (tick * 31 + i * 7 + parentBurst) % 997;
  return (
    <div
      className="h-1 rounded-sm"
      style={{
        width: `${4 + (v % 92)}%`,
        backgroundColor: `hsl(${(v + i + parentBurst) % 360} 55% 50%)`,
        opacity: 0.4 + (v % 5) * 0.12,
      }}
    />
  );
}

/** Wide tree: parent tick + 120 style-mutating rows. */
function LongListChaos({ parentBurst }: ParentDriveProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 45);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="rounded-lg border border-sky-500/40 bg-sky-500/5 p-3 font-mono text-xs"
      data-welcome-burst={parentBurst}
    >
      <p className="mb-2 font-semibold text-sky-900 dark:text-sky-200">
        Long list (45ms × 120 rows)
      </p>
      <p className="mb-2 text-sky-950/80 dark:text-sky-100/80">tick: {tick}</p>
      <div className="max-h-32 space-y-0.5 overflow-y-auto pr-1">
        {Array.from({ length: 120 }, (_, i) => (
          <LongListRow key={i} i={i} tick={tick} parentBurst={parentBurst} />
        ))}
      </div>
      <ParentPropNote parentBurst={parentBurst} />
    </div>
  );
}

/** Parent + child both on rAF (two animation pipelines). */
function NestedRafChaos({ parentBurst }: ParentDriveProps) {
  const [outer, setOuter] = useState(0);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setOuter((o) => o + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/5 p-3 font-mono text-xs"
      data-welcome-burst={parentBurst}
    >
      <p className="font-semibold text-fuchsia-900 dark:text-fuchsia-200">
        Nested rAF (outer + inner)
      </p>
      <p>outer: {outer}</p>
      <InnerRafChaos parentBurst={parentBurst} />
      <ParentPropNote parentBurst={parentBurst} />
    </div>
  );
}

function InnerRafChaos({ parentBurst }: ParentDriveProps) {
  const [inner, setInner] = useState(0);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setInner((n) => n + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <p>
      inner: {inner} · pb mod: {(inner + parentBurst) % 97}
    </p>
  );
}

type CatImageProvider = "placecats" | "lorem";

function bustQuery() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

/** https://placecats.com — JPEG placeholders (PlaceKitten-style; currently more reliable). */
function placeCatsSrc(width: number, height: number, bust = bustQuery()) {
  return `https://placecats.com/${width}/${height}?bust=${encodeURIComponent(bust)}`;
}

/** https://loremflickr.com — random Flickr photo tagged “cat” (302 → image; cache-bust via query). */
function loremCatSrc(width: number, height: number, bust = bustQuery()) {
  return `https://loremflickr.com/${width}/${height}/cat?random=${encodeURIComponent(bust)}`;
}

function randomCatPair(
  width: number,
  height: number,
): { provider: CatImageProvider; src: string } {
  const provider: CatImageProvider = Math.random() < 0.5 ? "placecats" : "lorem";
  const bust = bustQuery();
  const src =
    provider === "placecats"
      ? placeCatsSrc(width, height, bust)
      : loremCatSrc(width, height, bust);
  return { provider, src };
}

function otherProvider(
  provider: CatImageProvider,
  width: number,
  height: number,
): { provider: CatImageProvider; src: string } {
  const next: CatImageProvider = provider === "placecats" ? "lorem" : "placecats";
  const bust = bustQuery();
  const src =
    next === "placecats"
      ? placeCatsSrc(width, height, bust)
      : loremCatSrc(width, height, bust);
  return { provider: next, src };
}

/** Large hero cat; swaps on random delays (stress decode + layout). */
function RandomCatImageChaos({ parentBurst }: ParentDriveProps) {
  const w = 320;
  const h = 220;
  const [{ provider, src }, setCat] = useState(() => randomCatPair(w, h));
  const [swaps, setSwaps] = useState(0);

  const onImgError = useCallback(() => {
    setCat((c) => otherProvider(c.provider, w, h));
  }, [w, h]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const ms = 500 + Math.random() * 2500;
      timeoutId = setTimeout(() => {
        setCat(randomCatPair(w, h));
        setSwaps((s) => s + 1);
        schedule();
      }, ms);
    };
    schedule();
    return () => clearTimeout(timeoutId);
  }, [w, h]);

  return (
    <div
      className="rounded-lg border border-pink-500/40 bg-pink-500/5 p-3 font-mono text-xs text-pink-950 dark:text-pink-50"
      data-welcome-burst={parentBurst}
    >
      <p className="mb-1 font-semibold text-pink-900 dark:text-pink-200">
        Random cat swap (placecats · loremflickr)
      </p>
      <p className="mb-2 text-pink-900/80 dark:text-pink-100/80">
        swaps: {swaps} · via {provider} · pb {parentBurst}
      </p>
      <img
        src={src}
        alt="Random placeholder cat"
        width={w}
        height={h}
        className="aspect-320/220 w-full max-w-sm rounded-md bg-pink-950/25 object-cover"
        decoding="async"
        onError={onImgError}
      />
      <ParentPropNote parentBurst={parentBurst} />
    </div>
  );
}

function SmallRandomCatTile({
  label,
  parentBurst,
}: { label: string } & ParentDriveProps) {
  const w = 200;
  const h = 140;
  const [{ provider, src }, setCat] = useState(() => randomCatPair(w, h));

  const onImgError = useCallback(() => {
    setCat((c) => otherProvider(c.provider, w, h));
  }, [w, h]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const ms = 350 + Math.random() * 2000;
      timeoutId = setTimeout(() => {
        setCat(randomCatPair(w, h));
        schedule();
      }, ms);
    };
    schedule();
    return () => clearTimeout(timeoutId);
  }, [w, h]);

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-[10px] text-pink-900/70 dark:text-pink-200/70">
        {label} · {provider} · pb{parentBurst % 1000}
      </span>
      <img
        src={src}
        alt=""
        width={w}
        height={h}
        className="aspect-10/7 w-full rounded-md bg-pink-950/20 object-cover"
        decoding="async"
        onError={onImgError}
      />
    </div>
  );
}

/** Three independent random timers → parallel image loads and decodes. */
function MultiCatTileChaos({ parentBurst }: ParentDriveProps) {
  return (
    <div
      className="rounded-lg border border-pink-500/40 bg-pink-500/5 p-3 font-mono text-xs text-pink-950 dark:text-pink-50"
      data-welcome-burst={parentBurst}
    >
      <p className="mb-2 font-semibold text-pink-900 dark:text-pink-200">
        Three cats · staggered random swaps
      </p>
      <div className="grid grid-cols-3 gap-2">
        <SmallRandomCatTile label="A" parentBurst={parentBurst} />
        <SmallRandomCatTile label="B" parentBurst={parentBurst} />
        <SmallRandomCatTile label="C" parentBurst={parentBurst} />
      </div>
      <ParentPropNote parentBurst={parentBurst} />
    </div>
  );
}

export type WelcomeChaosContentProps = {
  parentBurst: number;
  nextParentMs: number | null;
  /** Shown above the drive strip; override from the route parent. */
  title?: string;
  /** Merged onto the main chaos column (`max-w-3xl` wrapper). */
  contentClassName?: string;
  /** Block between chaos and `#bottom` (hash-link scroll target). */
  scrollSpacerClassName?: string;
};

export function WelcomeChaosContent({
  parentBurst,
  nextParentMs,
  title = "Chaos probes (render / re-render stress)",
  contentClassName,
  scrollSpacerClassName = "h-[800px]",
}: WelcomeChaosContentProps) {
  const topTargetRef = useRef<HTMLElement>(null);
  const bottomTargetRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <header
        ref={topTargetRef}
        className="flex flex-col items-center gap-9"
        id="top"
      >
        <HashLinksToBottom bottomTargetRef={bottomTargetRef} />
      </header>
      <div
        className={[
          "flex w-full max-w-3xl flex-col gap-4 px-4 pb-8",
          contentClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <div className="rounded-md border border-dashed border-gray-400/50 bg-gray-500/5 px-3 py-2 font-mono text-xs text-gray-800 dark:border-gray-500/40 dark:text-gray-200">
          <span className="font-semibold">Welcome parent drive</span>
          <span className="mx-2 opacity-40">|</span>
          <span className="tabular-nums">burst: {parentBurst}</span>
          <span className="mx-2 opacity-40">|</span>
          <span>
            next prop bump:{" "}
            {nextParentMs != null ? `${nextParentMs.toFixed(0)} ms` : "—"}
          </span>
        </div>
        <LongMainThreadTaskChaos parentBurst={parentBurst} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <RandomIntervalChaos parentBurst={parentBurst} />
          <RafChaos parentBurst={parentBurst} />
          <NestedRafChaos parentBurst={parentBurst} />
          <MicrotaskBurstChaos parentBurst={parentBurst} />
          <TimerStackChaos parentBurst={parentBurst} />
          <RemountRouletteChaos parentBurst={parentBurst} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <BurstGridChaos parentBurst={parentBurst} />
          <ContextFanoutChaos parentBurst={parentBurst} />
        </div>
        <LongListChaos parentBurst={parentBurst} />
        <div className="grid gap-4 lg:grid-cols-2">
          <RandomCatImageChaos parentBurst={parentBurst} />
          <MultiCatTileChaos parentBurst={parentBurst} />
        </div>
      </div>
      <div className={scrollSpacerClassName} />
      <div ref={bottomTargetRef} id="bottom" className="pb-[200px]">
        <HashLinksToTop topTargetRef={topTargetRef} />
      </div>
    </>
  );
}

export type WelcomeProps = {
  /** Extra Tailwind classes on the main column shell; changes when the route parent re-renders. */
  shellClassName?: string;
  /** Forwarded to `WelcomeChaosContent` as `title`. */
  chaosTitle?: string;
  /** Forwarded to `WelcomeChaosContent` as `contentClassName`. */
  chaosContentClassName?: string;
  /** Forwarded to `WelcomeChaosContent` as `scrollSpacerClassName`. */
  chaosScrollSpacerClassName?: string;
};

export function Welcome({
  shellClassName,
  chaosTitle,
  chaosContentClassName,
  chaosScrollSpacerClassName,
}: WelcomeProps = {}) {
  const [parentBurst, setParentBurst] = useState(0);
  const [nextParentMs, setNextParentMs] = useState<number | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const ms = 60 + Math.random() * 1200;
      setNextParentMs(ms);
      timeoutId = setTimeout(() => {
        setParentBurst((b) => b + 1);
        schedule();
      }, ms);
    };
    schedule();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <main className="flex items-center justify-center pt-16 pb-4 scroll-smooth">
      <div
        className={[
          "flex-1 flex flex-col items-center gap-16 min-h-0",
          shellClassName,
        ]
          .filter(Boolean)
          .join(" ")}
        data-welcome-shell-burst={parentBurst}
      >
        <DemoSiteNav page="chaos" />
        <WelcomeChaosContent
          parentBurst={parentBurst}
          nextParentMs={nextParentMs}
          title={chaosTitle}
          contentClassName={chaosContentClassName}
          scrollSpacerClassName={chaosScrollSpacerClassName}
        />
      </div>
    </main>
  );
}

const resources = [
  {
    href: "https://reactrouter.com/docs",
    text: "React Router Docs",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="stroke-gray-600 group-hover:stroke-current dark:stroke-gray-300"
      >
        <path
          d="M9.99981 10.0751V9.99992M17.4688 17.4688C15.889 19.0485 11.2645 16.9853 7.13958 12.8604C3.01467 8.73546 0.951405 4.11091 2.53116 2.53116C4.11091 0.951405 8.73546 3.01467 12.8604 7.13958C16.9853 11.2645 19.0485 15.889 17.4688 17.4688ZM2.53132 17.4688C0.951566 15.8891 3.01483 11.2645 7.13974 7.13963C11.2647 3.01471 15.8892 0.951453 17.469 2.53121C19.0487 4.11096 16.9854 8.73551 12.8605 12.8604C8.73562 16.9853 4.11107 19.0486 2.53132 17.4688Z"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "https://rmx.as/discord",
    text: "Join Discord",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="20"
        viewBox="0 0 24 20"
        fill="none"
        className="stroke-gray-600 group-hover:stroke-current dark:stroke-gray-300"
      >
        <path
          d="M15.0686 1.25995L14.5477 1.17423L14.2913 1.63578C14.1754 1.84439 14.0545 2.08275 13.9422 2.31963C12.6461 2.16488 11.3406 2.16505 10.0445 2.32014C9.92822 2.08178 9.80478 1.84975 9.67412 1.62413L9.41449 1.17584L8.90333 1.25995C7.33547 1.51794 5.80717 1.99419 4.37748 2.66939L4.19 2.75793L4.07461 2.93019C1.23864 7.16437 0.46302 11.3053 0.838165 15.3924L0.868838 15.7266L1.13844 15.9264C2.81818 17.1714 4.68053 18.1233 6.68582 18.719L7.18892 18.8684L7.50166 18.4469C7.96179 17.8268 8.36504 17.1824 8.709 16.4944L8.71099 16.4904C10.8645 17.0471 13.128 17.0485 15.2821 16.4947C15.6261 17.1826 16.0293 17.8269 16.4892 18.4469L16.805 18.8725L17.3116 18.717C19.3056 18.105 21.1876 17.1751 22.8559 15.9238L23.1224 15.724L23.1528 15.3923C23.5873 10.6524 22.3579 6.53306 19.8947 2.90714L19.7759 2.73227L19.5833 2.64518C18.1437 1.99439 16.6386 1.51826 15.0686 1.25995ZM16.6074 10.7755L16.6074 10.7756C16.5934 11.6409 16.0212 12.1444 15.4783 12.1444C14.9297 12.1444 14.3493 11.6173 14.3493 10.7877C14.3493 9.94885 14.9378 9.41192 15.4783 9.41192C16.0471 9.41192 16.6209 9.93851 16.6074 10.7755ZM8.49373 12.1444C7.94513 12.1444 7.36471 11.6173 7.36471 10.7877C7.36471 9.94885 7.95323 9.41192 8.49373 9.41192C9.06038 9.41192 9.63892 9.93712 9.6417 10.7815C9.62517 11.6239 9.05462 12.1444 8.49373 12.1444Z"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
];

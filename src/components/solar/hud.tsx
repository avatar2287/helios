import { memo, useState, type ReactNode } from "react";
import { Compass, Info, Minus, Orbit, Pause, Play, Plus, Route, Tag } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BODIES, findBody, type BodyId } from "@/lib/solar/bodies";
import { bodyCopy, figureCopy, moonName, resonanceLabel, t, type Lang } from "@/lib/solar/i18n";
import { cameraCmd, dayEl, labelAnchors } from "@/lib/solar/runtime";
import { useSolar, type KeplerSolid } from "@/lib/solar/store";
import { ChartPanel } from "@/components/solar/chart-panel";
import { ct } from "@/lib/solar/chart-copy";
import { DANCE_KEYS } from "@/lib/solar/dances";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const tap =
  "transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const FIGURES: KeplerSolid[] = ["octa", "icosa", "dodeca", "tetra", "cube"];
const AU: Partial<Record<BodyId, number>> = {
  mercury: 0.387,
  venus: 0.723,
  earth: 1,
  mars: 1.524,
  jupiter: 5.204,
  saturn: 9.583,
  uranus: 19.218,
  neptune: 30.07,
};
const LANGS: { id: Lang; label: string }[] = [
  { id: "uk", label: "UA" },
  { id: "en", label: "EN" },
  { id: "ru", label: "RU" },
];

const PRESETS = [0.5, 1, 3, 8] as const;

export function Hud() {
  const focus = useSolar((s) => s.focus);
  const paused = useSolar((s) => s.paused);
  const speed = useSolar((s) => s.speed);
  const trails = useSolar((s) => s.trails);
  const labels = useSolar((s) => s.labels);
  const orbits = useSolar((s) => s.orbits);
  const kepler = useSolar((s) => s.kepler);
  const dances = useSolar((s) => s.dances);
  const setFocus = useSolar((s) => s.setFocus);
  const togglePause = useSolar((s) => s.togglePause);
  const setSpeed = useSolar((s) => s.setSpeed);
  const toggleTrails = useSolar((s) => s.toggleTrails);
  const toggleLabels = useSolar((s) => s.toggleLabels);
  const toggleOrbits = useSolar((s) => s.toggleOrbits);
  const toggleKepler = useSolar((s) => s.toggleKepler);
  const toggleDance = useSolar((s) => s.toggleDance);
  const lang = useSolar((s) => s.lang);
  const setLang = useSolar((s) => s.setLang);
  const [infoOpen, setInfoOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [sheet, setSheet] = useState<"dances" | "kepler" | null>(null);

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-10">
        {BODIES.map((item) => (
          <LabelButton
            key={item.id}
            id={item.id}
            name={bodyCopy(lang, item.id).name}
            swatch={item.swatch}
            active={focus === item.id}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-bg via-bg/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg via-bg/80 to-transparent" />

        <header className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-6">
          <div className="pointer-events-auto max-w-[16rem] sm:max-w-sm">
            <p className="text-xs tracking-widest text-accent uppercase">{t(lang, "observatory")}</p>
            <h1 className="font-display text-4xl leading-none sm:text-5xl">{t(lang, "title")}</h1>
            <p
              ref={(node) => {
                dayEl.current = node;
              }}
              className="mt-2 text-sm text-muted tabular-nums"
            >
              День 0 · рік 0
            </p>
          </div>
          <div className="pointer-events-auto flex items-center justify-end gap-2">
            {paused && (
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs text-accent backdrop-blur-xl">
                {t(lang, "pause")}
              </span>
            )}
            <div className="flex overflow-hidden rounded-full border border-white/10 bg-white/10 backdrop-blur-xl">
              {LANGS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={lang === item.id}
                  onClick={() => setLang(item.id)}
                  className={cn(
                    tap,
                    "h-11 px-2.5 text-xs font-medium",
                    lang === item.id ? "bg-accent text-bg" : "text-muted hover:text-fg",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-expanded={chartOpen}
              className={cn(
                tap,
                "inline-flex h-11 items-center rounded-full border border-white/10 px-3 text-sm backdrop-blur-xl",
                chartOpen ? "bg-accent text-bg" : "bg-white/10 text-fg",
              )}
              onClick={() => setChartOpen((open) => !open)}
            >
              {ct(lang, "chart")}
            </button>
            <button
              type="button"
              aria-expanded={infoOpen}
              aria-label={t(lang, "info")}
              className={cn(
                tap,
                "grid size-11 place-items-center rounded-full border border-white/10 bg-white/10 backdrop-blur-xl",
                infoOpen ? "bg-accent text-bg" : "text-fg",
              )}
              onClick={() => setInfoOpen((open) => !open)}
            >
              <Info className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={cn(
                tap,
                "inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 text-sm text-fg backdrop-blur-xl",
              )}
              onClick={() => {
                cameraCmd.reset = true;
              }}
            >
              <Compass className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t(lang, "overview")}</span>
            </button>
          </div>
        </header>

        {chartOpen && <ChartPanel onClose={() => setChartOpen(false)} />}

        {sheet === "dances" && (
          <div className="pointer-events-auto absolute inset-x-0 top-[4.6rem] z-20 px-3 sm:px-6">
            <div className="chiprow flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-black/45 p-1.5 backdrop-blur-xl">
              {DANCE_KEYS.map((id) => {
                const on = dances.includes(id);
                const [a, b] = id.split("-") as [BodyId, BodyId];
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleDance(id)}
                    className={cn(
                      tap,
                      "inline-flex h-8 shrink-0 items-center rounded-full border px-2.5 text-xs",
                      on ? "border-accent bg-accent text-bg" : "border-white/10 bg-white/5 text-muted hover:text-fg",
                    )}
                  >
                    <span className="font-medium">
                      {bodyCopy(lang, a).name}–{bodyCopy(lang, b).name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <nav
          aria-label={t(lang, "bodies")}
          className="scrollthin pointer-events-auto absolute top-28 bottom-36 left-4 hidden w-52 flex-col gap-1 overflow-y-auto rounded-2xl border border-line bg-raised/75 p-2 backdrop-blur-md md:flex"
        >
          {BODIES.map((item) => {
            const active = focus === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFocus(item.id)}
                className={cn(
                  tap,
                  "flex h-11 items-center gap-3 rounded-xl px-3 text-left text-sm",
                  active ? "bg-accent/15 text-fg" : "text-muted hover:bg-fg/5 hover:text-fg",
                )}
              >
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: item.swatch }} />
                <span className="font-medium">{bodyCopy(lang, item.id).name}</span>
              </button>
            );
          })}
        </nav>

        <aside
          className={cn(
            "pointer-events-none absolute top-20 right-4 w-60 sm:w-64",
            infoOpen ? "block" : "hidden",
          )}
        >
          <InfoCard bodyId={focus} />
        </aside>

        <div className="absolute inset-x-0 bottom-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
          <div className="chiprow pointer-events-auto mb-2 flex gap-2 overflow-x-auto md:hidden">
            {BODIES.map((item) => {
              const active = focus === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFocus(item.id)}
                  className={cn(
                    tap,
                    "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-3 text-sm",
                    active
                      ? "border-accent bg-accent/15 text-fg"
                      : "border-line bg-raised/80 text-muted",
                  )}
                >
                  <span className="size-2 rounded-full" style={{ background: item.swatch }} />
                  {bodyCopy(lang, item.id).name}
                </button>
              );
            })}
          </div>

          <div className="pointer-events-auto mx-auto flex w-full max-w-3xl flex-col gap-2 rounded-2xl border border-white/10 bg-white/10 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="flex items-center gap-1">
              <button
                type="button"
                className={cn(
                  tap,
                  "grid size-11 shrink-0 place-items-center rounded-full",
                  paused ? "bg-accent text-bg" : "bg-fg/10 text-fg",
                )}
                aria-label={paused ? t(lang, "resume") : t(lang, "pause")}
                aria-pressed={paused}
                onClick={togglePause}
              >
                <span className="relative grid size-5 place-items-center">
                  <Play
                    className={cn(
                      "col-start-1 row-start-1 size-5 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
                      paused ? "scale-100 opacity-100 blur-none" : "scale-[0.25] opacity-0 blur-[4px]",
                    )}
                    aria-hidden="true"
                  />
                  <Pause
                    className={cn(
                      "col-start-1 row-start-1 size-5 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
                      paused ? "scale-[0.25] opacity-0 blur-[4px]" : "scale-100 opacity-100 blur-none",
                    )}
                    aria-hidden="true"
                  />
                </span>
              </button>
              <button
                type="button"
                className={cn(tap, "grid size-11 shrink-0 place-items-center rounded-full text-fg")}
                aria-label={t(lang, "slower")}
                onClick={() => setSpeed(speed - 0.5)}
              >
                <Minus className="size-4" aria-hidden="true" />
              </button>
              <label className="flex h-11 min-w-0 flex-1 items-center px-1">
                <span className="sr-only">{t(lang, "speed")}</span>
                <input
                  type="range"
                  min={0}
                  max={12}
                  step={0.1}
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full"
                />
              </label>
              <button
                type="button"
                className={cn(tap, "grid size-11 shrink-0 place-items-center rounded-full text-fg")}
                aria-label={t(lang, "faster")}
                onClick={() => setSpeed(speed + 0.5)}
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
              <input
                aria-label={t(lang, "speedN")}
                type="number"
                min={0}
                max={12}
                step={0.1}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="h-11 w-16 shrink-0 rounded-full border border-line bg-bg/60 text-center text-base text-fg tabular-nums"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <Toggle on={trails} label={t(lang, "trails")} onClick={toggleTrails}>
                <Route className="size-4" aria-hidden="true" />
              </Toggle>
              <Toggle on={labels} label={t(lang, "labels")} onClick={toggleLabels}>
                <Tag className="size-4" aria-hidden="true" />
              </Toggle>
              <Toggle on={orbits} label={t(lang, "orbits")} onClick={toggleOrbits}>
                <Orbit className="size-4" aria-hidden="true" />
              </Toggle>
              <span className="mx-1 hidden h-6 w-px bg-line sm:block" />
              <button
                type="button"
                aria-expanded={sheet === "dances"}
                onClick={() => setSheet((cur) => (cur === "dances" ? null : "dances"))}
                className={cn(
                  tap,
                  "inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm",
                  sheet === "dances" || dances.length > 0 ? "bg-accent text-bg" : "text-muted hover:text-fg",
                )}
              >
                {t(lang, "dances")}
                {dances.length > 0 && <span className="tabular-nums">{dances.length}</span>}
              </button>
              <button
                type="button"
                aria-expanded={sheet === "kepler"}
                onClick={() => setSheet((cur) => (cur === "kepler" ? null : "kepler"))}
                className={cn(
                  tap,
                  "inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm",
                  sheet === "kepler" || kepler.length > 0 ? "bg-accent text-bg" : "text-muted hover:text-fg",
                )}
              >
                {t(lang, "keplerBtn")}
                {kepler.length > 0 && <span className="tabular-nums">{kepler.length}</span>}
              </button>
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  aria-pressed={speed === preset}
                  onClick={() => setSpeed(preset)}
                  className={cn(
                    tap,
                    "h-11 rounded-full px-3 text-sm tabular-nums",
                    speed === preset ? "bg-accent text-bg" : "text-muted hover:text-fg",
                  )}
                >
                  ×{preset.toLocaleString("uk-UA")}
                </button>
              ))}
            </div>
            {sheet === "kepler" && (
            <div className="chiprow flex gap-1 overflow-x-auto">
              {FIGURES.map((id) => {
                const on = kepler.includes(id);
                const figure = figureCopy(lang, id);
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleKepler(id)}
                    className={cn(
                      tap,
                      "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs",
                      on ? "border-accent bg-accent text-bg" : "border-white/10 bg-white/5 text-muted hover:text-fg",
                    )}
                  >
                    <span className="font-medium">{figure.label}</span>
                    <span className={on ? "text-bg/75" : "text-muted"}>{figure.between}</span>
                  </button>
                );
              })}
            </div>
            )}
          </div>
          <p className="pointer-events-none mt-2 text-center text-xs text-muted">
            {t(lang, "hint")}
          </p>
        </div>
      </div>
    </>
  );
}

const LabelButton = memo(function LabelButton({
  id,
  name,
  swatch,
  active,
}: {
  id: BodyId;
  name: string;
  swatch: string;
  active: boolean;
}) {
  return (
    <button
      type="button"
      ref={(node) => {
        if (node) labelAnchors.set(id, node);
        else labelAnchors.delete(id);
      }}
      onClick={() => useSolar.getState().setFocus(id)}
      className={cn(
        "pointer-events-none absolute top-0 left-0 rounded-full border px-2.5 py-1 text-xs whitespace-nowrap opacity-0",
        active ? "z-10 border-accent bg-bg/85 text-fg" : "border-line bg-bg/70 text-muted",
      )}
    >
      <span className="mr-1.5 inline-block size-1.5 rounded-full align-middle" style={{ background: swatch }} />
      {name}
    </button>
  );
});

function Toggle({
  on,
  label,
  onClick,
  children,
}: {
  on: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        tap,
        "inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm",
        on ? "bg-accent text-bg" : "text-muted hover:text-fg",
      )}
    >
      {children}
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
}

function InfoCard({ bodyId }: { bodyId: BodyId | null }) {
  const lang = useSolar((s) => s.lang);
  const body = findBody(bodyId);
  const text = body ? bodyCopy(lang, body.id) : null;
  const rose = body ? resonanceLabel(lang, body.id) : "";
  return (
    <article className="rise scrollthin pointer-events-auto max-h-[min(18rem,46vh)] overflow-y-auto rounded-2xl border border-white/10 bg-white/10 p-3 shadow-[0_16px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <p className="text-[10px] tracking-widest text-accent uppercase">{text ? text.kind : t(lang, "model")}</p>
      <h2 className="font-display text-2xl leading-none">{text ? text.name : t(lang, "system")}</h2>
      <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-fg">{text ? text.blurb : t(lang, "empty")}</p>
      {rose && (
        <p className="mt-2 text-[11px] text-accent">
          {t(lang, "tank")} · {rose}
        </p>
      )}
      {text && (
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
          {text.facts.map((fact) => (
            <div key={fact.k} className="contents">
              <dt className="text-muted">{fact.k}</dt>
              <dd className="text-right text-fg">{fact.v}</dd>
            </div>
          ))}
          {body && body.ecc > 0 && (
            <div className="contents">
              <dt className="text-muted">{t(lang, "ecc")}</dt>
              <dd className="text-right text-fg tabular-nums">{body.ecc.toFixed(4)}</dd>
            </div>
          )}
          {body && body.id !== "sun" && AU[body.id] != null && (
            <div className="contents">
              <dt className="text-muted">{t(lang, "range")}</dt>
              <dd className="text-right text-fg tabular-nums">
                {(AU[body.id]! * (1 - body.ecc)).toFixed(3)}–{(AU[body.id]! * (1 + body.ecc)).toFixed(3)} {t(lang, "au")}
              </dd>
            </div>
          )}
        </dl>
      )}
      {body && body.moons.length > 0 && (
        <p className="mt-2 text-xs text-muted">
          {t(lang, "moons")}: {body.moons.map((moon) => moonName(lang, moon.name)).join(", ")}
        </p>
      )}
      <p className="mt-2 text-[10px] leading-relaxed text-muted">{t(lang, "scale")}</p>
    </article>
  );
}

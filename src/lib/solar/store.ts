import { create } from "zustand";
import type { BodyId } from "@/lib/solar/bodies";
import type { ChartBody, NatalChart, Voice } from "@/lib/solar/chart";
import { isNatalChart } from "@/lib/solar/chart";
import type { Lang } from "@/lib/solar/i18n";
import { DANCE_KEYS } from "@/lib/solar/dances";

export type KeplerSolid = "octa" | "icosa" | "dodeca" | "tetra" | "cube";

const KEPLER_IDS: KeplerSolid[] = ["octa", "icosa", "dodeca", "tetra", "cube"];

export function readKepler(value: unknown): KeplerSolid[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id): id is KeplerSolid => typeof id === "string" && KEPLER_IDS.includes(id as KeplerSolid)))];
}

export function readDances(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id): id is string => typeof id === "string" && DANCE_KEYS.includes(id)))];
}

export function clampSpeed(n: number) {
  if (!Number.isFinite(n)) return 1;
  return Math.min(12, Math.max(0, Math.round(n * 10) / 10));
}

type SolarState = {
  focus: BodyId | null;
  paused: boolean;
  speed: number;
  trails: boolean;
  labels: boolean;
  orbits: boolean;
  kepler: KeplerSolid[];
  dances: string[];
  lang: Lang;
  chart: NatalChart | null;
  voice: Voice;
  chartFocus: ChartBody | null;
  setFocus: (id: BodyId | null) => void;
  togglePause: () => void;
  setSpeed: (n: number) => void;
  toggleTrails: () => void;
  toggleLabels: () => void;
  toggleOrbits: () => void;
  toggleKepler: (id: KeplerSolid) => void;
  toggleDance: (id: string) => void;
  setLang: (lang: Lang) => void;
  setChart: (chart: NatalChart | null) => void;
  setVoice: (voice: Voice) => void;
  setChartFocus: (id: ChartBody | null) => void;
};

export const useSolar = create<SolarState>((set) => ({
  focus: null,
  paused: false,
  speed: 1,
  trails: true,
  labels: true,
  orbits: true,
  kepler: [],
  dances: [],
  lang: "uk",
  chart: null,
  voice: "adult",
  chartFocus: null,
  setFocus: (focus) => set({ focus }),
  togglePause: () => set((s) => ({ paused: !s.paused })),
  setSpeed: (speed) => set({ speed: clampSpeed(speed) }),
  toggleTrails: () => set((s) => ({ trails: !s.trails })),
  toggleLabels: () => set((s) => ({ labels: !s.labels })),
  toggleOrbits: () => set((s) => ({ orbits: !s.orbits })),
  toggleKepler: (id) =>
    set((s) => ({
      kepler: s.kepler.includes(id) ? s.kepler.filter((item) => item !== id) : [...s.kepler, id],
    })),
  toggleDance: (id) =>
    set((s) => ({
      dances: s.dances.includes(id) ? s.dances.filter((item) => item !== id) : [...s.dances, id],
    })),
  setLang: (lang) => set({ lang }),
  setChart: (chart) => set({ chart, chartFocus: chart ? "sun" : null }),
  setVoice: (voice) => set({ voice }),
  setChartFocus: (chartFocus) => set({ chartFocus }),
}));

const PREF_KEY = "helios-prefs-v1";

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<
      Pick<SolarState, "speed" | "trails" | "labels" | "orbits" | "lang" | "voice">
    > & {
      kepler?: unknown;
      dances?: unknown;
      chart?: unknown;
    };
    const lang = parsed.lang === "en" || parsed.lang === "ru" || parsed.lang === "uk" ? parsed.lang : "uk";
    const chart = isNatalChart(parsed.chart) ? parsed.chart : null;
    useSolar.setState({
      speed: typeof parsed.speed === "number" ? clampSpeed(parsed.speed) : 1,
      trails: typeof parsed.trails === "boolean" ? parsed.trails : true,
      labels: typeof parsed.labels === "boolean" ? parsed.labels : true,
      orbits: typeof parsed.orbits === "boolean" ? parsed.orbits : true,
      kepler: readKepler(parsed.kepler),
      dances: readDances(parsed.dances),
      lang,
      voice: parsed.voice === "child" ? "child" : "adult",
      chart,
      chartFocus: chart ? "sun" : null,
    });
  } catch {
    /* ignore broken prefs */
  }
}

export function bindPrefs() {
  return useSolar.subscribe((s) => {
    try {
    localStorage.setItem(
      PREF_KEY,
      JSON.stringify({
        speed: s.speed,
        trails: s.trails,
        labels: s.labels,
        orbits: s.orbits,
        kepler: s.kepler,
        dances: s.dances,
        lang: s.lang,
        voice: s.voice,
        chart: s.chart,
      }),
    );
    } catch {
      // Storage can be disabled or full; controls must remain usable.
    }
  });
}

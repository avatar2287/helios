import { Body, Ecliptic, GeoVector, MakeTime, SiderealTime, SunPosition, e_tilt } from "astronomy-engine";
import type { Lang } from "@/lib/solar/i18n";

export type SignId =
  | "ari"
  | "tau"
  | "gem"
  | "can"
  | "leo"
  | "vir"
  | "lib"
  | "sco"
  | "sag"
  | "cap"
  | "aqu"
  | "pis";

export type ChartBody =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto";

export type AspectKind = "conjunction" | "sextile" | "square" | "trine" | "opposition";

export type Voice = "child" | "adult";

export const SIGN_IDS: SignId[] = ["ari", "tau", "gem", "can", "leo", "vir", "lib", "sco", "sag", "cap", "aqu", "pis"];

export const CHART_BODIES: ChartBody[] = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
];

export const SIGN_GLYPH = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"] as const;

const BODY_ENUM: Record<ChartBody, Body> = {
  sun: Body.Sun,
  moon: Body.Moon,
  mercury: Body.Mercury,
  venus: Body.Venus,
  mars: Body.Mars,
  jupiter: Body.Jupiter,
  saturn: Body.Saturn,
  uranus: Body.Uranus,
  neptune: Body.Neptune,
  pluto: Body.Pluto,
};

export type City = {
  id: string;
  name: Record<Lang, string>;
  lat: number;
  lon: number;
  tz: string;
};

export const CITIES: City[] = [
  { id: "kyiv", name: { uk: "Київ", en: "Kyiv", ru: "Киев" }, lat: 50.45, lon: 30.523, tz: "Europe/Kyiv" },
  { id: "lviv", name: { uk: "Львів", en: "Lviv", ru: "Львов" }, lat: 49.842, lon: 24.032, tz: "Europe/Kyiv" },
  { id: "odesa", name: { uk: "Одеса", en: "Odesa", ru: "Одесса" }, lat: 46.482, lon: 30.723, tz: "Europe/Kyiv" },
  { id: "kharkiv", name: { uk: "Харків", en: "Kharkiv", ru: "Харьков" }, lat: 49.993, lon: 36.23, tz: "Europe/Kyiv" },
  { id: "dnipro", name: { uk: "Дніпро", en: "Dnipro", ru: "Днепр" }, lat: 48.464, lon: 35.046, tz: "Europe/Kyiv" },
  { id: "warsaw", name: { uk: "Варшава", en: "Warsaw", ru: "Варшава" }, lat: 52.23, lon: 21.012, tz: "Europe/Warsaw" },
  { id: "berlin", name: { uk: "Берлін", en: "Berlin", ru: "Берлин" }, lat: 52.52, lon: 13.405, tz: "Europe/Berlin" },
  { id: "prague", name: { uk: "Прага", en: "Prague", ru: "Прага" }, lat: 50.075, lon: 14.438, tz: "Europe/Prague" },
  { id: "vienna", name: { uk: "Відень", en: "Vienna", ru: "Вена" }, lat: 48.208, lon: 16.373, tz: "Europe/Vienna" },
  { id: "paris", name: { uk: "Париж", en: "Paris", ru: "Париж" }, lat: 48.857, lon: 2.352, tz: "Europe/Paris" },
  { id: "london", name: { uk: "Лондон", en: "London", ru: "Лондон" }, lat: 51.507, lon: -0.128, tz: "Europe/London" },
  { id: "rome", name: { uk: "Рим", en: "Rome", ru: "Рим" }, lat: 41.902, lon: 12.496, tz: "Europe/Rome" },
  { id: "madrid", name: { uk: "Мадрид", en: "Madrid", ru: "Мадрид" }, lat: 40.417, lon: -3.704, tz: "Europe/Madrid" },
  { id: "istanbul", name: { uk: "Стамбул", en: "Istanbul", ru: "Стамбул" }, lat: 41.008, lon: 28.978, tz: "Europe/Istanbul" },
  { id: "minsk", name: { uk: "Мінськ", en: "Minsk", ru: "Минск" }, lat: 53.9, lon: 27.567, tz: "Europe/Minsk" },
  { id: "vilnius", name: { uk: "Вільнюс", en: "Vilnius", ru: "Вильнюс" }, lat: 54.687, lon: 25.28, tz: "Europe/Vilnius" },
  { id: "tbilisi", name: { uk: "Тбілісі", en: "Tbilisi", ru: "Тбилиси" }, lat: 41.694, lon: 44.833, tz: "Asia/Tbilisi" },
  { id: "almaty", name: { uk: "Алмати", en: "Almaty", ru: "Алматы" }, lat: 43.238, lon: 76.946, tz: "Asia/Almaty" },
  { id: "astana", name: { uk: "Астана", en: "Astana", ru: "Астана" }, lat: 51.169, lon: 71.449, tz: "Asia/Almaty" },
  { id: "dubai", name: { uk: "Дубай", en: "Dubai", ru: "Дубай" }, lat: 25.204, lon: 55.271, tz: "Asia/Dubai" },
  { id: "telaviv", name: { uk: "Тель-Авів", en: "Tel Aviv", ru: "Тель-Авив" }, lat: 32.085, lon: 34.782, tz: "Asia/Jerusalem" },
  { id: "newyork", name: { uk: "Нью-Йорк", en: "New York", ru: "Нью-Йорк" }, lat: 40.713, lon: -74.006, tz: "America/New_York" },
  { id: "chicago", name: { uk: "Чикаго", en: "Chicago", ru: "Чикаго" }, lat: 41.878, lon: -87.63, tz: "America/Chicago" },
  { id: "losangeles", name: { uk: "Лос-Анджелес", en: "Los Angeles", ru: "Лос-Анджелес" }, lat: 34.052, lon: -118.244, tz: "America/Los_Angeles" },
  { id: "toronto", name: { uk: "Торонто", en: "Toronto", ru: "Торонто" }, lat: 43.653, lon: -79.383, tz: "America/Toronto" },
];

export type Placement = {
  id: ChartBody;
  lon: number;
  sign: SignId;
  deg: number;
  house: number;
  retro: boolean;
};

export type Aspect = {
  a: ChartBody;
  b: ChartBody;
  kind: AspectKind;
  orb: number;
};

export type NatalChart = {
  when: { y: number; mo: number; d: number; h: number; mi: number };
  cityId: string;
  cityName: Record<Lang, string>;
  lat: number;
  lonGeo: number;
  asc: number;
  placements: Placement[];
  aspects: Aspect[];
};

const ASPECTS: { kind: AspectKind; angle: number; orb: number }[] = [
  { kind: "conjunction", angle: 0, orb: 8 },
  { kind: "sextile", angle: 60, orb: 5 },
  { kind: "square", angle: 90, orb: 7 },
  { kind: "trine", angle: 120, orb: 7 },
  { kind: "opposition", angle: 180, orb: 8 },
];

export function signOf(lon: number): { sign: SignId; deg: number } {
  const wrapped = ((lon % 360) + 360) % 360;
  const index = Math.floor(wrapped / 30) % 12;
  return { sign: SIGN_IDS[index], deg: wrapped - index * 30 };
}

export function findCity(id: string) {
  return CITIES.find((city) => city.id === id) ?? CITIES[0];
}

function tzOffsetMinutes(date: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(
    fmt
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour % 24, +parts.minute, +parts.second);
  return Math.round((asUtc - date.getTime()) / 60000);
}

export function zonedToDate(y: number, mo: number, d: number, h: number, mi: number, timeZone: string) {
  // Older Android ICU versions know the legacy spelling only.
  if (timeZone === "Europe/Kyiv") {
    try { new Intl.DateTimeFormat("en", { timeZone }); }
    catch { timeZone = "Europe/Kiev"; }
  }
  const wall = Date.UTC(y, mo - 1, d, h, mi, 0);
  const first = tzOffsetMinutes(new Date(wall), timeZone);
  let result = new Date(wall - first * 60000);
  const second = tzOffsetMinutes(result, timeZone);
  if (second !== first) result = new Date(wall - second * 60000);
  if (result.getTime() + tzOffsetMinutes(result, timeZone) * 60000 !== wall) {
    throw new RangeError("This local time does not exist because the clocks changed.");
  }
  return result;
}

export function isChartWhen(value: unknown): value is NatalChart["when"] {
  if (!value || typeof value !== "object") return false;
  const w = value as NatalChart["when"];
  if (![w.y, w.mo, w.d, w.h, w.mi].every(Number.isInteger)) return false;
  if (w.y < 1800 || w.y > 2200 || w.mo < 1 || w.mo > 12 || w.d < 1 || w.h < 0 || w.h > 23 || w.mi < 0 || w.mi > 59) return false;
  const date = new Date(Date.UTC(w.y, w.mo - 1, w.d));
  return date.getUTCFullYear() === w.y && date.getUTCMonth() === w.mo - 1 && date.getUTCDate() === w.d;
}

function wrapLon(lon: number) {
  return ((lon % 360) + 360) % 360;
}

function bodyLongitude(id: ChartBody, date: Date) {
  if (id === "sun") return wrapLon(SunPosition(date).elon);
  return wrapLon(Ecliptic(GeoVector(BODY_ENUM[id], date, true)).elon);
}

export function ascendant(date: Date, latDeg: number, lonDeg: number) {
  const gast = SiderealTime(date);
  const lst = (((gast + lonDeg / 15) % 24) + 24) % 24;
  const ramc = (lst * 15 * Math.PI) / 180;
  const eps = (e_tilt(MakeTime(date)).tobl * Math.PI) / 180;
  const phi = (latDeg * Math.PI) / 180;
  const y = Math.cos(ramc);
  const x = -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps));
  return wrapLon((Math.atan2(y, x) * 180) / Math.PI);
}

function separation(a: number, b: number) {
  const raw = Math.abs(wrapLon(a) - wrapLon(b)) % 360;
  return raw > 180 ? 360 - raw : raw;
}

function aspectsOf(placements: Placement[]): Aspect[] {
  const found: Aspect[] = [];
  for (let i = 0; i < placements.length; i++) {
    for (let j = i + 1; j < placements.length; j++) {
      const gap = separation(placements[i].lon, placements[j].lon);
      let best: Aspect | null = null;
      for (const spec of ASPECTS) {
        const orb = Math.abs(gap - spec.angle);
        if (orb <= spec.orb && (!best || orb < best.orb)) {
          best = { a: placements[i].id, b: placements[j].id, kind: spec.kind, orb };
        }
      }
      if (best) found.push(best);
    }
  }
  return found.sort((a, b) => a.orb - b.orb);
}

export function computeChart(when: NatalChart["when"], city: City): NatalChart {
  if (!isChartWhen(when)) throw new RangeError("Enter a valid date between 1800 and 2200.");
  const date = zonedToDate(when.y, when.mo, when.d, when.h, when.mi, city.tz);
  const asc = ascendant(date, city.lat, city.lon);
  const ascSign = signOf(asc).sign;
  const ascIndex = SIGN_IDS.indexOf(ascSign);
  const later = new Date(date.getTime() + 86400000);
  const placements = CHART_BODIES.map((id) => {
    const lon = bodyLongitude(id, date);
    const place = signOf(lon);
    const house = ((SIGN_IDS.indexOf(place.sign) - ascIndex + 12) % 12) + 1;
    let retro = false;
    if (id !== "sun" && id !== "moon") {
      const delta = ((bodyLongitude(id, later) - lon + 540) % 360) - 180;
      retro = delta < 0;
    }
    return { id, lon, sign: place.sign, deg: place.deg, house, retro };
  });
  return {
    when,
    cityId: city.id,
    cityName: city.name,
    lat: city.lat,
    lonGeo: city.lon,
    asc,
    placements,
    aspects: aspectsOf(placements),
  };
}

export function isNatalChart(value: unknown): value is NatalChart {
  if (!value || typeof value !== "object") return false;
  const chart = value as NatalChart;
  const bounded = (n: unknown, lo: number, hi: number): n is number => typeof n === "number" && Number.isFinite(n) && n >= lo && n <= hi;
  return isChartWhen(chart.when)
    && CITIES.some((city) => city.id === chart.cityId)
    && !!chart.cityName && ["uk", "en", "ru"].every((lang) => typeof chart.cityName[lang as Lang] === "string")
    && bounded(chart.lat, -90, 90) && bounded(chart.lonGeo, -180, 180) && bounded(chart.asc, 0, 360)
    && Array.isArray(chart.placements) && chart.placements.length === CHART_BODIES.length
    && new Set(chart.placements.map((p) => p?.id)).size === CHART_BODIES.length
    && chart.placements.every((p) => p && CHART_BODIES.includes(p.id) && SIGN_IDS.includes(p.sign)
      && bounded(p.lon, 0, 360) && bounded(p.deg, 0, 30) && bounded(p.house, 1, 12) && Number.isInteger(p.house) && typeof p.retro === "boolean")
    && Array.isArray(chart.aspects) && chart.aspects.length <= 45
    && chart.aspects.every((a) => a && CHART_BODIES.includes(a.a) && CHART_BODIES.includes(a.b) && a.a !== a.b
      && ASPECTS.some((s) => s.kind === a.kind) && bounded(a.orb, 0, 8));
}

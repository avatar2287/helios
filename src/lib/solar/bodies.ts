export const TAU = Math.PI * 2;
export const EARTH_ORBIT = 15;
export const EARTH_PERIOD = 32;

const dayFmt = new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 });
const yearFmt = new Intl.NumberFormat("uk-UA", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatSim(t: number) {
  const days = (t / EARTH_PERIOD) * 365.25;
  const years = days / 365.25;
  return `День ${dayFmt.format(days)} · рік ${yearFmt.format(years)}`;
}

export function periodFor(orbit: number) {
  return EARTH_PERIOD * Math.pow(orbit / EARTH_ORBIT, 1.5);
}

export function writeOrbit(
  orbit: number,
  anomaly: number,
  inclination: number,
  out: { x: number; y: number; z: number },
  ecc = 0,
  peri = 0,
  mode: "mean" | "true" = "mean",
) {
  let nu = anomaly;
  let radius = orbit;
  if (ecc > 1e-6) {
    if (mode === "mean") {
      let M = anomaly % TAU;
      if (M < 0) M += TAU;
      let E = ecc < 0.8 ? M : Math.PI;
      for (let i = 0; i < 7; i++) {
        E -= (E - ecc * Math.sin(E) - M) / (1 - ecc * Math.cos(E));
      }
      nu = 2 * Math.atan2(Math.sqrt(1 + ecc) * Math.sin(E / 2), Math.sqrt(1 - ecc) * Math.cos(E / 2));
      radius = orbit * (1 - ecc * Math.cos(E));
    } else {
      radius = (orbit * (1 - ecc * ecc)) / (1 + ecc * Math.cos(anomaly));
    }
  }
  const ang = nu + peri;
  const x = Math.cos(ang) * radius;
  const z0 = Math.sin(ang) * radius;
  out.x = x;
  out.y = z0 * Math.sin(inclination);
  out.z = z0 * Math.cos(inclination);
}

export type BodyId =
  | "sun"
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune";

export type Fact = { k: string; v: string };

export type MoonDef = {
  name: string;
  radius: number;
  orbit: number;
  period: number;
  phase: number;
  tilt: number;
  color: string;
};

export type RingDef = {
  inner: number;
  outer: number;
  color: string;
  alpha: number;
  gap: number;
};

export type BodyDef = {
  id: BodyId;
  name: string;
  latin: string;
  kind: string;
  swatch: string;
  radius: number;
  orbit: number;
  period: number;
  phase: number;
  inclination: number;
  ecc: number;
  peri: number;
  years: number;
  tilt: number;
  spin: number;
  retrograde: boolean;
  shader: number;
  seed: number;
  spec: number;
  rim: number;
  rimColor: string;
  a: string;
  b: string;
  c: string;
  bands: number;
  spot: number;
  cities: number;
  clouds: boolean;
  atmo: string;
  atmoStrength: number;
  approach: number;
  rings?: RingDef;
  moons: MoonDef[];
  facts: Fact[];
  blurb: string;
};

const base = {
  orbit: 0,
  period: 1,
  phase: 0,
  inclination: 0,
  ecc: 0,
  peri: 0,
  years: 1,
  tilt: 0,
  spin: 0.12,
  retrograde: false,
  shader: 0,
  seed: 0,
  spec: 0,
  rim: 0,
  rimColor: "#ffffff",
  bands: 0,
  spot: 0,
  cities: 0,
  clouds: false,
  atmo: "#ffffff",
  atmoStrength: 0,
  moons: [] as MoonDef[],
};

export const SUN: BodyDef = {
  ...base,
  id: "sun",
  name: "Сонце",
  latin: "Sol",
  kind: "Зоря G2V",
  swatch: "#e4b56a",
  radius: 2.15,
  a: "#c45a12",
  b: "#ffb347",
  c: "#fff6d8",
  approach: 10,
  spin: 0.11,
  seed: 1.7,
  facts: [
    { k: "Клас", v: "Жовтий карлик G2V" },
    { k: "Діаметр", v: "1,39 млн км" },
    { k: "Маса", v: "99,8% системи" },
    { k: "Поверхня", v: "5 500 °C" },
    { k: "Екватор", v: "~25 земних діб" },
  ],
  blurb:
    "Майже вся маса Сонячної системи зібрана тут. Світло від фотосфери до Землі йде близько восьми хвилин.",
};

export const PLANETS: BodyDef[] = [
  {
    ...base,
    id: "mercury",
    name: "Меркурій",
    latin: "Mercurius",
    kind: "Планета земної групи",
    swatch: "#c2b4a6",
    radius: 0.16,
    orbit: 7.6,
    phase: 0.45,
    inclination: 0.11,
    ecc: 0.2056,
    peri: 1.35,
    years: 0.2408,
    tilt: 0.01,
    spin: 0.32,
    shader: 1,
    seed: 2.2,
    spec: 0.06,
    rim: 0.12,
    rimColor: "#d5c8b8",
    a: "#6a615a",
    b: "#c4b5a6",
    c: "#8d7f72",
    atmo: "#d5c8b8",
    atmoStrength: 0.12,
    approach: 2.3,
    facts: [
      { k: "Діаметр", v: "4 879 км" },
      { k: "Відстань", v: "0,39 а.о." },
      { k: "Рік", v: "88 земних діб" },
      { k: "Зоряна доба", v: "59 земних діб" },
      { k: "Супутники", v: "немає" },
      { k: "Температура", v: "−180…+430 °C" },
    ],
    blurb:
      "Найменша планета системи. Сонячна доба триває 176 земних діб — довше, ніж її власний рік.",
  },
  {
    ...base,
    id: "venus",
    name: "Венера",
    latin: "Venus",
    kind: "Планета земної групи",
    swatch: "#ead7ae",
    radius: 0.28,
    orbit: 10.6,
    phase: 2.15,
    inclination: 0.04,
    ecc: 0.0068,
    peri: 2.3,
    years: 0.6152,
    tilt: 0.09,
    spin: 0.1,
    retrograde: true,
    shader: 2,
    seed: 4.1,
    spec: 0.2,
    rim: 0.28,
    rimColor: "#f3e6c4",
    a: "#e4d0a4",
    b: "#f6ead0",
    c: "#c9a56e",
    atmo: "#f0e2bc",
    atmoStrength: 0.62,
    approach: 3.3,
    facts: [
      { k: "Діаметр", v: "12 104 км" },
      { k: "Відстань", v: "0,72 а.о." },
      { k: "Рік", v: "225 діб" },
      { k: "Доба", v: "243 доби, зворотний хід" },
      { k: "Супутники", v: "немає" },
      { k: "Температура", v: "~465 °C" },
    ],
    blurb:
      "Найгарячіша планета: щільна вуглекислотна атмосфера тримає тепло. Обертається у зворотний бік.",
  },
  {
    ...base,
    id: "earth",
    name: "Земля",
    latin: "Terra",
    kind: "Планета земної групи",
    swatch: "#7eafd6",
    radius: 0.3,
    orbit: EARTH_ORBIT,
    phase: 4.05,
    inclination: 0,
    ecc: 0.0167,
    peri: 1.8,
    years: 1,
    tilt: 0.408,
    spin: 0.85,
    shader: 3,
    seed: 8.4,
    spec: 0.42,
    rim: 0.34,
    rimColor: "#9fd0ff",
    a: "#1a4c86",
    b: "#2f6b3c",
    c: "#c6b48a",
    cities: 1,
    clouds: true,
    atmo: "#9fd0ff",
    atmoStrength: 0.72,
    approach: 3.7,
    moons: [
      {
        name: "Місяць",
        radius: 0.082,
        orbit: 0.82,
        period: 3.1,
        phase: 0.6,
        tilt: 0.09,
        color: "#d7d2c8",
      },
    ],
    facts: [
      { k: "Діаметр", v: "12 742 км" },
      { k: "Відстань", v: "1 а.о." },
      { k: "Рік", v: "365,25 доби" },
      { k: "Доба", v: "24 години" },
      { k: "Супутники", v: "1 — Місяць" },
      { k: "Температура", v: "~15 °C" },
    ],
    blurb:
      "Єдина відома планета з рідкою водою на поверхні. Нахил осі 23,4° дає пори року.",
  },
  {
    ...base,
    id: "mars",
    name: "Марс",
    latin: "Mars",
    kind: "Планета земної групи",
    swatch: "#d27a48",
    radius: 0.21,
    orbit: 19,
    phase: 1.15,
    inclination: 0.05,
    ecc: 0.0934,
    peri: 0.86,
    years: 1.8808,
    tilt: 0.436,
    spin: 0.8,
    shader: 4,
    seed: 3.3,
    spec: 0.08,
    rim: 0.18,
    rimColor: "#efc2a4",
    a: "#8a3b22",
    b: "#d18452",
    c: "#f3f0e8",
    atmo: "#efc2a4",
    atmoStrength: 0.26,
    approach: 2.9,
    facts: [
      { k: "Діаметр", v: "6 779 км" },
      { k: "Відстань", v: "1,52 а.о." },
      { k: "Рік", v: "687 діб" },
      { k: "Доба", v: "24 год 37 хв" },
      { k: "Супутники", v: "2 — Фобос і Деймос" },
      { k: "Температура", v: "~−63 °C" },
    ],
    blurb:
      "Олімп — найбільший вулкан системи, близько 22 км заввишки. Пил забарвлює небо в рожеве.",
  },
  {
    ...base,
    id: "jupiter",
    name: "Юпітер",
    latin: "Iuppiter",
    kind: "Газовий гігант",
    swatch: "#e0c7a4",
    radius: 0.92,
    orbit: 27.2,
    phase: 5.15,
    inclination: 0.02,
    ecc: 0.0489,
    peri: 0.25,
    years: 11.862,
    tilt: 0.052,
    spin: 2.05,
    shader: 5,
    seed: 6.6,
    spec: 0.16,
    rim: 0.22,
    rimColor: "#f3e4cc",
    a: "#c4a27a",
    b: "#f3e6d0",
    c: "#a85a34",
    bands: 26,
    spot: 1,
    atmo: "#f3e4cc",
    atmoStrength: 0.34,
    approach: 8.4,
    moons: [
      { name: "Іо", radius: 0.055, orbit: 1.28, period: 1.55, phase: 0.2, tilt: 0.06, color: "#e6c27a" },
      { name: "Європа", radius: 0.05, orbit: 1.58, period: 2.35, phase: 1.3, tilt: 0.04, color: "#d5e2ee" },
      { name: "Ганімед", radius: 0.072, orbit: 1.95, period: 3.5, phase: 2.5, tilt: 0.08, color: "#a89880" },
      { name: "Каллісто", radius: 0.064, orbit: 2.38, period: 5.1, phase: 0.7, tilt: 0.1, color: "#7e756c" },
    ],
    facts: [
      { k: "Діаметр", v: "139 820 км" },
      { k: "Відстань", v: "5,2 а.о." },
      { k: "Рік", v: "11,9 року" },
      { k: "Доба", v: "9 год 56 хв" },
      { k: "Супутники", v: "95+" },
      { k: "Хмари", v: "~−110 °C" },
    ],
    blurb:
      "Велика червона пляма — антициклон, ширший за Землю. Маса Юпітера більша за всі інші планети разом.",
  },
  {
    ...base,
    id: "saturn",
    name: "Сатурн",
    latin: "Saturnus",
    kind: "Газовий гігант",
    swatch: "#edd9ae",
    radius: 0.76,
    orbit: 34.8,
    phase: 0.85,
    inclination: 0.045,
    ecc: 0.0565,
    peri: 1.6,
    years: 29.457,
    tilt: 0.466,
    spin: 1.85,
    shader: 5,
    seed: 9.2,
    spec: 0.18,
    rim: 0.2,
    rimColor: "#f6ecd4",
    a: "#e4d2a4",
    b: "#f8f0dc",
    c: "#c9a86e",
    bands: 20,
    atmo: "#f6ecd4",
    atmoStrength: 0.28,
    approach: 11,
    rings: { inner: 1.05, outer: 1.68, color: "#f0e2bc", alpha: 0.92, gap: 0.58 },
    moons: [
      { name: "Титан", radius: 0.07, orbit: 2.15, period: 4.3, phase: 1.1, tilt: 0.18, color: "#e2c48a" },
    ],
    facts: [
      { k: "Діаметр", v: "116 460 км" },
      { k: "Відстань", v: "9,5 а.о." },
      { k: "Рік", v: "29,5 року" },
      { k: "Доба", v: "10 год 33 хв" },
      { k: "Супутники", v: "140+" },
      { k: "Температура", v: "~−140 °C" },
    ],
    blurb:
      "Кільця — крига й пил. Завширшки вони на сотні тисяч кілометрів, а завтовшки — близько кілометра.",
  },
  {
    ...base,
    id: "uranus",
    name: "Уран",
    latin: "Uranus",
    kind: "Крижаний гігант",
    swatch: "#b7e4e6",
    radius: 0.48,
    orbit: 42.6,
    phase: 3.35,
    inclination: 0.018,
    ecc: 0.0457,
    peri: 3.0,
    years: 84.01,
    tilt: 1.707,
    spin: 1.25,
    shader: 6,
    seed: 5.5,
    spec: 0.32,
    rim: 0.28,
    rimColor: "#dff8f8",
    a: "#9fd4d6",
    b: "#e7fbfb",
    c: "#6eafbf",
    bands: 12,
    atmo: "#dff8f8",
    atmoStrength: 0.42,
    approach: 5.6,
    rings: { inner: 0.7, outer: 0.9, color: "#d5f3f4", alpha: 0.42, gap: -1 },
    facts: [
      { k: "Діаметр", v: "50 724 км" },
      { k: "Відстань", v: "19,2 а.о." },
      { k: "Рік", v: "84 роки" },
      { k: "Доба", v: "17 год 14 хв" },
      { k: "Супутники", v: "28" },
      { k: "Температура", v: "~−195 °C" },
    ],
    blurb: "Вісь майже лежить на орбіті: планета «котиться» боком. Нахил — близько 98°.",
  },
  {
    ...base,
    id: "neptune",
    name: "Нептун",
    latin: "Neptunus",
    kind: "Крижаний гігант",
    swatch: "#4d78e0",
    radius: 0.47,
    orbit: 50.2,
    phase: 2.55,
    inclination: 0.03,
    ecc: 0.0113,
    peri: 0.77,
    years: 164.8,
    tilt: 0.489,
    spin: 1.35,
    shader: 6,
    seed: 7.7,
    spec: 0.36,
    rim: 0.32,
    rimColor: "#a9c0ff",
    a: "#1c4cb8",
    b: "#4d7ae6",
    c: "#d5e2ff",
    bands: 14,
    atmo: "#a9c0ff",
    atmoStrength: 0.55,
    approach: 5.5,
    facts: [
      { k: "Діаметр", v: "49 244 км" },
      { k: "Відстань", v: "30,1 а.о." },
      { k: "Рік", v: "165 років" },
      { k: "Доба", v: "16 год 6 хв" },
      { k: "Супутники", v: "16" },
      { k: "Температура", v: "~−200 °C" },
    ],
    blurb:
      "Найвітряніша планета: потоки в атмосфері швидші за 2 000 км/год. Її знайшли розрахунком раніше, ніж побачили.",
  },
];

for (const planet of PLANETS) {
  planet.period = periodFor(planet.orbit);
}

export const BODIES: BodyDef[] = [SUN, ...PLANETS];

export function findBody(id: BodyId | null): BodyDef | null {
  if (!id) return null;
  return BODIES.find((body) => body.id === id) ?? null;
}

export const SCALE_NOTE =
  "Розміри й відстані стиснуті, щоб система вмістилася в кадр. Відносні періоди дотримано за Кеплером: що далі орбіта, то повільніший рух.";

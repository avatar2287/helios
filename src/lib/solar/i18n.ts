import { EARTH_PERIOD, TAU, findBody, writeOrbit, type BodyId } from "@/lib/solar/bodies";

export type Lang = "uk" | "en" | "ru";
type KeplerSolid = "octa" | "icosa" | "dodeca" | "tetra" | "cube";

const LOCALE: Record<Lang, string> = { uk: "uk-UA", en: "en-GB", ru: "ru-RU" };

export function formatClock(t: number, lang: Lang) {
  const days = (t / EARTH_PERIOD) * 365.25;
  const years = days / 365.25;
  const dayFmt = new Intl.NumberFormat(LOCALE[lang], { maximumFractionDigits: 0 });
  const yearFmt = new Intl.NumberFormat(LOCALE[lang], { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  if (lang === "en") return `Day ${dayFmt.format(days)} · year ${yearFmt.format(years)}`;
  if (lang === "ru") return `День ${dayFmt.format(days)} · год ${yearFmt.format(years)}`;
  return `День ${dayFmt.format(days)} · рік ${yearFmt.format(years)}`;
}

const ui = {
  uk: {
    observatory: "Обсерваторія",
    title: "Геліос",
    pause: "Пауза",
    resume: "Продовжити симуляцію",
    info: "Довідка",
    overview: "Огляд",
    bodies: "Тіла Сонячної системи",
    trails: "Сліди",
    labels: "Мітки",
    orbits: "Орбіти",
    dances: "Танці",
    keplerBtn: "Кеплер",
    slower: "Повільніше",
    faster: "Швидше",
    speed: "Швидкість симуляції",
    speedN: "Множник швидкості",
    hint: "Пробіл — пауза · Танці і Кеплер — окремі кнопки внизу · 1–9 тіло · Esc огляд",
    model: "Модель",
    system: "Сонячна система",
    empty: "Оберіть планету. Еліпси йдуть за Кеплером: ближче до Сонця рух швидший. Фігури внизу вмикаються окремо.",
    moons: "Супутники",
    scale:
      "Розміри стиснуті, щоб система вмістилася в кадр. Ексцентриситети, нахили осей і закон площ — справжні.",
    tank: "Орбітальний танк",
    ecc: "Ексцентриситет",
    range: "Перигелій — афелій",
    au: "а.о.",
  },
  en: {
    observatory: "Observatory",
    title: "Helios",
    pause: "Pause",
    resume: "Resume simulation",
    info: "Guide",
    overview: "Overview",
    bodies: "Bodies of the Solar System",
    trails: "Trails",
    labels: "Labels",
    orbits: "Orbits",
    dances: "Dances",
    keplerBtn: "Kepler",
    slower: "Slower",
    faster: "Faster",
    speed: "Simulation speed",
    speedN: "Speed multiplier",
    hint: "Space — pause · Dances and Kepler are separate buttons below · 1–9 body · Esc overview",
    model: "Model",
    system: "Solar System",
    empty: "Select a planet. Ellipses follow Kepler: motion is faster near the Sun. Figures below switch on one at a time.",
    moons: "Moons",
    scale: "Sizes are compressed to fit the frame. Eccentricities, axial tilts and the law of areas are real.",
    tank: "Orbit tank",
    ecc: "Eccentricity",
    range: "Perihelion — aphelion",
    au: "AU",
  },
  ru: {
    observatory: "Обсерватория",
    title: "Гелиос",
    pause: "Пауза",
    resume: "Продолжить симуляцию",
    info: "Справка",
    overview: "Обзор",
    bodies: "Тела Солнечной системы",
    trails: "Следы",
    labels: "Метки",
    orbits: "Орбиты",
    dances: "Танцы",
    keplerBtn: "Кеплер",
    slower: "Медленнее",
    faster: "Быстрее",
    speed: "Скорость симуляции",
    speedN: "Множитель скорости",
    hint: "Пробел — пауза · Танцы и Кеплер — отдельные кнопки внизу · 1–9 тело · Esc обзор",
    model: "Модель",
    system: "Солнечная система",
    empty: "Выберите планету. Эллипсы по Кеплеру: ближе к Солнцу движение быстрее. Фигуры внизу включаются по одной.",
    moons: "Спутники",
    scale:
      "Размеры сжаты, чтобы система уместилась в кадр. Эксцентриситеты, наклоны осей и закон площадей — настоящие.",
    tank: "Орбитальный танк",
    ecc: "Эксцентриситет",
    range: "Перигелий — афелий",
    au: "а.е.",
  },
} as const;

export type UiKey = keyof (typeof ui)["uk"];

export function t(lang: Lang, key: UiKey) {
  return ui[lang][key];
}

type Copy = { name: string; kind: string; blurb: string; facts: { k: string; v: string }[] };

const copy: Record<Lang, Record<BodyId, Copy>> = {
  uk: {
    sun: {
      name: "Сонце",
      kind: "Зоря G2V",
      blurb: "Майже вся маса системи зібрана тут. Світло від фотосфери до Землі йде близько восьми хвилин.",
      facts: [
        { k: "Клас", v: "G2V" },
        { k: "Маса", v: "1,989×10³⁰ кг" },
        { k: "Склад", v: "водень, гелій" },
        { k: "Ядро", v: "плазма ~15 млн °C" },
        { k: "Поверхня", v: "5 500 °C" },
      ],
    },
    mercury: {
      name: "Меркурій",
      kind: "Планета земної групи",
      blurb: "Найсильніший еліпс серед планет: e = 0,206. Біля перигелію вона помітно швидша, ніж в афелії.",
      facts: [
        { k: "Маса", v: "3,30×10²³ кг" },
        { k: "Атмосфера", v: "екзосфера, сліди Na, K" },
        { k: "Рік", v: "88 діб" },
        { k: "Надра", v: "велике залізне ядро" },
        { k: "Відстань", v: "0,31–0,47 а.о." },
      ],
    },
    venus: {
      name: "Венера",
      kind: "Планета земної групи",
      blurb: "Із Землею тримає резонанс 13:8. За вісім земних років лінія між ними малює п’ятипелюсткову квітку.",
      facts: [
        { k: "Маса", v: "4,87×10²⁴ кг" },
        { k: "Атмосфера", v: "CO₂, хмари H₂SO₄" },
        { k: "Рік", v: "225 діб" },
        { k: "Надра", v: "кам’яна мантія, залізне ядро" },
        { k: "Тиск", v: "92 атм" },
      ],
    },
    earth: {
      name: "Земля",
      kind: "Планета земної групи",
      blurb: "Нахил осі 23,4° дає пори року. Разом із Венерою їхні орбіти складають гармонію 8:13.",
      facts: [
        { k: "Маса", v: "5,97×10²⁴ кг" },
        { k: "Атмосфера", v: "N₂ 78%, O₂ 21%" },
        { k: "Рік", v: "365,25 доби" },
        { k: "Надра", v: "кора, мантія, рідке ядро" },
        { k: "Доба", v: "24 години" },
      ],
    },
    mars: {
      name: "Марс",
      kind: "Планета земної групи",
      blurb: "Еліпс помітний (e = 0,093). Із Землею найближчий простий резонанс близько 1:2.",
      facts: [
        { k: "Маса", v: "6,42×10²³ кг" },
        { k: "Атмосфера", v: "CO₂ ~95%" },
        { k: "Рік", v: "687 діб" },
        { k: "Надра", v: "базальтова кора, ядро" },
        { k: "Доба", v: "24 год 37 хв" },
      ],
    },
    jupiter: {
      name: "Юпітер",
      kind: "Газовий гігант",
      blurb: "Із Сатурном майже точно 5:2 — великий резонанс, який тримає пояс астероїдів.",
      facts: [
        { k: "Маса", v: "1,90×10²⁷ кг" },
        { k: "Атмосфера", v: "H₂, He, смуги NH₃" },
        { k: "Рік", v: "11,86 року" },
        { k: "Надра", v: "металічний водень" },
        { k: "Доба", v: "9 год 56 хв" },
      ],
    },
    saturn: {
      name: "Сатурн",
      kind: "Газовий гігант",
      blurb: "Нахил осі 26,7° відкриває кільця. З Юпітером ділить резонанс 2:5.",
      facts: [
        { k: "Маса", v: "5,68×10²⁶ кг" },
        { k: "Атмосфера", v: "H₂, He" },
        { k: "Рік", v: "29,5 року" },
        { k: "Надра", v: "металічний водень, ядро" },
        { k: "Кільця", v: "крига, товщина ~1 км" },
      ],
    },
    uranus: {
      name: "Уран",
      kind: "Крижаний гігант",
      blurb: "Вісь нахилена на 98°: планета котиться боком. Із Нептуном близький резонанс 2:1.",
      facts: [
        { k: "Маса", v: "8,68×10²⁵ кг" },
        { k: "Атмосфера", v: "H₂, He, CH₄" },
        { k: "Рік", v: "84 роки" },
        { k: "Надра", v: "вода, аміак, метан" },
        { k: "Доба", v: "17 год 14 хв" },
      ],
    },
    neptune: {
      name: "Нептун",
      kind: "Крижаний гігант",
      blurb: "Найдалі з великих планет. Вітри понад 2 000 км/год. Із Ураном — майже 1:2.",
      facts: [
        { k: "Маса", v: "1,02×10²⁶ кг" },
        { k: "Атмосфера", v: "H₂, He, CH₄" },
        { k: "Рік", v: "165 років" },
        { k: "Надра", v: "крижана мантія" },
        { k: "Відстань", v: "30,1 а.о." },
      ],
    },
  },
  en: {
    sun: {
      name: "Sun",
      kind: "G2V star",
      blurb: "Nearly all the mass of the system sits here. Light from the photosphere reaches Earth in about eight minutes.",
      facts: [
        { k: "Class", v: "G2V" },
        { k: "Mass", v: "1.989×10³⁰ kg" },
        { k: "Makeup", v: "hydrogen, helium" },
        { k: "Core", v: "plasma ~15 million °C" },
        { k: "Surface", v: "5,500 °C" },
      ],
    },
    mercury: {
      name: "Mercury",
      kind: "Terrestrial planet",
      blurb: "The most eccentric planetary orbit, e = 0.206. It moves clearly faster at perihelion than at aphelion.",
      facts: [
        { k: "Mass", v: "3.30×10²³ kg" },
        { k: "Atmosphere", v: "exosphere, traces of Na, K" },
        { k: "Year", v: "88 days" },
        { k: "Interior", v: "huge iron core" },
        { k: "Distance", v: "0.31–0.47 AU" },
      ],
    },
    venus: {
      name: "Venus",
      kind: "Terrestrial planet",
      blurb: "Locked with Earth in an 13:8 resonance. Over eight Earth years the line between them draws a five-petal flower.",
      facts: [
        { k: "Mass", v: "4.87×10²⁴ kg" },
        { k: "Atmosphere", v: "CO₂, H₂SO₄ clouds" },
        { k: "Year", v: "225 days" },
        { k: "Interior", v: "rocky mantle, iron core" },
        { k: "Pressure", v: "92 atm" },
      ],
    },
    earth: {
      name: "Earth",
      kind: "Terrestrial planet",
      blurb: "An axial tilt of 23.4° makes the seasons. With Venus the orbits form an 8:13 harmony.",
      facts: [
        { k: "Mass", v: "5.97×10²⁴ kg" },
        { k: "Atmosphere", v: "N₂ 78%, O₂ 21%" },
        { k: "Year", v: "365.25 days" },
        { k: "Interior", v: "crust, mantle, liquid core" },
        { k: "Day", v: "24 hours" },
      ],
    },
    mars: {
      name: "Mars",
      kind: "Terrestrial planet",
      blurb: "The ellipse is visible (e = 0.093). With Earth the nearest simple resonance is about 1:2.",
      facts: [
        { k: "Mass", v: "6.42×10²³ kg" },
        { k: "Atmosphere", v: "CO₂ ~95%" },
        { k: "Year", v: "687 days" },
        { k: "Interior", v: "basalt crust, core" },
        { k: "Day", v: "24 h 37 min" },
      ],
    },
    jupiter: {
      name: "Jupiter",
      kind: "Gas giant",
      blurb: "With Saturn it is almost exactly 5:2 — the great resonance that shepherds the asteroid belt.",
      facts: [
        { k: "Mass", v: "1.90×10²⁷ kg" },
        { k: "Atmosphere", v: "H₂, He, NH₃ bands" },
        { k: "Year", v: "11.86 years" },
        { k: "Interior", v: "metallic hydrogen" },
        { k: "Day", v: "9 h 56 min" },
      ],
    },
    saturn: {
      name: "Saturn",
      kind: "Gas giant",
      blurb: "A 26.7° tilt opens the rings. It shares a 2:5 resonance with Jupiter.",
      facts: [
        { k: "Mass", v: "5.68×10²⁶ kg" },
        { k: "Atmosphere", v: "H₂, He" },
        { k: "Year", v: "29.5 years" },
        { k: "Interior", v: "metallic hydrogen, core" },
        { k: "Rings", v: "ice, ~1 km thick" },
      ],
    },
    uranus: {
      name: "Uranus",
      kind: "Ice giant",
      blurb: "Tilted 98°, it rolls on its side. With Neptune the orbits sit near a 2:1 resonance.",
      facts: [
        { k: "Mass", v: "8.68×10²⁵ kg" },
        { k: "Atmosphere", v: "H₂, He, CH₄" },
        { k: "Year", v: "84 years" },
        { k: "Interior", v: "water, ammonia, methane" },
        { k: "Day", v: "17 h 14 min" },
      ],
    },
    neptune: {
      name: "Neptune",
      kind: "Ice giant",
      blurb: "The outermost giant. Winds exceed 2,000 km/h. With Uranus the ratio is nearly 1:2.",
      facts: [
        { k: "Mass", v: "1.02×10²⁶ kg" },
        { k: "Atmosphere", v: "H₂, He, CH₄" },
        { k: "Year", v: "165 years" },
        { k: "Interior", v: "icy mantle" },
        { k: "Distance", v: "30.1 AU" },
      ],
    },
  },
  ru: {
    sun: {
      name: "Солнце",
      kind: "Звезда G2V",
      blurb: "Почти вся масса системы собрана здесь. Свет от фотосферы до Земли идёт около восьми минут.",
      facts: [
        { k: "Класс", v: "G2V" },
        { k: "Масса", v: "1,989×10³⁰ кг" },
        { k: "Состав", v: "водород, гелий" },
        { k: "Ядро", v: "плазма ~15 млн °C" },
        { k: "Поверхность", v: "5 500 °C" },
      ],
    },
    mercury: {
      name: "Меркурий",
      kind: "Планета земной группы",
      blurb: "Самый вытянутый эллипс среди планет: e = 0,206. В перигелии она заметно быстрее, чем в афелии.",
      facts: [
        { k: "Масса", v: "3,30×10²³ кг" },
        { k: "Атмосфера", v: "экзосфера, следы Na, K" },
        { k: "Год", v: "88 суток" },
        { k: "Недра", v: "большое железное ядро" },
        { k: "Расстояние", v: "0,31–0,47 а.е." },
      ],
    },
    venus: {
      name: "Венера",
      kind: "Планета земной группы",
      blurb: "С Землёй держит резонанс 13:8. За восемь земных лет линия между ними рисует пятилепестковый цветок.",
      facts: [
        { k: "Масса", v: "4,87×10²⁴ кг" },
        { k: "Атмосфера", v: "CO₂, облака H₂SO₄" },
        { k: "Год", v: "225 суток" },
        { k: "Недра", v: "каменная мантия, железное ядро" },
        { k: "Давление", v: "92 атм" },
      ],
    },
    earth: {
      name: "Земля",
      kind: "Планета земной группы",
      blurb: "Наклон оси 23,4° даёт времена года. Вместе с Венерой орбиты складываются в гармонию 8:13.",
      facts: [
        { k: "Масса", v: "5,97×10²⁴ кг" },
        { k: "Атмосфера", v: "N₂ 78%, O₂ 21%" },
        { k: "Год", v: "365,25 суток" },
        { k: "Недра", v: "кора, мантия, жидкое ядро" },
        { k: "Сутки", v: "24 часа" },
      ],
    },
    mars: {
      name: "Марс",
      kind: "Планета земной группы",
      blurb: "Эллипс заметен (e = 0,093). С Землёй ближайший простой резонанс около 1:2.",
      facts: [
        { k: "Масса", v: "6,42×10²³ кг" },
        { k: "Атмосфера", v: "CO₂ ~95%" },
        { k: "Год", v: "687 суток" },
        { k: "Недра", v: "базальтовая кора, ядро" },
        { k: "Сутки", v: "24 ч 37 мин" },
      ],
    },
    jupiter: {
      name: "Юпитер",
      kind: "Газовый гигант",
      blurb: "С Сатурном почти точно 5:2 — великий резонанс, который держит пояс астероидов.",
      facts: [
        { k: "Масса", v: "1,90×10²⁷ кг" },
        { k: "Атмосфера", v: "H₂, He, полосы NH₃" },
        { k: "Год", v: "11,86 года" },
        { k: "Недра", v: "металлический водород" },
        { k: "Сутки", v: "9 ч 56 мин" },
      ],
    },
    saturn: {
      name: "Сатурн",
      kind: "Газовый гигант",
      blurb: "Наклон оси 26,7° раскрывает кольца. С Юпитером делит резонанс 2:5.",
      facts: [
        { k: "Масса", v: "5,68×10²⁶ кг" },
        { k: "Атмосфера", v: "H₂, He" },
        { k: "Год", v: "29,5 года" },
        { k: "Недра", v: "металлический водород, ядро" },
        { k: "Кольца", v: "лёд, толщина ~1 км" },
      ],
    },
    uranus: {
      name: "Уран",
      kind: "Ледяной гигант",
      blurb: "Ось наклонена на 98°: планета катится боком. С Нептуном близкий резонанс 2:1.",
      facts: [
        { k: "Масса", v: "8,68×10²⁵ кг" },
        { k: "Атмосфера", v: "H₂, He, CH₄" },
        { k: "Год", v: "84 года" },
        { k: "Недра", v: "вода, аммиак, метан" },
        { k: "Сутки", v: "17 ч 14 мин" },
      ],
    },
    neptune: {
      name: "Нептун",
      kind: "Ледяной гигант",
      blurb: "Самая далёкая из больших планет. Ветры свыше 2 000 км/ч. С Ураном — почти 1:2.",
      facts: [
        { k: "Масса", v: "1,02×10²⁶ кг" },
        { k: "Атмосфера", v: "H₂, He, CH₄" },
        { k: "Год", v: "165 лет" },
        { k: "Недра", v: "ледяная мантия" },
        { k: "Расстояние", v: "30,1 а.е." },
      ],
    },
  },
};

export function bodyCopy(lang: Lang, id: BodyId) {
  return copy[lang][id];
}

const moons: Record<string, Record<Lang, string>> = {
  Місяць: { uk: "Місяць", en: "Moon", ru: "Луна" },
  Іо: { uk: "Іо", en: "Io", ru: "Ио" },
  Європа: { uk: "Європа", en: "Europa", ru: "Европа" },
  Ганімед: { uk: "Ганімед", en: "Ganymede", ru: "Ганимед" },
  Каллісто: { uk: "Каллісто", en: "Callisto", ru: "Каллисто" },
  Титан: { uk: "Титан", en: "Titan", ru: "Титан" },
};

export function moonName(lang: Lang, name: string) {
  return moons[name]?.[lang] ?? name;
}

const figures: Record<Lang, Record<KeplerSolid, { label: string; between: string }>> = {
  uk: {
    octa: { label: "Октаедр", between: "Меркурій — Венера" },
    icosa: { label: "Ікосаедр", between: "Венера — Земля" },
    dodeca: { label: "Додекаедр", between: "Земля — Марс" },
    tetra: { label: "Тетраедр", between: "Марс — Юпітер" },
    cube: { label: "Куб", between: "Юпітер — Сатурн" },
  },
  en: {
    octa: { label: "Octahedron", between: "Mercury — Venus" },
    icosa: { label: "Icosahedron", between: "Venus — Earth" },
    dodeca: { label: "Dodecahedron", between: "Earth — Mars" },
    tetra: { label: "Tetrahedron", between: "Mars — Jupiter" },
    cube: { label: "Cube", between: "Jupiter — Saturn" },
  },
  ru: {
    octa: { label: "Октаэдр", between: "Меркурий — Венера" },
    icosa: { label: "Икосаэдр", between: "Венера — Земля" },
    dodeca: { label: "Додекаэдр", between: "Земля — Марс" },
    tetra: { label: "Тетраэдр", between: "Марс — Юпитер" },
    cube: { label: "Куб", between: "Юпитер — Сатурн" },
  },
};

export function figureCopy(lang: Lang, id: KeplerSolid) {
  return figures[lang][id];
}

export const RESONANCE: Partial<Record<BodyId, { partner: BodyId; n: number; m: number; days: number }>> = {
  mercury: { partner: "venus", n: 5, m: 2, days: 145 },
  venus: { partner: "earth", n: 13, m: 8, days: 584 },
  earth: { partner: "venus", n: 8, m: 13, days: 584 },
  mars: { partner: "earth", n: 1, m: 2, days: 780 },
  jupiter: { partner: "saturn", n: 5, m: 2, days: 7254 },
  saturn: { partner: "jupiter", n: 2, m: 5, days: 7254 },
  uranus: { partner: "neptune", n: 2, m: 1, days: 62800 },
  neptune: { partner: "uranus", n: 1, m: 2, days: 62800 },
};

const beat: Record<Lang, (ratio: string, other: string, days: string) => string> = {
  uk: (ratio, other, days) => `${ratio} · ${other} · такт ${days} д`,
  en: (ratio, other, days) => `${ratio} · ${other} · beat ${days} d`,
  ru: (ratio, other, days) => `${ratio} · ${other} · такт ${days} сут`,
};

export function resonanceLabel(lang: Lang, id: BodyId) {
  const spec = RESONANCE[id];
  if (!spec) return "";
  const other = copy[lang][spec.partner].name;
  const ratio = `${spec.n}:${spec.m}`;
  const days = new Intl.NumberFormat(LOCALE[lang], { maximumFractionDigits: 0 }).format(spec.days);
  return beat[lang](ratio, other, days);
}

const scratch = { x: 0, y: 0, z: 0 };

export function buildRose(id: BodyId) {
  const spec = RESONANCE[id];
  const body = findBody(id);
  const partner = spec ? findBody(spec.partner) : null;
  if (!spec || !body || !partner) return null;
  const steps = 960;
  const arr = new Float32Array((steps + 1) * 3);
  let rMax = 1;
  for (let i = 0; i <= steps; i++) {
    const turn = i / steps;
    const m1 = turn * spec.n * TAU + body.phase;
    const m2 = turn * spec.m * TAU + partner.phase;
    writeOrbit(body.orbit, m1, body.inclination, scratch, body.ecc, body.peri);
    const x1 = scratch.x;
    const y1 = scratch.y;
    const z1 = scratch.z;
    writeOrbit(partner.orbit, m2, partner.inclination, scratch, partner.ecc, partner.peri);
    const x = scratch.x - x1;
    const y = scratch.y - y1;
    const z = scratch.z - z1;
    arr[i * 3] = x;
    arr[i * 3 + 1] = y;
    arr[i * 3 + 2] = z;
    rMax = Math.max(rMax, Math.hypot(x, y, z));
  }
  return { arr, rMax, color: body.swatch };
}

import type { AspectKind, ChartBody, NatalChart, Placement, SignId, Voice } from "@/lib/solar/chart";
import { SIGN_IDS, signOf } from "@/lib/solar/chart";
import type { Lang } from "@/lib/solar/i18n";

export const SIGN_NAME: Record<Lang, Record<SignId, string>> = {
  uk: { ari: "Овен", tau: "Телець", gem: "Близнюки", can: "Рак", leo: "Лев", vir: "Діва", lib: "Терези", sco: "Скорпіон", sag: "Стрілець", cap: "Козоріг", aqu: "Водолій", pis: "Риби" },
  en: { ari: "Aries", tau: "Taurus", gem: "Gemini", can: "Cancer", leo: "Leo", vir: "Virgo", lib: "Libra", sco: "Scorpio", sag: "Sagittarius", cap: "Capricorn", aqu: "Aquarius", pis: "Pisces" },
  ru: { ari: "Овен", tau: "Телец", gem: "Близнецы", can: "Рак", leo: "Лев", vir: "Дева", lib: "Весы", sco: "Скорпион", sag: "Стрелец", cap: "Козерог", aqu: "Водолей", pis: "Рыбы" },
};

export const BODY_NAME: Record<Lang, Record<ChartBody, string>> = {
  uk: { sun: "Сонце", moon: "Місяць", mercury: "Меркурій", venus: "Венера", mars: "Марс", jupiter: "Юпітер", saturn: "Сатурн", uranus: "Уран", neptune: "Нептун", pluto: "Плутон" },
  en: { sun: "Sun", moon: "Moon", mercury: "Mercury", venus: "Venus", mars: "Mars", jupiter: "Jupiter", saturn: "Saturn", uranus: "Uranus", neptune: "Neptune", pluto: "Pluto" },
  ru: { sun: "Солнце", moon: "Луна", mercury: "Меркурий", venus: "Венера", mars: "Марс", jupiter: "Юпитер", saturn: "Сатурн", uranus: "Уран", neptune: "Нептун", pluto: "Плутон" },
};

const PLANET: Record<Lang, Record<Voice, Record<ChartBody, string>>> = {
  uk: {
    child: {
      sun: "Сонце — чим тобі радісно світити і що хочеться показати світу.",
      moon: "Місяць — як ти заспокоюєшся, коли втомлюєшся, і що відчуваєш удома.",
      mercury: "Меркурій — як ти думаєш, питаєш і розповідаєш історії.",
      venus: "Венера — як ти дружиш, любиш красиве і миришся.",
      mars: "Марс — як ти берешся до справи і захищаєш те, що важливе.",
      jupiter: "Юпітер — де тобі щастить рости і вчитися великого.",
      saturn: "Сатурн — де потрібні терпіння і чесна праця, і там виростає майстерність.",
      uranus: "Уран — де тобі кортить зробити по-своєму і здивувати.",
      neptune: "Нептун — де живе уява, музика і сни.",
      pluto: "Плутон — де ти вмієш змінюватися і не боїшся правди.",
    },
    adult: {
      sun: "Сонце — свідома воля, ім’я і те, на чому тримається самоповага.",
      moon: "Місяць — тіло пам’яті, потреба в безпеці і звичний спосіб відновлюватися.",
      mercury: "Меркурій — мова, увага і те, як людина складає світ у речення.",
      venus: "Венера — смак, приязнь і те, що людина вважає гідним любові.",
      mars: "Марс — спосіб діяти, гніватися і відстоювати межу.",
      jupiter: "Юпітер — сенс, щедрість і горизонт, до якого тягне віра.",
      saturn: "Сатурн — форма, межа, відповідальність і час, який усе перевіряє.",
      uranus: "Уран — раптова свобода, розрив звички і власний закон.",
      neptune: "Нептун — розчинення межі, образ, співчуття і самообман.",
      pluto: "Плутон — влада, втрата і те, що не відпускає, поки не зміниться.",
    },
  },
  en: {
    child: {
      sun: "The Sun is what you love to shine with and show the world.",
      moon: "The Moon is how you calm down and what home feels like.",
      mercury: "Mercury is how you think, ask questions and tell stories.",
      venus: "Venus is how you make friends, love beauty and make peace.",
      mars: "Mars is how you start things and protect what matters.",
      jupiter: "Jupiter is where you grow and learn something big.",
      saturn: "Saturn is where patience and honest work turn into skill.",
      uranus: "Uranus is where you want to do it your own surprising way.",
      neptune: "Neptune is where imagination, music and dreams live.",
      pluto: "Pluto is where you can change and are not afraid of the truth.",
    },
    adult: {
      sun: "The Sun is conscious will, the name, and what self-respect stands on.",
      moon: "The Moon is memory in the body, the need for safety, and how a person recovers.",
      mercury: "Mercury is speech, attention, and how a mind turns the world into sentences.",
      venus: "Venus is taste, affection, and what a person finds worth loving.",
      mars: "Mars is how one acts, gets angry, and defends a boundary.",
      jupiter: "Jupiter is meaning, generosity, and the horizon faith reaches for.",
      saturn: "Saturn is form, limit, responsibility, and the time that tests them.",
      uranus: "Uranus is sudden freedom, the break in habit, and a law of one’s own.",
      neptune: "Neptune is the dissolving edge, image, compassion, and self-deception.",
      pluto: "Pluto is power, loss, and what will not let go until it changes.",
    },
  },
  ru: {
    child: {
      sun: "Солнце — чем тебе радостно светить и что хочется показать миру.",
      moon: "Луна — как ты успокаиваешься и каким бывает дом.",
      mercury: "Меркурий — как ты думаешь, спрашиваешь и рассказываешь истории.",
      venus: "Венера — как ты дружишь, любишь красивое и миришься.",
      mars: "Марс — как ты берёшься за дело и защищаешь важное.",
      jupiter: "Юпитер — где тебе везёт расти и узнавать большое.",
      saturn: "Сатурн — где нужны терпение и честный труд, и там появляется мастерство.",
      uranus: "Уран — где хочется сделать по-своему и удивить.",
      neptune: "Нептун — где живут воображение, музыка и сны.",
      pluto: "Плутон — где ты умеешь меняться и не боишься правды.",
    },
    adult: {
      sun: "Солнце — сознательная воля, имя и то, на чём держится самоуважение.",
      moon: "Луна — память тела, нужда в безопасности и привычный способ восстановиться.",
      mercury: "Меркурий — речь, внимание и то, как человек складывает мир в фразы.",
      venus: "Венера — вкус, приязнь и то, что человек считает достойным любви.",
      mars: "Марс — способ действовать, злиться и защищать границу.",
      jupiter: "Юпитер — смысл, щедрость и горизонт, к которому тянется вера.",
      saturn: "Сатурн — форма, предел, ответственность и время, которое всё проверяет.",
      uranus: "Уран — внезапная свобода, разрыв привычки и собственный закон.",
      neptune: "Нептун — растворение границы, образ, сочувствие и самообман.",
      pluto: "Плутон — власть, утрата и то, что не отпускает, пока не изменится.",
    },
  },
};

const SIGN: Record<Lang, Record<Voice, Record<SignId, string>>> = {
  uk: {
    child: {
      ari: "Тут усе починається швидко, з іскри.",
      tau: "Тут приємно повільно: тепло, смак, свої речі.",
      gem: "Тут багато слів, питань і цікавих поворотів.",
      can: "Тут бережуть своїх і пам’ятають, де дім.",
      leo: "Тут люблять сцену, тепло і щиру гру.",
      vir: "Тут помічають дрібниці і люблять зробити добре.",
      lib: "Тут шукають рівновагу і гарну розмову.",
      sco: "Тут почуття глибокі і секрети не для всіх.",
      sag: "Тут тягне далі: у дорогу, у жарт, у велике питання.",
      cap: "Тут будують сходинку за сходинкою.",
      aqu: "Тут друзі і дивні ідеї важливіші за моду.",
      pis: "Тут усе м’якше, як вода, пісня і сон.",
    },
    adult: {
      ari: "Овен дає прямий старт і не терпить довгої розминки.",
      tau: "Телець тримає цінність у тілі, речовині й вірності ритму.",
      gem: "Близнюки з’єднують, порівнюють і не люблять однієї версії.",
      can: "Рак захищає корінь: родину, пам’ять, вразливе.",
      leo: "Лев збирає увагу і творчу гідність. Ризик — грати роль замість живого жесту.",
      vir: "Діва розрізняє, лагодить і служить через точність.",
      lib: "Терези шукають міру, іншого і форму, в якій двом добре.",
      sco: "Скорпіон не відпускає половину правди. Тут зв’язок або криза.",
      sag: "Стрілець розширює карту: смисл, чужина, віра.",
      cap: "Козоріг будує те, що має пережити автора.",
      aqu: "Водолій відсуває особисте заради майбутнього і дружнього кола.",
      pis: "Риби розмивають край: співчуття, музика, плутанина образів.",
    },
  },
  en: {
    child: {
      ari: "Here things start fast, from a spark.",
      tau: "Here slow is pleasant: warmth, taste, your own things.",
      gem: "Here there are many words, questions and turns.",
      can: "Here you look after your people and remember home.",
      leo: "Here you love a stage, warmth and honest play.",
      vir: "Here you notice small things and like to do them well.",
      lib: "Here you look for balance and a good conversation.",
      sco: "Here feelings are deep and secrets are not for everyone.",
      sag: "Here you want to go farther: a road, a joke, a big question.",
      cap: "Here you build one step at a time.",
      aqu: "Here friends and odd ideas matter more than fashion.",
      pis: "Here everything is softer, like water, a song and a dream.",
    },
    adult: {
      ari: "Aries gives a direct start and dislikes a long warm-up.",
      tau: "Taurus keeps value in the body, material and a faithful rhythm.",
      gem: "Gemini connects, compares and resists a single version.",
      can: "Cancer guards the root: family, memory, what is tender.",
      leo: "Leo gathers attention and creative dignity. The risk is playing a role instead of a living gesture.",
      vir: "Virgo distinguishes, mends and serves through precision.",
      lib: "Libra looks for measure, the other person, and a form that suits two.",
      sco: "Scorpio does not accept half a truth. Here a bond or a crisis.",
      sag: "Sagittarius widens the map: meaning, abroad, faith.",
      cap: "Capricorn builds what should outlast its maker.",
      aqu: "Aquarius sets the personal aside for a future and a circle of friends.",
      pis: "Pisces softens the edge: compassion, music, a blur of images.",
    },
  },
  ru: {
    child: {
      ari: "Здесь всё начинается быстро, от искры.",
      tau: "Здесь приятно медленно: тепло, вкус, свои вещи.",
      gem: "Здесь много слов, вопросов и поворотов.",
      can: "Здесь берегут своих и помнят, где дом.",
      leo: "Здесь любят сцену, тепло и честную игру.",
      vir: "Здесь замечают мелочи и любят сделать хорошо.",
      lib: "Здесь ищут равновесие и хороший разговор.",
      sco: "Здесь чувства глубокие, и секреты не для всех.",
      sag: "Здесь тянет дальше: в дорогу, в шутку, в большой вопрос.",
      cap: "Здесь строят ступеньку за ступенькой.",
      aqu: "Здесь друзья и странные идеи важнее моды.",
      pis: "Здесь всё мягче, как вода, песня и сон.",
    },
    adult: {
      ari: "Овен даёт прямой старт и не любит долгой раскачки.",
      tau: "Телец держит ценность в теле, веществе и верности ритму.",
      gem: "Близнецы соединяют, сравнивают и не любят одной версии.",
      can: "Рак защищает корень: семью, память, уязвимое.",
      leo: "Лев собирает внимание и творческое достоинство. Риск — играть роль вместо живого жеста.",
      vir: "Дева различает, чинит и служит через точность.",
      lib: "Весы ищут меру, другого и форму, в которой двоим хорошо.",
      sco: "Скорпион не отпускает половину правды. Здесь связь или кризис.",
      sag: "Стрелец расширяет карту: смысл, чужбина, вера.",
      cap: "Козерог строит то, что должно пережить автора.",
      aqu: "Водолей отодвигает личное ради будущего и круга друзей.",
      pis: "Рыбы размывают край: сочувствие, музыка, путаница образов.",
    },
  },
};

const HOUSE: Record<Lang, Record<Voice, string[]>> = {
  uk: {
    child: [
      "Це про тебе самого.",
      "Це про речі, які твої.",
      "Це про слова, братів, сестер і дорогу до школи.",
      "Це про дім і тих, хто поруч уночі.",
      "Це про гру, сцену і радість.",
      "Це про турботу, звички і корисні справи.",
      "Це про друга навпроти.",
      "Це про спільне і про те, що не кажуть уголос.",
      "Це про далекі країни і великі питання.",
      "Це про те, ким тебе бачать і що ти вмієш.",
      "Це про друзів і мрії гуртом.",
      "Це про тишу, таємниці і відпочинок.",
    ],
    adult: [
      "I дім — спосіб входити в кімнату і тіло, з якого дивляться.",
      "II дім — ресурс, тілесна опора і те, що людина вважає своїм.",
      "III дім — мова ближнього кола, навчання, дорога.",
      "IV дім — корінь, дім, батько або мати, кінець справи.",
      "V дім — творчість, гра, любовний ризик, діти.",
      "VI дім — праця, служіння, тіло в режимі.",
      "VII дім — інший: партнер, суперник, дзеркало.",
      "VIII дім — спільне, борг, близькість, те, що перероджує.",
      "IX дім — сенс, чужина, закон, віра.",
      "X дім — покликання і те, що видно здалеку.",
      "XI дім — коло однодумців і майбутнє.",
      "XII дім — усамітнення, сон, приховане і відпущене.",
    ],
  },
  en: {
    child: [
      "This is about you.",
      "This is about the things that are yours.",
      "This is about words, brothers, sisters and the way to school.",
      "This is about home and who is near at night.",
      "This is about play, a stage and joy.",
      "This is about care, habits and useful jobs.",
      "This is about the friend across from you.",
      "This is about what is shared and not said aloud.",
      "This is about far countries and big questions.",
      "This is about what people see you can do.",
      "This is about friends and dreams together.",
      "This is about quiet, secrets and rest.",
    ],
    adult: [
      "House I — how a person enters a room, and the body they look from.",
      "House II — resource, bodily support, and what they call their own.",
      "House III — the speech of the near circle, study, the road.",
      "House IV — the root, the home, a parent, the end of a matter.",
      "House V — making, play, the risk of love, children.",
      "House VI — work, service, the body on a schedule.",
      "House VII — the other: partner, rival, mirror.",
      "House VIII — what is shared, debt, intimacy, what remakes.",
      "House IX — meaning, abroad, law, faith.",
      "House X — a calling and what is visible from far away.",
      "House XI — a circle of allies and the future.",
      "House XII — solitude, sleep, the hidden and the released.",
    ],
  },
  ru: {
    child: [
      "Это про тебя самого.",
      "Это про вещи, которые твои.",
      "Это про слова, братьев, сестёр и дорогу в школу.",
      "Это про дом и тех, кто рядом ночью.",
      "Это про игру, сцену и радость.",
      "Это про заботу, привычки и полезные дела.",
      "Это про друга напротив.",
      "Это про общее и про то, чего не говорят вслух.",
      "Это про дальние страны и большие вопросы.",
      "Это про то, каким тебя видят и что ты умеешь.",
      "Это про друзей и общие мечты.",
      "Это про тишину, тайны и отдых.",
    ],
    adult: [
      "I дом — как человек входит в комнату и тело, из которого смотрит.",
      "II дом — ресурс, телесная опора и то, что он считает своим.",
      "III дом — речь ближнего круга, учёба, дорога.",
      "IV дом — корень, дом, родитель, конец дела.",
      "V дом — творчество, игра, риск любви, дети.",
      "VI дом — труд, служение, тело в режиме.",
      "VII дом — другой: партнёр, соперник, зеркало.",
      "VIII дом — общее, долг, близость, то, что перерождает.",
      "IX дом — смысл, чужбина, закон, вера.",
      "X дом — призвание и то, что видно издалека.",
      "XI дом — круг единомышленников и будущее.",
      "XII дом — уединение, сон, скрытое и отпущенное.",
    ],
  },
};

export const ASPECT_NAME: Record<Lang, Record<AspectKind, string>> = {
  uk: { conjunction: "З’єднання", sextile: "Секстиль", square: "Квадрат", trine: "Трин", opposition: "Опозиція" },
  en: { conjunction: "Conjunction", sextile: "Sextile", square: "Square", trine: "Trine", opposition: "Opposition" },
  ru: { conjunction: "Соединение", sextile: "Секстиль", square: "Квадрат", trine: "Трин", opposition: "Оппозиция" },
};

const ASPECT_LINE: Record<Lang, Record<Voice, Record<AspectKind, string>>> = {
  uk: {
    child: {
      conjunction: "Вони стоять разом і говорять в один голос.",
      sextile: "Їм легко подати одне одному руку.",
      square: "Вони штовхають одне одного до справи. Це не зламаність, а зусилля.",
      trine: "Між ними тече легко, як по річці.",
      opposition: "Вони навпроти і вчать дивитися в обидва боки.",
    },
    adult: {
      conjunction: "Дві сили злиті. Важко відділити одну від одної.",
      sextile: "Нагода, яка просить маленького зусилля, інакше лишається чемною.",
      square: "Тертя, яке змушує діяти. Не присуд, а робота.",
      trine: "Потік, який підтримує. Ризик — не розвинути дар.",
      opposition: "Вісь. Зрілість у тому, щоб тримати обидва кінці.",
    },
  },
  en: {
    child: {
      conjunction: "They stand together and speak with one voice.",
      sextile: "It is easy for them to offer a hand.",
      square: "They push each other to do the work. That is effort, not a break.",
      trine: "Between them it flows like a river.",
      opposition: "They face each other and teach you to look both ways.",
    },
    adult: {
      conjunction: "Two forces are fused. It is hard to tell them apart.",
      sextile: "A chance that asks for a small effort, or it stays merely polite.",
      square: "Friction that forces action. Not a verdict, work.",
      trine: "A current that supports. The risk is leaving the gift untrained.",
      opposition: "An axis. Maturity is holding both ends.",
    },
  },
  ru: {
    child: {
      conjunction: "Они стоят вместе и говорят в один голос.",
      sextile: "Им легко подать друг другу руку.",
      square: "Они подталкивают друг друга к делу. Это усилие, не поломка.",
      trine: "Между ними течёт легко, как по реке.",
      opposition: "Они напротив и учат смотреть в обе стороны.",
    },
    adult: {
      conjunction: "Две силы слиты. Трудно отделить одну от другой.",
      sextile: "Случай, который просит маленького усилия, иначе остаётся вежливым.",
      square: "Трение, которое заставляет действовать. Не приговор, а работа.",
      trine: "Поток, который поддерживает. Риск — не развить дар.",
      opposition: "Ось. Зрелость в том, чтобы держать оба конца.",
    },
  },
};

const ui = {
  uk: {
    chart: "Карта",
    child: "Дитина",
    adult: "Дорослий",
    date: "Дата",
    time: "Час",
    city: "Місто",
    cityFind: "Знайти місто",
    build: "Поставити небо",
    clear: "Прибрати карту",
    asc: "Схід",
    house: "Дім",
    retro: "зворотний хід",
    retroChild: "планета перечитує урок",
    aspects: "Аспекти",
    none: "Вкажіть дату, час і місто. Небо стане таким, яким було тоді.",
    note: "Це мова образів, не прогноз і не присуд. Дома — цілі знаки від сходу.",
  },
  en: {
    chart: "Chart",
    child: "Child",
    adult: "Adult",
    date: "Date",
    time: "Time",
    city: "City",
    cityFind: "Find a city",
    build: "Set the sky",
    clear: "Clear chart",
    asc: "Ascendant",
    house: "House",
    retro: "retrograde",
    retroChild: "this planet is rereading the lesson",
    aspects: "Aspects",
    none: "Set a date, a time and a city. The sky becomes what it was then.",
    note: "This is a language of images, not a forecast or a verdict. Houses are whole signs from the ascendant.",
  },
  ru: {
    chart: "Карта",
    child: "Ребёнок",
    adult: "Взрослый",
    date: "Дата",
    time: "Время",
    city: "Город",
    cityFind: "Найти город",
    build: "Поставить небо",
    clear: "Убрать карту",
    asc: "Асцендент",
    house: "Дом",
    retro: "ретроградность",
    retroChild: "планета перечитывает урок",
    aspects: "Аспекты",
    none: "Укажите дату, время и город. Небо станет таким, каким было тогда.",
    note: "Это язык образов, не прогноз и не приговор. Дома — целые знаки от асцендента.",
  },
} as const;

export type ChartUiKey = keyof (typeof ui)["uk"];

export function ct(lang: Lang, key: ChartUiKey) {
  return ui[lang][key];
}

export function formatDeg(deg: number) {
  const safe = Math.min(29.999, Math.max(0, deg));
  const whole = Math.floor(safe);
  const minute = Math.floor((safe - whole) * 60);
  return `${whole}°${String(minute).padStart(2, "0")}′`;
}

export function formatWhen(chart: NatalChart, lang: Lang) {
  const { y, mo, d, h, mi } = chart.when;
  const date = new Date(Date.UTC(y, mo - 1, d));
  const day = new Intl.DateTimeFormat(lang === "uk" ? "uk-UA" : lang === "ru" ? "ru-RU" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
  const hm = `${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
  return `${day} · ${hm} · ${chart.cityName[lang]}`;
}

export function reading(lang: Lang, voice: Voice, place: Placement) {
  const retro =
    place.retro && voice === "child"
      ? ct(lang, "retroChild")
      : place.retro
        ? ct(lang, "retro")
        : "";
  return [PLANET[lang][voice][place.id], SIGN[lang][voice][place.sign], HOUSE[lang][voice][place.house - 1], retro]
    .filter(Boolean)
    .join(" ");
}

export function aspectLine(lang: Lang, voice: Voice, kind: AspectKind) {
  return ASPECT_LINE[lang][voice][kind];
}

export function ascSign(chart: NatalChart) {
  return signOf(chart.asc).sign;
}

export function signIndex(id: SignId) {
  return SIGN_IDS.indexOf(id);
}

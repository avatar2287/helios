import { useMemo, useState } from "react";
import { CITIES, computeChart, findCity, signOf, type ChartBody } from "@/lib/solar/chart";
import { ASPECT_NAME, BODY_NAME, SIGN_NAME, aspectLine, ct, formatDeg, formatWhen, reading, ascSign } from "@/lib/solar/chart-copy";
import { useSolar } from "@/lib/solar/store";

export function ChartPanel({ onClose }: { onClose: () => void }) {
  const lang = useSolar((s) => s.lang);
  const voice = useSolar((s) => s.voice);
  const chart = useSolar((s) => s.chart);
  const chartFocus = useSolar((s) => s.chartFocus);
  const setChart = useSolar((s) => s.setChart);
  const setVoice = useSolar((s) => s.setVoice);
  const setChartFocus = useSolar((s) => s.setChartFocus);
  const [date, setDate] = useState(chart ? isoDate(chart.when) : "1990-05-12");
  const [time, setTime] = useState(chart ? isoTime(chart.when) : "12:00");
  const [query, setQuery] = useState("");
  const [cityId, setCityId] = useState(chart?.cityId ?? "kyiv");
  const cities = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return CITIES;
    return CITIES.filter((city) => city.name.uk.toLowerCase().includes(needle) || city.name.en.toLowerCase().includes(needle) || city.name.ru.toLowerCase().includes(needle));
  }, [query]);
  const place = chart?.placements.find((item) => item.id === chartFocus) ?? chart?.placements[0];

  const build = () => {
    const [y, mo, d] = date.split("-").map(Number);
    const [h, mi] = time.split(":").map(Number);
    if (!y || !mo || !d || Number.isNaN(h) || Number.isNaN(mi)) return;
    const next = computeChart({ y, mo, d, h, mi: mi || 0 }, findCity(cityId));
    setChart(next);
    setChartFocus("sun");
  };

  return (
    <aside className="pointer-events-auto absolute top-20 right-3 z-30 w-[min(22rem,calc(100vw-1.5rem))] max-h-[min(34rem,72vh)] overflow-y-auto rounded-2xl border border-white/10 bg-black/55 p-3 text-fg shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:right-6">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] tracking-widest text-accent uppercase">{ct(lang, "chart")}</p>
        <button type="button" className="text-xs text-muted" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="mt-2 flex overflow-hidden rounded-full border border-white/10">
        {(["child", "adult"] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={voice === item}
            className={`h-9 flex-1 text-xs ${voice === item ? "bg-accent text-bg" : "text-muted"}`}
            onClick={() => setVoice(item)}
          >
            {ct(lang, item)}
          </button>
        ))}
      </div>
      <label className="mt-3 block text-[10px] tracking-widest text-muted uppercase">
        {ct(lang, "date")}
        <input className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-fg" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </label>
      <label className="mt-2 block text-[10px] tracking-widest text-muted uppercase">
        {ct(lang, "time")}
        <input className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-fg" type="time" value={time} onChange={(event) => setTime(event.target.value)} />
      </label>
      <label className="mt-2 block text-[10px] tracking-widest text-muted uppercase">
        {ct(lang, "city")}
        <input
          className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-fg"
          placeholder={ct(lang, "cityFind")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className="chiprow mt-2 flex max-h-24 flex-wrap gap-1 overflow-y-auto">
        {cities.map((city) => (
          <button
            key={city.id}
            type="button"
            aria-pressed={cityId === city.id}
            className={`h-8 rounded-full border px-2.5 text-xs ${cityId === city.id ? "border-accent bg-accent text-bg" : "border-white/10 text-muted"}`}
            onClick={() => setCityId(city.id)}
          >
            {city.name[lang]}
          </button>
        ))}
      </div>
      <button type="button" className="mt-3 h-10 w-full rounded-full bg-accent text-sm text-bg" onClick={build}>
        {ct(lang, "build")}
      </button>
      {chart && (
        <button type="button" className="mt-2 h-9 w-full rounded-full text-xs text-muted" onClick={() => setChart(null)}>
          {ct(lang, "clear")}
        </button>
      )}
      {chart && place && (
        <div className="mt-3 border-t border-white/10 pt-3">
          <p className="text-xs text-accent">{formatWhen(chart, lang)}</p>
          <p className="mt-1 text-xs text-muted">
            {ct(lang, "asc")} {SIGN_NAME[lang][ascSign(chart)]} {formatDeg(signOf(chart.asc).deg)}
          </p>
          <div className="mt-2 flex flex-col gap-1">
            {chart.placements.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={place.id === item.id}
                className={`flex items-baseline justify-between gap-2 rounded-lg px-2 py-1 text-left text-xs ${place.id === item.id ? "bg-white/10 text-fg" : "text-muted"}`}
                onClick={() => setChartFocus(item.id)}
              >
                <span>{BODY_NAME[lang][item.id]}</span>
                <span className="tabular-nums">
                  {SIGN_NAME[lang][item.sign]} {formatDeg(item.deg)} · {item.house}
                  {item.retro ? " R" : ""}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-fg">{reading(lang, voice, place)}</p>
          <AspectList focus={place.id} />
          <p className="mt-3 text-[10px] leading-relaxed text-muted">{ct(lang, "note")}</p>
        </div>
      )}
      {!chart && <p className="mt-3 text-xs leading-relaxed text-muted">{ct(lang, "none")}</p>}
    </aside>
  );
}

function AspectList({ focus }: { focus: ChartBody }) {
  const lang = useSolar((s) => s.lang);
  const voice = useSolar((s) => s.voice);
  const chart = useSolar((s) => s.chart);
  const rows = chart?.aspects.filter((aspect) => aspect.a === focus || aspect.b === focus) ?? [];
  if (!chart || rows.length === 0) return null;
  return (
    <ul className="mt-3 flex flex-col gap-1">
      {rows.map((aspect) => {
        const other = aspect.a === focus ? aspect.b : aspect.a;
        return (
          <li key={`${aspect.a}-${aspect.b}-${aspect.kind}`} className="text-xs text-muted">
            <span className="text-fg">{ASPECT_NAME[lang][aspect.kind]}</span> · {BODY_NAME[lang][other]} · {aspect.orb.toFixed(1)}°
            <span className="mt-0.5 block text-[11px] leading-relaxed">{aspectLine(lang, voice, aspect.kind)}</span>
          </li>
        );
      })}
    </ul>
  );
}

function isoDate(when: { y: number; mo: number; d: number }) {
  return `${when.y}-${String(when.mo).padStart(2, "0")}-${String(when.d).padStart(2, "0")}`;
}

function isoTime(when: { h: number; mi: number }) {
  return `${String(when.h).padStart(2, "0")}:${String(when.mi).padStart(2, "0")}`;
}

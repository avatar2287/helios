import { EARTH_PERIOD, PLANETS, TAU, findBody, writeOrbit, type BodyId } from "@/lib/solar/bodies";

export const DANCE_ORDER: BodyId[] = PLANETS.map((planet) => planet.id);

export const DANCE_KEYS: string[] = DANCE_ORDER.flatMap((a, i) =>
  DANCE_ORDER.slice(i + 1).map((b) => `${a}-${b}`),
);

const point = { x: 0, y: 0, z: 0 };

export function parseDance(key: string): [BodyId, BodyId] | null {
  const parts = key.split("-");
  if (parts.length !== 2) return null;
  const [a, b] = parts as [BodyId, BodyId];
  if (!DANCE_ORDER.includes(a) || !DANCE_ORDER.includes(b)) return null;
  if (DANCE_ORDER.indexOf(a) >= DANCE_ORDER.indexOf(b)) return null;
  return [a, b];
}

export function placeDance(id: BodyId, yearsElapsed: number, out: { x: number; y: number; z: number }) {
  const body = findBody(id);
  if (!body) return;
  const angle = (yearsElapsed / body.years) * TAU + body.phase;
  writeOrbit(body.orbit, angle, 0, out, body.ecc, body.peri);
}

export function placeBody(id: BodyId, t: number, out: { x: number; y: number; z: number }) {
  placeDance(id, t / EARTH_PERIOD, out);
}

export function buildFan(key: string) {
  const pair = parseDance(key);
  if (!pair) return null;
  const [ia, ib] = pair;
  const inner = findBody(ia);
  const outer = findBody(ib);
  if (!inner || !outer) return null;
  let turns = 13;
  let error = Infinity;
  for (let n = 5; n <= 48; n++) {
    const laps = (n * inner.years) / outer.years;
    const miss = Math.abs(laps - Math.round(laps));
    if (miss < error - 0.0005) {
      error = miss;
      turns = n;
    }
  }
  const duration = turns * inner.years;
  const steps = 480;
  const arr = new Float32Array(steps * 6);
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * duration;
    placeDance(ia, t, point);
    arr[i * 6] = point.x;
    arr[i * 6 + 1] = point.y;
    arr[i * 6 + 2] = point.z;
    placeDance(ib, t, point);
    arr[i * 6 + 3] = point.x;
    arr[i * 6 + 4] = point.y;
    arr[i * 6 + 5] = point.z;
  }
  return arr;
}

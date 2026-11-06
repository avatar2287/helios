import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const server = await createServer({ configFile: false, root, server: { middlewareMode: true }, resolve: { alias: { '@': `${root}src` } } });
after(() => server.close());
const { computeChart, isNatalChart, isChartWhen, findCity, zonedToDate } = await server.ssrLoadModule('/src/lib/solar/chart.ts');
const { useSolar, loadPrefs, bindPrefs, readKepler, readDances } = await server.ssrLoadModule('/src/lib/solar/store.ts');
const when = { y: 1990, mo: 5, d: 12, h: 12, mi: 0 };

test('valid chart has ten unique finite placements and survives persistence', () => {
  const chart = computeChart(when, findCity('kyiv'));
  assert.ok(isNatalChart(JSON.parse(JSON.stringify(chart))));
  assert.equal(new Set(chart.placements.map(p => p.id)).size, 10);
  assert.ok(chart.placements.every(p => Number.isFinite(p.lon) && p.lon >= 0 && p.lon < 360));
});
test('invalid calendar dates, leap days, hours and extreme years are rejected', () => {
  for (const patch of [{d: 32}, {d: 366}, {mo: 0}, {mo: 13}, {h: 24}, {mi: 60}, {y: 0}, {y: 3000}, {y: 2023, mo: 2, d: 29}]) {
    assert.equal(isChartWhen({...when, ...patch}), false);
    assert.throws(() => computeChart({...when, ...patch}, findCity('kyiv')), RangeError);
  }
  assert.ok(isChartWhen({...when, y: 2024, mo: 2, d: 29}));
});
test('timezone conversion observes winter and summer and rejects the DST gap', () => {
  assert.equal(zonedToDate(2024, 1, 15, 12, 0, 'Europe/Kyiv').toISOString(), '2024-01-15T10:00:00.000Z');
  assert.equal(zonedToDate(2024, 7, 15, 12, 0, 'Europe/Kyiv').toISOString(), '2024-07-15T09:00:00.000Z');
  assert.throws(() => zonedToDate(2024, 3, 31, 3, 30, 'Europe/Kyiv'), RangeError);
});
test('incomplete or poisoned stored charts cannot reach the renderer', () => {
  const chart = computeChart(when, findCity('kyiv'));
  for (const value of [null, {}, {placements: Array(10).fill({}), asc: 0}, {...chart, asc: NaN}, {...chart, aspects: null}, {...chart, placements: Array(10).fill(chart.placements[0])}, {...chart, cityName: null}]) {
    assert.equal(isNatalChart(value), false);
  }
});
test('unavailable storage cannot break a control update', () => {
  globalThis.localStorage = { getItem() { throw Error('unavailable'); }, setItem() { throw Error('quota'); } };
  assert.doesNotThrow(loadPrefs);
  const unbind = bindPrefs();
  try { assert.doesNotThrow(() => useSolar.getState().setSpeed(3)); } finally { unbind(); }
});
test('corrupt JSON, wrong boolean types and duplicate toggles are handled', () => {
  globalThis.localStorage = { getItem() { return '{'; } };
  assert.doesNotThrow(loadPrefs);
  globalThis.localStorage = { getItem() { return JSON.stringify({speed: 100, trails: 'false', labels: false, orbits: 0, chart: {asc: 0, placements: Array(10).fill({})}}); } };
  loadPrefs();
  const state = useSolar.getState();
  assert.equal(state.speed, 12);
  assert.equal(state.trails, true);
  assert.equal(state.labels, false);
  assert.equal(state.orbits, true);
  assert.equal(state.chart, null);
  assert.deepEqual(readKepler(['cube', 'cube', 'bad']), ['cube']);
  assert.deepEqual(readDances(['earth-mars', 'earth-mars', 'bad']), ['earth-mars']);
});

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { SIGN_GLYPH, SIGN_IDS, type AspectKind, type ChartBody, type NatalChart } from "@/lib/solar/chart";
import { useSolar } from "@/lib/solar/store";

const RING = 61;
const MARK = 56.5;

const SIGN_COLOR = ["#e07a5f", "#d4a574", "#f2e2b0", "#9ec9d4", "#e4b56a", "#c8c2a8", "#e7c4d4", "#c47a6a", "#d7a15a", "#b7a48a", "#9bb7d4", "#8fbfc2"];

const MARK_COLOR: Record<ChartBody, string> = {
  sun: "#f3d48a",
  moon: "#e7e2d8",
  mercury: "#c2b4a6",
  venus: "#ead7ae",
  mars: "#d27a48",
  jupiter: "#e0c7a4",
  saturn: "#edd9ae",
  uranus: "#b7e4e6",
  neptune: "#4d78e0",
  pluto: "#c7b6a4",
};

const ASPECT_COLOR: Record<AspectKind, string> = {
  conjunction: "#f3e2b3",
  sextile: "#9ec9e8",
  square: "#e08a78",
  trine: "#b7d3a8",
  opposition: "#d7b3e0",
};

function polar(lon: number, radius: number): [number, number, number] {
  const angle = (lon * Math.PI) / 180;
  return [Math.cos(angle) * radius, 0.08, Math.sin(angle) * radius];
}

function glyphTexture(symbol: string, color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, 128, 128);
  ctx.fillStyle = color;
  ctx.font = "72px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(symbol, 64, 70);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function arcs() {
  return SIGN_IDS.map((_, index) => {
    const steps = 28;
    const arr = new Float32Array((steps + 1) * 3);
    const start = (index * Math.PI) / 6;
    for (let step = 0; step <= steps; step++) {
      const angle = start + (step / steps) * (Math.PI / 6);
      arr[step * 3] = Math.cos(angle) * RING;
      arr[step * 3 + 1] = 0.02;
      arr[step * 3 + 2] = Math.sin(angle) * RING;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    const mat = new THREE.LineBasicMaterial({ color: SIGN_COLOR[index], transparent: true, opacity: 0.9 });
    const line = new THREE.Line(geo, mat);
    line.frustumCulled = false;
    line.raycast = () => {};
    return line;
  });
}

function aspectLines(chart: NatalChart) {
  const byId = new Map(chart.placements.map((place) => [place.id, place.lon]));
  const arr = new Float32Array(chart.aspects.length * 6);
  const colors = new Float32Array(chart.aspects.length * 6);
  chart.aspects.forEach((aspect, index) => {
    const a = polar(byId.get(aspect.a) ?? 0, MARK);
    const b = polar(byId.get(aspect.b) ?? 0, MARK);
    arr.set([...a, ...b], index * 6);
    const color = new THREE.Color(ASPECT_COLOR[aspect.kind]);
    colors.set([color.r, color.g, color.b, color.r, color.g, color.b], index * 6);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55, depthWrite: false });
  const line = new THREE.LineSegments(geo, mat);
  line.frustumCulled = false;
  line.raycast = () => {};
  return line;
}

export function ChartSky() {
  const chart = useSolar((s) => s.chart);
  const chartFocus = useSolar((s) => s.chartFocus);
  const setChartFocus = useSolar((s) => s.setChartFocus);
  const setFocus = useSolar((s) => s.setFocus);
  const ring = useMemo(() => arcs(), []);
  const glyphs = useMemo(
    () =>
      SIGN_IDS.map((id, index) => {
        const texture = glyphTexture(SIGN_GLYPH[index], SIGN_COLOR[index]);
        const mat = new THREE.SpriteMaterial({ map: texture ?? undefined, transparent: true, depthWrite: false });
        const sprite = new THREE.Sprite(mat);
        const angle = ((index + 0.5) * Math.PI) / 6;
        sprite.position.set(Math.cos(angle) * (RING + 3.2), 0.2, Math.sin(angle) * (RING + 3.2));
        sprite.scale.set(3.4, 3.4, 1);
        sprite.raycast = () => {};
        return sprite;
      }),
    [],
  );
  const aspects = useMemo(() => (chart ? aspectLines(chart) : null), [chart]);
  useEffect(
    () => () => {
      ring.forEach((line) => {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      });
      glyphs.forEach((sprite) => {
        const mat = sprite.material as THREE.SpriteMaterial;
        mat.map?.dispose();
        mat.dispose();
      });
    },
    [ring, glyphs],
  );
  useEffect(
    () => () => {
      if (!aspects) return;
      aspects.geometry.dispose();
      (aspects.material as THREE.Material).dispose();
    },
    [aspects],
  );
  if (!chart) return null;
  return (
    <group>
      {ring.map((line, index) => (
        <primitive key={SIGN_IDS[index]} object={line} />
      ))}
      {glyphs.map((sprite, index) => (
        <primitive key={SIGN_IDS[index]} object={sprite} />
      ))}
      {aspects && <primitive object={aspects} />}
      {chart.placements.map((place) => (
        <mesh
          key={place.id}
          position={polar(place.lon, MARK)}
          scale={chartFocus === place.id ? 1.55 : 1}
          onClick={(event) => {
            event.stopPropagation();
            setChartFocus(place.id);
            if (place.id !== "moon" && place.id !== "pluto") setFocus(place.id as "sun");
          }}
        >
          <sphereGeometry args={[place.id === "sun" || place.id === "moon" ? 0.85 : 0.62, 18, 18]} />
          <meshBasicMaterial color={MARK_COLOR[place.id]} />
        </mesh>
      ))}
    </group>
  );
}

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  BODIES,
  PLANETS,
  SUN,
  TAU,
  findBody,
  writeOrbit,
  type BodyDef,
  type BodyId,
  type MoonDef,
} from "@/lib/solar/bodies";
import { formatClock } from "@/lib/solar/i18n";
import { cameraCmd, clock, dayEl, labelAnchors, pointerGate } from "@/lib/solar/runtime";
import { useSolar } from "@/lib/solar/store";
import { ChartSky } from "@/components/solar/chart-scene";
import { Dust, ResonanceTank } from "@/components/solar/resonance";
import { formatWhen } from "@/lib/solar/chart-copy";
import type { ChartBody } from "@/lib/solar/chart";
import {
  atmoFrag,
  cloudFrag,
  coronaFrag,
  litUvVert,
  litVert,
  moonFrag,
  nebulaFrag,
  nebulaVert,
  planetFrag,
  ringFrag,
  ringVert,
  starFrag,
  starVert,
  sunFrag,
} from "@/components/solar/shaders";

const worldPos = new Map<string, THREE.Vector3>();
const _ndc = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _delta = new THREE.Vector3();
const _orbit = { x: 0, y: 0, z: 0 };

const BLANK = new THREE.DataTexture(new Uint8Array([180, 180, 180, 255]), 1, 1);
BLANK.needsUpdate = true;
BLANK.colorSpace = THREE.NoColorSpace;

const asset = (file: string) => `${import.meta.env.BASE_URL}textures/${file}`;

const SURFACE: Record<BodyId, string> = {
  sun: asset("sun.jpg"),
  mercury: asset("mercury.jpg"),
  venus: asset("venus.jpg"),
  earth: asset("earth.jpg"),
  mars: asset("mars.jpg"),
  jupiter: asset("jupiter.jpg"),
  saturn: asset("saturn.jpg"),
  uranus: asset("uranus.jpg"),
  neptune: asset("neptune.jpg"),
};

function useMap(
  mat: THREE.ShaderMaterial | null,
  url: string | null,
  slot = "uMap",
  flag = "uHasMap",
) {
  useEffect(() => {
    if (!mat || !url) return;
    let tex: THREE.Texture | null = null;
    let dead = false;
    const loader = new THREE.TextureLoader();
    loader.load(url, (t) => {
      if (dead) {
        t.dispose();
        return;
      }
      t.colorSpace = THREE.NoColorSpace;
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.ClampToEdgeWrapping;
      t.anisotropy = 8;
      tex = t;
      mat.uniforms[slot].value = t;
      mat.uniforms[flag].value = 1;
    });
    return () => {
      dead = true;
      tex?.dispose();
      if (mat.uniforms[slot]) {
        mat.uniforms[slot].value = BLANK;
        mat.uniforms[flag].value = 0;
      }
    };
  }, [mat, url, slot, flag]);
}

const labelSlots = BODIES.map((body) => ({ id: body.id, x: 0, y: 0, on: false }));

function posOf(id: string) {
  let v = worldPos.get(id);
  if (!v) {
    v = new THREE.Vector3();
    worldPos.set(id, v);
  }
  return v;
}

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

function overviewDist(aspect: number) {
  if (aspect < 0.85) return 118;
  if (aspect < 1.15) return 102;
  return 88;
}

function minDist(focus: BodyId | null) {
  const body = findBody(focus);
  if (!body) return 24;
  return Math.max(1.4, body.radius * 2.15);
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeGlow() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);
  const grd = ctx.createRadialGradient(128, 128, 18, 128, 128, 128);
  grd.addColorStop(0, "rgba(255,236,190,0)");
  grd.addColorStop(0.08, "rgba(255,210,120,0.28)");
  grd.addColorStop(0.34, "rgba(255,140,40,0.16)");
  grd.addColorStop(1, "rgba(255,120,20,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function placeLabels(camera: THREE.Camera, width: number, height: number) {
  const { labels, focus } = useSolar.getState();
  camera.getWorldDirection(_dir);
  const active: number[] = [];
  for (let i = 0; i < BODIES.length; i++) {
    const body = BODIES[i];
    const slot = labelSlots[i];
    const el = labelAnchors.get(body.id);
    if (!el || !body) continue;
    const wp = worldPos.get(body.id);
    if (!wp) {
      el.style.opacity = "0";
      el.style.pointerEvents = "none";
      continue;
    }
    _delta.copy(wp).sub(camera.position);
    const inFront = _delta.dot(_dir) > 0.2;
    const show = inFront && (labels || focus === body.id);
    if (!show) {
      el.style.opacity = "0";
      el.style.pointerEvents = "none";
      slot.on = false;
      continue;
    }
    _ndc.copy(wp).project(camera);
    slot.x = (_ndc.x * 0.5 + 0.5) * width;
    slot.y = (-_ndc.y * 0.5 + 0.5) * height - 16;
    slot.on = true;
    active.push(i);
  }
  const min = 52;
  for (let iter = 0; iter < 5; iter++) {
    for (let a = 0; a < active.length; a++) {
      for (let b = a + 1; b < active.length; b++) {
        const pa = labelSlots[active[a]];
        const pb = labelSlots[active[b]];
        let dx = pb.x - pa.x;
        let dy = pb.y - pa.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < min * min && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const push = (min - d) * 0.5;
          dx /= d;
          dy /= d;
          pa.x -= dx * push;
          pa.y -= dy * push;
          pb.x += dx * push;
          pb.y += dy * push;
        }
      }
    }
  }
  for (const index of active) {
    const slot = labelSlots[index];
    const el = labelAnchors.get(slot.id);
    if (!el) continue;
    const x = clamp(slot.x, 32, Math.max(32, width - 32));
    const y = clamp(slot.y, 28, Math.max(28, height - 28));
    el.style.opacity = "1";
    el.style.pointerEvents = "auto";
    el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -130%)`;
  }
}

function Clock() {
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.1);
    const { paused, speed, lang, chart } = useSolar.getState();
    if (!paused && speed > 0 && !chart) clock.t += dt * speed;
    if (dayEl.current) dayEl.current.textContent = chart ? formatWhen(chart, lang) : formatClock(clock.t, lang);
  }, -20);
  return null;
}

function Sky() {
  const points = useMemo(() => {
    const count = 1400;
    const rand = mulberry32(11);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const theta = TAU * rand();
      const phi = Math.acos(2 * rand() - 1);
      const r = 175;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      const big = rand() > 0.975;
      sizes[i] = big ? 4.2 + rand() * 2.2 : 1.05 + rand() * 1.7;
      phases[i] = rand() * TAU;
      const tint = rand();
      if (tint > 0.93) color.set("#f3e2c2");
      else if (tint > 0.84) color.set("#c9d5ea");
      else color.set("#f5f2eb");
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);
  const starMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: starVert,
        fragmentShader: starFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );
  const nebulaMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uHasSky: { value: 0 }, uSky: { value: BLANK } },
        vertexShader: nebulaVert,
        fragmentShader: nebulaFrag,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  );
  useEffect(
    () => () => {
      points.dispose();
      starMat.dispose();
      nebulaMat.dispose();
    },
    [points, starMat, nebulaMat],
  );
  const skyT = useRef(0);
  useMap(nebulaMat, asset("cosmos.jpg"), "uSky", "uHasSky");
  useFrame((_, raw) => {
    skyT.current += Math.min(raw, 0.1);
    starMat.uniforms.uTime.value = skyT.current;
    nebulaMat.uniforms.uTime.value = skyT.current;
  });
  return (
    <>
      <mesh scale={200} material={nebulaMat} raycast={() => {}} frustumCulled={false}>
        <sphereGeometry args={[1, 32, 24]} />
      </mesh>
      <points geometry={points} material={starMat} raycast={() => {}} frustumCulled={false} />
    </>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.28} color="#d9d2c6" />
      <pointLight position={[0, 0, 0]} intensity={5200} color="#fff1cc" decay={2} distance={0} />
    </>
  );
}

function Belt({
  count,
  seed,
  inner,
  outer,
  rate,
  spread,
  geo,
  tintA,
  tintB,
}: {
  count: number;
  seed: number;
  inner: number;
  outer: number;
  rate: number;
  spread: number;
  geo: THREE.BufferGeometry;
  tintA: string;
  tintB: string;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.96, metalness: 0.04 }),
    [],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const rand = mulberry32(seed);
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const ang = rand() * TAU;
      const r = inner + rand() * (outer - inner);
      dummy.position.set(Math.cos(ang) * r, (rand() - 0.5) * spread, Math.sin(ang) * r);
      dummy.rotation.set(rand() * 6, rand() * 6, rand() * 6);
      dummy.scale.setScalar(0.02 + rand() ** 2 * 0.12);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      color.set(rand() > 0.45 ? tintA : tintB);
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, inner, outer, seed, spread, tintA, tintB]);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y = clock.t * rate;
  });
  return (
    <instancedMesh ref={ref} args={[geo, mat, count]} frustumCulled={false} raycast={() => {}} />
  );
}

function Belts() {
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <>
      <Belt count={520} seed={21} inner={21.7} outer={24.8} rate={0.018} spread={0.85} geo={geo} tintA="#8a8174" tintB="#5c564c" />
      <Belt count={160} seed={44} inner={54} outer={58} rate={0.006} spread={1.4} geo={geo} tintA="#6e6a74" tintB="#3e4450" />
    </>
  );
}

function MoonMesh({ moon, geo }: { moon: MoonDef; geo: THREE.SphereGeometry }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(moon.color) } },
        vertexShader: litVert,
        fragmentShader: moonFrag,
      }),
    [moon],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const ang = (clock.t / moon.period) * TAU + moon.phase;
    const x = Math.cos(ang) * moon.orbit;
    const z = Math.sin(ang) * moon.orbit;
    mesh.position.set(x, z * Math.sin(moon.tilt), z * Math.cos(moon.tilt));
  });
  return <mesh ref={ref} geometry={geo} material={mat} scale={moon.radius} />;
}

function PathLine({
  geometry,
  color = "#ffffff",
  opacity = 1,
  vertexColors = false,
  visible = true,
  scale = 1,
}: {
  geometry: THREE.BufferGeometry;
  color?: string;
  opacity?: number;
  vertexColors?: boolean;
  visible?: boolean;
  scale?: number | [number, number, number];
}) {
  const line = useMemo(() => {
    const material = new THREE.LineBasicMaterial({
      color,
      vertexColors,
      transparent: opacity < 1,
      opacity,
    });
    const obj = new THREE.Line(geometry, material);
    obj.frustumCulled = false;
    obj.raycast = () => {};
    return obj;
  }, [geometry, color, opacity, vertexColors]);
  useEffect(() => {
    line.visible = visible;
  }, [line, visible]);
  useEffect(() => () => (line.material as THREE.Material).dispose(), [line]);
  return <primitive object={line} visible={visible} scale={scale} />;
}

function OrbitLine({ body }: { body: BodyDef }) {
  const show = useSolar((s) => s.orbits);
  const dances = useSolar((s) => s.dances);
  const chartOn = useSolar((s) => s.chart !== null);
  const involved = dances.length === 0 || dances.some((id) => id.split("-").includes(body.id));
  const geo = useMemo(() => {
    const steps = 192;
    const arr = new Float32Array((steps + 1) * 3);
    for (let i = 0; i <= steps; i++) {
      writeOrbit(body.orbit, (i / steps) * TAU, body.inclination, _orbit, body.ecc, body.peri, "true");
      arr[i * 3] = _orbit.x;
      arr[i * 3 + 1] = _orbit.y;
      arr[i * 3 + 2] = _orbit.z;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, [body]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <PathLine
      geometry={geo}
      color={involved ? "#f3ead8" : "#8d8478"}
      opacity={chartOn ? 0.16 : involved ? 0.85 : 0.12}
      visible={show}
    />
  );
}

function Perihelion({ body }: { body: BodyDef }) {
  const show = useSolar((s) => s.orbits);
  const pos = useMemo(() => {
    writeOrbit(body.orbit, 0, body.inclination, _orbit, body.ecc, body.peri, "true");
    return [_orbit.x, _orbit.y, _orbit.z] as const;
  }, [body]);
  if (!show) return null;
  return (
    <mesh position={pos} raycast={() => {}}>
      <sphereGeometry args={[Math.max(0.07, body.radius * 0.18), 12, 12]} />
      <meshBasicMaterial color={body.swatch} />
    </mesh>
  );
}

function Trail({ body }: { body: BodyDef }) {
  const show = useSolar((s) => s.trails);
  const geo = useMemo(() => {
    const steps = 96;
    const pos = new Float32Array(steps * 3);
    const col = new Float32Array(steps * 3);
    const c0 = new THREE.Color(body.swatch);
    const c1 = new THREE.Color("#07080c");
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const c = c0.clone().lerp(c1, Math.pow(t, 0.5));
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.userData.steps = steps;
    return g;
  }, [body]);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame(() => {
    const attr = geo.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const steps = geo.userData.steps as number;
    const angle = (clock.t / body.period) * TAU + body.phase;
    const arc = 0.18 * TAU;
    for (let i = 0; i < steps; i++) {
      writeOrbit(body.orbit, angle - (i / (steps - 1)) * arc, body.inclination, _orbit, body.ecc, body.peri);
      arr[i * 3] = _orbit.x;
      arr[i * 3 + 1] = _orbit.y + 0.04;
      arr[i * 3 + 2] = _orbit.z;
    }
    attr.needsUpdate = true;
  });
  const chart = useSolar((s) => s.chart);
  return <PathLine geometry={geo} vertexColors opacity={0.95} visible={show && !chart} />;
}

function Planet({
  body,
  sphere,
  moonGeo,
}: {
  body: BodyDef;
  sphere: THREE.SphereGeometry;
  moonGeo: THREE.SphereGeometry;
}) {
  const root = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const clouds = useRef<THREE.Group>(null);
  const surface = useRef<THREE.Mesh>(null);
  const hover = useRef(0);
  const shown = useRef(body.radius);
  const selected = useSolar((s) => s.focus === body.id);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uKind: { value: body.shader },
          uTime: { value: 0 },
          uSeed: { value: body.seed },
          uSpec: { value: body.spec },
          uRim: { value: body.rim },
          uCities: { value: body.cities },
          uBands: { value: body.bands },
          uSpot: { value: body.spot },
          uA: { value: new THREE.Color(body.a) },
          uB: { value: new THREE.Color(body.b) },
          uC: { value: new THREE.Color(body.c) },
          uRimColor: { value: new THREE.Color(body.rimColor) },
          uHasMap: { value: 0 },
          uMap: { value: BLANK },
        },
        vertexShader: litUvVert,
        fragmentShader: planetFrag,
      }),
    [body],
  );
  const cloudMat = useMemo(() => {
    if (!body.clouds) return null;
    return new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uHasCloud: { value: 0 }, uCloud: { value: BLANK } },
      vertexShader: litUvVert,
      fragmentShader: cloudFrag,
      transparent: true,
      depthWrite: false,
    });
  }, [body]);
  const atmoMat = useMemo(() => {
    if (body.atmoStrength <= 0) return null;
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(body.atmo) },
        uStrength: { value: body.atmoStrength },
      },
      vertexShader: litVert,
      fragmentShader: atmoFrag,
      transparent: true,
      depthWrite: false,
    });
  }, [body]);
  const ringMat = useMemo(() => {
    if (!body.rings) return null;
    return new THREE.ShaderMaterial({
      uniforms: {
        uInner: { value: body.rings.inner },
        uOuter: { value: body.rings.outer },
        uColor: { value: new THREE.Color(body.rings.color) },
        uAlpha: { value: body.rings.alpha },
        uGap: { value: body.rings.gap },
        uTime: { value: 0 },
      },
      vertexShader: ringVert,
      fragmentShader: ringFrag,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }, [body]);
  const ringGeo = useMemo(() => {
    if (!body.rings) return null;
    return new THREE.RingGeometry(body.rings.inner, body.rings.outer, 160);
  }, [body]);
  const selectGeo = useMemo(
    () => new THREE.RingGeometry(body.radius * 1.75, body.radius * 1.98, 72),
    [body.radius],
  );
  const axisGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([0, -1, 0, 0, 1, 0], 3));
    return g;
  }, []);
  useEffect(
    () => () => {
      mat.dispose();
      cloudMat?.dispose();
      atmoMat?.dispose();
      ringMat?.dispose();
      ringGeo?.dispose();
      selectGeo.dispose();
      axisGeo.dispose();
    },
    [mat, cloudMat, atmoMat, ringMat, ringGeo, selectGeo, axisGeo],
  );
  useMap(mat, SURFACE[body.id]);
  useMap(cloudMat, body.clouds ? asset("earth-clouds.jpg") : null, "uCloud", "uHasCloud");

  const chart = useSolar((s) => s.chart);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.1);
    const natal = chart?.placements.find((place) => place.id === body.id);
    if (natal) {
      const angle = (natal.lon * Math.PI) / 180;
      _orbit.x = Math.cos(angle) * body.orbit;
      _orbit.y = 0;
      _orbit.z = Math.sin(angle) * body.orbit;
    } else if (chart && body.id === "earth") {
      const sun = chart.placements.find((place) => place.id === "sun");
      const angle = ((((sun?.lon ?? 0) + 180) * Math.PI) / 180);
      _orbit.x = Math.cos(angle) * body.orbit;
      _orbit.y = 0;
      _orbit.z = Math.sin(angle) * body.orbit;
    } else {
      const angle = (clock.t / body.period) * TAU + body.phase;
      writeOrbit(body.orbit, angle, body.inclination, _orbit, body.ecc, body.peri);
    }
    const wp = posOf(body.id);
    wp.set(_orbit.x, _orbit.y, _orbit.z);
    if (root.current) root.current.position.copy(wp);
    if (spin.current) spin.current.rotation.y = clock.t * body.spin * (body.retrograde ? -1 : 1);
    if (clouds.current) clouds.current.rotation.y = clock.t * 0.18;
    mat.uniforms.uTime.value = clock.t;
    if (cloudMat) cloudMat.uniforms.uTime.value = clock.t;
    if (ringMat) ringMat.uniforms.uTime.value = clock.t;
    const target = hover.current ? body.radius * 1.05 : body.radius;
    shown.current += (target - shown.current) * (1 - Math.exp(-8 * dt));
    if (surface.current) surface.current.scale.setScalar(shown.current);
  });

  const select = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (pointerGate.dragged) return;
    useSolar.getState().setFocus(body.id);
    if (useSolar.getState().chart) {
      if (body.id === "earth") useSolar.getState().setChartFocus("sun");
      else useSolar.getState().setChartFocus(body.id as ChartBody);
    }
  };

  return (
    <>
      <OrbitLine body={body} />
      <Perihelion body={body} />
      <Trail body={body} />
      <group ref={root} onClick={select}>
        <group rotation={[0, 0, body.tilt]}>
          <group ref={spin}>
            <mesh
              ref={surface}
              geometry={sphere}
              material={mat}
              onPointerOver={(e) => {
                e.stopPropagation();
                hover.current = 1;
              }}
              onPointerOut={() => {
                hover.current = 0;
              }}
            />
            {cloudMat && (
              <group ref={clouds}>
                <mesh geometry={sphere} material={cloudMat} scale={body.radius * 1.03} raycast={() => {}} />
              </group>
            )}
          </group>
          {ringGeo && ringMat && (
            <mesh geometry={ringGeo} material={ringMat} rotation={[Math.PI / 2, 0, 0]} />
          )}
          {atmoMat && (
            <mesh geometry={sphere} material={atmoMat} scale={body.radius * 1.2} raycast={() => {}} />
          )}
          {body.moons.map((moon) => (
            <MoonMesh key={moon.name} moon={moon} geo={moonGeo} />
          ))}
          <PathLine
            geometry={axisGeo}
            color="#e4b56a"
            opacity={0.5}
            visible={selected}
            scale={[1, body.radius * 1.55, 1]}
          />
        </group>
        <mesh
          visible={selected}
          rotation={[Math.PI / 2, 0, 0]}
          geometry={selectGeo}
          raycast={() => {}}
        >
          <meshBasicMaterial color="#e4b56a" transparent opacity={0.7} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
    </>
  );
}

function Sun({ sphere }: { sphere: THREE.SphereGeometry }) {
  const spin = useRef<THREE.Group>(null);
  const selected = useSolar((s) => s.focus === "sun");
  const glow = useMemo(() => makeGlow(), []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uA: { value: new THREE.Color(SUN.a) },
          uB: { value: new THREE.Color(SUN.b) },
          uC: { value: new THREE.Color(SUN.c) },
          uHasMap: { value: 0 },
          uMap: { value: BLANK },
        },
        vertexShader: litUvVert,
        fragmentShader: sunFrag,
      }),
    [],
  );
  const coronaMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: litVert,
        fragmentShader: coronaFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );
  const selectGeo = useMemo(() => new THREE.RingGeometry(SUN.radius * 1.55, SUN.radius * 1.72, 72), []);
  useEffect(
    () => () => {
      mat.dispose();
      coronaMat.dispose();
      glow.dispose();
      selectGeo.dispose();
    },
    [mat, coronaMat, glow, selectGeo],
  );
  useMap(mat, SURFACE.sun);
  useLayoutEffect(() => {
    posOf("sun").set(0, 0, 0);
  }, []);
  useFrame(() => {
    mat.uniforms.uTime.value = clock.t;
    if (spin.current) spin.current.rotation.y = clock.t * SUN.spin;
  });
  const select = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (pointerGate.dragged) return;
    useSolar.getState().setFocus("sun");
  };
  return (
    <group onClick={select}>
      <sprite scale={[16, 16, 1]} raycast={() => {}} renderOrder={1}>
        <spriteMaterial
          map={glow}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      <mesh geometry={sphere} material={coronaMat} scale={SUN.radius * 1.85} raycast={() => {}} renderOrder={2} />
      <group ref={spin}>
        <mesh geometry={sphere} material={mat} scale={SUN.radius} renderOrder={3} />
      </group>
      <mesh visible={selected} rotation={[Math.PI / 2, 0, 0]} geometry={selectGeo} raycast={() => {}}>
        <meshBasicMaterial color="#e4b56a" transparent opacity={0.75} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function CameraRig() {
  const { camera, gl, size } = useThree();
  const rig = useRef({
    az: 0.62,
    pol: 0.92,
    dist: 132,
    distGoal: 90,
    look: new THREE.Vector3(),
    desired: new THREE.Vector3(),
    easing: false,
    azGoal: 0.62,
    polGoal: 0.92,
    lastFocus: null as BodyId | null,
    lastDances: "",
    lastChart: false,
    velAz: 0,
    velPol: 0,
    dragging: 0,
  });

  useEffect(() => {
    const el = gl.domElement;
    const r = rig.current;
    const pointers = new Map<number, { x: number; y: number }>();
    let pinch: number | null = null;

    const onDown = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      pointerGate.dragged = false;
      pointerGate.x = e.clientX;
      pointerGate.y = e.clientY;
      r.dragging = pointers.size;
      r.easing = false;
      el.style.cursor = "grabbing";
      if (pointers.size >= 2) {
        const pts = [...pointers.values()];
        pinch = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      }
    };
    const onMove = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      const dx0 = e.clientX - pointerGate.x;
      const dy0 = e.clientY - pointerGate.y;
      if (dx0 * dx0 + dy0 * dy0 > 64) pointerGate.dragged = true;
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size <= 1) {
        r.az -= dx * 0.005;
        r.pol = clamp(r.pol + dy * 0.004, 0.04, Math.PI - 0.14);
        r.velAz = -dx * 0.005;
        r.velPol = dy * 0.004;
        pinch = null;
      } else if (pinch) {
        const pts = [...pointers.values()];
        const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (d > 0 && pinch > 0) {
          r.distGoal = clamp(r.distGoal * (pinch / d), minDist(useSolar.getState().focus), 150);
          pinch = d;
        }
      }
    };
    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      r.dragging = pointers.size;
      if (!pointerGate.dragged) {
        r.velAz = 0;
        r.velPol = 0;
      }
      if (pointers.size < 2) pinch = null;
      if (pointers.size === 0) el.style.cursor = "grab";
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      r.distGoal = clamp(r.distGoal * Math.exp(e.deltaY * 0.00115), minDist(useSolar.getState().focus), 150);
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
    };
  }, [gl]);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.1);
    const r = rig.current;
    if (cameraCmd.reset) {
      cameraCmd.reset = false;
      const state = useSolar.getState();
      state.setFocus(null);
      if (state.chart) state.setChart(null);
      r.easing = true;
      r.azGoal = 0.62;
      r.polGoal = 0.92;
      r.velAz = 0;
      r.velPol = 0;
      r.distGoal = overviewDist(size.width / Math.max(1, size.height));
      r.lastFocus = null;
      r.lastChart = false;
      r.lastDances = state.dances.join("|");
    }
    const chartOn = useSolar.getState().chart !== null;
    if (chartOn !== r.lastChart) {
      r.lastChart = chartOn;
      if (chartOn) {
        if (useSolar.getState().focus) useSolar.getState().setFocus(null);
        r.lastFocus = null;
        const persp = camera as THREE.PerspectiveCamera;
        const half = Math.tan((persp.fov * Math.PI) / 360);
        const aspect = size.width / Math.max(1, size.height);
        const distFit = 68 / (half * Math.min(1, aspect));
        r.distGoal = clamp(distFit, 20, 140);
        r.dist = r.distGoal;
        r.pol = 0.08;
        r.polGoal = 0.08;
        r.velAz = 0;
        r.velPol = 0;
        r.look.set(0, 0, 0);
        r.desired.set(0, 0, 0);
      }
    }
    const dances = useSolar.getState().dances;
    const danceKey = dances.join("|");
    if (!chartOn && danceKey !== r.lastDances) {
      r.lastDances = danceKey;
      if (dances.length) {
        if (useSolar.getState().focus) useSolar.getState().setFocus(null);
        r.lastFocus = null;
        const latest = dances[dances.length - 1];
        const mate = findBody(latest.split("-")[1] as BodyId);
        const outer = mate ? mate.orbit * (1 + mate.ecc) : 12;
        const persp = camera as THREE.PerspectiveCamera;
        const half = Math.tan((persp.fov * Math.PI) / 360);
        const aspect = size.width / Math.max(1, size.height);
        const distFit = (outer * 1.18) / (half * Math.min(1, aspect));
        r.distGoal = clamp(distFit, 8, 140);
        r.dist = distFit;
        r.polGoal = 0.08;
        r.pol = 0.08;
        r.easing = false;
        r.velAz = 0;
        r.velPol = 0;
      }
    }
    const focus = useSolar.getState().focus;
    if (focus !== r.lastFocus) {
      r.lastFocus = focus;
      const body = findBody(focus);
      if (body) r.distGoal = body.approach;
      else if (!dances.length) r.distGoal = overviewDist(size.width / Math.max(1, size.height));
    }
    const floor = dances.length ? 6 : minDist(focus);
    r.distGoal = clamp(r.distGoal, floor, 150);
    if (r.dragging === 0) {
      r.az += r.velAz;
      r.pol = clamp(r.pol + r.velPol, 0.04, Math.PI - 0.14);
      const damp = Math.exp(-7 * dt);
      r.velAz *= damp;
      r.velPol *= damp;
    }
    if (r.easing) {
      const k = 1 - Math.exp(-2.6 * dt);
      r.az += (r.azGoal - r.az) * k;
      r.pol += (r.polGoal - r.pol) * k;
      if (Math.abs(r.azGoal - r.az) < 0.002 && Math.abs(r.polGoal - r.pol) < 0.002) r.easing = false;
    }
    const body = findBody(focus);
    if (body) {
      const p = worldPos.get(body.id);
      if (p) r.desired.copy(p);
      else r.desired.set(0, 0, 0);
    } else r.desired.set(0, 0, 0);
    const follow = 1 - Math.exp(-5.2 * dt);
    r.look.lerp(r.desired, follow);
    r.dist += (r.distGoal - r.dist) * (1 - Math.exp(-3.1 * dt));
    const sp = Math.sin(r.pol);
    camera.position.set(
      r.look.x + sp * Math.sin(r.az) * r.dist,
      r.look.y + Math.cos(r.pol) * r.dist,
      r.look.z + sp * Math.cos(r.az) * r.dist,
    );
    camera.lookAt(r.look);
    (camera as THREE.PerspectiveCamera).clearViewOffset();
    placeLabels(camera, size.width, size.height);
  });

  return null;
}

function cubeOfRadius(radius: number) {
  const side = (2 * radius) / Math.sqrt(3);
  return new THREE.BoxGeometry(side, side, side);
}

function KeplerModel() {
  const active = useSolar((s) => s.kepler);
  const root = useRef<THREE.Group>(null);
  const pack = useMemo(() => {
    const orbit = (id: BodyId) => PLANETS.find((body) => body.id === id)!.orbit;
    const solids = [
      { id: "cube" as const, geo: cubeOfRadius(orbit("saturn")) },
      { id: "tetra" as const, geo: new THREE.TetrahedronGeometry(orbit("jupiter"), 0) },
      { id: "dodeca" as const, geo: new THREE.DodecahedronGeometry(orbit("mars"), 0) },
      { id: "icosa" as const, geo: new THREE.IcosahedronGeometry(orbit("earth"), 0) },
      { id: "octa" as const, geo: new THREE.OctahedronGeometry(orbit("venus"), 0) },
    ];
    const edges = solids.map((solid) => new THREE.EdgesGeometry(solid.geo));
    const face = new THREE.MeshBasicMaterial({
      color: "#e4b56a",
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const line = new THREE.LineBasicMaterial({
      color: "#f6e3bc",
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
    });
    const lines = edges.map((geo) => {
      const obj = new THREE.LineSegments(geo, line);
      obj.frustumCulled = false;
      obj.raycast = () => {};
      return obj;
    });
    return { solids, edges, face, line, lines };
  }, []);
  useEffect(
    () => () => {
      pack.solids.forEach((solid) => solid.geo.dispose());
      pack.edges.forEach((geo) => geo.dispose());
      pack.face.dispose();
      pack.line.dispose();
    },
    [pack],
  );
  useFrame(() => {
    if (root.current) root.current.rotation.y = clock.t * 0.025;
  });
  return (
    <group ref={root}>
      {pack.solids.map((solid, index) => (
        <group key={solid.id} visible={active.includes(solid.id)}>
          <mesh geometry={solid.geo} material={pack.face} raycast={() => {}} frustumCulled={false} />
          <primitive object={pack.lines[index]} />
        </group>
      ))}
    </group>
  );
}

export function Scene() {
  const sphere = useMemo(() => new THREE.SphereGeometry(1, 96, 72), []);
  const moonGeo = useMemo(() => new THREE.SphereGeometry(1, 20, 16), []);
  useEffect(
    () => () => {
      sphere.dispose();
      moonGeo.dispose();
    },
    [sphere, moonGeo],
  );
  return (
    <>
      <Clock />
      <Sky />
      <Lights />
      <Sun sphere={sphere} />
      {PLANETS.map((body) => (
        <Planet key={body.id} body={body} sphere={sphere} moonGeo={moonGeo} />
      ))}
      <Belts />
      <Dust />
      <ChartSky />
      <KeplerModel />
      <ResonanceTank />
      <CameraRig />
    </>
  );
}

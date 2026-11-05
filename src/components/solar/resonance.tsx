import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildFan, parseDance, placeDance } from "@/lib/solar/dances";
import { EARTH_PERIOD } from "@/lib/solar/bodies";
import { clock } from "@/lib/solar/runtime";
import { useSolar } from "@/lib/solar/store";

const liveA = { x: 0, y: 0, z: 0 };
const liveB = { x: 0, y: 0, z: 0 };

function ChordFan({ id }: { id: string }) {
  const geo = useMemo(() => {
    const arr = buildFan(id);
    if (!arr) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, [id]);
  const mat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: "#fffaf2",
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      }),
    [],
  );
  const line = useMemo(() => {
    if (!geo) return null;
    const obj = new THREE.LineSegments(geo, mat);
    obj.frustumCulled = false;
    obj.raycast = () => {};
    return obj;
  }, [geo, mat]);
  useEffect(
    () => () => {
      geo?.dispose();
      mat.dispose();
    },
    [geo, mat],
  );
  if (!line) return null;
  return <primitive object={line} />;
}

function LiveChord({ id }: { id: string }) {
  const pair = parseDance(id);
  const line = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
    const mat = new THREE.LineBasicMaterial({
      color: "#fff6df",
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    const obj = new THREE.Line(geo, mat);
    obj.frustumCulled = false;
    obj.raycast = () => {};
    return obj;
  }, []);
  useEffect(
    () => () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    },
    [line],
  );
  useFrame(() => {
    if (!pair) return;
    const years = clock.t / EARTH_PERIOD;
    placeDance(pair[0], years, liveA);
    placeDance(pair[1], years, liveB);
    const attr = line.geometry.getAttribute("position") as THREE.BufferAttribute;
    attr.setXYZ(0, liveA.x, liveA.y, liveA.z);
    attr.setXYZ(1, liveB.x, liveB.y, liveB.z);
    attr.needsUpdate = true;
  });
  if (!pair) return null;
  return <primitive object={line} />;
}

export function ResonanceTank() {
  const dances = useSolar((s) => s.dances);
  return (
    <group>
      {dances.map((id) => (
        <group key={id}>
          <ChordFan id={id} />
          <LiveChord id={id} />
        </group>
      ))}
    </group>
  );
}

export function Dust() {
  const geo = useMemo(() => {
    const count = 420;
    const pos = new Float32Array(count * 3);
    let seed = 99;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = 0; i < count; i++) {
      const ang = rand() * Math.PI * 2;
      const r = 6 + rand() * 48;
      pos[i * 3] = Math.cos(ang) * r;
      pos[i * 3 + 1] = (rand() - 0.5) * 1.4;
      pos[i * 3 + 2] = Math.sin(ang) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <points geometry={geo} raycast={() => {}}>
      <pointsMaterial color="#d9d2c4" size={0.045} transparent opacity={0.35} depthWrite={false} sizeAttenuation />
    </points>
  );
}
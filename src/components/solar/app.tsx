import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { BODIES, type BodyId } from "@/lib/solar/bodies";
import { cameraCmd } from "@/lib/solar/runtime";
import { bindPrefs, loadPrefs, useSolar } from "@/lib/solar/store";
import { Hud } from "@/components/solar/hud";
import { Scene } from "@/components/solar/scene";

const ORDER: BodyId[] = BODIES.map((body) => body.id);

export function SolarApp() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadPrefs();
    return bindPrefs();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      const state = useSolar.getState();
      if (event.code === "Space") {
        event.preventDefault();
        state.togglePause();
        return;
      }
      if (event.code === "Escape") {
        state.setFocus(null);
        return;
      }
      if (event.code === "KeyR") {
        cameraCmd.reset = true;
        return;
      }
      if (event.code === "KeyL") state.toggleLabels();
      if (event.code === "KeyT") state.toggleTrails();
      if (event.code === "KeyO") state.toggleOrbits();
      if (event.code === "BracketLeft" || event.code === "Minus") state.setSpeed(state.speed - 0.5);
      if (event.code === "BracketRight" || event.code === "Equal") state.setSpeed(state.speed + 0.5);
      const digit = /^Digit([1-9])$/.exec(event.code);
      if (digit) {
        const id = ORDER[Number(digit[1]) - 1];
        if (id) state.setFocus(id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {mounted && (
        <div className="absolute inset-0 z-0">
          <Canvas
            className="block h-full w-full cursor-grab touch-none"
            dpr={[1, 1.6]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
            stencil: false,
          }}
          camera={{ fov: 40, near: 0.08, far: 420, position: [58, 78, 86] }}
          onCreated={({ gl }) => {
            gl.setClearColor("#07080c", 1);
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
          }}
        >
          <Scene />
        </Canvas>
        </div>
      )}
      <Hud />
    </>
  );
}

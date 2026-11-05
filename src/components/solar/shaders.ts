export const litUvVert = /* glsl */ `
varying vec3 vObj;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vUv;
void main() {
  vUv = uv;
  vObj = position;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const litVert = /* glsl */ `
varying vec3 vObj;
varying vec3 vWorld;
varying vec3 vNormal;
void main() {
  vObj = position;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const noiseFns = /* glsl */ `
float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}
float vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash13(i), hash13(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash13(i + vec3(0.0, 1.0, 0.0)), hash13(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash13(i + vec3(0.0, 0.0, 1.0)), hash13(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash13(i + vec3(0.0, 1.0, 1.0)), hash13(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z
  );
}
float fbm(vec3 p) {
  float a = 0.0;
  float w = 0.5;
  for (int i = 0; i < 4; i++) {
    a += w * vnoise(p);
    p = p * 2.03 + 1.7;
    w *= 0.5;
  }
  return a;
}
vec4 finish(vec3 color, float alpha) {
  #ifdef TONE_MAPPING
    color = toneMapping(color);
  #endif
  return linearToOutputTexel(vec4(color, alpha));
}
`;

export const planetFrag = /* glsl */ `
varying vec3 vObj;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vUv;
uniform float uKind;
uniform float uTime;
uniform float uSeed;
uniform float uSpec;
uniform float uRim;
uniform float uCities;
uniform float uBands;
uniform float uSpot;
uniform float uHasMap;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;
uniform vec3 uRimColor;
uniform sampler2D uMap;
${noiseFns}
void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 L = normalize(-vWorld);
  float ndl = dot(N, L);
  vec3 seed = vec3(uSeed, uSeed * 0.37, 1.7);
  vec3 mapCol = pow(max(texture2D(uMap, vUv).rgb, vec3(0.0)), vec3(2.2));
  vec3 albedo;
  if (uHasMap > 0.5) {
    albedo = mapCol;
  } else if (uKind < 1.5) {
    float n = fbm(vObj * 6.5 + seed);
    float pit = smoothstep(0.62, 0.86, fbm(vObj * 13.0 + seed));
    albedo = mix(uA, uB, n);
    albedo *= 1.0 - pit * 0.45;
  } else if (uKind < 2.5) {
    float n = fbm(vObj * 2.4 + seed + vec3(uTime * 0.012, 0.0, 0.0));
    float n2 = fbm(vObj * 5.5 + seed.yzx);
    albedo = mix(uA, uB, n);
    albedo = mix(albedo, uC, smoothstep(0.45, 0.8, n2) * 0.45);
  } else if (uKind < 3.5) {
    float n = fbm(vObj * 2.15 + seed);
    float land = smoothstep(0.46, 0.56, n);
    vec3 ground = mix(uB, uC, fbm(vObj * 5.2 + seed.y));
    albedo = mix(uA, ground, land);
    float cap = smoothstep(0.76, 0.94, abs(vObj.y));
    albedo = mix(albedo, vec3(0.93, 0.95, 0.97), cap);
  } else if (uKind < 4.5) {
    float n = fbm(vObj * 3.1 + seed);
    albedo = mix(uA, uB, n);
    float dark = smoothstep(0.55, 0.82, fbm(vObj * 7.0 + seed));
    albedo *= 1.0 - dark * 0.28;
    float cap = smoothstep(0.78, 0.95, abs(vObj.y));
    albedo = mix(albedo, uC, cap);
  } else if (uKind < 5.5) {
    float y = vObj.y;
    float wobble = fbm(vec3(vObj.x, y * 2.2, vObj.z) * 2.3 + seed + uTime * 0.015);
    float band = 0.5 + 0.5 * sin(y * uBands + wobble * 1.6);
    albedo = mix(uA, uB, band);
    albedo = mix(albedo, uC, smoothstep(0.58, 0.86, fbm(vObj * 3.6 + wobble)) * 0.28);
    if (uSpot > 0.5) {
      float spot = length(vObj - vec3(0.78, -0.16, 0.42));
      float m = smoothstep(0.46, 0.16, spot);
      albedo = mix(albedo, vec3(0.62, 0.22, 0.12), m);
    }
  } else {
    float y = vObj.y;
    float wobble = fbm(vObj * 2.0 + seed + uTime * 0.01);
    float band = 0.5 + 0.5 * sin(y * uBands + wobble);
    albedo = mix(uA, uB, band * 0.65 + 0.18);
    albedo = mix(albedo, uC, smoothstep(0.62, 0.9, fbm(vObj * 4.0)) * 0.18);
  }
  float day = smoothstep(-0.18, 0.42, ndl);
  float lit = mix(0.035, 1.0, day);
  vec3 col = albedo * lit * vec3(1.08, 1.02, 0.96);
  float ocean = 0.0;
  float land = 1.0;
  if (uHasMap > 0.5 && uKind > 2.5 && uKind < 3.5) {
    ocean = smoothstep(0.02, 0.2, mapCol.b - max(mapCol.r, mapCol.g));
    land = 1.0 - ocean;
  }
  if (uCities > 0.5 && uKind > 2.5 && uKind < 3.5) {
    float cities = land * smoothstep(0.58, 0.82, fbm(vObj * 14.0 + seed));
    float night = 1.0 - smoothstep(-0.05, 0.32, ndl);
    col += vec3(1.0, 0.72, 0.38) * cities * night * 1.15;
  }
  vec3 H = normalize(L + V);
  float specK = mix(uSpec * 0.45, 1.35, ocean);
  float spec = pow(max(dot(N, H), 0.0), mix(36.0, 80.0, ocean)) * specK * smoothstep(-0.05, 0.35, ndl);
  col += spec * vec3(1.0, 0.98, 0.92);
  float rim = pow(1.0 - max(dot(N, V), 0.0), 2.6);
  col += rim * uRimColor * uRim * (uHasMap > 0.5 ? 0.28 : 1.0);
  gl_FragColor = finish(col, 1.0);
}
`;

export const sunFrag = /* glsl */ `
varying vec3 vObj;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vUv;
uniform float uTime;
uniform float uHasMap;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;
uniform sampler2D uMap;
${noiseFns}
void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 col;
  if (uHasMap > 0.5) {
    vec2 uv = vUv + vec2(uTime * 0.004, 0.0);
    col = pow(max(texture2D(uMap, uv).rgb, vec3(0.0)), vec3(2.2));
    float granule = fbm(vObj * 9.0 + vec3(uTime * 0.05, 0.0, uTime * 0.03));
    col *= 0.86 + 0.22 * granule;
    col *= 1.45;
  } else {
    float n = fbm(vObj * 3.2 + vec3(uTime * 0.045, 0.0, uTime * 0.03));
    float n2 = fbm(vObj * 8.0 - vec3(uTime * 0.07, uTime * 0.02, 0.0));
    col = mix(uA, uB, n);
    col = mix(col, uC, smoothstep(0.45, 0.9, n2));
    col *= 2.15;
  }
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 1.6);
  col += vec3(1.0, 0.62, 0.22) * fres * 0.35;
  gl_FragColor = finish(col, 1.0);
}
`;

export const cloudFrag = /* glsl */ `
varying vec3 vObj;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vUv;
uniform float uTime;
uniform float uHasCloud;
uniform sampler2D uCloud;
${noiseFns}
void main() {
  vec3 N = normalize(vNormal);
  vec3 L = normalize(-vWorld);
  float ndl = dot(N, L);
  float lit = clamp(ndl * 0.9 + 0.08, 0.0, 1.0);
  if (uHasCloud > 0.5) {
    vec3 c = texture2D(uCloud, vUv + vec2(uTime * 0.002, 0.0)).rgb;
    float a = smoothstep(0.08, 0.62, max(c.r, max(c.g, c.b)));
    float night = 1.0 - smoothstep(-0.2, 0.25, ndl);
    a *= mix(1.0, 0.12, night);
    if (a < 0.02) discard;
    gl_FragColor = finish(vec3(0.96, 0.97, 1.0) * (0.42 + lit * 0.85), a * 0.78);
    return;
  }
  float n = fbm(vObj * 3.5 + vec3(uTime * 0.02, 0.15, 0.0));
  float a = smoothstep(0.5, 0.74, n) * lit;
  gl_FragColor = finish(vec3(0.97, 0.98, 1.0) * (0.55 + lit), a * 0.48);
}
`;

export const atmoFrag = /* glsl */ `
varying vec3 vWorld;
varying vec3 vNormal;
uniform vec3 uColor;
uniform float uStrength;
${noiseFns}
void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 L = normalize(-vWorld);
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 1.85);
  float day = smoothstep(-0.35, 0.55, dot(N, L));
  vec3 col = uColor * (0.28 + 1.15 * day);
  float alpha = fres * uStrength * (0.42 + 0.7 * day);
  alpha += pow(fres, 5.0) * uStrength * 0.22;
  gl_FragColor = finish(col, clamp(alpha, 0.0, 0.92));
}
`;

export const coronaFrag = /* glsl */ `
varying vec3 vWorld;
varying vec3 vNormal;
${noiseFns}
void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorld);
  float fres = pow(clamp(1.0 - dot(N, V), 0.0, 1.0), 1.7);
  vec3 col = mix(vec3(1.0, 0.55, 0.16), vec3(1.0, 0.92, 0.7), fres);
  gl_FragColor = finish(col * 1.6, fres * 0.8);
}
`;

export const ringVert = /* glsl */ `
varying float vSpan;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vLocal;
uniform float uInner;
uniform float uOuter;
void main() {
  float r = length(position.xy);
  vSpan = clamp((r - uInner) / max(uOuter - uInner, 0.0001), 0.0, 1.0);
  vLocal = position.xy;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * vec3(0.0, 0.0, 1.0));
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const ringFrag = /* glsl */ `
varying float vSpan;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vLocal;
uniform vec3 uColor;
uniform float uAlpha;
uniform float uGap;
uniform float uTime;
${noiseFns}
void main() {
  float gap = 1.0;
  if (uGap >= 0.0) {
    float d = abs(vSpan - uGap);
    gap = smoothstep(0.0, 0.025, d - 0.012);
  }
  float bands = 0.62 + 0.38 * sin(vSpan * 86.0);
  float grain = 0.78 + 0.22 * fbm(vec3(vLocal * 2.4, uTime * 0.05));
  float az = atan(vLocal.y, vLocal.x);
  float spokes = 0.86 + 0.14 * sin(az * 22.0 + uTime * 0.15);
  float a = bands * grain * spokes * gap * uAlpha;
  a *= smoothstep(0.0, 0.03, vSpan) * smoothstep(1.0, 0.94, vSpan);
  vec3 L = normalize(-vWorld);
  float nd = abs(dot(normalize(vNormal), L));
  float lit = 0.35 + 0.65 * clamp(nd, 0.0, 1.0);
  vec3 col = mix(uColor * 0.62, uColor, vSpan) * lit;
  if (a < 0.02) discard;
  gl_FragColor = finish(col, a);
}
`;

export const moonFrag = /* glsl */ `
varying vec3 vWorld;
varying vec3 vNormal;
uniform vec3 uColor;
${noiseFns}
void main() {
  vec3 N = normalize(vNormal);
  vec3 L = normalize(-vWorld);
  vec3 V = normalize(cameraPosition - vWorld);
  float lit = clamp(dot(N, L) * 0.8 + 0.18, 0.0, 1.0);
  float rim = pow(1.0 - max(dot(N, V), 0.0), 2.5);
  vec3 col = uColor * lit + uColor * rim * 0.15;
  gl_FragColor = finish(col, 1.0);
}
`;

export const starVert = /* glsl */ `
attribute float aSize;
attribute float aPhase;
attribute vec3 aColor;
varying float vPhase;
varying vec3 vColor;
void main() {
  vPhase = aPhase;
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * (420.0 / max(-mv.z, 1.0));
  gl_Position = projectionMatrix * mv;
}
`;

export const starFrag = /* glsl */ `
varying float vPhase;
varying vec3 vColor;
uniform float uTime;
void main() {
  vec2 p = gl_PointCoord - 0.5;
  float d = length(p);
  if (d > 0.5) discard;
  float tw = 0.72 + 0.28 * sin(uTime * (0.55 + vPhase) + vPhase * 6.28318);
  float a = smoothstep(0.5, 0.05, d) * tw;
  vec3 col = vColor;
  #ifdef TONE_MAPPING
    col = toneMapping(col);
  #endif
  gl_FragColor = linearToOutputTexel(vec4(col, a));
}
`;

export const nebulaVert = /* glsl */ `
varying vec3 vObj;
varying vec2 vUv;
void main() {
  vObj = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const nebulaFrag = /* glsl */ `
varying vec3 vObj;
varying vec2 vUv;
uniform float uTime;
uniform float uHasSky;
uniform sampler2D uSky;
${noiseFns}
void main() {
  vec3 dir = normalize(vObj);
  vec2 uv = vec2(1.0 - vUv.x, vUv.y);
  vec3 col = vec3(0.02, 0.024, 0.038);
  if (uHasSky > 0.5) {
    vec3 tex = pow(max(texture2D(uSky, uv).rgb, vec3(0.0)), vec3(2.2));
    float breathe = 0.94 + 0.06 * sin(uTime * 0.07 + dir.x * 2.0);
    col = tex * 0.42 * breathe;
  }
  float n = fbm(dir * 2.1 + vec3(uTime * 0.008, 0.0, 0.0));
  float n2 = fbm(dir * 4.4 + 3.1);
  col += vec3(0.04, 0.05, 0.09) * smoothstep(0.55, 0.9, n) * 0.45;
  col += vec3(0.09, 0.05, 0.03) * smoothstep(0.7, 0.95, n2) * 0.28;
  gl_FragColor = finish(col, 1.0);
}
`;

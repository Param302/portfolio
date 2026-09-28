import * as THREE from "three";
import { createProjectedSurface, PIXEL_SCALE, REFERENCE_SIZE } from "./avatar-reference-geometry.js";

// Pixel landmarks in the approved 1254px frontal reference. These outlines are
// also the head's eye holes; changing one side without the other leaves seams.
export const REFERENCE_EYES = [
  {
    center: [541, 538],
    outline: [[491, 538], [503, 518], [525, 508], [553, 511], [576, 528], [585, 548], [559, 560], [519, 558], [497, 548]],
    irisRadius: 26,
    whiteSamples: [[506, 538], [576, 541]],
    sparkle: [483, 520],
  },
  {
    center: [750, 538],
    outline: [[701, 545], [706, 526], [725, 511], [749, 508], [775, 517], [799, 537], [802, 548], [779, 559], [749, 564], [718, 559]],
    irisRadius: 26,
    whiteSamples: [[713, 540], [789, 542]],
    sparkle: [810, 523],
  },
];

const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;
const smooth = (value) => value * value * (3 - 2 * value);
const worldPoint = (px, py, z) => [(px - REFERENCE_SIZE / 2) * PIXEL_SCALE, (REFERENCE_SIZE / 2 - py) * PIXEL_SCALE, z];
const UV = (px, py) => new THREE.Vector2(px / REFERENCE_SIZE, 1 - py / REFERENCE_SIZE);
const LID_COLUMNS = 36;
const LID_ROWS = 8;
const MAX_GAZE_X_PX = 18;
const MAX_GAZE_Y_PX = 10;
const GAZE_RESPONSE = 22;

function makeEyeMaterial(texture, eye, gazePixels) {
  const material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, side: THREE.DoubleSide });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.referenceGaze = { value: gazePixels };
    shader.uniforms.referenceEyeCenter = { value: new THREE.Vector2(...eye.center) };
    shader.uniforms.referenceIrisRadius = { value: eye.irisRadius };
    shader.uniforms.referenceWhiteA = { value: new THREE.Vector2(...eye.whiteSamples[0]) };
    shader.uniforms.referenceWhiteB = { value: new THREE.Vector2(...eye.whiteSamples[1]) };
    shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `#include <common>
      uniform vec2 referenceGaze;
      uniform vec2 referenceEyeCenter;
      uniform float referenceIrisRadius;
      uniform vec2 referenceWhiteA;
      uniform vec2 referenceWhiteB;
    `).replace("#include <map_fragment>", `#include <map_fragment>
      vec2 referencePx = vec2(vMapUv.x, 1.0 - vMapUv.y) * ${REFERENCE_SIZE.toFixed(1)};
      float referenceDistance = length(referencePx - referenceEyeCenter);
      float referenceClear = 1.0 - smoothstep(referenceIrisRadius - 0.7, referenceIrisRadius + 1.0, referenceDistance);
      if (referenceClear > 0.0) {
        float referenceDy = clamp(referencePx.y - referenceEyeCenter.y, -6.0, 6.0);
        vec2 whiteUvA = vec2(referenceWhiteA.x, referenceWhiteA.y + referenceDy) / ${REFERENCE_SIZE.toFixed(1)};
        vec2 whiteUvB = vec2(referenceWhiteB.x, referenceWhiteB.y + referenceDy) / ${REFERENCE_SIZE.toFixed(1)};
        whiteUvA.y = 1.0 - whiteUvA.y;
        whiteUvB.y = 1.0 - whiteUvB.y;
        vec3 referenceWhite = mix(texture2D(map, whiteUvA).rgb, texture2D(map, whiteUvB).rgb,
          clamp((referencePx.x - referenceEyeCenter.x + referenceIrisRadius) / (referenceIrisRadius * 2.0), 0.0, 1.0));
        diffuseColor.rgb = mix(diffuseColor.rgb, referenceWhite, referenceClear);
      }
      // The pupil, brown iris and original white catchlight are one source crop.
      // Erase that crop from the stationary eye before translating all of it;
      // a second textured depth layer must never leave a fixed catchlight behind.
      vec2 irisSourcePx = referencePx - referenceGaze;
      float irisDistance = length(irisSourcePx - referenceEyeCenter);
      float irisCoverage = 1.0 - smoothstep(referenceIrisRadius + 1.0, referenceIrisRadius + 3.0, irisDistance);
      if (irisCoverage > 0.0) {
        vec2 irisUv = irisSourcePx / ${REFERENCE_SIZE.toFixed(1)};
        irisUv.y = 1.0 - irisUv.y;
        diffuseColor.rgb = mix(diffuseColor.rgb, texture2D(map, irisUv).rgb, irisCoverage);
      }
    `);
  };
  material.customProgramCacheKey = () => "reference-eye-with-moving-catchlight-v2";
  return material;
}

function verticalBounds(outline, x) {
  const intersections = [];
  outline.forEach((point, index) => {
    const next = outline[(index + 1) % outline.length];
    if (Math.abs(next[0] - point[0]) < 0.00001) {
      if (Math.abs(x - point[0]) < 0.0001) intersections.push(point[1], next[1]);
      return;
    }
    const t = (x - point[0]) / (next[0] - point[0]);
    if (t >= 0 && t <= 1) intersections.push(lerp(point[1], next[1], t));
  });
  return [Math.min(...intersections), Math.max(...intersections)];
}

function makeLidGeometry() {
  const layerSize = (LID_COLUMNS + 1) * (LID_ROWS + 1);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(layerSize * 2 * 3), 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(layerSize * 2 * 2), 2));
  const indices = [];
  for (let row = 0; row < LID_ROWS; row++) {
    for (let column = 0; column < LID_COLUMNS; column++) {
      const a = row * (LID_COLUMNS + 1) + column;
      const b = a + 1;
      const c = a + LID_COLUMNS + 1;
      const d = c + 1;
      indices.push(a, b, c, b, d, c, a + layerSize, c + layerSize, b + layerSize, b + layerSize, c + layerSize, d + layerSize);
    }
  }
  const wall = (a, b) => indices.push(a, a + layerSize, b, b, a + layerSize, b + layerSize);
  for (let column = 0; column < LID_COLUMNS; column++) {
    wall(column + 1, column);
    wall(LID_ROWS * (LID_COLUMNS + 1) + column, LID_ROWS * (LID_COLUMNS + 1) + column + 1);
  }
  for (let row = 0; row < LID_ROWS; row++) {
    wall(row * (LID_COLUMNS + 1), (row + 1) * (LID_COLUMNS + 1));
    wall((row + 1) * (LID_COLUMNS + 1) + LID_COLUMNS, row * (LID_COLUMNS + 1) + LID_COLUMNS);
  }
  geometry.setIndex(indices);
  return geometry;
}

function updateLid(mesh, eye, side, closure) {
  mesh.visible = closure > 0.0001;
  const positions = mesh.geometry.attributes.position;
  const uv = mesh.geometry.attributes.uv;
  const layerSize = positions.count / 2;
  eye.lidColumns.forEach(({ px, top, bottom }, column) => {
    const outer = side === "upper" ? top : bottom;
    const closedY = lerp(top, bottom, 0.66);
    const movingEdge = lerp(outer, closedY, closure);
    for (let row = 0; row <= LID_ROWS; row++) {
      const across = row / LID_ROWS;
      const py = lerp(outer, movingEdge, across);
      const front = eye.surfaceDepth(px, py) + 0.018;
      const index = row * (LID_COLUMNS + 1) + column;
      positions.setXYZ(index, ...worldPoint(px, py, front));
      positions.setXYZ(index + layerSize, ...worldPoint(px, py, front - 0.009));
      // The shutter stretches nearby skin into the aperture, never the original
      // iris/white pixels. A narrow original lash margin becomes the blink crease.
      const offset = 1.5 + 6 * Math.sin(Math.PI * across);
      const skinY = side === "upper" ? top - offset : bottom + offset;
      const sourceUv = UV(px, skinY);
      uv.setXY(index, sourceUv.x, sourceUv.y);
      uv.setXY(index + layerSize, sourceUv.x, sourceUv.y);
    }
  });
  positions.needsUpdate = true;
  uv.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
  mesh.geometry.computeBoundingSphere();
}

function makeStarGeometry() {
  const outline = new THREE.Shape();
  for (let index = 0; index < 10; index++) {
    const angle = Math.PI / 2 + index * Math.PI / 5;
    const radius = (index % 2 ? 2.6 : 6) * PIXEL_SCALE;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (index) outline.lineTo(x, y); else outline.moveTo(x, y);
  }
  outline.closePath();
  return new THREE.ExtrudeGeometry(outline, { depth: 0.004, bevelEnabled: true, bevelThickness: 0.001, bevelSize: 0.001, bevelSegments: 1, steps: 1 });
}

/**
 * Real curved eye patches in the source image's neutral coordinate system.
 * Texture is borrowed and never disposed. Base UVs stay attached to the curved
 * surface; the iris crop (including its catchlight) follows a single gaze offset.
 * Neutral gaze is an exact source crop. Moving gaze first clears the original
 * iris/glint footprint, then paints its translated crop on the same surface.
 */
export function createReferenceEyes(parent, { texture, depthAt, reduceMotion = false, random = Math.random } = {}) {
  if (!parent?.isObject3D || !texture?.isTexture || typeof depthAt !== "function") throw new TypeError("Reference eyes require a parent, reference texture and pixel-space depthAt function.");
  const group = new THREE.Group();
  group.name = "Reference matched animated eyes";
  const ownedGeometries = new Set();
  const ownedMaterials = new Set();
  const ownGeometry = (value) => { ownedGeometries.add(value); return value; };
  const ownMaterial = (value) => { ownedMaterials.add(value); return value; };
  const lidMaterial = ownMaterial(new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, side: THREE.DoubleSide }));
  const starGeometry = ownGeometry(makeStarGeometry());
  const starMaterial = ownMaterial(new THREE.MeshBasicMaterial({ color: 0xe9ba54, toneMapped: false }));

  const instances = REFERENCE_EYES.map((definition, index) => {
    const surfaceDepth = (px, py) => {
      const dx = (px - definition.center[0]) / 52;
      const dy = (py - definition.center[1]) / 31;
      return depthAt(px, py) + 0.004 + 0.010 * Math.max(0, 1 - dx * dx - dy * dy);
    };
    const gaze = new THREE.Vector2();
    const eyeSurface = new THREE.Mesh(ownGeometry(createProjectedSurface({ outline: definition.outline, frontDepth: surfaceDepth, maxEdge: 6 })), ownMaterial(makeEyeMaterial(texture, definition, gaze)));
    eyeSurface.name = `Reference eye with moving iris and catchlight ${index}`;
    group.add(eyeSurface);
    const minX = Math.min(...definition.outline.map((point) => point[0]));
    const maxX = Math.max(...definition.outline.map((point) => point[0]));
    const lidColumns = Array.from({ length: LID_COLUMNS + 1 }, (_, column) => {
      const px = lerp(minX, maxX, column / LID_COLUMNS);
      const [top, bottom] = verticalBounds(definition.outline, px);
      return { px, top, bottom };
    });
    const upper = new THREE.Mesh(ownGeometry(makeLidGeometry()), lidMaterial);
    const lower = new THREE.Mesh(ownGeometry(makeLidGeometry()), lidMaterial);
    upper.name = `Reference upper eyelid ${index}`;
    lower.name = `Reference lower eyelid ${index}`;
    group.add(upper, lower);
    const sparkle = new THREE.Mesh(starGeometry, starMaterial);
    sparkle.position.fromArray(worldPoint(...definition.sparkle, depthAt(...definition.sparkle) + 0.025));
    sparkle.name = `Small eye corner sparkle ${index}`;
    sparkle.visible = false;
    group.add(sparkle);
    return { definition, surfaceDepth, gaze, target: new THREE.Vector2(), upper, lower, sparkle, lidColumns, previousLids: [-1, -1] };
  });
  parent.add(group);

  let disposed = false;
  let reduced = Boolean(reduceMotion);
  let reaction = "idle";
  let elapsed = 0;
  let blinkAge = Infinity;
  let squint = 0;
  const scheduleBlink = () => 3.1 + clamp(Number(random()) || 0, 0, 1) * 2.8;
  let nextBlink = scheduleBlink();

  function paint(delta = 0, snap = false) {
    const blend = snap || reduced ? 1 : 1 - Math.exp(-delta * 12);
    const gazeBlend = snap || reduced ? 1 : 1 - Math.exp(-delta * GAZE_RESPONSE);
    squint = lerp(squint, reaction === "happy" ? 0.09 : 0, blend);
    let blink = 0;
    if (!reduced && blinkAge < 0.21) {
      if (blinkAge < 0.065) blink = smooth(blinkAge / 0.065);
      else if (blinkAge < 0.095) blink = 1;
      else blink = 1 - smooth((blinkAge - 0.095) / 0.115);
    }
    instances.forEach((eye, index) => {
      const x = lerp(eye.gaze.x, reduced ? 0 : eye.target.x, gazeBlend);
      const y = lerp(eye.gaze.y, reduced ? 0 : eye.target.y, gazeBlend);
      if (Math.abs(x - eye.gaze.x) + Math.abs(y - eye.gaze.y) > 0.00001) {
        eye.gaze.set(x, y);
      }
      const closures = [squint + (1 - squint) * blink, squint * 0.55 + (1 - squint * 0.55) * blink];
      closures.forEach((closure, side) => {
        if (Math.abs(closure - eye.previousLids[side]) < 0.00001) return;
        updateLid(side === 0 ? eye.upper : eye.lower, eye, side === 0 ? "upper" : "lower", closure);
        eye.previousLids[side] = closure;
      });
      eye.sparkle.visible = reaction === "stars";
      eye.sparkle.scale.setScalar(reduced ? 1 : 0.95 + Math.sin(elapsed * 3 + index) * 0.06);
    });
  }
  paint(0, true);

  return {
    group,
    setGaze(x = 0, y = 0) {
      if (disposed) return;
      const horizontal = clamp(Number.isFinite(x) ? x : 0, -1, 1) * MAX_GAZE_X_PX;
      const vertical = -clamp(Number.isFinite(y) ? y : 0, -1, 1) * MAX_GAZE_Y_PX;
      instances.forEach((eye) => eye.target.set(horizontal, vertical));
    },
    setLookTarget(localTarget) {
      if (disposed) return;
      const point = localTarget?.isVector3 ? localTarget : new THREE.Vector3(...localTarget);
      instances.forEach((eye) => {
        const [x, y, z] = worldPoint(...eye.definition.center, depthAt(...eye.definition.center));
        const forward = point.z - z;
        eye.target.set(forward <= 0 ? 0 : clamp(Math.atan2(point.x - x, forward) / 0.35, -1, 1) * MAX_GAZE_X_PX, forward <= 0 ? 0 : -clamp(Math.atan2(point.y - y, Math.hypot(point.x - x, forward)) / 0.25, -1, 1) * MAX_GAZE_Y_PX);
      });
    },
    setReaction(next) {
      if (disposed) return;
      reaction = ["happy", "excited", "stars"].includes(next) ? next : "idle";
      paint(0, reduced);
    },
    setReducedMotion(next) {
      if (disposed) return;
      reduced = Boolean(next);
      blinkAge = Infinity;
      nextBlink = scheduleBlink();
      paint(0, true);
    },
    blink() {
      if (disposed || reduced) return;
      blinkAge = 0;
      nextBlink = scheduleBlink();
    },
    update(deltaSeconds = 0) {
      if (disposed || reduced) return;
      const delta = clamp(Number.isFinite(deltaSeconds) ? deltaSeconds : 0, 0, 0.1);
      elapsed += delta;
      nextBlink -= delta;
      if (nextBlink <= 0 && blinkAge >= 0.21) { blinkAge = 0; nextBlink = scheduleBlink(); }
      else blinkAge += delta;
      paint(delta);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      group.removeFromParent();
      ownedGeometries.forEach((geometry) => geometry.dispose());
      ownedMaterials.forEach((material) => material.dispose());
      group.clear();
    },
  };
}

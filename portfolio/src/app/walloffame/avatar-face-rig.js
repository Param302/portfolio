import * as THREE from "three";

/**
 * A calibrated, local-space face rig for the locally sculpted avatar. Nothing in
 * this module assumes where the face is or how large it is.
 *
 * FITTING THE FACE (required before attaching this to the live scene):
 * 1. Pick the sculpted head Object3D and measure both globe centers/radii IN THAT
 *    OBJECT'S LOCAL SPACE. Each eye's local +Z points
 *    out of the face, +Y points toward its brow; use `quaternion` to fit that basis.
 *    A visible pupil center is on the FRONT of the globe, not its center. Bury the
 *    center roughly one radius behind it, then fit the actual socket in 3D.
 * 2. Form actual sockets in the face or recess the face surface behind each new
 *    globe's aperture. A solid head intersecting the opening will cover the pupil.
 *    The skin shells must blend into the head around their outer seam. Check both
 *    profiles, looking up/down, full blink, happy squint and star eyes. Do not
 *    disable depth testing, force renderOrder or use transparent overlays.
 * 3. Match skin color/roughness under the SAME lights, or pass the head's material
 *    as skinMaterial (cloned, never mutated/disposed by this rig). Lid `outerWidth`
 *    and `outerHeight` are radii-relative patch extents; their outer seam must sink
 *    into surrounding skin. When skinMaterial is supplied, the outer seam is
 *    fitted once against parent meshes that use that exact material. The default
 *    shells have real thickness and cover the
 *    entire front globe except for a deforming almond-shaped opening. Optional
 *    `surfaceZ(x,y,z)` adjusts the shell to sculpted skin; never push its moving
 *    inner edge behind the globe, iris or glints. It receives eye-normalized units.
 * 4. Preserve the separate silver glasses and their temples. The glasses must be
 *    IN FRONT of the eyelids, including at full closure. This rig does not replace
 *    glasses or alter their material. Test
 *    from the back to ensure eyeballs remain inside the head. Fit each eye
 *    independently; a slightly asymmetric face should not be forced symmetric.
 * 5. If later reused on a textured scan, remove the original eye-only meshes or
 *    carve the bounded socket and clean any baked iris/eyelash pixels. The new
 *    globe must cover ALL remaining eye pixels at every supported view angle.
 *    Never hide a shared head/glasses mesh. This rig does not modify source faces.
 *
 * No DOM listeners, render loop, timers or global model transforms are installed.
 * Call update(deltaSeconds) from the scene's existing visible-frame loop. Map the
 * screen pointer into the head's local gaze direction; setGaze(x,y) expects right
 * and UP positive, unlike DOM clientY. For rotated heads use setLookTarget with a
 * target in the same local space as headParent, or return the gaze to neutral.
 * Keep the model front-facing by default; gaze never rotates the head.
 *
 * This rig provides eye expressions only. It does not claim to animate a baked
 * smile, brows or cheeks. Use real model morph targets for those when available.
 * Call setReaction on both hero feedback changes and FeedbackWheel.onActiveChange.
 * Call dispose BEFORE the scene's generic traversal cleanup so these resources
 * are detached and are not disposed twice. Parent resources are never owned.
 */

const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;
const smoothstep = (value) => value * value * (3 - 2 * value);
const TAU = Math.PI * 2;
const LID_COLUMNS = 40;
const LID_ROWS = 9;
const RIM_SEGMENTS = 40;
const RIM_SIDES = 6;

const EXPRESSIONS = {
  idle: { upper: 1, lower: 1, seam: 0, stars: false },
  happy: { upper: 0.90, lower: 0.86, seam: 0.015, stars: false },
  excited: { upper: 1.08, lower: 1.04, seam: 0, stars: false },
  stars: { upper: 1.05, lower: 1.02, seam: 0, stars: true },
};

const DEFAULT_LIDS = {
  apertureWidth: 0.90,
  upperOpening: 0.66,
  lowerOpening: 0.46,
  outerWidth: 1.16,
  outerHeight: 1.15,
  shellRadius: 1.06,
  thickness: 0.028,
  cornerTilt: 0,
};

function validateEye(eye, index) {
  if (!Array.isArray(eye.center) || eye.center.length !== 3 || !eye.center.every(Number.isFinite)) {
    throw new TypeError(`Eye ${index} needs a calibrated finite local center [x, y, z].`);
  }
  if (eye.radii !== undefined) {
    if (!Array.isArray(eye.radii) || eye.radii.length !== 3 || !eye.radii.every((value) => Number.isFinite(value) && value > 0)) throw new TypeError(`Eye ${index} radii must be positive finite [rx, ry, rz].`);
  } else if (!Number.isFinite(eye.radius) || eye.radius <= 0) throw new TypeError(`Eye ${index} needs calibrated radii or a radius greater than zero.`);
  if (eye.depthRatio !== undefined && (!Number.isFinite(eye.depthRatio) || eye.depthRatio <= 0)) {
    throw new TypeError(`Eye ${index} depthRatio must be greater than zero.`);
  }
  if (eye.quaternion !== undefined && (!Array.isArray(eye.quaternion) || eye.quaternion.length !== 4 || !eye.quaternion.every(Number.isFinite) || !eye.quaternion.some((value) => value !== 0))) {
    throw new TypeError(`Eye ${index} quaternion must be a nonzero finite [x, y, z, w].`);
  }
  const lids = { ...DEFAULT_LIDS, ...eye.lids };
  for (const key of Object.keys(DEFAULT_LIDS)) {
    if (!Number.isFinite(lids[key])) throw new TypeError(`Eye ${index} lid ${key} must be finite.`);
  }
  if (lids.apertureWidth <= 0 || lids.apertureWidth >= 1 || lids.upperOpening <= 0 || lids.lowerOpening <= 0 || lids.upperOpening > 0.7 || lids.lowerOpening > 0.7 || lids.outerWidth <= 1 || lids.outerHeight <= 1 || lids.shellRadius < 1.05 || lids.thickness <= 0) {
    throw new RangeError(`Eye ${index} lid dimensions must contain the globe and leave a valid opening.`);
  }
  if (eye.surfaceZ !== undefined && typeof eye.surfaceZ !== "function") throw new TypeError(`Eye ${index} surfaceZ must be a function.`);
  return lids;
}

// A curved spherical disk, not a camera-facing sprite or a flat iris card.
function sphericalDisk(radius, surfaceRadius, colored = false, aspect = [1, 1]) {
  const rings = 12;
  const segments = 64;
  const positions = [];
  const normals = [];
  const colors = [];
  const indices = [];
  const brown = new THREE.Color(0x745032);
  for (let ring = 0; ring <= rings; ring++) {
    const distance = radius * ring / rings;
    for (let segment = 0; segment <= segments; segment++) {
      const angle = segment / segments * TAU;
      const x = Math.cos(angle) * distance * aspect[0];
      const y = Math.sin(angle) * distance * aspect[1];
      const z = Math.sqrt(1 - x * x - y * y);
      positions.push(x * surfaceRadius, y * surfaceRadius, z * surfaceRadius);
      normals.push(x, y, z);
      if (colored) {
        const fiber = Math.sin(angle * 37 + distance * 19) * 0.09 + Math.sin(angle * 61 - distance * 9) * 0.045;
        const rim = ring >= rings - 1 ? 0.46 : ring < 5 ? 0.73 : 1;
        const shade = (0.9 + fiber) * rim;
        colors.push(brown.r * shade, brown.g * shade, brown.b * shade);
      }
      if (ring < rings && segment < segments) {
        const start = ring * (segments + 1) + segment;
        indices.push(start, start + segments + 1, start + 1, start + 1, start + segments + 1, start + segments + 2);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  if (colored) geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  return geometry;
}

function eyeStarGeometry(aspect) {
  const outline = new THREE.Shape();
  for (let index = 0; index < 10; index++) {
    const angle = Math.PI / 2 + index * Math.PI / 5;
    const radius = index % 2 ? 0.24 : 0.52;
    const point = [Math.cos(angle) * radius, Math.sin(angle) * radius];
    if (index) outline.lineTo(...point); else outline.moveTo(...point);
  }
  outline.closePath();
  const geometry = new THREE.ExtrudeGeometry(outline, { depth: 0.012, bevelEnabled: true, bevelSize: 0.009, bevelThickness: 0.004, bevelSegments: 2, steps: 1 });
  const positions = geometry.attributes.position;
  for (let index = 0; index < positions.count; index++) {
    const x = positions.getX(index) * aspect[0];
    const y = positions.getY(index) * aspect[1];
    positions.setX(index, x);
    positions.setY(index, y);
    positions.setZ(index, Math.sqrt(Math.max(0, 1 - x * x - y * y)) * 1.014 + positions.getZ(index));
  }
  geometry.computeVertexNormals();
  return geometry;
}

function lidGeometry() {
  const layerSize = (LID_COLUMNS + 1) * (LID_ROWS + 1);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(layerSize * 2 * 3), 3).setUsage(THREE.DynamicDrawUsage));
  const indices = [];
  for (let row = 0; row < LID_ROWS; row++) {
    for (let column = 0; column < LID_COLUMNS; column++) {
      const a = row * (LID_COLUMNS + 1) + column;
      const b = a + 1;
      const c = a + LID_COLUMNS + 1;
      const d = c + 1;
      indices.push(a, b, c, b, d, c);
      indices.push(a + layerSize, c + layerSize, b + layerSize, b + layerSize, c + layerSize, d + layerSize);
    }
  }
  function wall(a, b) { indices.push(a, a + layerSize, b, b, a + layerSize, b + layerSize); }
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

function updateLid(geometry, side, config, openness, seamHeight, surfaceZ, edgeDepth) {
  const positions = geometry.attributes.position;
  const layerSize = positions.count / 2;
  for (let column = 0; column <= LID_COLUMNS; column++) {
    const x = (column / LID_COLUMNS * 2 - 1) * config.outerWidth;
    const apertureArch = Math.sqrt(Math.max(0, 1 - (x / config.apertureWidth) ** 2));
    const seam = (seamHeight + config.cornerTilt * x) * apertureArch;
    const innerY = seam + side * openness * apertureArch;
    const outerY = side * config.outerHeight * Math.sqrt(Math.max(0, 1 - (x / config.outerWidth) ** 2));
    for (let row = 0; row <= LID_ROWS; row++) {
      const across = row / LID_ROWS;
      const y = lerp(innerY, outerY, across);
      const domeZ = Math.sqrt(Math.max(0, config.shellRadius ** 2 - x * x - y * y));
      // The outer seam blends into surrounding skin. The leading edge stays outside
      // the globe, even when closed; no whole-eye scaling is used for blinking.
      const edge = edgeDepth?.[column];
      const fittedZ = Number.isFinite(edge) ? lerp(domeZ, edge, smoothstep(across)) : domeZ;
      // The edge is buried in the face, but the shell must still cover the globe
      // between the aperture and that edge. Otherwise white leaks around the lid.
      const globeDepth = x * x + y * y < 1 ? Math.sqrt(1 - x * x - y * y) + 0.026 : -Infinity;
      const fittedShell = Math.max(fittedZ, globeDepth);
      const requestedZ = surfaceZ ? surfaceZ(x, y, fittedShell) : fittedShell;
      const z = Number.isFinite(requestedZ) ? requestedZ : domeZ;
      const index = row * (LID_COLUMNS + 1) + column;
      positions.setXYZ(index, x, y, z);
      positions.setXYZ(index + layerSize, x, y, z - config.thickness);
    }
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
}

function lidRimGeometry() {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array((RIM_SEGMENTS + 1) * (RIM_SIDES + 1) * 3), 3).setUsage(THREE.DynamicDrawUsage));
  const indices = [];
  for (let segment = 0; segment < RIM_SEGMENTS; segment++) {
    for (let side = 0; side < RIM_SIDES; side++) {
      const a = segment * (RIM_SIDES + 1) + side;
      const b = a + RIM_SIDES + 1;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  geometry.setIndex(indices);
  return geometry;
}

// A fine upper lash margin supplies the dark eye outline from the reference.
// It follows the physical lid edge, including the crease of a closed blink.
function updateLidRim(geometry, config, openness, seamHeight, surfaceZ) {
  const positions = geometry.attributes.position;
  for (let segment = 0; segment <= RIM_SEGMENTS; segment++) {
    const t = segment / RIM_SEGMENTS;
    const x = (t * 2 - 1) * config.apertureWidth;
    const arch = Math.sqrt(Math.max(0, 1 - (x / config.apertureWidth) ** 2));
    const y = (seamHeight + config.cornerTilt * x + openness) * arch;
    const domeZ = Math.sqrt(Math.max(0, config.shellRadius ** 2 - x * x - y * y));
    const requestedZ = surfaceZ ? surfaceZ(x, y, domeZ) : domeZ;
    const z = (Number.isFinite(requestedZ) ? requestedZ : domeZ) + 0.002;
    const slope = arch > 0.01 ? -(openness + seamHeight) * x / (config.apertureWidth ** 2 * arch) + config.cornerTilt * arch : 0;
    const length = Math.hypot(slope, 1);
    const radius = 0.024 * Math.pow(Math.sin(Math.PI * t), 0.45);
    for (let side = 0; side <= RIM_SIDES; side++) {
      const angle = side / RIM_SIDES * TAU;
      const across = Math.cos(angle) * radius;
      positions.setXYZ(segment * (RIM_SIDES + 1) + side, x - slope / length * across, y + across / length, z + Math.sin(angle) * radius * 0.5);
    }
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
}

/**
 * @param {THREE.Object3D} headParent Calibrated local-space parent; never mutated.
 * @param {object} options
 * @param {Array<object>} options.eyes Exactly two configs: center:[x,y,z],
 *   radii:[rx,ry,rz] (or radius), optional quaternion:[x,y,z,w], depthRatio,
 *   skinMaterial, skinColor, skinRoughness, lids,
 *   surfaceZ. Radii/centers are deliberately REQUIRED; there are no guessed ones.
 * @param {number} options.maxYaw Max eye-only yaw in radians (default 0.20).
 * @param {number} options.maxPitch Max eye-only pitch in radians (default 0.13).
 * @param {function} options.random Optional seeded RNG for reproducible blinking.
 */
export function createAvatarFaceRig(headParent, {
  eyes,
  reduceMotion = false,
  reaction = "idle",
  skinMaterial,
  skinColor = 0xe5b38d,
  skinRoughness = 0.73,
  maxYaw = 0.20,
  maxPitch = 0.13,
  gazeResponse = 11,
  blinkInterval = [3.2, 6.4],
  random = Math.random,
} = {}) {
  if (!headParent?.isObject3D) throw new TypeError("A THREE.Object3D head parent is required.");
  if (!Array.isArray(eyes) || eyes.length !== 2) throw new TypeError("Provide exactly two calibrated eyes.");
  const lidConfigs = eyes.map(validateEye);
  if (!Number.isFinite(maxYaw) || !Number.isFinite(maxPitch) || maxYaw < 0 || maxPitch < 0 || maxYaw > 0.35 || maxPitch > 0.25) throw new RangeError("Eye gaze limits must remain within 0–0.35 yaw and 0–0.25 pitch radians.");
  if (!Number.isFinite(gazeResponse) || gazeResponse <= 0) throw new RangeError("gazeResponse must be positive.");
  if (!Array.isArray(blinkInterval) || blinkInterval.length !== 2 || !blinkInterval.every(Number.isFinite) || blinkInterval[0] < 0.4 || blinkInterval[1] < blinkInterval[0]) throw new RangeError("blinkInterval must contain ordered positive seconds.");
  if (typeof random !== "function") throw new TypeError("random must be a function.");

  const group = new THREE.Group();
  group.name = "CalibratedAvatarFaceRig";
  const geometries = new Set();
  const materials = new Set();
  const skinMeshes = [];
  headParent.traverse((object) => {
    if (object.isMesh && object.material === skinMaterial) skinMeshes.push(object);
  });
  const ownGeometry = (geometry) => { geometries.add(geometry); return geometry; };
  const ownMaterial = (material) => { materials.add(material); return material; };
  const sphere = ownGeometry(new THREE.SphereGeometry(1, 40, 28));
  const white = ownMaterial(new THREE.MeshPhysicalMaterial({ color: 0xece3d8, roughness: 0.54, clearcoat: 0.06, clearcoatRoughness: 0.4, specularIntensity: 0.25 }));
  const irisMaterial = ownMaterial(new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.33, clearcoat: 0.65, clearcoatRoughness: 0.12 }));
  const pupilMaterial = ownMaterial(new THREE.MeshStandardMaterial({ color: 0x120e0b, roughness: 0.18 }));
  const glintMaterial = ownMaterial(new THREE.MeshBasicMaterial({ color: 0xfffcf4, toneMapped: false }));
  const starMaterial = ownMaterial(new THREE.MeshStandardMaterial({ color: 0xf2c65c, roughness: 0.32, metalness: 0.35, emissive: 0x976013, emissiveIntensity: 0.16 }));
  const lidRimMaterial = ownMaterial(new THREE.MeshStandardMaterial({ color: 0x72503e, roughness: 0.86, side: THREE.DoubleSide }));

  const instances = eyes.map((config, index) => {
    const socket = new THREE.Group();
    socket.name = `AvatarEyeSocket${index}`;
    socket.position.fromArray(config.center);
    socket.scale.fromArray(config.radii ?? [config.radius, config.radius, config.radius * (config.depthRatio ?? 1)]);
    if (config.quaternion) socket.quaternion.fromArray(config.quaternion).normalize();
    group.add(socket);
    const globe = new THREE.Mesh(sphere, white);
    globe.name = "EyeGlobe";
    socket.add(globe);
    const gaze = new THREE.Group();
    gaze.name = "EyeGaze";
    socket.add(gaze);
    // An adult eye has a roughly round iris even when the visible white is wide.
    // Correct for the ellipsoid's x/y ratio while keeping every vertex ON its
    // curved surface. Scaling a flat circle in front would float above the globe.
    const roundAspect = [Math.min(1, socket.scale.y / socket.scale.x), Math.min(1, socket.scale.x / socket.scale.y)];
    const iris = new THREE.Mesh(ownGeometry(sphericalDisk(0.56, 1.006, true, roundAspect)), irisMaterial);
    const pupil = new THREE.Mesh(ownGeometry(sphericalDisk(0.24, 1.013, false, roundAspect)), pupilMaterial);
    iris.name = "BrownIris";
    pupil.name = "Pupil";
    gaze.add(iris, pupil);
    const glints = new THREE.Group();
    [[-0.12, 0.14, 0.044], [0.09, -0.08, 0.018]].forEach(([x, y, radius]) => {
      const glint = new THREE.Mesh(sphere, glintMaterial);
      glint.position.set(x, y, Math.sqrt(1 - x * x - y * y) * 1.017);
      glint.scale.set(radius, radius, 0.007);
      glints.add(glint);
    });
    gaze.add(glints);
    const star = new THREE.Mesh(ownGeometry(eyeStarGeometry(roundAspect)), starMaterial);
    star.name = "StarIris";
    star.visible = false;
    gaze.add(star);
    const sourceSkin = config.skinMaterial ?? skinMaterial;
    const skin = ownMaterial(sourceSkin?.isMaterial ? sourceSkin.clone() : new THREE.MeshStandardMaterial({ color: config.skinColor ?? skinColor, roughness: config.skinRoughness ?? skinRoughness }));
    if (sourceSkin?.isMaterial && config.skinColor !== undefined) skin.color?.set(config.skinColor);
    if (sourceSkin?.isMaterial && config.skinRoughness !== undefined) skin.roughness = config.skinRoughness;
    skin.side = THREE.DoubleSide;
    skin.transparent = false;
    skin.opacity = 1;
    skin.depthTest = true;
    skin.depthWrite = true;
    skin.alphaMap = null;
    skin.alphaTest = 0;
    const upper = new THREE.Mesh(ownGeometry(lidGeometry()), skin);
    const lower = new THREE.Mesh(ownGeometry(lidGeometry()), skin);
    upper.name = "UpperEyelidShell";
    lower.name = "LowerEyelidShell";
    const rim = new THREE.Mesh(ownGeometry(lidRimGeometry()), lidRimMaterial);
    rim.name = "UpperLidLashMargin";
    socket.add(upper, lower, rim);
    return { socket, gaze, iris, pupil, glints, star, upper, lower, rim, config, lids: lidConfigs[index], targetYaw: 0, targetPitch: 0, previousLids: [] };
  });
  headParent.add(group);

  // Sparse edge samples are fitted once, never per animation frame. Interpolate
  // the smooth face contour between them to avoid hundreds of startup raycasts.
  if (skinMeshes.length) {
    headParent.updateWorldMatrix(true, true);
    const raycaster = new THREE.Raycaster();
    const origin = new THREE.Vector3();
    const destination = new THREE.Vector3();
    const direction = new THREE.Vector3();
    instances.forEach((eye) => {
      eye.edgeDepth = [1, -1].map((side) => {
        const samples = new Array(LID_COLUMNS + 1);
        for (let column = 0; column <= LID_COLUMNS; column += 4) {
          const x = (column / LID_COLUMNS * 2 - 1) * eye.lids.outerWidth;
          const y = side * eye.lids.outerHeight * Math.sqrt(Math.max(0, 1 - (x / eye.lids.outerWidth) ** 2));
          eye.socket.localToWorld(origin.set(x, y, 3));
          eye.socket.localToWorld(destination.set(x, y, -3));
          direction.subVectors(destination, origin).normalize();
          raycaster.set(origin, direction);
          const hit = raycaster.intersectObjects(skinMeshes, false)[0];
          if (hit) samples[column] = eye.socket.worldToLocal(hit.point).z - 0.025;
        }
        return Array.from({ length: LID_COLUMNS + 1 }, (_, column) => {
          if (column % 4 === 0) return samples[column];
          const before = Math.floor(column / 4) * 4;
          const after = before + 4;
          if (!Number.isFinite(samples[before]) || !Number.isFinite(samples[after])) return undefined;
          return lerp(samples[before], samples[after], (column - before) / 4);
        });
      });
    });
  }

  let disposed = false;
  let reduced = Boolean(reduceMotion);
  let currentReaction = EXPRESSIONS[reaction] ? reaction : "idle";
  let expression = { ...EXPRESSIONS[currentReaction] };
  let blinkAge = Number.POSITIVE_INFINITY;
  const scheduleBlink = () => lerp(blinkInterval[0], blinkInterval[1], clamp(Number(random()) || 0, 0, 1));
  let nextBlink = scheduleBlink();
  const localTarget = new THREE.Vector3();

  function paint(delta = 0, snap = false) {
    const target = EXPRESSIONS[currentReaction];
    const blend = snap || reduced ? 1 : 1 - Math.exp(-delta * 14);
    expression.upper = lerp(expression.upper, target.upper, blend);
    expression.lower = lerp(expression.lower, target.lower, blend);
    expression.seam = lerp(expression.seam, target.seam, blend);
    let closure = 0;
    if (!reduced && blinkAge < 0.205) {
      if (blinkAge < 0.065) closure = smoothstep(blinkAge / 0.065);
      else if (blinkAge < 0.095) closure = 1;
      else closure = 1 - smoothstep((blinkAge - 0.095) / 0.11);
    }
    const gazeBlend = snap || reduced ? 1 : 1 - Math.exp(-delta * gazeResponse);
    instances.forEach((eye) => {
      eye.gaze.rotation.y = lerp(eye.gaze.rotation.y, reduced ? 0 : eye.targetYaw, gazeBlend);
      eye.gaze.rotation.x = lerp(eye.gaze.rotation.x, reduced ? 0 : eye.targetPitch, gazeBlend);
      eye.iris.visible = eye.pupil.visible = eye.glints.visible = !target.stars;
      eye.star.visible = target.stars;
      const upper = eye.lids.upperOpening * expression.upper * (1 - closure);
      const lower = eye.lids.lowerOpening * expression.lower * (1 - closure);
      const seam = expression.seam;
      if ([upper, lower, seam].some((value, index) => Math.abs(value - (eye.previousLids[index] ?? Infinity)) > 0.00001)) {
        updateLid(eye.upper.geometry, 1, eye.lids, upper, seam, eye.config.surfaceZ, eye.edgeDepth?.[0]);
        updateLid(eye.lower.geometry, -1, eye.lids, lower, seam, eye.config.surfaceZ, eye.edgeDepth?.[1]);
        updateLidRim(eye.rim.geometry, eye.lids, upper, seam, eye.config.surfaceZ);
        eye.previousLids = [upper, lower, seam];
      }
    });
  }
  paint(0, true);

  return {
    group,
    setGaze(x = 0, y = 0) {
      if (disposed) return;
      const yaw = clamp(Number.isFinite(x) ? x : 0, -1, 1) * maxYaw;
      const pitch = -clamp(Number.isFinite(y) ? y : 0, -1, 1) * maxPitch;
      instances.forEach((eye) => { eye.targetYaw = yaw; eye.targetPitch = pitch; });
    },
    setLookTarget(targetInHeadSpace) {
      if (disposed) return;
      const values = targetInHeadSpace?.isVector3 ? targetInHeadSpace.toArray() : targetInHeadSpace;
      if (!Array.isArray(values) || values.length !== 3 || !values.every(Number.isFinite)) throw new TypeError("Look target must be a finite local Vector3 or [x,y,z].");
      group.updateMatrixWorld(true);
      instances.forEach((eye) => {
        localTarget.fromArray(values).sub(eye.socket.position);
        localTarget.applyQuaternion(eye.socket.quaternion.clone().invert());
        // A target behind the face should not make pupils disappear into the head.
        eye.targetYaw = localTarget.z <= 0 ? 0 : clamp(Math.atan2(localTarget.x, localTarget.z), -maxYaw, maxYaw);
        eye.targetPitch = localTarget.z <= 0 ? 0 : clamp(-Math.atan2(localTarget.y, Math.hypot(localTarget.x, localTarget.z)), -maxPitch, maxPitch);
      });
    },
    setReaction(next) {
      if (disposed) return;
      currentReaction = EXPRESSIONS[next] ? next : "idle";
      paint(0, reduced);
    },
    setReducedMotion(next) {
      if (disposed) return;
      reduced = Boolean(next);
      blinkAge = Number.POSITIVE_INFINITY;
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
      nextBlink -= delta;
      if (nextBlink <= 0 && blinkAge >= 0.205) {
        blinkAge = 0;
        nextBlink = scheduleBlink();
      } else blinkAge += delta;
      paint(delta);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      group.removeFromParent();
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      group.clear();
    },
  };
}

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// The portrait is a real, closed sculpture. All dimensions are shared with the
// eye rig: +Z faces the camera, the eye line is y=.52 and the nose is z=.84.
const TAU = Math.PI * 2;
const gauss = (value, width) => Math.exp(-(value * value) / (2 * width * width));
const clamp = THREE.MathUtils.clamp;

function surface(rows, columns, sample, close = false) {
  const positions = [];
  const uv = [];
  const indices = [];
  for (let row = 0; row <= rows; row += 1) {
    for (let column = 0; column <= columns; column += 1) {
      positions.push(...sample(column / columns, row / rows));
      uv.push(column / columns, row / rows);
    }
  }
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const a = row * (columns + 1) + column;
      const b = a + columns + 1;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  // Average the UV seam so a rotating sculpture never reveals a lighting seam.
  if (close) {
    const normals = geometry.attributes.normal;
    for (let row = 0; row <= rows; row += 1) {
      const a = row * (columns + 1);
      const b = a + columns;
      const normal = new THREE.Vector3().fromBufferAttribute(normals, a)
        .add(new THREE.Vector3().fromBufferAttribute(normals, b)).normalize();
      normals.setXYZ(a, normal.x, normal.y, normal.z);
      normals.setXYZ(b, normal.x, normal.y, normal.z);
    }
  }
  return geometry;
}

function mesh(group, geometry, material, name) {
  const object = new THREE.Mesh(geometry, material);
  object.name = name;
  object.castShadow = true;
  object.receiveShadow = true;
  group.add(object);
  return object;
}

function ellipsoid(group, material, position, scale, name) {
  const object = mesh(group, new THREE.SphereGeometry(1, 24, 18), material, name);
  object.position.set(...position);
  object.scale.set(...scale);
  return object;
}

function pathTube(points, radius, segments = 28, radialSegments = 8, closed = false) {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)), closed);
  return new THREE.TubeGeometry(curve, segments, radius, radialSegments, closed);
}

// A tapered, slightly fluted lock has a broad sculpted highlight and a fine
// groove, unlike a string of spheres. Each tuft follows a continuous curve.
function hairLock(points, radius, phase = 0) {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
  const segments = 12;
  const frames = curve.computeFrenetFrames(segments, false);
  return surface(segments, 8, (u, v) => {
    const index = Math.min(segments, Math.round(v * segments));
    const point = curve.getPointAt(v);
    const profile = Math.pow(Math.sin(Math.PI * (0.34 + v * 0.66)), 0.72);
    const angle = u * TAU + phase + v * 0.5;
    const groove = 1 + 0.055 * Math.cos(angle * 3 + v * 2);
    const radial = radius * Math.max(0.004, profile) * groove;
    point.addScaledVector(frames.normals[index], Math.cos(angle) * radial * 0.50);
    point.addScaledVector(frames.binormals[index], Math.sin(angle) * radial);
    return point.toArray();
  }, true);
}

function createFaceGeometry() {
  return surface(76, 128, (u, v) => {
    const latitude = -Math.PI / 2 + Math.PI * v;
    const theta = u * TAU;
    const y = 0.36 + 0.95 * Math.sin(latitude);
    const ring = Math.cos(latitude);
    const jaw = 1 + 0.10 * gauss(y + 0.02, 0.24) - 0.055 * gauss(y + 0.48, 0.12);
    const x = 0.704 * ring * Math.sin(theta) * jaw;
    const front = Math.max(0, Math.cos(theta));
    let z = 0.54 * ring * Math.cos(theta);
    if (front > 0) {
      const blend = Math.pow(front, 4);
      const cheeks = 0.117 * (gauss(x - 0.405, 0.18) + gauss(x + 0.405, 0.18)) * gauss(y - 0.22, 0.20);
      const eyeSockets = 0.074 * (gauss(x - 0.30, 0.16) + gauss(x + 0.30, 0.16)) * gauss(y - 0.52, 0.105);
      const muzzle = 0.172 * gauss(x, 0.29) * gauss(y + 0.15, 0.12)
        + 0.070 * gauss(x, 0.28) * gauss(y + 0.34, 0.15);
      const browBone = 0.035 * (gauss(x - 0.30, 0.19) + gauss(x + 0.30, 0.19)) * gauss(y - 0.72, 0.08);
      const bridge = 0.128 * gauss(x, 0.074) * gauss(y - 0.395, 0.225);
      const noseTip = 0.200 * gauss(x, 0.10) * gauss(y - 0.16, 0.092);
      const noseWings = 0.076 * (gauss(x - 0.10, 0.045) + gauss(x + 0.10, 0.045)) * gauss(y - 0.12, 0.043);
      const philtrum = -0.011 * gauss(x, 0.024) * gauss(y + 0.025, 0.07);
      z += blend * (cheeks - eyeSockets + muzzle + browBone + bridge + noseTip + noseWings + philtrum);
    }
    return [x, y, z];
  }, true);
}

function beardPoint(theta, amount) {
  const side = Math.abs(Math.sin(theta));
  const back = Math.max(0, -Math.cos(theta));
  const top = -0.365 + 0.58 * Math.pow(side, 1.45) + 0.42 * back;
  const t = clamp(amount, 0, 1);
  return [
    0.686 * Math.sin(theta) * (1 - 0.60 * t * t),
    THREE.MathUtils.lerp(top, -0.725, t),
    0.593 * Math.cos(theta) * (1 - 0.32 * t * t) + 0.025,
  ];
}

function mergeStaticLocks(group) {
  const batches = new Map();
  for (const child of group.children) {
    if (!child.isMesh) continue;
    if (!batches.has(child.material)) batches.set(child.material, []);
    batches.get(child.material).push(child);
  }
  for (const [material, children] of batches) {
    if (children.length < 2) continue;
    const geometry = mergeGeometries(children.map((child) => child.geometry));
    mesh(group, geometry, material, 'Batched sculpted hair locks');
    for (const child of children) {
      group.remove(child);
      child.geometry.dispose();
    }
  }
}

function createHair(parent, hairMaterials) {
  const group = new THREE.Group();
  group.name = 'Full dimensional beard and curls';
  parent.add(group);
  mesh(group, surface(30, 112, (u, v) => beardPoint(u * TAU, 1 - v), true), hairMaterials[0], 'Sculpted continuous beard');
  // Four overlapping rows make the beard read as a mass of flowing locks.
  for (let row = 0; row < 4; row += 1) {
    const count = 50 - row * 5;
    for (let index = 0; index < count; index += 1) {
      const theta = ((index + 0.47 * (row % 2)) / count) * TAU + 0.014 * Math.sin(index * 3.71 + row);
      const start = Math.max(0, row * 0.19 + 0.035 * Math.sin(index * 2.19 + row * 1.3));
      const points = [];
      for (let step = 0; step <= 5; step += 1) {
        const t = step / 5;
        const curl = 0.10 * Math.sin(t * Math.PI * 1.3 + row * 0.8 + index * 0.48) * t;
        const point = beardPoint(theta + curl, start + t * (0.30 - row * 0.012));
        point[0] += Math.sin(theta) * (0.003 + 0.017 * Math.sin(t * Math.PI));
        point[2] += Math.cos(theta) * (0.006 + 0.012 * Math.sin(t * Math.PI));
        points.push(point);
      }
      mesh(group, hairLock(points, 0.030 + 0.006 * Math.sin(index * 2.4 + row), index), hairMaterials[(index + row) % hairMaterials.length], 'Flowing beard lock');
    }
  }
  // Individual tapering hairs feather the cheek line into the skin.
  for (const side of [-1, 1]) {
    for (let index = 0; index < 16; index += 1) {
      const theta = side * (0.45 + index / 16 * 1.06);
      const first = beardPoint(theta, 0);
      first[1] += 0.028 + 0.02 * Math.sin(index * 2.5);
      const second = beardPoint(theta + side * 0.025, 0.14);
      const third = beardPoint(theta - side * 0.04, 0.27);
      [first, second, third].forEach((point) => { point[2] += 0.025 * Math.cos(theta); });
      mesh(group, hairLock([first, second, third], 0.018, index), hairMaterials[index % 4], 'Soft cheek hairline');
    }
    // Broad S-shaped side curls remain three-dimensional at profile and rear.
    for (let row = 0; row < 5; row += 1) {
      for (let depth = 0; depth < 3; depth += 1) {
        const y = 0.23 - row * 0.145;
        const z = 0.13 - depth * 0.22;
        const x = side * (0.666 - depth * 0.027 - row * 0.009);
        const points = [
          [x, y + 0.09, z],
          [x + side * 0.065, y + 0.045, z + 0.035],
          [x + side * 0.08, y - 0.065, z + 0.08],
          [x + side * 0.015, y - 0.14, z + 0.10],
          [x - side * 0.03, y - 0.105, z + 0.105],
        ];
        mesh(group, hairLock(points, 0.050, row * 0.3), hairMaterials[(row + depth) % 4], 'Sculpted side curl');
      }
    }
  }

  const moustache = new THREE.Group();
  moustache.name = 'Swept moustache';
  group.add(moustache);
  for (const side of [-1, 1]) {
    mesh(moustache, hairLock([
      [side * 0.016, -0.017, 0.709],
      [side * 0.098, -0.014, 0.727],
      [side * 0.210, -0.061, 0.688],
      [side * 0.286, -0.111, 0.639],
      [side * 0.305, -0.205, 0.613],
    ], 0.068, 0.5), hairMaterials[0], 'Moustache body');
    for (let index = 0; index < 13; index += 1) {
      const fraction = index / 12;
      const points = [
        [side * (0.005 + fraction * 0.035), 0.006 - fraction * 0.071, 0.743 - fraction * 0.005],
        [side * (0.09 + fraction * 0.038), 0.005 - fraction * 0.059, 0.758 - fraction * 0.009],
        [side * (0.17 + fraction * 0.06), -0.038 - fraction * 0.057, 0.725 - fraction * 0.011],
        [side * (0.23 + fraction * 0.067), -0.084 - fraction * 0.075, 0.660 - fraction * 0.009],
      ];
      mesh(moustache, hairLock(points, 0.010 + fraction * 0.005, index), hairMaterials[index % 4], 'Individual moustache sweep');
    }
  }
  for (let index = 0; index < 9; index += 1) {
    const x = (index - 4) * 0.017;
    mesh(group, hairLock([
      [x, -0.288 + Math.abs(x) * 0.15, 0.636],
      [x * 0.65, -0.342, 0.647],
      [x * 0.3, -0.388, 0.616],
    ], 0.014, index), hairMaterials[index % 4], 'Small soul patch');
  }
  mergeStaticLocks(moustache);
  mergeStaticLocks(group);
  return moustache;
}

function createMouth(group) {
  const lipMaterial = new THREE.MeshPhysicalMaterial({ color: '#bf7762', roughness: 0.54, clearcoat: 0.05, clearcoatRoughness: 0.6 });
  const innerMaterial = new THREE.MeshStandardMaterial({ color: '#542825', roughness: 0.95 });
  const teethMaterial = new THREE.MeshStandardMaterial({ color: '#fff5e6', roughness: 0.4 });
  const mouth = new THREE.Group();
  mouth.name = 'Expressive sculpted smile';
  group.add(mouth);
  const mouthState = { open: 0, smile: 0.72 };
  const sampleLip = (lower) => (u, v) => {
    const nx = u * 2 - 1;
    const weight = Math.max(0, 1 - nx * nx);
    const curve = -0.177 + (0.039 + mouthState.smile * 0.039) * nx * nx;
    const innerY = curve - (lower ? mouthState.open * weight + 0.002 : 0);
    const thickness = (lower ? 0.026 : 0.019) * Math.pow(weight, 0.65);
    const y = innerY + (lower ? -1 : 1) * thickness * v;
    const z = 0.642 + 0.026 * weight + Math.sin(v * Math.PI) * 0.013 * weight - 0.012 * v;
    return [nx * 0.238, y, z];
  };
  const upper = mesh(mouth, surface(7, 48, sampleLip(false)), lipMaterial, 'Upper lip');
  const lower = mesh(mouth, surface(7, 48, sampleLip(true)), lipMaterial, 'Lower lip');
  // Flip the upper ribbon so both lip surfaces face the viewer.
  upper.material.side = THREE.DoubleSide;
  const opening = mesh(mouth, surface(1, 48, (u, v) => {
    const nx = u * 2 - 1;
    const weight = 1 - nx * nx;
    const y = -0.177 + (0.039 + mouthState.smile * 0.039) * nx * nx - v * (mouthState.open * weight + 0.006);
    return [nx * 0.236, y, 0.652 + 0.008 * weight];
  }), innerMaterial, 'Smile opening');
  innerMaterial.side = THREE.DoubleSide;
  const teeth = mesh(mouth, new THREE.PlaneGeometry(0.325, 0.045, 8, 1), teethMaterial, 'Upper teeth');
  teeth.position.set(0, -0.19, 0.662);
  teeth.visible = false;
  function updateGeometry(object, sample) {
    const attribute = object.geometry.attributes.position;
    const rows = 7;
    const columns = 48;
    for (let row = 0; row <= rows; row += 1) {
      for (let column = 0; column <= columns; column += 1) {
        attribute.setXYZ(row * (columns + 1) + column, ...sample(column / columns, row / rows));
      }
    }
    attribute.needsUpdate = true;
    object.geometry.computeVertexNormals();
  }
  return {
    set(open, smile) {
      mouthState.open = open;
      mouthState.smile = smile;
      updateGeometry(upper, sampleLip(false));
      updateGeometry(lower, sampleLip(true));
      const attribute = opening.geometry.attributes.position;
      for (let row = 0; row <= 1; row += 1) {
        for (let column = 0; column <= 48; column += 1) {
          const nx = column / 24 - 1;
          const weight = 1 - nx * nx;
          attribute.setXYZ(row * 49 + column, nx * 0.236,
            -0.177 + (0.039 + smile * 0.039) * nx * nx - row * (open * weight + 0.006), 0.652 + 0.008 * weight);
        }
      }
      attribute.needsUpdate = true;
      teeth.visible = open > 0.045;
      teeth.scale.y = Math.min(1, open / 0.09);
    },
  };
}

function createBrows(group, hairMaterials) {
  const brows = [];
  for (const side of [-1, 1]) {
    const brow = new THREE.Group();
    brow.name = side < 0 ? 'Left expressive brow' : 'Right expressive brow';
    group.add(brow);
    mesh(brow, hairLock([
      [side * 0.12, 0.741, 0.554],
      [side * 0.23, 0.775, 0.568],
      [side * 0.39, 0.780, 0.537],
      [side * 0.53, 0.734, 0.465],
    ], 0.048), hairMaterials[0], 'Sculpted brow mass');
    for (let index = 0; index < 25; index += 1) {
      const t = index / 24;
      const x = side * (0.128 + t * 0.382);
      const y = 0.739 + 0.043 * Math.sin(t * Math.PI);
      const z = 0.562 - 0.10 * t * t;
      mesh(brow, hairLock([
        [x, y - 0.023, z + 0.013],
        [x + side * 0.014, y + 0.013, z + 0.029],
        [x + side * 0.050, y + 0.030, z + 0.007],
      ], 0.010, t), hairMaterials[index % 4], 'Combed eyebrow hair');
    }
    mergeStaticLocks(brow);
    brows.push(brow);
  }
  return brows;
}

function createGlasses(group) {
  const glasses = new THREE.Group();
  glasses.name = 'Silver rounded rectangular eyeglasses';
  glasses.position.z = -0.075;
  group.add(glasses);
  const metal = new THREE.MeshPhysicalMaterial({ color: '#bfcbd4', metalness: 0.93, roughness: 0.22, clearcoat: 0.5 });
  const innerMetal = new THREE.MeshStandardMaterial({ color: '#35404b', metalness: 0.75, roughness: 0.27 });
  const lensMaterial = new THREE.MeshPhysicalMaterial({
    color: '#e5f4ff', metalness: 0, roughness: 0.07, transparent: true,
    opacity: 0.075, transmission: 0, thickness: 0.015, ior: 1.45,
    depthWrite: false, side: THREE.DoubleSide,
  });
  for (const side of [-1, 1]) {
    const centerX = side * 0.327;
    const outline = [];
    const lensShape = new THREE.Shape();
    for (let index = 0; index < 64; index += 1) {
      const angle = index / 64 * TAU;
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      const y = 0.205 * Math.sign(sine) * Math.pow(Math.abs(sine), 0.58);
      const x = 0.270 * Math.sign(cosine) * Math.pow(Math.abs(cosine), 0.59) * (1 + y * 0.10);
      outline.push([centerX + x, 0.505 + y, 0.778 - 0.06 * Math.pow((centerX + x) / 0.66, 2)]);
      if (index === 0) lensShape.moveTo(x, y);
      else lensShape.lineTo(x, y);
    }
    lensShape.closePath();
    mesh(glasses, pathTube(outline, 0.016, 80, 8, true), innerMetal, 'Dark inset frame edge');
    const silver = outline.map(([x, y, z]) => [x, y, z + 0.008]);
    mesh(glasses, pathTube(silver, 0.009, 80, 8, true), metal, 'Polished silver lens rim');
    const lens = mesh(glasses, new THREE.ShapeGeometry(lensShape, 48), lensMaterial, 'Clear optical lens');
    lens.position.set(centerX, 0.505, 0.767);
    lens.castShadow = false;
    lens.receiveShadow = false;
    const hinge = mesh(glasses, new THREE.BoxGeometry(0.068, 0.041, 0.034), metal, 'Frame hinge');
    hinge.position.set(side * 0.624, 0.579, 0.710);
    mesh(glasses, pathTube([
      [side * 0.611, 0.579, 0.709],
      [side * 0.678, 0.575, 0.574],
      [side * 0.711, 0.565, 0.33],
      [side * 0.696, 0.526, 0.185],
    ], 0.015, 28), metal, 'Glasses temple arm');
    ellipsoid(glasses, metal, [side * 0.087, 0.41, 0.738], [0.021, 0.037, 0.017], 'Nose pad mount');
  }
  mesh(glasses, pathTube([
    [-0.067, 0.561, 0.795], [-0.043, 0.586, 0.812], [0, 0.594, 0.819],
    [0.043, 0.586, 0.812], [0.067, 0.561, 0.795],
  ], 0.012, 28), metal, 'Saddle bridge');
  return glasses;
}

export function createAvatarHead() {
  const group = new THREE.Group();
  group.name = 'Hand sculpted portrait head';
  const skinMaterial = new THREE.MeshPhysicalMaterial({
    color: '#e8b58d', roughness: 0.63, metalness: 0, clearcoat: 0.06,
    clearcoatRoughness: 0.65, sheen: 0.20, sheenColor: '#ffd1b7', sheenRoughness: 0.85,
  });
  const warmSkin = new THREE.MeshStandardMaterial({ color: '#b66d51', roughness: 0.78 });
  const hairMaterials = ['#493428', '#533c2e', '#594030', '#4e382b'].map((color) => new THREE.MeshPhysicalMaterial({
    color, roughness: 0.64, metalness: 0, sheen: 0.35, sheenColor: '#ad8663', sheenRoughness: 0.75,
  }));
  mesh(group, createFaceGeometry(), skinMaterial, 'Unified sculpted face and nose');
  for (const side of [-1, 1]) {
    const ear = new THREE.Group();
    ear.name = 'Modeled ear';
    ear.position.set(side * 0.655, 0.25, -0.007);
    ear.rotation.z = -side * 0.08;
    group.add(ear);
    ellipsoid(ear, skinMaterial, [0, 0, 0], [0.125, 0.215, 0.117], 'Ear outer form');
    ellipsoid(ear, warmSkin, [side * 0.025, 0.015, 0.091], [0.061, 0.135, 0.03], 'Concha recess');
    mesh(ear, pathTube([
      [side * 0.025, -0.13, 0.121], [side * 0.074, -0.063, 0.137],
      [side * 0.077, 0.083, 0.137], [side * 0.039, 0.166, 0.108],
      [-side * 0.006, 0.12, 0.10],
    ], 0.019, 28), skinMaterial, 'Ear helix');
    // Small recessed nostrils are tucked under the nose, not painted on it.
    const nostril = ellipsoid(group, warmSkin, [side * 0.092, 0.092, 0.781], [0.030, 0.012, 0.021], 'Nostril recess');
    nostril.rotation.z = -side * 0.2;
  }
  const moustache = createHair(group, hairMaterials);
  const mouth = createMouth(group);
  const brows = createBrows(group, hairMaterials);
  createGlasses(group);
  let previousExpression = '';
  let previousAmount = -1;
  return {
    group,
    skinMaterial,
    eyeSockets: [
      { center: [-0.30, 0.52, 0.49], radii: [0.18, 0.145, 0.105] },
      { center: [0.30, 0.52, 0.49], radii: [0.18, 0.145, 0.105] },
    ],
    setExpression(name = 'happy', amount = 1) {
      const intensity = clamp(amount, 0, 1);
      if (name === previousExpression && Math.abs(previousAmount - intensity) < 0.005) return;
      previousExpression = name;
      previousAmount = intensity;
      const excited = ['excited', 'delighted', 'celebrate', 'celebrating', 'surprised', 'wow'].includes(name);
      const thoughtful = ['thoughtful', 'thinking', 'curious', 'focused'].includes(name);
      const sad = ['sad', 'concerned', 'worried', 'empathetic'].includes(name);
      const open = excited ? 0.074 * intensity : 0.002;
      const smile = excited ? 0.98 : thoughtful ? 0.25 : sad ? -0.3 : 0.72;
      mouth.set(open, smile);
      brows.forEach((brow, index) => {
        brow.position.y = excited ? intensity * 0.066 : thoughtful ? (index === 0 ? 0.025 : -0.011) * intensity : sad ? 0.016 : 0;
        brow.rotation.z = thoughtful ? (index === 0 ? -0.035 : -0.02) * intensity : 0;
      });
      moustache.position.y = excited ? 0.007 * intensity : 0;
    },
  };
}

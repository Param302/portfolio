import * as THREE from 'three';

const TAU = Math.PI * 2;
const V = (point) => new THREE.Vector3(...point);
const mix = THREE.MathUtils.lerp;

function material(color, options = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.8,
    metalness: 0,
    sheen: 0.22,
    sheenRoughness: 0.82,
    sheenColor: new THREE.Color(color).lerp(new THREE.Color('#fff4db'), 0.25),
    ...options,
  });
}

function mesh(geometry, surface, name) {
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  const item = new THREE.Mesh(geometry, surface);
  item.name = name;
  item.castShadow = true;
  item.receiveShadow = true;
  return item;
}

// Two sampled surfaces joined at every boundary make a closed cloth volume.
function closedSurface(sample, widthSteps, lengthSteps, thickness = 0.04) {
  const positions = [];
  const uv = [];
  const indices = [];
  const stride = widthSteps + 1;
  const surfaceSize = stride * (lengthSteps + 1);
  for (let side = 0; side < 2; side += 1) {
    for (let j = 0; j <= lengthSteps; j += 1) {
      for (let i = 0; i <= widthSteps; i += 1) {
        const u = i / widthSteps;
        const t = j / lengthSteps;
        const point = sample(u, t, side, thickness);
        positions.push(point.x, point.y, point.z);
        uv.push(u, t);
      }
    }
  }
  for (let j = 0; j < lengthSteps; j += 1) {
    for (let i = 0; i < widthSteps; i += 1) {
      const a = j * stride + i;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      indices.push(a, b, c, b, d, c);
      indices.push(a + surfaceSize, c + surfaceSize, b + surfaceSize,
        b + surfaceSize, c + surfaceSize, d + surfaceSize);
    }
  }
  const join = (a, b) => indices.push(a, a + surfaceSize, b,
    b, a + surfaceSize, b + surfaceSize);
  for (let i = 0; i < widthSteps; i += 1) {
    join(i + 1, i);
    join(lengthSteps * stride + i, lengthSteps * stride + i + 1);
  }
  for (let j = 0; j < lengthSteps; j += 1) {
    join(j * stride, (j + 1) * stride);
    join((j + 1) * stride + widthSteps, j * stride + widthSteps);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  return geometry;
}

function panel(left, right, { bulge = 0.045, thickness = 0.038 } = {}) {
  const a = new THREE.CatmullRomCurve3(left.map(V));
  const b = new THREE.CatmullRomCurve3(right.map(V));
  const geometry = closedSurface((u, t, side, depth) => {
    const point = a.getPoint(t).lerp(b.getPoint(t), u);
    point.z += Math.sin(Math.PI * u) * bulge - side * depth;
    return point;
  }, 20, 44, thickness);
  // Mirrored lapels and upward/downward panels retain outward front normals.
  const across = b.getPoint(0.5).sub(a.getPoint(0.5));
  if (across.cross(a.getTangent(0.5)).z < 0) {
    const indices = geometry.index.array;
    for (let i = 0; i < indices.length; i += 3) {
      [indices[i + 1], indices[i + 2]] = [indices[i + 2], indices[i + 1]];
    }
  }
  return geometry;
}

// Elliptical sections give the wraps real rolled edges and deep cloth valleys.
function fold(points, width, depth, { rear = false, taper = 0.2 } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map(V));
  const positions = [];
  const uv = [];
  const indices = [];
  const lengthSteps = 90;
  const around = 20;
  const outward = new THREE.Vector3();
  const across = new THREE.Vector3();
  for (let i = 0; i <= lengthSteps; i += 1) {
    const t = i / lengthSteps;
    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();
    if (rear) outward.set(point.x, 0.09, point.z + 0.07).normalize();
    else outward.set(0, 0, 1);
    across.crossVectors(tangent, outward).normalize();
    outward.crossVectors(across, tangent).normalize();
    const amount = Math.max(0.005, Math.pow(Math.sin(Math.PI * t), taper));
    for (let k = 0; k <= around; k += 1) {
      const angle = k / around * TAU;
      const subtleCrease = 1 + 0.035 * Math.cos(angle * 3 + t * 2);
      const p = point.clone()
        .addScaledVector(across, Math.cos(angle) * width * amount)
        .addScaledVector(outward, Math.sin(angle) * depth * amount * subtleCrease);
      positions.push(p.x, p.y, p.z);
      uv.push(k / around, t * 3);
    }
  }
  for (let i = 0; i < lengthSteps; i += 1) {
    for (let k = 0; k < around; k += 1) {
      const a = i * (around + 1) + k;
      const b = a + around + 1;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  // The small end rings are capped so there are no open ribbon edges.
  for (const end of [0, lengthSteps]) {
    const start = end * (around + 1);
    for (let k = 1; k < around - 1; k += 1) {
      if (end === 0) indices.push(start, start + k, start + k + 1);
      else indices.push(start, start + k + 1, start + k);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  return geometry;
}

function seam(points, radius, surface, name) {
  const curve = new THREE.CatmullRomCurve3(points.map(V));
  return mesh(new THREE.TubeGeometry(curve, 48, radius, 7, false), surface, name);
}

function makeTurban(gold, goldLight, navy) {
  const turban = new THREE.Group();
  turban.name = 'Wrapped golden turban';
  const contour = [[0.22, 0.86], [0.48, 0.99], [0.98, 1.045], [1.39, 0.99], [1.68, 0.845], [1.89, 0.56], [2.065, 0]];
  const radiusAtHeight = (y) => {
    const index = Math.min(contour.length - 2, Math.max(0, contour.findIndex((point) => point[0] >= y) - 1));
    const before = contour[Math.max(0, index - 1)];
    const a = contour[index];
    const b = contour[index + 1];
    const after = contour[Math.min(contour.length - 1, index + 2)];
    const t = THREE.MathUtils.clamp((y - a[0]) / (b[0] - a[0]), 0, 1);
    const distance = b[0] - a[0];
    const slopeA = (b[1] - before[1]) / (b[0] - before[0]);
    const slopeB = (after[1] - a[1]) / (after[0] - a[0]);
    return (2 * t ** 3 - 3 * t ** 2 + 1) * a[1]
      + (t ** 3 - 2 * t ** 2 + t) * distance * slopeA
      + (-2 * t ** 3 + 3 * t ** 2) * b[1]
      + (t ** 3 - t ** 2) * distance * slopeB;
  };
  // A continuous shaped shell follows the opening around the forehead and temples.
  // Its contour is defined by height, so the diagonal front folds are supported
  // around their sides too. Rear pleats are sculpted into this same continuous mesh.
  const shell = closedSurface((u, v, side) => {
    const angle = (u - 0.5) * TAU;
    const frontDistance = Math.abs(angle);
    const lowerY = 0.22 + 1.22 * Math.exp(-((frontDistance / 0.73) ** 2));
    const y = mix(lowerY, 2.065, v);
    const rearAmount = THREE.MathUtils.smoothstep(Math.abs(angle), 0.85, 1.6);
    const ripple = 0.014 * (1 - v) * rearAmount * Math.sin((y - 0.22) * 22 + 0.32 * Math.sin(angle));
    const radius = (radiusAtHeight(y) + ripple) * (1 - side * 0.047);
    const cosine = Math.cos(angle);
    const depth = 0.77 * cosine + 0.06 * cosine ** 2;
    return new THREE.Vector3(
      Math.sin(angle) * radius,
      y,
      -0.07 + depth * radius,
    );
  }, 120, 70, 0.04);
  turban.add(mesh(shell, gold, 'Continuous sculpted turban wrap'));

  // Navy fabric has a curved lower hairline and the characteristic center triangle.
  const undercap = panel(
    [[-0.32, 1.045, 0.637], [-0.20, 1.20, 0.672], [-0.025, 1.455, 0.688]],
    [[0.32, 1.045, 0.637], [0.20, 1.20, 0.672], [0.025, 1.455, 0.688]],
    { bulge: 0.027, thickness: 0.055 },
  );
  turban.add(mesh(undercap, navy, 'Navy undercap triangle'));
  turban.add(seam([[-0.31, 1.047, 0.659], [0, 1.071, 0.681], [0.31, 1.047, 0.659]], 0.007, navy, 'Undercap folded hem'));

  const leftWraps = [
    [[-0.88, 0.27, 0.21], [-1.005, 0.66, 0.31], [-0.95, 1.17, 0.35], [-0.72, 1.65, 0.35], [-0.34, 1.91, 0.32], [0.055, 2.018, 0.29]],
    [[-0.835, 0.255, 0.37], [-0.91, 0.63, 0.50], [-0.795, 1.08, 0.585], [-0.50, 1.54, 0.59], [-0.14, 1.80, 0.51], [0.12, 1.915, 0.41]],
    [[-0.77, 0.25, 0.48], [-0.78, 0.62, 0.63], [-0.61, 1.02, 0.704], [-0.32, 1.41, 0.716], [0.005, 1.68, 0.64], [0.17, 1.78, 0.57]],
    [[-0.71, 0.255, 0.55], [-0.635, 0.60, 0.70], [-0.43, 0.94, 0.76], [-0.14, 1.29, 0.78], [0.11, 1.58, 0.745], [0.19, 1.71, 0.65]],
  ];
  const rightWraps = [
    [[0.12, 1.99, 0.25], [0.54, 1.86, 0.32], [0.83, 1.56, 0.37], [1.005, 1.12, 0.36], [1.02, 0.66, 0.29], [0.91, 0.28, 0.19]],
    [[0.12, 1.82, 0.48], [0.49, 1.65, 0.57], [0.75, 1.31, 0.595], [0.88, 0.91, 0.53], [0.92, 0.53, 0.41], [0.85, 0.255, 0.29]],
    [[0.09, 1.65, 0.64], [0.40, 1.45, 0.71], [0.62, 1.11, 0.714], [0.77, 0.76, 0.66], [0.82, 0.43, 0.52], [0.78, 0.245, 0.39]],
    [[0.055, 1.49, 0.721], [0.30, 1.25, 0.77], [0.50, 0.95, 0.79], [0.65, 0.64, 0.725], [0.725, 0.38, 0.61], [0.735, 0.24, 0.47]],
  ];
  leftWraps.forEach((points, index) => turban.add(mesh(
    fold(points, 0.134 - index * 0.006, 0.032),
    index % 2 ? gold : goldLight,
    `Left overlapping cloth pleat ${index + 1}`,
  )));
  rightWraps.forEach((points, index) => turban.add(mesh(
    fold(points, 0.132 - index * 0.007, 0.032),
    index % 2 ? goldLight : gold,
    `Right overlapping cloth pleat ${index + 1}`,
  )));

  const flap = panel(
    [[-0.18, 2.015, 0.20], [-0.065, 1.91, 0.49], [0.007, 1.775, 0.68], [-0.045, 1.60, 0.80], [-0.15, 1.442, 0.795]],
    [[0.27, 1.99, 0.19], [0.29, 1.88, 0.46], [0.226, 1.72, 0.68], [0.115, 1.55, 0.82], [-0.105, 1.43, 0.806]],
    { bulge: 0.062, thickness: 0.045 },
  );
  turban.add(mesh(flap, goldLight, 'Folded center turban flap'));
  turban.add(mesh(fold([
    [-0.175, 2.012, 0.229], [-0.095, 1.93, 0.476], [-0.018, 1.797, 0.703], [-0.059, 1.625, 0.828], [-0.147, 1.465, 0.827],
  ], 0.025, 0.021, { taper: 0.25 }), gold, 'Flap rolled inner edge'));
  return turban;
}

function plaidTexture() {
  const size = 256;
  const pixels = new Uint8Array(size * size * 4);
  const paper = new THREE.Color('#f3f3e7');
  const blue = new THREE.Color('#567f9b');
  const green = new THREE.Color('#536f5b');
  const ochre = new THREE.Color('#a29555');
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const color = paper.clone();
      for (const position of [x, y]) {
        const p = position / 2;
        if (p >= 17 && p < 37) color.lerp(blue, 0.9);
        if (p >= 46 && p < 50) color.lerp(blue, 0.75);
        if (p >= 72 && p < 86) color.lerp(green, 0.84);
        if (p >= 91 && p < 100) color.lerp(ochre, 0.8);
        if (p >= 109 && p < 112) color.lerp(green, 0.52);
      }
      color.multiplyScalar(0.97 + ((x + y) % 2) * 0.03);
      color.convertLinearToSRGB();
      const offset = (y * size + x) * 4;
      pixels[offset] = Math.round(color.r * 255);
      pixels[offset + 1] = Math.round(color.g * 255);
      pixels[offset + 2] = Math.round(color.b * 255);
      pixels[offset + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

const bodyProfile = new THREE.CatmullRomCurve3([
  [1.51, -1.76, 0.445], [1.51, -1.59, 0.46], [1.38, -1.32, 0.46],
  [1.01, -1.095, 0.425], [0.61, -0.91, 0.335], [0.35, -0.74, 0.225], [0.285, -0.64, 0.19],
].map(V));

function torso(jacket) {
  const geometry = closedSurface((u, t, side) => {
    const profile = bodyProfile.getPoint(t);
    const openAngle = jacket
      ? mix(0.255, 0.72, t ** 2)
      : 0.8 * THREE.MathUtils.smoothstep(t, 0.42, 1);
    const angle = openAngle + u * (TAU - 2 * openAngle);
    const inset = (jacket ? 0 : 0.043) + side * 0.027;
    const width = profile.x - inset;
    const frontDepth = profile.z - inset;
    const rearDepth = mix(0.62, 0.23, t) - inset;
    const cosine = Math.cos(angle);
    const z = cosine * (frontDepth + rearDepth) / 2
      + cosine ** 2 * (frontDepth - rearDepth) / 2;
    return new THREE.Vector3(
      Math.sin(angle) * width,
      profile.y,
      z - 0.065,
    );
  }, 100, 56, 0.027);
  const uv = geometry.getAttribute('uv');
  const position = geometry.getAttribute('position');
  for (let i = 0; i < uv.count; i += 1) {
    uv.setXY(i, position.getX(i) * 1.85, position.getY(i) * 1.65);
  }
  return geometry;
}

function texturedPanel(left, right, options) {
  const geometry = panel(left, right, options);
  const positions = geometry.getAttribute('position');
  const uv = geometry.getAttribute('uv');
  for (let i = 0; i < uv.count; i += 1) {
    uv.setXY(i, positions.getX(i) * 1.85, positions.getY(i) * 1.65);
  }
  return geometry;
}

function makeBody(ivory, ivorySeam, navy) {
  const body = new THREE.Group();
  body.name = 'Ivory jacket and checked shirt';
  body.scale.x = 1.15;
  const shirt = material('#ffffff', { map: plaidTexture(), roughness: 0.91, sheen: 0.13 });
  const skin = material('#e8b58d', { roughness: 0.6, sheen: 0.04 });
  const neck = mesh(new THREE.SphereGeometry(1, 40, 32), skin, 'Warm skin neck');
  neck.position.set(0, -0.73, -0.07);
  neck.scale.set(0.25, 0.45, 0.24);
  body.add(neck);
  body.add(mesh(torso(false), shirt, 'Full checked shirt torso'));
  body.add(mesh(torso(true), ivory, 'Open ivory jacket with rounded shoulders'));

  const mirror = (points, sign) => points.map(([x, y, z]) => [x * sign, y, z]);
  for (const sign of [-1, 1]) {
    const name = sign < 0 ? 'Left' : 'Right';
    const collarInner = [[0.26, -0.61, 0.105], [0.31, -0.80, 0.265], [0.355, -1.08, 0.405], [0.37, -1.36, 0.435], [0.405, -1.755, 0.425]];
    const collarOuter = [[0.37, -0.56, 0.075], [0.53, -0.79, 0.25], [0.60, -1.095, 0.38], [0.54, -1.405, 0.414], [0.47, -1.755, 0.425]];
    body.add(mesh(panel(mirror(collarInner, sign), mirror(collarOuter, sign), { bulge: 0.065, thickness: 0.042 }), ivory, `${name} thick raised jacket collar`));
    const trimInner = [[0.237, -0.76, 0.225], [0.255, -0.965, 0.367], [0.292, -1.225, 0.421], [0.337, -1.49, 0.432], [0.362, -1.755, 0.431]];
    const trimOuter = [[0.301, -0.76, 0.246], [0.331, -0.965, 0.389], [0.363, -1.225, 0.434], [0.404, -1.49, 0.441], [0.426, -1.755, 0.43]];
    body.add(mesh(panel(mirror(trimInner, sign), mirror(trimOuter, sign), { bulge: 0.023, thickness: 0.027 }), navy, `${name} navy inner jacket binding`));

    const shirtInner = [[0.20, -0.76, 0.199], [0.18, -0.94, 0.33], [0.12, -1.12, 0.39], [0.145, -1.25, 0.381]];
    const shirtOuter = [[0.27, -0.765, 0.185], [0.345, -0.975, 0.339], [0.31, -1.125, 0.417], [0.195, -1.265, 0.406]];
    body.add(mesh(texturedPanel(mirror(shirtInner, sign), mirror(shirtOuter, sign), { bulge: 0.034, thickness: 0.026 }), shirt, `${name} folded plaid shirt collar`));

    const shoulderSeam = mirror([[0.62, -0.98, 0.278], [0.875, -1.105, 0.307], [1.075, -1.275, 0.294], [1.195, -1.49, 0.258], [1.22, -1.755, 0.242]], sign);
    body.add(seam(shoulderSeam, 0.008, ivorySeam, `${name} raglan shoulder seam`));
    body.add(seam(mirror([[0.409, -1.03, 0.456], [0.425, -1.275, 0.486], [0.435, -1.52, 0.484], [0.446, -1.752, 0.453]], sign), 0.005, ivorySeam, `${name} collar edge topstitch`));

    // Small individual zipper teeth catch the studio light without a painted line.
    const zipperMetal = material('#526174', { roughness: 0.36, metalness: 0.55, sheen: 0 });
    const teeth = new THREE.InstancedMesh(new THREE.BoxGeometry(0.014, 0.014, 0.011), zipperMetal, 29);
    teeth.name = `${name} individual zipper teeth`;
    teeth.castShadow = true;
    teeth.receiveShadow = true;
    const transform = new THREE.Object3D();
    for (let tooth = 0; tooth < 29; tooth += 1) {
      const t = tooth / 28;
      const y = mix(-1.0, -1.73, t);
      const x = mix(0.27, 0.365, t) * sign;
      transform.position.set(x, y, mix(0.393, 0.45, Math.min(t * 2, 1)));
      transform.rotation.z = -sign * 0.1;
      transform.updateMatrix();
      teeth.setMatrixAt(tooth, transform.matrix);
    }
    teeth.computeBoundingBox();
    teeth.computeBoundingSphere();
    body.add(teeth);
  }

  const placket = texturedPanel(
    [[-0.025, -1.255, 0.355], [-0.039, -1.51, 0.367], [-0.051, -1.755, 0.365]],
    [[0.049, -1.255, 0.36], [0.035, -1.51, 0.381], [0.027, -1.755, 0.375]],
    { bulge: 0.012, thickness: 0.018 },
  );
  body.add(mesh(placket, shirt, 'Checked shirt center placket'));
  const buttonMaterial = material('#e9ebdd', { roughness: 0.45, sheen: 0 });
  for (const [x, y, z] of [[-0.19, -1.115, 0.448], [0.0, -1.50, 0.397]]) {
    const button = mesh(new THREE.CylinderGeometry(0.027, 0.027, 0.008, 24), buttonMaterial, 'Ivory shirt button');
    button.rotation.x = Math.PI / 2;
    button.position.set(x, y, z);
    body.add(button);
  }
  return body;
}

export function createAvatarWardrobe() {
  const gold = material('#e3ad4b', { roughness: 0.81, sheen: 0.26 });
  const goldLight = material('#efbb57', { roughness: 0.82, sheen: 0.28 });
  const navy = material('#252e49', { roughness: 0.86, sheen: 0.15 });
  const ivory = material('#e9e7e0', { roughness: 0.86, sheen: 0.26 });
  const ivorySeam = material('#cecdc6', { roughness: 0.88, sheen: 0.1 });
  return {
    turban: makeTurban(gold, goldLight, navy),
    body: makeBody(ivory, ivorySeam, navy),
  };
}

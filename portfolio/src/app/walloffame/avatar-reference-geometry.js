import * as THREE from "three";

export const REFERENCE_SIZE = 1254;
export const PIXEL_SCALE = 4 / REFERENCE_SIZE;

export function pixelToWorld(x, y, z = 0) {
  return new THREE.Vector3((x - REFERENCE_SIZE / 2) * PIXEL_SCALE, (REFERENCE_SIZE / 2 - y) * PIXEL_SCALE, z);
}

export function smoothOutline(points, steps = 4) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(x, y, 0)), true, "centripetal");
  return curve.getPoints(points.length * steps).slice(0, -1).map(({ x, y }) => [x, y]);
}

// The reference coordinates are permanent UVs on the sculpture. They do not
// follow the camera; rotating the portrait exposes its modeled sides and back.
export function createProjectedSurface({ outline, holes = [], frontDepth, maxEdge = 20 }) {
  const contour = outline.map(([x, y]) => new THREE.Vector2(x, y));
  const holePoints = holes.map((ring) => ring.map(([x, y]) => new THREE.Vector2(x, y)));
  const points = [...contour, ...holePoints.flat()];
  const triangles = THREE.ShapeUtils.triangulateShape(contour, holePoints);
  const midpointCache = new Map();
  const indices = [];

  function midpoint(a, b) {
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (midpointCache.has(key)) return midpointCache.get(key);
    const index = points.length;
    points.push(points[a].clone().add(points[b]).multiplyScalar(0.5));
    midpointCache.set(key, index);
    return index;
  }
  function refine(a, b, c) {
    const ab = points[a].distanceToSquared(points[b]);
    const bc = points[b].distanceToSquared(points[c]);
    const ca = points[c].distanceToSquared(points[a]);
    if (Math.max(ab, bc, ca) <= maxEdge * maxEdge) {
      const signed = (points[b].x - points[a].x) * (points[c].y - points[a].y)
        - (points[b].y - points[a].y) * (points[c].x - points[a].x);
      indices.push(...(signed > 0 ? [a, c, b] : [a, b, c]));
    } else if (ab >= bc && ab >= ca) {
      const m = midpoint(a, b); refine(a, m, c); refine(m, b, c);
    } else if (bc >= ca) {
      const m = midpoint(b, c); refine(a, b, m); refine(a, m, c);
    } else {
      const m = midpoint(c, a); refine(a, b, m); refine(m, b, c);
    }
  }
  triangles.forEach(([a, b, c]) => refine(a, b, c));
  const positions = [];
  const normals = [];
  const uv = [];
  for (const point of points) {
    const z = frontDepth(point.x, point.y);
    positions.push(...pixelToWorld(point.x, point.y, z).toArray());
    const dx = (frontDepth(point.x + 0.5, point.y) - frontDepth(point.x - 0.5, point.y)) / PIXEL_SCALE;
    const dy = (frontDepth(point.x, point.y + 0.5) - frontDepth(point.x, point.y - 0.5)) / PIXEL_SCALE;
    normals.push(...new THREE.Vector3(-dx, dy, 1).normalize().toArray());
    uv.push(point.x / REFERENCE_SIZE, 1 - point.y / REFERENCE_SIZE);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

export function createProjectedSolid({ outline, holes = [], frontDepth, backDepth, frontMaterial, sideMaterial, name, maxEdge = 20 }) {
  // Use the same sampled boundary on both caps and the sidewall. Otherwise a
  // long edge subdivided only by the cap leaves visible cracks at profile.
  const resampleBoundary = (ring) => ring.flatMap((point, index) => {
    const next = ring[(index + 1) % ring.length];
    const count = Math.max(1, Math.ceil(Math.hypot(next[0] - point[0], next[1] - point[1]) / (maxEdge * 0.65)));
    return Array.from({ length: count }, (_, step) => [THREE.MathUtils.lerp(point[0], next[0], step / count), THREE.MathUtils.lerp(point[1], next[1], step / count)]);
  });
  outline = resampleBoundary(outline);
  holes = holes.map(resampleBoundary);
  const front = createProjectedSurface({ outline, holes, frontDepth, maxEdge });
  const back = createProjectedSurface({ outline, frontDepth: typeof backDepth === "function" ? backDepth : () => backDepth ?? -0.45, maxEdge: maxEdge * 1.6 });
  const positions = [...front.attributes.position.array, ...back.attributes.position.array];
  const normals = [...front.attributes.normal.array, ...back.attributes.normal.array.map((value) => -value)];
  const uv = [...front.attributes.uv.array, ...back.attributes.uv.array];
  const frontVertices = front.attributes.position.count;
  const indices = [...front.index.array];
  const frontIndices = indices.length;
  for (let index = 0; index < back.index.count; index += 3) {
    indices.push(back.index.array[index] + frontVertices, back.index.array[index + 2] + frontVertices, back.index.array[index + 1] + frontVertices);
  }
  // Join the silhouette as a closed volume. Eye apertures have socket walls,
  // while the rear cap remains intact behind the inset animated eyes.
  for (const [ringIndex, ring] of [outline, ...holes].entries()) {
    const pixelArea = ring.reduce((sum, point, index) => {
      const next = ring[(index + 1) % ring.length];
      return sum + point[0] * next[1] - next[0] * point[1];
    }, 0);
    const reverse = (pixelArea < 0) !== (ringIndex > 0);
    for (let index = 0; index < ring.length; index++) {
      const a = ring[index];
      const b = ring[(index + 1) % ring.length];
      const base = positions.length / 3;
      const backZ = (point) => typeof backDepth === "function" ? backDepth(...point) : backDepth ?? -0.45;
      const corners = [pixelToWorld(...a, frontDepth(...a)), pixelToWorld(...b, frontDepth(...b)), pixelToWorld(...a, backZ(a)), pixelToWorld(...b, backZ(b))];
      const normal = corners[1].clone().sub(corners[0]).cross(corners[2].clone().sub(corners[0])).normalize();
      if (reverse) normal.negate();
      corners.forEach((point, corner) => {
        positions.push(...point.toArray()); normals.push(...normal.toArray());
        const source = corner % 2 ? b : a;
        uv.push(source[0] / REFERENCE_SIZE, 1 - source[1] / REFERENCE_SIZE);
      });
      indices.push(...(reverse ? [base, base + 2, base + 1, base + 1, base + 2, base + 3] : [base, base + 1, base + 2, base + 1, base + 3, base + 2]));
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.addGroup(0, frontIndices, 0);
  geometry.addGroup(frontIndices, indices.length - frontIndices, 1);
  geometry.userData.frontVertexCount = frontVertices;
  geometry.computeBoundingSphere();
  front.dispose(); back.dispose();
  const object = new THREE.Mesh(geometry, [frontMaterial, sideMaterial]);
  object.name = name ?? "Reference textured sculpture";
  return object;
}

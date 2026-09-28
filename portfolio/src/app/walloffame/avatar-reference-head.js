import * as THREE from 'three';
import { createProjectedSolid, smoothOutline } from './avatar-reference-geometry.js';
import { REFERENCE_EYES } from './avatar-reference-eyes.js';

const IMAGE_SIZE = 1254;
const PIXEL_SCALE = 4 / IMAGE_SIZE;
const gaussian = (value, width) => Math.exp(-(value * value) / (2 * width * width));
const clamp = THREE.MathUtils.clamp;

// The outline follows the facial beard along the jaw, excluding the loose
// curls behind it. The upper edge sits inside the separately modeled turban.
const HEAD_OUTLINE = [
  [541, 329], [512, 389], [465, 447], [437, 494], [420, 546],
  [412, 574], [405, 594], [398, 621], [392, 644], [392, 669],
  [396, 693], [393, 711], [403, 731], [413, 752], [420, 777],
  [429, 796], [443, 816], [456, 831], [470, 844],
  [482, 868], [505, 887],
  [528, 909], [553, 929], [578, 946], [600, 956], [613, 968],
  [630, 975], [648, 978], [664, 973], [679, 966], [699, 960],
  [716, 949], [738, 932], [758, 912], [777, 891], [795, 868],
  [803, 840], [821, 824], [835, 810], [848, 790], [858, 771],
  [867, 750], [875, 730], [883, 710], [889, 690], [891, 669],
  [889, 647], [884, 626], [878, 606], [876, 595], [869, 573],
  [860, 550], [842, 500], [817, 452], [786, 410], [753, 372],
  [735, 336], [684, 329], [623, 327], [578, 328],
];

const WIDTH_PROFILE = [
  [327, 540, 738], [350, 529, 744], [400, 502, 783],
  [450, 463, 818], [500, 435, 843], [550, 419, 861],
  [600, 402, 879], [650, 391, 890], [700, 394, 885],
  [750, 414, 868], [800, 433, 842], [830, 455, 815],
  [850, 474, 800], [870, 484, 795], [900, 518, 769],
  [930, 554, 740], [955, 598, 708], [978, 637, 651],
];

const DEPTH_PROFILE = [
  [327, 0.41], [400, 0.47], [480, 0.54], [560, 0.575],
  [650, 0.58], [735, 0.555], [825, 0.535], [910, 0.49],
  [950, 0.41], [978, 0.28],
];

const FRAME_PATHS = [
  [[470, 481], [518, 475], [566, 479], [600, 490], [616, 516], [614, 548], [603, 584], [580, 607], [541, 617], [495, 612], [467, 600], [451, 575], [442, 540], [443, 509], [455, 489], [470, 481]],
  [[696, 490], [728, 479], [767, 476], [808, 482], [836, 496], [850, 521], [848, 551], [839, 582], [823, 604], [789, 614], [752, 617], [721, 609], [700, 590], [687, 560], [681, 532], [685, 507], [696, 490]],
  [[616, 520], [629, 514], [644, 513], [659, 514], [680, 522]],
  [[419, 514], [441, 516]], [[850, 515], [876, 514]],
];

function interpolateProfile(profile, y, column) {
  if (y <= profile[0][0]) return profile[0][column];
  for (let index = 1; index < profile.length; index += 1) {
    if (y <= profile[index][0]) {
      const previous = profile[index - 1];
      const next = profile[index];
      let fraction = (y - previous[0]) / (next[0] - previous[0]);
      fraction = fraction * fraction * (3 - 2 * fraction);
      return THREE.MathUtils.lerp(previous[column], next[column], fraction);
    }
  }
  return profile[profile.length - 1][column];
}

function horizontalProfile(px, py) {
  const left = interpolateProfile(WIDTH_PROFILE, py, 1);
  const right = interpolateProfile(WIDTH_PROFILE, py, 2);
  const center = (left + right) / 2;
  return clamp(Math.abs((px - center) / Math.max(12, (right - left) / 2)), 0, 1);
}

function segmentDistance(px, py, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const fraction = clamp(((px - a[0]) * dx + (py - a[1]) * dy) / (dx * dx + dy * dy), 0, 1);
  return Math.hypot(px - a[0] - dx * fraction, py - a[1] - dy * fraction);
}

function frameRelief(px, py) {
  if (py < 462 || py > 629 || px < 410 || px > 886) return 0;
  let nearest = 1000;
  for (const path of FRAME_PATHS) {
    for (let index = 1; index < path.length; index += 1) {
      nearest = Math.min(nearest, segmentDistance(px, py, path[index - 1], path[index]));
    }
  }
  return 0.024 * gaussian(nearest, 4.0);
}

function frontDepth(px, py) {
  const horizontal = horizontalProfile(px, py);
  const roundness = Math.sqrt(Math.max(0, 1 - Math.pow(horizontal, 2.8)));
  const centerDepth = interpolateProfile(DEPTH_PROFILE, py, 1);
  const skull = 0.065 + (centerDepth - 0.065) * roundness;
  const bridge = 0.142 * gaussian(px - 645, 26) * gaussian(py - 569, 74);
  const noseTip = 0.197 * gaussian(px - 647, 32) * gaussian(py - 648, 26);
  const noseWings = 0.064 * (gaussian(px - 602, 14) + gaussian(px - 690, 14)) * gaussian(py - 653, 17);
  const cheeks = 0.059 * (gaussian(px - 488, 57) + gaussian(px - 804, 57)) * gaussian(py - 641, 65);
  const mouth = 0.075 * gaussian(px - 645, 88) * gaussian(py - 744, 37);
  const chin = 0.052 * gaussian(px - 645, 80) * gaussian(py - 875, 66);
  const sockets = 0.026 * (gaussian(px - 541, 39) + gaussian(px - 750, 39)) * gaussian(py - 539, 23);
  const brows = 0.012 * (gaussian(px - 545, 57) + gaussian(px - 753, 57)) * gaussian(py - 453, 16);
  // Fine relief is restrained: the texture carries individual hairs while the
  // smooth volume gives the beard a rounded silhouette from other angles.
  const hairRegion = clamp((py - 775) / 85, 0, 1);
  const hairRelief = hairRegion * roundness * 0.008 * Math.sin(px * 0.12 + Math.sin(py * 0.045) * 2.5) * Math.sin(py * 0.095);
  return skull + bridge + noseTip + noseWings + cheeks + mouth + chin - sockets + brows + frameRelief(px, py) + hairRelief;
}

function backDepth(px, py) {
  const horizontal = horizontalProfile(px, py);
  const center = Math.sqrt(Math.max(0, 1 - horizontal * horizontal));
  const vertical = Math.sqrt(Math.max(0.10, 1 - Math.pow((py - 628) / 382, 2)));
  return -0.10 - 0.43 * center * vertical;
}

function createExpressionRig(mesh) {
  const geometry = mesh.geometry;
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  const original = new Float32Array(position.array);
  const frontVertices = new Set();
  for (const group of geometry.groups) {
    if (group.materialIndex !== 0) continue;
    for (let offset = group.start; offset < group.start + group.count; offset += 1) {
      frontVertices.add(geometry.index ? geometry.index.getX(offset) : offset);
    }
  }
  const weightedVertices = [];
  for (const index of frontVertices) {
    const px = uv.getX(index) * IMAGE_SIZE;
    const py = (1 - uv.getY(index)) * IMAGE_SIZE;
    const leftBrow = gaussian(px - 545, 62) * gaussian(py - 450, 22);
    const rightBrow = gaussian(px - 752, 62) * gaussian(py - 450, 22);
    const leftCorner = gaussian(px - 567, 32) * gaussian(py - 734, 22);
    const rightCorner = gaussian(px - 723, 32) * gaussian(py - 734, 22);
    const chin = gaussian(px - 645, 66) * gaussian(py - 816, 46);
    if (leftBrow + rightBrow + leftCorner + rightCorner + chin > 0.002) {
      weightedVertices.push({ index, leftBrow, rightBrow, leftCorner, rightCorner, chin });
    }
  }
  let lastName = '';
  let lastAmount = -1;
  return (name = 'happy', amount = 1) => {
    const strength = clamp(amount, 0, 1);
    if (name === lastName && Math.abs(strength - lastAmount) < 0.004) return;
    lastName = name;
    lastAmount = strength;
    const excited = ['excited', 'delighted', 'celebrate', 'celebrating', 'surprised', 'wow'].includes(name);
    const thoughtful = ['thoughtful', 'thinking', 'focused', 'curious'].includes(name);
    const concerned = ['sad', 'concerned', 'worried', 'empathetic'].includes(name);
    const grateful = ['grateful', 'proud', 'warm'].includes(name);
    const leftLift = strength * (excited ? 8 : thoughtful ? 5 : concerned ? 2 : grateful ? 2 : 0);
    const rightLift = strength * (excited ? 8 : thoughtful ? -1 : concerned ? 2 : grateful ? 2 : 0);
    const smileLift = strength * (excited ? 6 : concerned ? -5 : thoughtful ? -2 : grateful ? 3 : 0);
    for (const vertex of weightedVertices) {
      const { index, leftBrow, rightBrow, leftCorner, rightCorner, chin } = vertex;
      const mouthWeight = leftCorner + rightCorner;
      position.setXYZ(index,
        original[index * 3] + (rightCorner - leftCorner) * smileLift * PIXEL_SCALE * 0.16,
        original[index * 3 + 1] + (leftBrow * leftLift + rightBrow * rightLift + mouthWeight * smileLift - (excited ? chin * strength : 0)) * PIXEL_SCALE,
        original[index * 3 + 2] + mouthWeight * smileLift * PIXEL_SCALE * 0.12,
      );
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
  };
}

export function createReferenceHead({ frontMaterial, maxEdge = 14 }) {
  const group = new THREE.Group();
  group.name = 'Reference calibrated sculpted head';
  const sideMaterial = new THREE.MeshStandardMaterial({
    color: '#493429', roughness: 0.79, metalness: 0,
  });
  const outline = smoothOutline(HEAD_OUTLINE, 3);
  const head = createProjectedSolid({
    outline,
    holes: REFERENCE_EYES.map((eye) => eye.outline),
    frontDepth,
    backDepth,
    frontMaterial,
    sideMaterial,
    name: 'Closed textured face and beard sculpture',
    maxEdge,
  });
  group.add(head);
  return {
    group,
    depthAt: frontDepth,
    eyes: REFERENCE_EYES,
    setExpression: createExpressionRig(head),
  };
}

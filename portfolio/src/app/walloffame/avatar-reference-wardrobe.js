import * as THREE from 'three';
import { createProjectedSolid, smoothOutline } from './avatar-reference-geometry.js';

// Coordinates are measured directly from the 1254 px approved reference.
const TURBAN_OUTER = [
  [385, 705], [351, 675], [328, 650], [293, 600], [267, 550],
  [249, 500], [240, 450], [239, 400], [247, 350], [263, 300],
  [286, 250], [319, 200], [364, 150], [429, 100], [476, 75],
  [551, 52], [576, 35], [621, 26], [672, 34], [724, 45],
  [780, 75], [824, 100], [884, 150], [931, 200], [964, 250],
  [987, 300], [1001, 350], [1010, 400], [1011, 450],
  [1000, 500], [985, 550], [959, 600], [927, 650], [898, 684],
];
const TURBAN_INNER_REVERSE = [
  [895, 655], [890, 605], [882, 555], [863, 505], [825, 450],
  [783, 400], [741, 350], [719, 325], [698, 300], [675, 275],
  [647, 250], [639, 247], [631, 250], [614, 275], [596, 300],
  [577, 325], [553, 350], [508, 400], [467, 450], [423, 500],
  [400, 550], [388, 600], [378, 650], [385, 692],
];
const TURBAN_WIDTHS = [
  [26, 13], [50, 98], [75, 152], [100, 198], [150, 260],
  [200, 307], [250, 339], [300, 365], [350, 376], [400, 386],
  [450, 386], [500, 375], [550, 358], [600, 332], [650, 298], [690, 267],
];
const BODY_OUTLINE = [
  [435, 824], [423, 849], [407, 875], [393, 900], [383, 925],
  [375, 950], [349, 975], [292, 1000], [235, 1025], [180, 1050],
  [97, 1100], [56, 1150], [28, 1200], [6, 1250], [5, 1254],
  [1250, 1254], [1246, 1250], [1225, 1200], [1198, 1150],
  [1158, 1100], [1076, 1050], [1022, 1025], [964, 1000],
  [906, 975], [886, 950], [878, 925], [866, 900], [851, 875],
  [832, 850], [817, 820], [775, 852], [723, 877], [627, 886],
  [537, 872], [476, 847],
];
const BODY_WIDTHS = [
  [820, 192], [850, 209], [875, 222], [900, 238], [925, 250],
  [950, 258], [975, 279], [1000, 336], [1025, 393], [1050, 448],
  [1100, 531], [1150, 573], [1200, 600], [1254, 625],
];
const CLOTH_FOLDS = [
  // The viewer's left has restrained fabric creases; pleats remain on the right.
  [[744, 100], [863, 180], [947, 318], [980, 463], [923, 649]],
  [[705, 164], [819, 249], [900, 390], [927, 519], [902, 660]],
  [[674, 233], [762, 337], [841, 461], [883, 586], [892, 670]],
];

function interpolate(rows, y) {
  if (y <= rows[0][0]) return rows[0][1];
  for (let i = 1; i < rows.length; i += 1) {
    if (y <= rows[i][0]) {
      const t = (y - rows[i - 1][0]) / (rows[i][0] - rows[i - 1][0]);
      return THREE.MathUtils.lerp(rows[i - 1][1], rows[i][1], t);
    }
  }
  return rows.at(-1)[1];
}

function sectionDepth(px, py, rows) {
  const relative = (px - 627) / interpolate(rows, py);
  return Math.sqrt(Math.max(0, 1 - relative * relative));
}

function distanceToPath(x, y, points) {
  let nearest = Infinity;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const t = THREE.MathUtils.clamp(((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy), 0, 1);
    nearest = Math.min(nearest, Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy));
  }
  return nearest;
}

function bump(x, y, points, width, amount) {
  const distance = distanceToPath(x, y, points);
  return amount * Math.exp(-((distance / width) ** 2));
}

function sideMaterial(color) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.88, metalness: 0 });
}

function solid(options, maxEdge = 17) {
  const outline = smoothOutline(options.outline, 4).map(([x, y]) => [x, Math.min(y, 1254)]);
  const object = createProjectedSolid({ ...options, outline, maxEdge });
  object.castShadow = true;
  object.receiveShadow = true;
  return object;
}

export function createReferenceWardrobe({ frontMaterial, turbanMaterial = frontMaterial, maxEdge = 17 }) {
  const turban = new THREE.Group();
  turban.name = 'Reference sculpted golden turban';
  const body = new THREE.Group();
  body.name = 'Reference sculpted jacket and shirt';
  const gold = sideMaterial('#d39744');
  const ivory = sideMaterial('#e6e3dd');
  const black = new THREE.MeshBasicMaterial({ color: '#000000', toneMapped: false });
  const turbanRoundness = (x, y) => {
    const crown = Math.pow(Math.sin(THREE.MathUtils.clamp((y - 26) / 709, 0, 1) * Math.PI), 0.68);
    return sectionDepth(x, y, TURBAN_WIDTHS) * crown;
  };

  // A separate, complete back dome fills the horseshoe opening behind the head.
  // Its edge thins continuously into the front silhouette, rather than forming
  // an extruded cardboard rim or a collection of disconnected strips.
  turban.add(solid({
    outline: [...TURBAN_OUTER, [873, 711], [783, 729], [628, 735], [472, 728], [392, 711]],
    frontDepth: (x, y) => -0.038 - 0.25 * turbanRoundness(x, y),
    backDepth: (x, y) => -0.048 - 0.76 * turbanRoundness(x, y),
    frontMaterial: gold,
    sideMaterial: gold,
    name: 'Rounded full turban back',
  }, maxEdge));
  turban.add(solid({
    outline: [...TURBAN_OUTER, ...TURBAN_INNER_REVERSE],
    frontDepth: (x, y) => {
      let folds = 0;
      for (const points of CLOTH_FOLDS) folds += bump(x, y, points, 19, 0.018);
      // Broader center flap has its own low sculpted crest under the exact UV.
      const flap = bump(x, y, [[616, 63], [671, 116], [651, 184], [610, 244]], 38, 0.035);
      return 0.045 + 0.69 * turbanRoundness(x, y) + folds + flap;
    },
    backDepth: (x, y) => 0.026 - 0.34 * turbanRoundness(x, y),
    frontMaterial: turbanMaterial,
    sideMaterial: gold,
    name: 'Golden wrapped cloth with original portrait UV',
  }, maxEdge));
  turban.add(solid({
    outline: [[638, 248], [655, 260], [676, 282], [700, 306], [734, 341], [704, 346], [652, 345], [603, 345], [557, 352], [577, 326], [602, 292], [621, 266]],
    frontDepth: (x, y) => 0.593 + 0.035 * Math.exp(-(((x - 640) / 130) ** 2)) - Math.abs(y - 322) * 0.00013,
    backDepth: () => 0.40,
    frontMaterial: black,
    sideMaterial: black,
    name: 'Pitch black undercap with curved hairline',
  }, maxEdge));

  const collarLeft = [[445, 854], [428, 929], [403, 1011], [406, 1095], [443, 1172]];
  const collarRight = [[817, 853], [840, 934], [861, 1009], [821, 1103], [827, 1187]];
  const shoulderLeft = [[356, 1014], [276, 1092], [222, 1180], [207, 1254]];
  const shoulderRight = [[922, 1013], [1044, 1119], [1121, 1254]];
  body.add(solid({
    outline: BODY_OUTLINE,
    frontDepth: (x, y) => {
      const rounded = sectionDepth(x, y, BODY_WIDTHS);
      const neck = Math.exp(-(((x - 632) / 143) ** 2)) * (1 - THREE.MathUtils.smoothstep(y, 975, 1140));
      return 0.055 + 0.405 * rounded + 0.043 * neck
        + bump(x, y, collarLeft, 46, 0.097)
        + bump(x, y, collarRight, 46, 0.095)
        + bump(x, y, shoulderLeft, 20, 0.013)
        + bump(x, y, shoulderRight, 20, 0.013);
    },
    backDepth: (x, y) => -0.07 - 0.56 * sectionDepth(x, y, BODY_WIDTHS),
    frontMaterial,
    sideMaterial: ivory,
    name: 'Rounded shoulders, raised collars, checked shirt and neck',
  }, maxEdge));
  return { turban, body };
}

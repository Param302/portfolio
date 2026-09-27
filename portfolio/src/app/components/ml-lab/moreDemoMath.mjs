export function classifyFlower(length, width) {
  if (length < 2.5) return { label: "Setosa", path: ["length", "setosa"] };
  if (width < 1.8) return { label: "Versicolor", path: ["length", "width", "versicolor"] };
  return { label: "Virginica", path: ["length", "width", "virginica"] };
}

export function randomStep(seed) {
  const next = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return { seed: next, value: next / 4294967296 };
}

export function makeClusterPoints() {
  let seed = 404;
  const centers = [[23, 28], [75, 28], [53, 74]];
  return centers.flatMap(([x, y]) => Array.from({ length: 18 }, () => {
    const samples = Array.from({ length: 4 }, () => {
      const next = randomStep(seed);
      seed = next.seed;
      return next.value;
    });
    return { x: x + (samples[0] + samples[1] - 1) * 24, y: y + (samples[2] + samples[3] - 1) * 24 };
  }));
}

export function initialCentroids(k) {
  return [{ x: 15, y: 18 }, { x: 32, y: 48 }, { x: 42, y: 22 }, { x: 80, y: 82 }].slice(0, k);
}

export function kMeansStep(points, centroids) {
  const distance = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
  const assignments = points.map((point) => centroids.reduce((best, center, index) => distance(point, center) < distance(point, centroids[best]) ? index : best, 0));
  const next = centroids.map((center, index) => {
    const members = points.filter((_, pointIndex) => assignments[pointIndex] === index);
    if (!members.length) return { ...center };
    return { x: members.reduce((sum, point) => sum + point.x, 0) / members.length, y: members.reduce((sum, point) => sum + point.y, 0) / members.length };
  });
  return {
    centroids: next,
    assignments,
    movement: Math.max(...next.map((center, index) => Math.sqrt(distance(center, centroids[index])))),
    inertia: points.reduce((sum, point, index) => sum + distance(point, next[assignments[index]]), 0),
  };
}

// Neural-network libraries commonly call this operation convolution, but do not flip the kernel.
export function correlateValid(input, kernel) {
  const outputSize = input.length - kernel.length + 1;
  return Array.from({ length: outputSize }, (_, row) => Array.from({ length: outputSize }, (_, col) => kernel.reduce((sum, line, kr) => sum + line.reduce((rowSum, weight, kc) => rowSum + weight * input[row + kr][col + kc], 0), 0)));
}

export const GRID_SIZE = 5;
export const GRID_START = 20;
export const GRID_GOAL = 4;
export const GRID_WALLS = [11];
export const GRID_PITS = [6, 13, 18];
export const ACTION_ARROWS = ["↑", "→", "↓", "←"];

export function initialQLearning() {
  return { q: Array.from({ length: 25 }, () => [0, 0, 0, 0]), position: GRID_START, episodes: 0, steps: 0, successes: 0, seed: 404, last: "Take a step, or train the agent.", trail: [GRID_START] };
}

export function gridTransition(position, action) {
  const row = Math.floor(position / GRID_SIZE);
  const col = position % GRID_SIZE;
  const [dr, dc] = [[-1, 0], [0, 1], [1, 0], [0, -1]][action];
  const nr = row + dr;
  const nc = col + dc;
  const target = nr * GRID_SIZE + nc;
  if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE || GRID_WALLS.includes(target)) return { position, reward: -0.12, done: false };
  if (target === GRID_GOAL) return { position: target, reward: 1, done: true };
  if (GRID_PITS.includes(target)) return { position: target, reward: -1, done: true };
  return { position: target, reward: -0.04, done: false };
}

export function qLearningStep(state, epsilon = 0.25) {
  // A terminal square stays visible until the next step starts a new episode.
  const position = state.terminal ? GRID_START : state.position;
  const steps = state.terminal ? 0 : state.steps;
  const q = state.q.map((row) => [...row]);
  const choice = randomStep(state.seed);
  const actionChoice = randomStep(choice.seed);
  const max = Math.max(...q[position]);
  const best = q[position].map((value, index) => Math.abs(value - max) < 1e-9 ? index : -1).filter((index) => index !== -1);
  const action = choice.value < epsilon ? Math.floor(actionChoice.value * 4) : best[Math.floor(actionChoice.value * best.length)];
  const next = gridTransition(position, action);
  const timedOut = steps + 1 >= 80 && !next.done;
  const terminal = next.done || timedOut;
  const target = next.reward + (terminal ? 0 : 0.95 * Math.max(...q[next.position]));
  q[position][action] += 0.35 * (target - q[position][action]);
  return {
    q, position: next.position, terminal, seed: actionChoice.seed,
    steps: steps + 1,
    episodes: state.episodes + (terminal ? 1 : 0),
    successes: state.successes + (next.position === GRID_GOAL ? 1 : 0),
    trail: [...(state.terminal ? [GRID_START] : state.trail), next.position].slice(-10),
    last: timedOut ? "Step limit reached. A new episode starts next." : next.done ? next.reward > 0 ? "Goal reached: +1 reward." : "Pit reached: −1 reward. Try another route." : `${ACTION_ARROWS[action]} Reward ${next.reward.toFixed(2)} · updated one Q-value.`,
  };
}

export function trainQLearning(state, episodes = 100, epsilon = 0.25) {
  let next = state;
  const target = state.episodes + episodes;
  while (next.episodes < target) next = qLearningStep(next, epsilon);
  return next;
}

import test from "node:test";
import assert from "node:assert/strict";
import { classifyFlower, correlateValid, gridTransition, initialCentroids, initialQLearning, kMeansStep, makeClusterPoints, qLearningStep, trainQLearning } from "../src/app/components/ml-lab/moreDemoMath.mjs";

test("decision tree takes all three leaves and respects strict boundaries", () => {
  assert.equal(classifyFlower(2.4, 2).label, "Setosa");
  assert.equal(classifyFlower(2.5, 1.7).label, "Versicolor");
  assert.equal(classifyFlower(2.5, 1.8).label, "Virginica");
});

test("k-means reduces squared error and converges", () => {
  const points = makeClusterPoints();
  let centers = initialCentroids(3);
  let previousError = Infinity;
  let result;
  for (let iteration = 0; iteration < 30; iteration += 1) {
    result = kMeansStep(points, centers);
    assert.ok(result.inertia <= previousError + 1e-8);
    centers = result.centroids;
    previousError = result.inertia;
  }
  assert.ok(result.movement < 1e-8);
  assert.equal(result.assignments.length, points.length);
  assert.equal(new Set(result.assignments).size, 3);
});

test("valid cross-correlation uses an unflipped kernel", () => {
  assert.deepEqual(correlateValid([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[0, 1], [0, 0]]), [[2, 3], [5, 6]]);
});

test("grid prevents edge/wall moves and terminates on goal or pit", () => {
  assert.equal(gridTransition(0, 0).position, 0);
  assert.equal(gridTransition(10, 1).position, 10);
  assert.deepEqual(gridTransition(3, 1), { position: 4, reward: 1, done: true });
  assert.deepEqual(gridTransition(5, 1), { position: 6, reward: -1, done: true });
});

test("Q-learning is reproducible and learns a successful policy", () => {
  const trained = trainQLearning(initialQLearning(), 400, 0.25);
  assert.equal(trained.episodes, 400);
  assert.ok(trained.successes > 150);
  assert.deepEqual(trained, trainQLearning(initialQLearning(), 400, 0.25));
  let greedy = { ...trained, position: 20, steps: 0, terminal: false };
  for (let step = 0; step < 20 && !greedy.terminal; step += 1) greedy = qLearningStep(greedy, 0);
  assert.equal(greedy.position, 4);
});

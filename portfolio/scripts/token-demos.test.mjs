import test from "node:test";
import assert from "node:assert/strict";
import { attentionSentences, calculateAttention, softmax } from "../src/app/components/ml-lab/attentionMath.mjs";
import { contributionTrace, predictionPrompts, predictTokens } from "../src/app/components/ml-lab/predictionMath.mjs";

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} ≠ ${expected}`);
test("softmax is normalized and stable with large logits", () => {
  const values = softmax([10000, 10001, 9999]);
  close(values.reduce((sum, value) => sum + value, 0), 1);
  assert.ok(values.every(Number.isFinite));
  assert.ok(values[1] > values[0]);
  assert.throws(() => softmax([1, 2], 0), RangeError);
});
test("attention masks future keys and mixes value vectors", () => {
  const attention = calculateAttention(attentionSentences[0].embeddings, 0, true);
  attention.weights.forEach((row, query) => {
    close(row.reduce((sum, value) => sum + value, 0), 1);
    row.forEach((weight, key) => { if (key > query) assert.equal(weight, 0); });
  });
  attention.outputs[0].forEach((value, index) => close(value, attention.values[0][index]));
  assert.notDeepEqual(calculateAttention(attentionSentences[0].embeddings, 0).weights, calculateAttention(attentionSentences[0].embeddings, 1).weights);
});
test("temperature alters entropy without changing logits", () => {
  const cold = predictTokens(predictionPrompts[0].input, 0.1);
  const warm = predictTokens(predictionPrompts[0].input, 3);
  assert.deepEqual(cold.logits, warm.logits);
  assert.ok(cold.entropy < warm.entropy);
  assert.ok(Math.max(...cold.probabilities) > Math.max(...warm.probabilities));
  close(warm.probabilities.reduce((sum, value) => sum + value, 0), 1);
});
test("contribution trace reaches the requested output only", () => {
  const prediction = predictTokens(predictionPrompts[0].input);
  const trace = contributionTrace(prediction.layers, 3);
  assert.ok(trace.size > 2);
  const outputs = [...trace].filter((edge) => edge.startsWith("2-"));
  assert.equal(outputs.length, 2);
  assert.ok(outputs.every((edge) => edge.endsWith("-3")));
});

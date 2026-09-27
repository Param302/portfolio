import { softmax } from "./attentionMath.mjs";

// Fixed, hand-authored weights: computation, not a trained LLM.
export const predictionPrompts = [
  { text: "Let’s build a", words: ["model", "community", "website", "robot", "sandwich"], input: [0.9, 0.4, 0.7, -0.2] },
  { text: "The cat sat on the", words: ["mat", "roof", "keyboard", "moon", "data"], input: [0.1, 0.9, -0.2, 0.8] },
];
export const predictionWeights = [
  [[0.8, 0.2, -0.3, 0.5], [-0.2, 0.9, 0.6, 0.1], [0.5, -0.4, 0.8, 0.2], [0.1, 0.7, -0.2, 0.9], [0.6, 0.1, 0.5, -0.6]],
  [[0.7, 0.2, 0.6, -0.3, 0.4], [-0.2, 0.8, 0.2, 0.7, 0.1], [0.4, 0.1, 0.9, 0.2, -0.1], [0.2, 0.6, -0.2, 0.8, 0.1], [0.6, -0.3, 0.5, 0.1, 0.7]],
  [[1.1, 0.2, 0.8, -0.1, 0.5], [0.3, 0.9, -0.1, 0.7, 0.2], [0.1, 0.2, 1, 0.4, 0.2], [-0.3, 0.4, 0.2, 0.8, 0.1], [-0.4, 0.1, -0.3, 0.2, 0.4]],
];
const biases = [[0.1, -0.1, 0.2, 0, 0.1], [0.05, 0.1, -0.05, 0.15, 0], [0.8, 0.4, 0.1, -0.2, -0.5]];
export function predictTokens(input, temperature = 1) {
  const layers = [input];
  predictionWeights.forEach((matrix, layer) => {
    const previous = layers.at(-1);
    layers.push(matrix.map((weights, neuron) => {
      const sum = weights.reduce((total, weight, index) => total + weight * previous[index], biases[layer][neuron]);
      return layer < 2 ? Math.tanh(sum) : sum;
    }));
  });
  const logits = layers.at(-1);
  const probabilities = softmax(logits, temperature);
  const entropy = -probabilities.reduce((total, probability) => total + (probability ? probability * Math.log2(probability) : 0), 0);
  return { layers, logits, probabilities, entropy };
}
// Highlight the two largest |activation × weight| contributions at each step.
export function contributionTrace(layers, output) {
  const edges = new Set();
  let targets = new Set([output]);
  for (let layer = predictionWeights.length - 1; layer >= 0; layer -= 1) {
    const sources = new Set();
    targets.forEach((target) => {
      predictionWeights[layer][target]
        .map((weight, source) => ({ source, magnitude: Math.abs(weight * layers[layer][source]) }))
        .sort((left, right) => right.magnitude - left.magnitude)
        .slice(0, 2)
        .forEach(({ source }) => { edges.add(`${layer}-${source}-${target}`); sources.add(source); });
    });
    targets = sources;
  }
  return edges;
}

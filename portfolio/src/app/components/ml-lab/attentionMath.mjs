// Scaled dot-product attention: https://arxiv.org/abs/1706.03762
// Hand-authored embeddings and projections, not trained language models.
export function softmax(values, temperature = 1) {
  if (!(temperature > 0) || !Number.isFinite(temperature)) throw new RangeError("Temperature must be positive and finite.");
  if (!values.length) return [];
  const maximum = Math.max(...values);
  if (!Number.isFinite(maximum)) throw new RangeError("At least one finite score is required.");
  const exponentials = values.map((value) => Math.exp((value - maximum) / temperature));
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map((value) => value / total);
}

export const attentionSentences = [
  {
    label: "The curious cat found a window",
    tokens: ["The", "curious", "cat", "found", "a", "window"],
    embeddings: [[0.1, 0.2, 0.3, 0.1], [0.9, 0.3, 0.1, 0.6], [1.4, 0.2, 0.9, 0.2], [0.3, 1.5, 0.4, 0.7], [0.2, 0.1, 0.3, 0.2], [0.8, 0.5, 1.5, 0.1]],
  },
  {
    label: "We build useful tools for people",
    tokens: ["We", "build", "useful", "tools", "for", "people"],
    embeddings: [[1.2, 0.2, 0.3, 0.8], [0.1, 1.5, 0.4, 0.5], [0.5, 0.4, 0.3, 1.4], [0.6, 0.7, 1.5, 0.2], [0.2, 0.2, 0.1, 0.3], [1.4, 0.1, 0.8, 0.7]],
  },
];
const heads = [
  {
    query: [[1.2, 0.1, 0, 0.3], [0, 1.1, 0.2, 0], [0.1, 0, 1.3, 0.2], [0.3, 0.2, 0, 0.8]],
    key: [[0.8, 0, 0.5, 0], [0.1, 1.3, 0, 0.2], [0.6, 0.1, 0.9, 0], [0, 0.3, 0.1, 1.1]],
    value: [[0.7, 0.2, 0, 0.1], [0.1, 0.8, 0.3, 0], [0, 0.1, 0.9, 0.2], [0.3, 0, 0.2, 0.8]],
  },
  {
    query: [[0.2, 1, 0.1, 0], [0.7, 0.1, 0, 0.6], [0.1, 0.2, 0.3, 1], [1, 0, 0.5, 0.2]],
    key: [[1.1, 0, 0.3, 0.2], [0, 0.8, 0.2, 0.4], [0.4, 0.1, 1.2, 0], [0.1, 0.6, 0, 0.9]],
    value: [[0.2, 0.8, 0, 0.2], [0.6, 0.1, 0.4, 0], [0, 0.2, 0.3, 0.8], [0.7, 0, 0.1, 0.2]],
  },
];
const dot = (left, right) => left.reduce((sum, value, index) => sum + value * right[index], 0);
const project = (embedding, matrix) => matrix.map((row) => dot(embedding, row));
export function calculateAttention(embeddings, headIndex = 0, causal = false) {
  const head = heads[headIndex];
  const queries = embeddings.map((embedding) => project(embedding, head.query));
  const keys = embeddings.map((embedding) => project(embedding, head.key));
  const values = embeddings.map((embedding) => project(embedding, head.value));
  const scores = queries.map((query, row) => keys.map((key, column) => causal && column > row ? -Infinity : dot(query, key) / Math.sqrt(query.length)));
  const weights = scores.map((row) => softmax(row));
  const outputs = weights.map((row) => values[0].map((_, dimension) => row.reduce((sum, weight, index) => sum + weight * values[index][dimension], 0)));
  return { queries, keys, values, scores, weights, outputs };
}

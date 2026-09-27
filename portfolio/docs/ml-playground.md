# About reveal and 404 lab

The portrait effect is a **visual analogy** for reverse diffusion. It blends the real portrait with decaying noise and progressively restores detail; it does not run a generative model. It starts once when at least 25% of the image enters view, takes 2.15 seconds plus a 180 ms dissolve, and falls back to the normal image. Reduced motion bypasses the effect. Canvas work is limited to a 220-pixel-wide raster at approximately 30 fps and stops offscreen.

The 404 remains an actual not-found response with `noindex`. Visit any unrecognized route (for example `/ml-lab`) to see it. Only the selected experiment is mounted. There are no model downloads, paid APIs, or new dependencies.

## Experiments

1. **Gradient descent:** analytic gradient on `f(x,y) = (x² + 3y²)/2`. An orthographic SVG projection provides a rotatable 3D view. Step, run, pause, reset, learning-rate presets, and a divergence boundary are explicit. No autoplay.
2. **Self-attention:** hand-authored embeddings and two fixed Q/K/V projections, scaled dot products, normalized weights, optional causal masking, and weighted value vectors. These are illustrative weights, not learned language understanding.
3. **Next-token prediction:** fixed 4→5→5→5 network with two tanh layers. Probabilities are `softmax(logits / T)`. Word selection traces the two largest absolute activation-times-weight contributions per neuron; the trace is not a complete explanation of an LLM. Animation is finite and reduced-motion aware.
4. **Decision tree:** two illustrative petal-feature thresholds, three leaves, and a highlighted decision path. Mobile gets a readable vertical path instead of a shrunken tree.
5. **K-means:** seeded synthetic data, nearest-centroid assignment, mean updates, squared error, and convergence. Initialization can lead to local optima.
6. **Convolution:** editable binary input, 3×3 filter presets/custom weights, valid stride-one cross-correlation, and patch arithmetic. The unflipped-kernel convention is labeled explicitly.
7. **Q-learning:** seeded 5×5 gridworld, epsilon-greedy exploration, tabular Q updates, terminal goals/pits, and capped episodes. Training occurs only after a user action.

## Verification

Run `npm run test:ml`, `npm run lint`, and `npm run build` from the app folder. Do not build while a development server is writing the same `.next` directory.

The 13 Node tests cover convergence/divergence, all supported surface rotations, tree boundaries, k-means convergence, convolution arithmetic, grid transitions, a learned goal-reaching policy, normalized softmax, attention masking/value mixing, temperature entropy, and contribution traces.

Browser verification used the local production build: 1440px desktop, 1024px tablet, and 390px phone viewports, both themes, keyboard controls, all seven panels without horizontal page overflow. Confirmed gradient stepping, causal masking, temperature endpoints, output selection, tree branches, k-means convergence, editable convolution, Q-learning training, and the portrait's ready/complete scroll states. Reduced-motion branches are covered by code inspection, not OS-level emulation. Other browser engines and physical touch devices have not been tested.

## Mathematical references

- [Dive into Deep Learning — Gradient Descent](https://d2l.ai/chapter_optimization/gd.html)
- [Dive into Deep Learning — Attention Scoring Functions](https://d2l.ai/chapter_attention-mechanisms-and-transformers/attention-scoring-functions.html)
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [MIT 6.390 — Reinforcement Learning](https://introml.mit.edu/notes/reinforcement_learning.html)

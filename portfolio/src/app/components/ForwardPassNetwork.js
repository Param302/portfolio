"use client";

import { useMemo, useState } from "react";
import { contributionTrace, predictionPrompts, predictionWeights, predictTokens } from "./ml-lab/predictionMath.mjs";
import styles from "./ml-lab/TokenDemos.module.css";

const nodePosition = (layer, index, count) => ({ x: 40 + layer * 110, y: 65 + index * 230 / Math.max(1, count - 1) });

export default function ForwardPassNetwork() {
  const [temperature, setTemperature] = useState(1);
  const [promptIndex, setPromptIndex] = useState(0);
  const [selected, setSelected] = useState(0);
  const [pulse, setPulse] = useState(0);
  const prompt = predictionPrompts[promptIndex];
  const prediction = useMemo(() => predictTokens(prompt.input, temperature), [prompt, temperature]);
  const trace = useMemo(() => contributionTrace(prediction.layers, selected), [prediction.layers, selected]);
  const selectWord = (index) => {
    setSelected(index);
    setPulse((value) => value + 1);
  };
  return (
    <div className={styles.demo}>
      <div className={styles.controls}>
        <label className={styles.control}>Prompt
          <select value={promptIndex} onChange={(event) => { setPromptIndex(Number(event.target.value)); setPulse((value) => value + 1); }}>
            {predictionPrompts.map((item, index) => <option key={item.text} value={index}>{item.text} …</option>)}
          </select>
        </label>
        <div className={styles.temperature}>
          <label htmlFor="token-temperature"><span>Temperature</span><output>{temperature.toFixed(2)}</output></label>
          <input id="token-temperature" type="range" min="0.1" max="3" step="0.05" value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} />
          <div className={styles.rangeLabels}><span>Predictable</span><span>More varied</span></div>
        </div>
      </div>
      <div className={styles.networkGrid}>
        <div className={styles.networkPanel}>
          <p className={styles.label}>A tiny forward pass</p>
          <svg className={styles.network} viewBox="0 0 410 340" role="img" aria-label={`Four input features flow through two hidden layers to score ${prompt.words.join(", ")}. Highlighting contributions to ${prompt.words[selected]}.`}>
            {["Input", "Hidden 1", "Hidden 2", "Scores"].map((label, layer) => <text key={label} x={40 + layer * 110} y="27" textAnchor="middle">{label}</text>)}
            {predictionWeights.map((matrix, layer) => matrix.flatMap((weights, target) => weights.map((weight, source) => {
              const from = nodePosition(layer, source, prediction.layers[layer].length);
              const to = nodePosition(layer + 1, target, matrix.length);
              const active = trace.has(`${layer}-${source}-${target}`);
              return <line key={`${layer}-${source}-${target}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={active ? (weight >= 0 ? "#1bb6e0" : "#e9b27d") : "#91a3b8"} strokeOpacity={active ? 0.5 : 0.1} strokeWidth={active ? 1.4 : 0.7} />;
            })))}
            <g key={pulse}>{predictionWeights.map((matrix, layer) => matrix.flatMap((weights, target) => weights.map((weight, source) => {
              if (!trace.has(`${layer}-${source}-${target}`)) return null;
              const from = nodePosition(layer, source, prediction.layers[layer].length);
              const to = nodePosition(layer + 1, target, matrix.length);
              return <line key={`${layer}-${source}-${target}`} className={styles.trace} style={{ animationDelay: `${layer * 160}ms` }} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={weight >= 0 ? "#67d9f5" : "#ffdfae"} strokeWidth="2" />;
            })))}</g>
            {prediction.layers.map((layer, layerIndex) => layer.map((activation, index) => {
              const position = nodePosition(layerIndex, index, layer.length);
              const isOutput = layerIndex === prediction.layers.length - 1;
              const magnitude = Math.min(1, Math.abs(activation));
              const highlighted = isOutput ? index === selected : [...trace].some((edge) => edge.startsWith(`${layerIndex}-${index}-`));
              return <g key={`${layerIndex}-${index}`}>
                <circle cx={position.x} cy={position.y} r={isOutput && index === selected ? 14 : 10} fill={isOutput && index !== selected ? "#172a3c" : `rgb(27 182 224 / ${0.25 + magnitude * 0.6})`} stroke={isOutput && index === selected ? "#ffdfae" : "#75cce3"} strokeWidth="1.5" />
                {highlighted && <circle key={pulse} className={styles.firingNode} style={{ animationDelay: `${layerIndex * 160}ms` }} cx={position.x} cy={position.y} r="17" fill="none" stroke="#b1f0ff" aria-hidden="true" />}
                {isOutput && <text x={position.x} y={position.y + 27} textAnchor="middle">{prompt.words[index]}</text>}
              </g>;
            }))}
          </svg>
          <p className={styles.hint}>Hover, focus, or tap a word to trace its strongest contributions.</p>
          <div className={styles.predictionStatus}><span><span style={{ color: "#1bb6e0" }}>●</span> Positive weight</span><span><span style={{ color: "#e9b27d" }}>●</span> Negative weight</span></div>
        </div>
        <div className={styles.panel}>
          <p className={styles.label}>{prompt.text} …</p>
          <div className={styles.wordList} aria-label="Next word probabilities">
            {prompt.words.map((word, index) => <button key={word} type="button" className={styles.word} aria-pressed={selected === index} onMouseEnter={() => selectWord(index)} onFocus={() => selectWord(index)} onClick={() => selectWord(index)}>
              <span className={styles.wordFill} style={{ width: `${prediction.probabilities[index] * 100}%` }} />
              <span className={styles.wordContent}><strong>{word}</strong><span>{(prediction.probabilities[index] * 100).toFixed(1)}%</span></span>
            </button>)}
          </div>
          <div className={styles.predictionStatus}><span>Score: {prediction.logits[selected].toFixed(2)}</span><span>Entropy: {prediction.entropy.toFixed(2)} bits</span></div>
          <p className={`${styles.hint} mt-4`}>Temperature changes the distribution, not the network’s scores.</p>
        </div>
      </div>
      <p className={styles.footnote}><strong>P(word) = softmax(score / temperature).</strong> Fixed synthetic weights, two tanh layers, five possible words. The highlighted paths show the two largest activation × weight contributions per neuron—not a full explanation of a real LLM.</p>
    </div>
  );
}

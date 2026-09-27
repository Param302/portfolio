"use client";

import { useMemo, useState } from "react";
import { attentionSentences, calculateAttention } from "./ml-lab/attentionMath.mjs";
import styles from "./ml-lab/TokenDemos.module.css";

export default function SelfAttentionPlayground() {
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [query, setQuery] = useState(2);
  const [head, setHead] = useState(0);
  const [causal, setCausal] = useState(false);
  const sentence = attentionSentences[sentenceIndex];
  const attention = useMemo(() => calculateAttention(sentence.embeddings, head, causal), [sentence, head, causal]);
  const row = attention.weights[query];
  return (
    <div className={styles.demo}>
      <div className={styles.controls}>
        <label className={styles.control}>Sentence
          <select value={sentenceIndex} onChange={(event) => setSentenceIndex(Number(event.target.value))}>
            {attentionSentences.map((item, index) => <option key={item.label} value={index}>{item.label}</option>)}
          </select>
        </label>
        <div className={styles.control}><span>Projection</span>
          <div className={styles.segmented} aria-label="Attention head">
            {[0, 1].map((index) => <button key={index} type="button" aria-pressed={head === index} onClick={() => setHead(index)}>Head {index + 1}</button>)}
          </div>
        </div>
        <label className={styles.toggle}><input type="checkbox" checked={causal} onChange={(event) => setCausal(event.target.checked)} />Hide future tokens</label>
      </div>
      <p className={styles.hint}>Choose a query word. See how it mixes information from the other tokens.</p>
      <div className={styles.tokens} aria-label="Query word">
        {sentence.tokens.map((token, index) => <button key={`${sentenceIndex}-${index}`} type="button" className={styles.token} aria-pressed={query === index} onClick={() => setQuery(index)}>{token}</button>)}
      </div>
      <div className={styles.split}>
        <div className={styles.panel}>
          <p className={styles.label}>Every query → every key</p>
          <table className={styles.heatmap} aria-label="Attention weights in percent. Rows are queries, columns are keys.">
            <thead><tr><th scope="col">Q ↓ K →</th>{sentence.tokens.map((token, index) => <th key={index} scope="col">{token}</th>)}</tr></thead>
            <tbody>{attention.weights.map((weights, rowIndex) => (
              <tr key={rowIndex} data-selected={rowIndex === query}>
                <th scope="row">{sentence.tokens[rowIndex]}</th>
                {weights.map((weight, keyIndex) => <td key={keyIndex}>
                  <button type="button" onClick={() => setQuery(rowIndex)} aria-label={`${sentence.tokens[rowIndex]} to ${sentence.tokens[keyIndex]}: ${(weight * 100).toFixed(1)} percent${causal && keyIndex > rowIndex ? ", masked" : ""}`} style={{ backgroundColor: `rgb(27 182 224 / ${weight ? 0.06 + weight * 0.75 : 0})` }}>
                    {causal && keyIndex > rowIndex ? <span className={styles.masked}>—</span> : Math.round(weight * 100)}
                  </button>
                </td>)}
              </tr>
            ))}</tbody>
          </table>
          <p className={styles.hint}>Brighter cells carry more weight. Each row sums to 100% before rounding.</p>
        </div>
        <div className={styles.panel}>
          <p className={styles.label}>Where “{sentence.tokens[query]}” attends</p>
          <div className={styles.bars}>{row.map((weight, index) => <div key={index}>
            <div className={styles.barLabel}><span>{sentence.tokens[index]}</span><span>{(weight * 100).toFixed(1)}%</span></div>
            <div className={styles.track}><div className={styles.fill} style={{ width: `${weight * 100}%` }} /></div>
          </div>)}</div>
          <p className={`${styles.label} mt-6`}>Weighted value vector</p>
          <div className={styles.vector} aria-label={`Output vector for ${sentence.tokens[query]}`}>
            {attention.outputs[query].map((value, index) => <span key={index}>{value.toFixed(2)}</span>)}
          </div>
        </div>
      </div>
      <p className={styles.footnote}><strong>softmax(QKᵀ / √d) × V.</strong> Each head uses different fixed projections. This tiny, hand-authored model shows the calculation—not a trained model’s understanding. <a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noreferrer">The attention paper ↗</a></p>
    </div>
  );
}

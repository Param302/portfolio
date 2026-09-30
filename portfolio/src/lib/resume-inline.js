// A deliberately small inline language shared by the web resume and PDF.
// Only emphasis is interpreted; HTML, links, and TeX remain ordinary text.
const whitespace = /\s/u;
const punctuation = /[\p{P}\p{S}]/u;
const maximumNesting = 32;

function textNodes(tokens) {
  const nodes = [];
  for (const token of tokens) {
    const node = token.type === "delimiter"
      ? { type: "text", value: token.marker.repeat(token.count) }
      : token;
    const previous = nodes[nodes.length - 1];
    if (node.type === "text" && previous?.type === "text") previous.value += node.value;
    else nodes.push(node.type === "text" ? { ...node } : node);
  }
  return nodes;
}

function delimiterFlags(source, start, end, marker) {
  const before = source[start - 1] || "";
  const after = source[end] || "";
  const beforeSpace = !before || whitespace.test(before);
  const afterSpace = !after || whitespace.test(after);
  const beforePunctuation = punctuation.test(before);
  const afterPunctuation = punctuation.test(after);
  const left = !afterSpace && (!afterPunctuation || beforeSpace || beforePunctuation);
  const right = !beforeSpace && (!beforePunctuation || afterSpace || afterPunctuation);
  // Underscores inside words (snake_case, model_names) are always literal.
  return marker === "_"
    ? { canOpen: left && (!right || beforePunctuation), canClose: right && (!left || afterPunctuation) }
    : { canOpen: left, canClose: right };
}

function tokenize(source) {
  const tokens = [];
  // Path and URL underscores are literal, including segments like /_cache_/.
  // This does not turn URLs into links or interpret any other markup.
  const pathUnderscores = new Set();
  const pathBackslashes = new Set();
  for (const match of source.matchAll(/\S+/gu)) {
    if (!/[\/\\]/u.test(match[0])) continue;
    const windowsPath = /^(?:[*_]*[a-z]:\\|\\\\[^\\])/iu.test(match[0]);
    const path = windowsPath || /(?:[a-z][a-z0-9+.-]*:\/\/|www\.|^(?:\.{0,2}|~)\/|[\/\\]_[^\/\\]+_(?:[\/\\]|$))/iu.test(match[0]);
    if (!path) continue;
    const outerUnderscore = /^\**_([^_]|$)/u.test(match[0]) ? match[0].indexOf("_") : -1;
    const finalUnderscore = outerUnderscore >= 0 && /_\**$/u.test(match[0]) ? match[0].lastIndexOf("_") : -1;
    for (let offset = 0; offset < match[0].length; offset += 1) {
      if (match[0][offset] === "_" && offset !== outerUnderscore && offset !== finalUnderscore) pathUnderscores.add(match.index + offset);
      if (windowsPath && match[0][offset] === "\\") pathBackslashes.add(match.index + offset);
    }
  }
  function append(value) {
    const previous = tokens[tokens.length - 1];
    if (previous?.type === "text") previous.value += value;
    else tokens.push({ type: "text", value });
  }
  for (let index = 0; index < source.length;) {
    const marker = source[index];
    if (marker === "\\" && !pathBackslashes.has(index) && /[*_\\]/u.test(source[index + 1] || " ")) {
      append(source[index + 1]);
      index += 2;
      continue;
    }
    if (marker !== "*" && marker !== "_") {
      append(marker);
      index += 1;
      continue;
    }
    let end = index + 1;
    while (source[end] === marker) end += 1;
    if (marker === "_" && pathUnderscores.has(index)) append(source.slice(index, end));
    else tokens.push({ type: "delimiter", marker, count: end - index, ...delimiterFlags(source, index, end, marker) });
    index = end;
  }
  return tokens;
}

/** Parse **bold**, *italic*, and _italic_ into safe text/emphasis nodes. */
export function parseResumeInline(value = "") {
  const tokens = tokenize(String(value ?? ""));
  const depths = new WeakMap();
  for (let closerIndex = 0; closerIndex < tokens.length; closerIndex += 1) {
    const closer = tokens[closerIndex];
    if (closer.type !== "delimiter" || !closer.canClose) continue;
    let openerIndex = closerIndex - 1;
    for (; openerIndex >= 0; openerIndex -= 1) {
      const opener = tokens[openerIndex];
      if (opener.type !== "delimiter" || !opener.canOpen || opener.marker !== closer.marker) continue;
      // Avoid pairing ambiguous runs across another emphasis boundary.
      const ambiguous = (opener.canClose || closer.canOpen)
        && (opener.count + closer.count) % 3 === 0
        && (opener.count % 3 !== 0 || closer.count % 3 !== 0);
      if (!ambiguous) break;
    }
    if (openerIndex < 0) continue;
    const opener = tokens[openerIndex];
    const count = opener.count >= 2 && closer.count >= 2 ? 2 : 1;
    const children = textNodes(tokens.slice(openerIndex + 1, closerIndex));
    const depth = 1 + children.reduce((maximum, child) => Math.max(maximum, depths.get(child) || 0), 0);
    // Retain excess markers literally instead of creating unsafe recursive trees.
    if (depth > maximumNesting) continue;
    const node = {
      type: count === 2 ? "strong" : "em",
      children,
    };
    depths.set(node, depth);
    opener.count -= count;
    closer.count -= count;
    const replacement = [...(opener.count ? [opener] : []), node, ...(closer.count ? [closer] : [])];
    tokens.splice(openerIndex, closerIndex - openerIndex + 1, ...replacement);
    // Revisit unused closing markers: ***text*** becomes nested emphasis.
    closerIndex = openerIndex + replacement.length - (closer.count ? 2 : 1);
  }
  return textNodes(tokens);
}

/** Keep the same wording on homepage cards without resume emphasis markers. */
export function plainResumeText(value = "") {
  const pending = parseResumeInline(value).reverse();
  const parts = [];
  while (pending.length) {
    const node = pending.pop();
    if (node.type === "text") parts.push(node.value);
    else for (let index = node.children.length - 1; index >= 0; index -= 1) pending.push(node.children[index]);
  }
  return parts.join("");
}

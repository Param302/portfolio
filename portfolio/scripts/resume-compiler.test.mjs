import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const workerSource = await readFile(new URL("../public/workers/resume-compiler.worker.js", import.meta.url), "utf8");
const tick = () => new Promise((resolve) => setImmediate(resolve));
const successfulResult = () => ({
  status: 0,
  pdf: new TextEncoder().encode("%PDF /Type /Page"),
  log: "Output written on main.pdf (1 page, 42 bytes).",
});

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function harness() {
  const engines = [];
  const messages = [];
  let activeCompiles = 0;
  let maxActiveCompiles = 0;
  class MockEngine {
    constructor() {
      this.ready = false;
      this.closed = false;
      this.loading = deferred();
      this.compiles = [];
      this.writes = [];
      this.workerMessages = [];
      this.latexWorker = { postMessage: (message) => this.workerMessages.push(message) };
      engines.push(this);
    }
    isReady() { return this.ready; }
    async loadEngine() {
      await this.loading.promise;
      this.ready = true;
    }
    writeMemFSFile(filename, source) {
      assert.ok(this.ready, "writing requires a ready engine");
      this.writes.push({ filename, source });
    }
    setEngineMainFile(filename) { assert.equal(filename, "main.tex"); }
    async compileLaTeX() {
      assert.ok(this.ready, "compiling requires a ready engine");
      this.ready = false;
      activeCompiles += 1;
      maxActiveCompiles = Math.max(maxActiveCompiles, activeCompiles);
      const compile = deferred();
      this.compiles.push(compile);
      try {
        return await compile.promise;
      } finally {
        activeCompiles -= 1;
        this.ready = true;
      }
    }
    closeWorker() { this.closed = true; }
  }
  const self = {
    location: { origin: "https://portfolio.test" },
    postMessage: (message, transfers) => messages.push({ ...message, transfers }),
  };
  vm.runInNewContext(workerSource, {
    importScripts() {},
    exports: { PdfTeXEngine: MockEngine },
    self,
    TextDecoder,
  });
  return {
    engines,
    messages,
    send: (requestId, source = `source ${requestId}`) => self.onmessage({ data: { type: "compile", requestId, source } }),
    maxActiveCompiles: () => maxActiveCompiles,
  };
}

test("edits during initialization share one engine and compile only the latest source", async () => {
  const worker = harness();
  worker.send(1);
  worker.send(2);
  worker.send(3);
  assert.equal(worker.engines.length, 1);
  const engine = worker.engines[0];
  engine.loading.resolve();
  await tick();
  assert.deepEqual(engine.writes, [{ filename: "main.tex", source: "source 3" }]);
  assert.equal(engine.workerMessages[0].url, "https://portfolio.test/vendor/swiftlatex/texlive/");
  engine.compiles[0].resolve(successfulResult());
  await tick();
  assert.equal(worker.messages.length, 1);
  assert.equal(worker.messages[0].requestId, 3);
  assert.equal(worker.messages[0].type, "success");
  assert.equal(worker.messages[0].pageCount, 1);
  assert.equal(worker.messages[0].transfers[0], worker.messages[0].pdf);
});

test("edits during compilation keep only the latest pending request and reuse the engine", async () => {
  const worker = harness();
  worker.send(1);
  const engine = worker.engines[0];
  engine.loading.resolve();
  await tick();
  worker.send(2);
  worker.send(3);
  worker.send(4);
  assert.equal(worker.engines.length, 1);
  assert.equal(engine.compiles.length, 1);
  engine.compiles[0].resolve(successfulResult());
  await tick();
  assert.deepEqual(engine.writes.map(({ source }) => source), ["source 1", "source 4"]);
  assert.equal(worker.maxActiveCompiles(), 1);
  engine.compiles[1].resolve(successfulResult());
  await tick();
  worker.send(5);
  await tick();
  assert.equal(worker.engines.length, 1);
  engine.compiles[2].resolve(successfulResult());
  await tick();
  assert.deepEqual(worker.messages.map(({ requestId }) => requestId), [1, 4, 5]);
});

test("a failed initialization closes its engine and allows the queued edit to succeed", async () => {
  const worker = harness();
  worker.send(1);
  worker.send(2);
  worker.engines[0].loading.reject(new Error("Unable to load WASM"));
  await tick();
  assert.equal(worker.engines[0].closed, true);
  assert.equal(worker.messages[0].requestId, 1);
  assert.equal(worker.messages[0].log, "Unable to load WASM");
  assert.equal(worker.engines.length, 2);
  const retry = worker.engines[1];
  retry.loading.resolve();
  await tick();
  retry.compiles[0].resolve(successfulResult());
  await tick();
  assert.equal(worker.messages[1].type, "success");
  assert.equal(worker.messages[1].requestId, 2);
});

for (const failure of ["rejection", "invalid PDF"]) {
  test(`a compilation ${failure} resets the engine and drains the latest queued edit`, async () => {
    const worker = harness();
    worker.send(1);
    const failed = worker.engines[0];
    failed.loading.resolve();
    await tick();
    worker.send(2);
    worker.send(3);
    if (failure === "rejection") failed.compiles[0].reject(new Error("Engine crashed"));
    else failed.compiles[0].resolve({ status: 1, log: "Invalid LaTeX" });
    await tick();
    assert.equal(failed.closed, true);
    assert.equal(worker.messages[0].type, "error");
    assert.equal(worker.messages[0].requestId, 1);
    const retry = worker.engines[1];
    retry.loading.resolve();
    await tick();
    assert.equal(retry.writes[0].source, "source 3");
    retry.compiles[0].resolve(successfulResult());
    await tick();
    assert.equal(worker.messages[1].type, "success");
    assert.equal(worker.messages[1].requestId, 3);
    assert.equal(worker.maxActiveCompiles(), 1);
  });
}

test("cleanup errors do not block the next edit", async () => {
  const worker = harness();
  worker.send(1);
  worker.engines[0].closeWorker = () => { throw new Error("Worker already stopped"); };
  worker.engines[0].loading.reject(new Error("Unable to load WASM"));
  await tick();
  worker.send(2);
  const retry = worker.engines[1];
  retry.loading.resolve();
  await tick();
  retry.compiles[0].resolve(successfulResult());
  await tick();
  assert.deepEqual(worker.messages.map(({ type }) => type), ["error", "success"]);
});

import test from "node:test";
import assert from "node:assert/strict";
import {
  AVATAR_ENHANCEMENT_BUDGET_MS,
  beginAvatarEnhancement,
  probeAvatarSupport,
} from "../src/app/walloffame/avatar-enhancement.mjs";

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function fakeClock() {
  let time = 0;
  let sequence = 0;
  const timers = new Map();
  return {
    now: () => time,
    schedule(callback, delay) {
      const id = ++sequence;
      timers.set(id, { callback, at: time + delay });
      return id;
    },
    unschedule: (id) => timers.delete(id),
    setTime(value) { time = value; },
    advanceTo(value) {
      assert.ok(value >= time, "the test clock must move forward");
      for (;;) {
        const next = [...timers].filter(([, timer]) => timer.at <= value)
          .sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
        if (!next) break;
        time = Math.max(time, next[1].at);
        timers.delete(next[0]);
        next[1].callback();
      }
      time = value;
    },
    get pendingTimers() { return timers.size; },
  };
}

async function flushMicrotasks() {
  for (let count = 0; count < 6; count++) await Promise.resolve();
}

function fixture(overrides = {}) {
  const clock = fakeClock();
  const ready = [];
  const fallback = [];
  const instance = { disposals: 0, dispose() { this.disposals++; } };
  const run = beginAvatarEnhancement({
    now: clock.now,
    schedule: clock.schedule,
    unschedule: clock.unschedule,
    load: () => ({ renderer: "module" }),
    create: () => instance,
    onReady: (value) => ready.push(value),
    onFallback: (state, error) => fallback.push({ state, error }),
    ...overrides,
  });
  return { clock, ready, fallback, instance, run };
}

test("a fast instance is promoted once and clears the one-second deadline", async () => {
  assert.equal(AVATAR_ENHANCEMENT_BUDGET_MS, 1000);
  const f = fixture();
  await f.run.settled;
  assert.equal(f.run.state, "ready");
  assert.deepEqual(f.ready, [f.instance]);
  assert.deepEqual(f.fallback, []);
  assert.equal(f.run.signal.aborted, false);
  assert.equal(f.clock.pendingTimers, 0);
  f.clock.advanceTo(2000);
  assert.equal(f.run.state, "ready");
  assert.equal(f.instance.disposals, 0);
  f.run.cancel();
});

test("module import and instance creation share one 1000ms budget", async () => {
  const moduleLoad = deferred();
  const creation = deferred();
  let options;
  const f = fixture({
    load: () => moduleLoad.promise,
    create: (loaded, value) => {
      assert.equal(loaded, "loaded module");
      options = value;
      return creation.promise;
    },
  });
  f.clock.advanceTo(700);
  moduleLoad.resolve("loaded module");
  await flushMicrotasks();
  assert.equal(options.signal, f.run.signal);
  f.clock.advanceTo(999);
  assert.equal(f.run.state, "loading");
  f.clock.advanceTo(1000);
  assert.equal(f.run.state, "timeout");
  assert.equal(f.run.signal.reason.name, "TimeoutError");
  assert.equal(f.fallback.length, 1);
  assert.equal(f.fallback[0].state, "timeout");
  assert.deepEqual(f.ready, []);
  creation.resolve(f.instance);
  await f.run.settled;
  assert.equal(f.instance.disposals, 1, "a late instance must release its resources");
  assert.deepEqual(f.ready, []);
  assert.equal(f.fallback.length, 1);
  assert.equal(f.clock.pendingTimers, 0);
});

test("a module that loads after timeout never starts instance creation", async () => {
  const moduleLoad = deferred();
  let creates = 0;
  const f = fixture({ load: () => moduleLoad.promise, create: () => { creates++; } });
  f.clock.advanceTo(1000);
  moduleLoad.resolve({});
  await f.run.settled;
  assert.equal(creates, 0);
  assert.equal(f.run.state, "timeout");
  assert.equal(f.fallback.length, 1);
  assert.deepEqual(f.ready, []);
});

test("an import checkpoint enforces the deadline even when its timer is delayed", async () => {
  const moduleLoad = deferred();
  let creates = 0;
  const f = fixture({ load: () => moduleLoad.promise, create: () => { creates++; } });
  f.clock.setTime(1000);
  moduleLoad.resolve({});
  await f.run.settled;
  assert.equal(creates, 0);
  assert.equal(f.run.state, "timeout");
  assert.equal(f.clock.pendingTimers, 0);
  assert.equal(f.fallback[0].error.name, "TimeoutError");
});

test("synchronous creation that overruns a delayed timer is disposed, never promoted", async () => {
  let f;
  f = fixture({ create: () => { f.clock.setTime(1001); return f.instance; } });
  await f.run.settled;
  assert.equal(f.run.state, "timeout");
  assert.deepEqual(f.ready, []);
  assert.equal(f.instance.disposals, 1);
  assert.equal(f.fallback.length, 1);
  assert.equal(f.clock.pendingTimers, 0);
});

test("creation checkpoints stop synchronous work as soon as the budget expires", async () => {
  let workAfterCheckpoint = false;
  let f;
  f = fixture({ create: (_, { checkpoint }) => {
    f.clock.setTime(1000);
    checkpoint();
    workAfterCheckpoint = true;
    return f.instance;
  } });
  await f.run.settled;
  assert.equal(workAfterCheckpoint, false);
  assert.equal(f.run.state, "timeout");
  assert.deepEqual(f.ready, []);
  assert.equal(f.fallback.length, 1);
});

test("yielding creation checks the deadline again after a delayed task resumes", async () => {
  let workAfterYield = false;
  const f = fixture({ create: async (_, { yieldTask }) => {
    await yieldTask();
    workAfterYield = true;
    return f.instance;
  } });
  await flushMicrotasks();
  f.clock.setTime(1000);
  f.clock.advanceTo(1000);
  await f.run.settled;
  assert.equal(workAfterYield, false);
  assert.equal(f.run.state, "timeout");
  assert.deepEqual(f.ready, []);
  assert.equal(f.fallback.length, 1);
});

test("cancellation during module loading prevents creation and fallback callbacks", async () => {
  const moduleLoad = deferred();
  let creates = 0;
  const f = fixture({ load: () => moduleLoad.promise, create: () => { creates++; } });
  f.run.cancel();
  f.run.cancel();
  moduleLoad.resolve({});
  await f.run.settled;
  assert.equal(f.run.state, "disposed");
  assert.equal(f.run.signal.reason.name, "AbortError");
  assert.equal(creates, 0);
  assert.equal(f.clock.pendingTimers, 0);
  assert.deepEqual(f.ready, []);
  assert.deepEqual(f.fallback, []);
});

test("cancellation during creation disposes the eventual instance exactly once", async () => {
  const creation = deferred();
  let started = false;
  const f = fixture({ create: () => { started = true; return creation.promise; } });
  await flushMicrotasks();
  assert.equal(started, true);
  f.run.cancel();
  creation.resolve(f.instance);
  await f.run.settled;
  f.run.cancel();
  assert.equal(f.run.state, "disposed");
  assert.equal(f.instance.disposals, 1);
  assert.deepEqual(f.ready, []);
  assert.deepEqual(f.fallback, []);
});

test("cancellation after readiness disposes the active instance exactly once", async () => {
  const f = fixture();
  await f.run.settled;
  f.run.cancel();
  f.run.cancel();
  assert.equal(f.run.state, "disposed");
  assert.equal(f.run.signal.aborted, true);
  assert.equal(f.instance.disposals, 1);
  assert.equal(f.ready.length, 1);
  assert.deepEqual(f.fallback, []);
  assert.equal(f.clock.pendingTimers, 0);
});

test("module and creation failures abort enhancement and report one fallback", async (t) => {
  for (const failingStage of ["load", "create"]) {
    await t.test(failingStage, async () => {
      const failure = new Error(`${failingStage} failed`);
      const f = fixture({ [failingStage]: async () => { throw failure; } });
      await f.run.settled;
      assert.equal(f.run.state, "failed");
      assert.equal(f.run.signal.reason, failure);
      assert.deepEqual(f.fallback, [{ state: "failed", error: failure }]);
      assert.deepEqual(f.ready, []);
      assert.equal(f.clock.pendingTimers, 0);
    });
  }
});

function browserFixture() {
  let probes = 0;
  let releases = 0;
  const context = {
    isContextLost: () => false,
    getExtension: () => ({ loseContext() { releases++; } }),
  };
  const canvas = { getContext(type, options) {
    probes++;
    assert.equal(type, "webgl2");
    assert.equal(options.failIfMajorPerformanceCaveat, true);
    return context;
  } };
  const args = {
    window: {
      WebGL2RenderingContext() {}, AbortController, ResizeObserver() {},
      IntersectionObserver() {}, requestAnimationFrame() {}, cancelAnimationFrame() {},
      fetch() {}, createImageBitmap() {}, performance: { now: () => 0 },
      matchMedia: () => ({ matches: false }),
    },
    document: { createElement: () => canvas },
    navigator: { connection: { saveData: false } },
  };
  return { args, context, canvas, get probes() { return probes; }, get releases() { return releases; } };
}

test("a supported probe returns the original context for reuse and can release it", () => {
  const f = browserFixture();
  const support = probeAvatarSupport(f.args);
  assert.equal(support.supported, true);
  assert.equal(support.canvas, f.canvas);
  assert.equal(support.context, f.context);
  assert.equal(f.probes, 1);
  support.release();
  assert.equal(f.releases, 1);
});

test("reduced-motion preferences and save-data skip context allocation", async (t) => {
  const cases = [
    ["explicit reduced motion", "reduced-motion", (args) => { args.reduceMotion = true; }],
    ["system reduced motion", "reduced-motion", (args) => { args.window.matchMedia = () => ({ matches: true }); }],
    ["save data", "save-data", (args) => { args.navigator.connection.saveData = true; }],
  ];
  for (const [name, reason, configure] of cases) {
    await t.test(name, () => {
      const f = browserFixture();
      configure(f.args);
      assert.deepEqual(probeAvatarSupport(f.args), { supported: false, reason });
      assert.equal(f.probes, 0);
    });
  }
});

test("missing required browser APIs disable enhancement without allocating WebGL", async (t) => {
  const required = ["WebGL2RenderingContext", "AbortController", "ResizeObserver", "IntersectionObserver", "requestAnimationFrame", "cancelAnimationFrame", "fetch", "createImageBitmap", "performance"];
  for (const api of required) {
    await t.test(api, () => {
      const f = browserFixture();
      delete f.args.window[api];
      assert.deepEqual(probeAvatarSupport(f.args), { supported: false, reason: "unsupported" });
      assert.equal(f.probes, 0);
    });
  }
  for (const missing of ["document", "createElement", "performance.now"]) {
    await t.test(missing, () => {
      const f = browserFixture();
      if (missing === "document") delete f.args.document;
      if (missing === "createElement") delete f.args.document.createElement;
      if (missing === "performance.now") delete f.args.window.performance.now;
      assert.deepEqual(probeAvatarSupport(f.args), { supported: false, reason: "unsupported" });
      assert.equal(f.probes, 0);
    });
  }
});

test("a null or already-lost WebGL2 context disables enhancement", async (t) => {
  await t.test("null context", () => {
    const f = browserFixture();
    f.canvas.getContext = () => null;
    assert.deepEqual(probeAvatarSupport(f.args), { supported: false, reason: "unsupported" });
  });
  await t.test("lost context", () => {
    const f = browserFixture();
    f.context.isContextLost = () => true;
    assert.deepEqual(probeAvatarSupport(f.args), { supported: false, reason: "unsupported" });
  });
});

test("WebGL2 allocation or inspection exceptions become unsupported results", async (t) => {
  for (const failingCall of ["createElement", "getContext", "isContextLost"]) {
    await t.test(failingCall, () => {
      const f = browserFixture();
      const fail = () => { throw new Error("context unavailable"); };
      if (failingCall === "createElement") f.args.document.createElement = fail;
      if (failingCall === "getContext") f.canvas.getContext = fail;
      if (failingCall === "isContextLost") f.context.isContextLost = fail;
      assert.deepEqual(probeAvatarSupport(f.args), { supported: false, reason: "unsupported" });
      assert.equal(f.releases, failingCall === "isContextLost" ? 1 : 0);
    });
  }
});

test("cleanup errors after a failed WebGL2 probe do not escape into the page", () => {
  const f = browserFixture();
  f.context.isContextLost = () => { throw new Error("context inspection failed"); };
  f.context.getExtension = () => { throw new Error("context cleanup failed"); };
  assert.deepEqual(probeAvatarSupport(f.args), { supported: false, reason: "unsupported" });
});

export const AVATAR_ENHANCEMENT_BUDGET_MS = 1000;
export const AVATAR_BACKGROUND_BUDGET_MS = 15000;

function stoppedError(message, name = "AbortError") {
  const error = new Error(message);
  error.name = name;
  return error;
}

// A real WebGL2 context is stronger evidence than checking the constructor.
// Hand the successful probe to Three.js so it does not allocate a second one.
export function probeAvatarSupport({ window: view, document: page, navigator: nav, reduceMotion = false }) {
  if (reduceMotion || view.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return { supported: false, reason: "reduced-motion" };
  if (nav?.connection?.saveData) return { supported: false, reason: "save-data" };
  const required = ["WebGL2RenderingContext", "AbortController", "ResizeObserver", "IntersectionObserver", "requestAnimationFrame", "cancelAnimationFrame", "fetch", "createImageBitmap"];
  if (required.some((name) => typeof view[name] !== "function") || !view.performance?.now || !page?.createElement) {
    return { supported: false, reason: "unsupported" };
  }
  let context;
  const release = () => {
    try { context?.getExtension("WEBGL_lose_context")?.loseContext(); } catch { /* A failed context may also reject cleanup. */ }
  };
  try {
    const canvas = page.createElement("canvas");
    context = canvas.getContext("webgl2", { alpha: true, antialias: true, powerPreference: "low-power", failIfMajorPerformanceCaveat: true });
    if (!context || context.isContextLost()) { release(); return { supported: false, reason: "unsupported" }; }
    return { supported: true, canvas, context, release };
  } catch {
    release();
    return { supported: false, reason: "unsupported" };
  }
}

/**
 * A deadline covers module loading, resources, geometry and the first frame.
 * Both timers and explicit checkpoints are necessary: synchronous WebGL/mesh
 * work can delay the timer, but may never promote an already-expired result.
 */
export function beginAvatarEnhancement({ load, create, onReady, onFallback, now = () => performance.now(), schedule = setTimeout, unschedule = clearTimeout, startedAt = now(), timeoutMs = AVATAR_ENHANCEMENT_BUDGET_MS }) {
  const controller = new AbortController();
  const deadline = startedAt + timeoutMs;
  let state = "loading";
  let instance;
  let timer;
  const expire = (reason) => {
    if (state !== "loading") return;
    state = reason?.name === "TimeoutError" ? "timeout" : "failed";
    unschedule(timer);
    controller.abort(reason);
    onFallback?.(state, reason);
  };
  const checkpoint = () => {
    if (controller.signal.aborted) throw controller.signal.reason || stoppedError("Avatar enhancement cancelled");
    if (now() >= deadline) {
      const error = stoppedError(`Avatar enhancement exceeded its ${timeoutMs}ms budget`, "TimeoutError");
      expire(error);
      throw error;
    }
  };
  const yieldTask = async () => {
    checkpoint();
    await new Promise((resolve) => schedule(resolve, 0));
    checkpoint();
  };
  timer = schedule(() => expire(stoppedError(`Avatar enhancement exceeded its ${timeoutMs}ms budget`, "TimeoutError")), Math.max(0, deadline - now()));
  const settled = (async () => {
    let candidate;
    try {
      checkpoint();
      const loadedModule = await load();
      checkpoint();
      candidate = await create(loadedModule, { signal: controller.signal, checkpoint, yieldTask });
      checkpoint();
      instance = candidate;
      state = "ready";
      unschedule(timer);
      onReady?.(instance);
    } catch (error) {
      candidate?.dispose();
      expire(error);
    }
  })();
  return {
    signal: controller.signal,
    settled,
    get state() { return state; },
    cancel() {
      if (state === "disposed") return;
      state = "disposed";
      unschedule(timer);
      controller.abort(stoppedError("Avatar enhancement cancelled"));
      instance?.dispose();
      instance = undefined;
    },
  };
}

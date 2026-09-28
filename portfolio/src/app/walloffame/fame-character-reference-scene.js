import * as THREE from "three";
import { createReferenceHead } from "./avatar-reference-head";
import { createReferenceWardrobe } from "./avatar-reference-wardrobe";
import { createReferenceEyes } from "./avatar-reference-eyes";
import { createReferenceMaterial } from "./avatar-reference-material";

const clamp = THREE.MathUtils.clamp;

function disposeObject(root, extraMaterials) {
  const geometries = new Set();
  const materials = new Set(extraMaterials);
  root?.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
    for (const material of [].concat(object.material || [])) materials.add(material);
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}

export async function createFameCharacter(host, {
  reduceMotion = false, reaction = "idle", onReadyChange, signal,
  blinkInterval,
  checkpoint = () => {}, yieldTask = () => Promise.resolve(),
  canvas: suppliedCanvas, context,
} = {}) {
  let disposed = false;
  let renderer;
  let scene;
  let faceRig;
  let frame = 0;
  const cleanups = [];
  const textures = new Set();
  const bitmaps = new Set();
  const materials = new Set();
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    cleanups.forEach((cleanup) => cleanup());
    faceRig?.dispose();
    disposeObject(scene, materials);
    textures.forEach((texture) => texture.dispose());
    bitmaps.forEach((bitmap) => bitmap.close());
    renderer?.dispose();
    renderer?.forceContextLoss();
    renderer?.domElement.remove();
  };
  const check = () => {
    checkpoint();
    if (disposed || signal?.aborted) throw signal?.reason || new DOMException("Avatar enhancement cancelled", "AbortError");
  };
  const stage = async () => { check(); await yieldTask(); check(); };
  signal?.addEventListener("abort", dispose, { once: true });
  cleanups.push(() => signal?.removeEventListener("abort", dispose));

  async function loadTexture(url) {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error("Avatar texture could not load (" + response.status + ")");
    check();
    const blob = await response.blob();
    check();
    // ImageBitmap ignores Texture.flipY: flip during decoding to preserve the
    // calibrated source UVs. Close an aborted decode as soon as it resolves.
    const bitmap = await createImageBitmap(blob, { imageOrientation: "flipY", premultiplyAlpha: "none" });
    if (disposed || signal?.aborted) { bitmap.close(); check(); }
    bitmaps.add(bitmap);
    check();
    const texture = new THREE.Texture(bitmap);
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 2;
    texture.needsUpdate = true;
    textures.add(texture);
    return texture;
  }

  try {
    check();
    const [texture, turbanTexture] = await Promise.all([
      loadTexture("/avatar-optimized/face-v2.webp"),
      loadTexture("/avatar-optimized/turban-v3.webp"),
    ]);
    await stage();
    const frontMaterial = createReferenceMaterial(texture);
    const turbanMaterial = createReferenceMaterial(turbanTexture);
    materials.add(frontMaterial);
    materials.add(turbanMaterial);
    renderer = new THREE.WebGLRenderer({ canvas: suppliedCanvas, context, antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    scene = new THREE.Scene();
    // Reference textures contain studio lighting; closed side surfaces need
    // only a cheap fill. No environment bake or shadow pass is necessary.
    scene.add(new THREE.HemisphereLight(0xfff4e7, 0x69849a, 1.2));
    const camera = new THREE.OrthographicCamera(-2.08, 2.08, 2.08, -2.08, 0.1, 40);
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);
    const portrait = new THREE.Group();
    scene.add(portrait);
    const headGroup = new THREE.Group();
    portrait.add(headGroup);
    check();
    const head = createReferenceHead({ frontMaterial, maxEdge: 28 });
    headGroup.add(head.group);
    await stage();
    const wardrobe = createReferenceWardrobe({ frontMaterial, turbanMaterial, maxEdge: 34 });
    headGroup.add(wardrobe.turban);
    portrait.add(wardrobe.body);
    await stage();
    faceRig = createReferenceEyes(headGroup, { texture, depthAt: head.depthAt, reduceMotion, blinkInterval });
    const teethShape = new THREE.Shape();
    teethShape.moveTo(-0.205, 0.012);
    teethShape.quadraticCurveTo(0, 0.064, 0.205, 0.012);
    teethShape.quadraticCurveTo(0.17, -0.052, 0, -0.064);
    teethShape.quadraticCurveTo(-0.17, -0.052, -0.205, 0.012);
    const teeth = new THREE.Mesh(
      new THREE.ShapeGeometry(teethShape, 18),
      new THREE.MeshBasicMaterial({ color: 0xfff7ea, toneMapped: false, side: THREE.DoubleSide }),
    );
    teeth.name = "Small celebration smile teeth";
    teeth.position.set(0.055, -0.36, head.depthAt(645, 734) + 0.055);
    teeth.visible = false;
    teeth.renderOrder = 8;
    headGroup.add(teeth);
    check();

    const sparkles = new THREE.Group();
    scene.add(sparkles);
    const starShape = new THREE.Shape();
    for (let index = 0; index < 10; index++) {
      const angle = Math.PI / 2 + index * Math.PI / 5;
      const radius = index % 2 ? 0.058 : 0.14;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (index) starShape.lineTo(x, y); else starShape.moveTo(x, y);
    }
    starShape.closePath();
    const starGeometry = new THREE.ExtrudeGeometry(starShape, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.008, bevelSegments: 1, steps: 1 });
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xf7c45c, toneMapped: false });
    [[-1.48, 1.18, 0], [1.48, 1.15, 0], [-1.66, 0.48, 0], [1.66, 0.42, 0], [-1.3, -0.18, 0], [1.28, -0.22, 0], [0, 1.76, 0]].forEach((position) => {
      const star = new THREE.Mesh(starGeometry, starMaterial);
      star.position.set(...position);
      sparkles.add(star);
    });
    sparkles.visible = false;
    let contextLost = false;
    let inView = true;
    let motionReduced = Boolean(reduceMotion);
    let paused = false;
    let currentReaction = reaction;
    let lastTime = 0;
    let elapsed = 0;
    let reactionStart = 0;
    const pointer = new THREE.Vector2();
    const gaze = new THREE.Vector2();
    const lookTarget = new THREE.Vector3();
    const canvas = renderer.domElement;

    function render() { if (!disposed && !contextLost && !paused) renderer.render(scene, camera); }
    function pose(delta = 0) {
      const excited = currentReaction === "excited";
      const liked = currentReaction === "liked";
      const age = elapsed - reactionStart;
      const likedEnvelope = liked
        ? Math.min(1, Math.max(0, age / 0.14)) * Math.min(1, Math.max(0, (2.08 - age) / 0.14))
        : 0;
      if (motionReduced) gaze.set(0, 0);
      else gaze.copy(pointer);
      portrait.position.y = motionReduced ? 0 : Math.sin(elapsed * 1.25) * 0.008
        + (excited ? Math.abs(Math.sin(age * 8)) * Math.exp(-age * 1.8) * 0.11 : 0)
        + (liked ? Math.sin(age * 27) * 0.01 * likedEnvelope : 0);
      teeth.visible = liked;
      teeth.scale.set(0.78 + likedEnvelope * 0.22, 0.35 + likedEnvelope * 0.65, 1);
      headGroup.updateWorldMatrix(true, false);
      lookTarget.set(gaze.x * 4, 0.29 + gaze.y * 3, 10);
      faceRig.setLookTarget(headGroup.worldToLocal(lookTarget));
      faceRig.update(delta);
      sparkles.visible = currentReaction === "stars" || liked;
      sparkles.children.forEach((star, index) => {
        const introScale = motionReduced ? 1 : Math.min(1, Math.max(0, age / 0.24));
        star.scale.setScalar(motionReduced ? 1 : introScale * (0.9 + Math.sin(elapsed * 7 + index * 1.7) * 0.24));
        star.rotation.z = motionReduced ? 0 : elapsed * (index % 2 ? -0.65 : 0.65) + index;
        star.rotation.y = motionReduced ? 0 : Math.sin(elapsed * 2.2 + index) * 0.35;
      });
    }
    function tick(time) {
      frame = 0;
      if (disposed || contextLost || !inView || document.hidden || motionReduced || paused) return;
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016;
      lastTime = time;
      elapsed += delta;
      pose(delta); render();
      frame = requestAnimationFrame(tick);
    }
    function resume() {
      if (!disposed && !contextLost && inView && !document.hidden && !motionReduced && !paused && !frame) {
        lastTime = 0;
        frame = requestAnimationFrame(tick);
      }
    }
    function stop() { cancelAnimationFrame(frame); frame = 0; }
    function resize(shouldRender = true) {
      if (disposed || contextLost) return false;
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return false;
      renderer.setSize(width, height, false);
      const aspect = width / height;
      const halfHeight = Math.max(2.08, 2.05 / aspect);
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.left = -halfHeight * aspect;
      camera.right = halfHeight * aspect;
      camera.updateProjectionMatrix();
      if (shouldRender) render();
      return true;
    }
    function gazeMove(event) {
      if (motionReduced || paused || !inView || event.pointerType === "touch") return;
      const rect = host.getBoundingClientRect();
      const eyeLine = (camera.top - 0.29) / (camera.top - camera.bottom);
      pointer.set(
        clamp((event.clientX - rect.left - rect.width / 2) / Math.max(48, rect.width * 0.45), -1, 1),
        clamp(-(event.clientY - rect.top - rect.height * eyeLine) / Math.max(48, rect.height * 0.35), -1, 1),
      );
    }
    function pointerLeave() { pointer.set(0, 0); }
    function visibility() { if (document.hidden) stop(); else { pose(); render(); resume(); } }
    function contextLostHandler(event) { event.preventDefault(); contextLost = true; stop(); onReadyChange?.(false); }
    function contextRestored() {
      if (disposed) return;
      contextLost = false;
      resize(false); pose(); render();
      onReadyChange?.(true);
      resume();
    }

    head.setExpression(currentReaction);
    faceRig.setReaction(currentReaction);
    faceRig.setReducedMotion(motionReduced);
    if (!resize(false)) throw new Error("Avatar host has no visible size");
    pose();
    await stage();
    // Let the browser paint the inline static portrait before GPU compilation.
    await new Promise((resolve) => {
      const firstFrame = requestAnimationFrame(resolve);
      cleanups.push(() => { cancelAnimationFrame(firstFrame); resolve(); });
    });
    check();
    render();
    check(); // Synchronous shader compilation can cross an otherwise idle timer.
    host.appendChild(canvas);

    const listen = (target, name, listener, options) => {
      target.addEventListener(name, listener, options);
      cleanups.push(() => target.removeEventListener(name, listener, options));
    };
    listen(canvas, "webglcontextlost", contextLostHandler);
    listen(canvas, "webglcontextrestored", contextRestored);
    listen(window, "pointermove", gazeMove, { passive: true });
    listen(document.documentElement, "pointerleave", pointerLeave);
    listen(document, "visibilitychange", visibility);
    const resizeObserver = new ResizeObserver(() => resize());
    cleanups.push(() => resizeObserver.disconnect());
    resizeObserver.observe(host);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) { pose(); render(); resume(); } else stop();
    }, { rootMargin: "80px" });
    cleanups.push(() => intersectionObserver.disconnect());
    intersectionObserver.observe(host);
    check();
    resume();

    return {
      setPaused(next) {
        if (disposed || paused === Boolean(next)) return;
        paused = Boolean(next);
        stop();
        if (!paused) { pose(); render(); resume(); }
      },
      setReducedMotion(next) {
        if (disposed) return;
        motionReduced = Boolean(next);
        faceRig.setReducedMotion(motionReduced);
        stop(); pose(); render(); resume();
      },
      setReaction(next) {
        if (disposed) return;
        currentReaction = ["happy", "excited", "stars", "liked"].includes(next) ? next : "idle";
        reactionStart = elapsed;
        head.setExpression(currentReaction);
        faceRig.setReaction(currentReaction);
        pose(); render();
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}

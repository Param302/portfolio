import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createAvatarHead } from "./avatar-head";
import { createAvatarWardrobe } from "./avatar-wardrobe";
import { createAvatarFaceRig } from "./avatar-face-rig";

const clamp = THREE.MathUtils.clamp;
const DEFAULT_YAW = 0;

function disposeObject(root) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  root.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
    for (const material of [].concat(object.material || [])) {
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    }
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  textures.forEach((texture) => texture.dispose());
}

export function createFameCharacter(host, { reduceMotion = false, reaction = "idle", onReadyChange } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
  camera.position.set(0, 0.16, 7.2);
  camera.lookAt(0, 0.16, 0);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  room.dispose();
  pmrem.dispose();
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.45;
  scene.add(new THREE.HemisphereLight(0xfff4e7, 0x69849a, 0.45));
  const keyLight = new THREE.DirectionalLight(0xffeed5, 2.1);
  keyLight.position.set(-3.5, 5, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  Object.assign(keyLight.shadow.camera, { left: -2.4, right: 2.4, top: 2.8, bottom: -2.4, near: 0.5, far: 16 });
  keyLight.shadow.bias = -0.00015;
  keyLight.shadow.normalBias = 0.015;
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xd9ecff, 0.6);
  fillLight.position.set(4, 1.5, 3);
  scene.add(fillLight);
  const rimLight = new THREE.DirectionalLight(0xffe1b7, 1.4);
  rimLight.position.set(2, 3, -4);
  scene.add(rimLight);

  const pivot = new THREE.Group();
  const portrait = new THREE.Group();
  pivot.add(portrait);
  scene.add(pivot);
  const headMotion = new THREE.Group();
  const head = createAvatarHead();
  const wardrobe = createAvatarWardrobe();
  headMotion.add(head.group, wardrobe.turban);
  portrait.add(wardrobe.body, headMotion);
  const faceRig = createAvatarFaceRig(headMotion, {
    eyes: head.eyeSockets,
    skinMaterial: head.skinMaterial,
    reduceMotion,
  });
  faceRig.group.traverse((object) => {
    if (object.isMesh && !object.material.isMeshBasicMaterial) object.receiveShadow = true;
  });

  const sparkles = new THREE.Group();
  scene.add(sparkles);
  const starShape = new THREE.Shape();
  for (let index = 0; index < 10; index++) {
    const angle = Math.PI / 2 + index * Math.PI / 5;
    const radius = index % 2 ? 0.042 : 0.096;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (index) starShape.lineTo(x, y); else starShape.moveTo(x, y);
  }
  starShape.closePath();
  const starGeometry = new THREE.ExtrudeGeometry(starShape, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.008, bevelSegments: 2, steps: 1 });
  const starMaterial = new THREE.MeshStandardMaterial({ color: 0xf7c45c, metalness: 0.5, roughness: 0.32, emissive: 0xa96412, emissiveIntensity: 0.12 });
  [[-1.25, 0.95, 0], [1.15, 1.35, 0], [1.38, 0.4, 0]].forEach((position) => {
    const star = new THREE.Mesh(starGeometry, starMaterial);
    star.position.set(...position);
    sparkles.add(star);
  });
  sparkles.visible = false;

  let disposed = false;
  const loaded = true;
  let contextLost = false;
  let inView = true;
  let motionReduced = Boolean(reduceMotion);
  let currentReaction = reaction;
  let frame = 0;
  let lastTime = 0;
  let elapsed = 0;
  let reactionStart = 0;
  let yaw = DEFAULT_YAW;
  let pitch = 0;
  let dragging = null;
  const pointer = new THREE.Vector2();
  const gaze = new THREE.Vector2();
  const lookTarget = new THREE.Vector3();
  const canvas = renderer.domElement;

  function render() {
    if (!disposed && !contextLost && loaded) renderer.render(scene, camera);
  }
  function pose(delta = 0) {
    const excited = currentReaction === "excited";
    const happy = currentReaction === "happy";
    const stars = currentReaction === "stars";
    const age = elapsed - reactionStart;
    if (motionReduced || dragging) gaze.set(0, 0);
    else gaze.lerp(pointer, Math.min(1, delta * 7));
    pivot.rotation.set(pitch, yaw, 0);
    headMotion.updateWorldMatrix(true, false);
    lookTarget.set(gaze.x * 4, 0.52 + gaze.y * 3, 10);
    faceRig.setLookTarget(headMotion.worldToLocal(lookTarget));
    faceRig.update(delta);
    headMotion.rotation.x = motionReduced ? 0 : excited ? Math.sin(age * 8) * Math.exp(-age * 1.8) * 0.045 : 0;
    portrait.rotation.z = motionReduced ? 0 : happy ? -0.025 : Math.sin(elapsed * 0.7) * 0.006;
    portrait.position.y = motionReduced ? 0 : Math.sin(elapsed * 1.25) * 0.008 + (excited ? Math.abs(Math.sin(age * 8)) * Math.exp(-age * 1.8) * 0.11 : 0);
    sparkles.visible = stars;
    sparkles.children.forEach((star, index) => {
      star.scale.setScalar(motionReduced ? 1 : 0.86 + Math.sin(elapsed * 2.5 + index * 2) * 0.16);
      star.rotation.y = motionReduced ? 0 : Math.sin(elapsed * 1.4 + index) * 0.35;
    });
  }
  function tick(time) {
    frame = 0;
    if (disposed || contextLost || !loaded || !inView || document.hidden || motionReduced) return;
    const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016;
    lastTime = time;
    elapsed += delta;
    pose(delta);
    render();
    frame = requestAnimationFrame(tick);
  }
  function resume() {
    if (!disposed && !contextLost && loaded && inView && !document.hidden && !motionReduced && !frame) {
      lastTime = 0;
      frame = requestAnimationFrame(tick);
    }
  }
  function stop() { cancelAnimationFrame(frame); frame = 0; }
  function resize() {
    if (disposed || contextLost) return;
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = Math.max(6.9, 6.2 / camera.aspect);
    camera.updateProjectionMatrix();
    render();
  }
  function rotateBy(yawDelta, pitchDelta = 0) {
    if (disposed || !loaded) return;
    yaw += yawDelta;
    pitch = clamp(pitch + pitchDelta, -0.4, 0.4);
    pose();
    render();
  }
  function resetView() {
    yaw = DEFAULT_YAW;
    pitch = 0;
    pointer.set(0, 0);
    gaze.set(0, 0);
    pose();
    render();
  }
  function dragStart(event) {
    if (!loaded || event.button !== 0 || dragging) return;
    dragging = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
    host.dataset.dragging = "true";
  }
  function dragMove(event) {
    if (!dragging || event.pointerId !== dragging.id) return;
    rotateBy((event.clientX - dragging.x) * 0.009, (event.clientY - dragging.y) * 0.005);
    dragging.x = event.clientX;
    dragging.y = event.clientY;
  }
  function dragEnd(event) {
    if (!dragging || event.pointerId !== dragging.id) return;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    dragging = null;
    delete host.dataset.dragging;
  }
  function gazeMove(event) {
    if (motionReduced || dragging || !inView || event.pointerType === "touch") return;
    const rect = host.getBoundingClientRect();
    pointer.set(clamp((event.clientX - rect.left - rect.width / 2) / Math.max(200, window.innerWidth * 0.35), -1, 1), clamp(-(event.clientY - rect.top - rect.height / 2) / Math.max(200, window.innerHeight * 0.4), -1, 1));
  }
  function pointerLeave() { pointer.set(0, 0); }
  function visibility() { if (document.hidden) stop(); else { pose(); render(); resume(); } }
  function contextLostHandler(event) { event.preventDefault(); contextLost = true; stop(); onReadyChange?.(false); }
  function contextRestored() {
    if (disposed) return;
    contextLost = false;
    resize(); pose(); render();
    onReadyChange?.(loaded);
    resume();
  }

  canvas.addEventListener("pointerdown", dragStart);
  canvas.addEventListener("pointermove", dragMove);
  canvas.addEventListener("pointerup", dragEnd);
  canvas.addEventListener("pointercancel", dragEnd);
  canvas.addEventListener("lostpointercapture", dragEnd);
  canvas.addEventListener("webglcontextlost", contextLostHandler);
  canvas.addEventListener("webglcontextrestored", contextRestored);
  window.addEventListener("pointermove", gazeMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", pointerLeave);
  document.addEventListener("visibilitychange", visibility);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) { pose(); render(); resume(); } else stop();
  }, { rootMargin: "80px" });
  intersectionObserver.observe(host);

  head.setExpression(currentReaction);
  faceRig.setReaction(currentReaction);
  faceRig.setReducedMotion(motionReduced);
  resize(); pose(); render();
  onReadyChange?.(true);
  resume();

  return {
    rotateBy,
    resetView,
    setReducedMotion(next) {
      motionReduced = Boolean(next);
      faceRig.setReducedMotion(motionReduced);
      stop(); pose(); render(); resume();
    },
    setReaction(next) {
      currentReaction = ["happy", "excited", "stars"].includes(next) ? next : "idle";
      reactionStart = elapsed;
      head.setExpression(currentReaction);
      faceRig.setReaction(currentReaction);
      pose(); render();
    },
    dispose() {
      disposed = true;
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("pointerdown", dragStart);
      canvas.removeEventListener("pointermove", dragMove);
      canvas.removeEventListener("pointerup", dragEnd);
      canvas.removeEventListener("pointercancel", dragEnd);
      canvas.removeEventListener("lostpointercapture", dragEnd);
      canvas.removeEventListener("webglcontextlost", contextLostHandler);
      canvas.removeEventListener("webglcontextrestored", contextRestored);
      window.removeEventListener("pointermove", gazeMove);
      document.documentElement.removeEventListener("pointerleave", pointerLeave);
      document.removeEventListener("visibilitychange", visibility);
      faceRig.dispose();
      disposeObject(scene);
      keyLight.shadow.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      delete host.dataset.dragging;
    },
  };
}

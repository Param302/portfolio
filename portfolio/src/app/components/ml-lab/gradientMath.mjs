// An anisotropic quadratic makes both convergence and overshooting visible.
export const initialPoint = { x: 2.6, y: 1.6 };
export const loss = ({ x, y }) => (x * x + 3 * y * y) / 2;
export const gradientStep = ({ x, y }, rate) => ({ x: x * (1 - rate), y: y * (1 - 3 * rate) });
export const hasEscaped = (point) => !Number.isFinite(loss(point)) || Math.abs(point.x) > 3 || Math.abs(point.y) > 3;

export function projectPoint(x, y, z, view = -0.55) {
  const yaw = typeof view === "number" ? view : view.yaw ?? -0.55;
  const pitch = typeof view === "number" ? 0 : view.pitch ?? 0.2;
  const u = x * Math.cos(yaw) - y * Math.sin(yaw);
  const v = x * Math.sin(yaw) + y * Math.cos(yaw);
  const tiltedY = v * Math.cos(pitch) - z * Math.sin(pitch);
  const tiltedZ = v * Math.sin(pitch) + z * Math.cos(pitch);
  return { x: 340 + u * 65, y: 315 + tiltedY * 29 - tiltedZ * 9 };
}

// An anisotropic quadratic makes both convergence and overshooting visible.
export const initialPoint = { x: 2.6, y: 1.6 };
export const loss = ({ x, y }) => (x * x + 3 * y * y) / 2;
export const gradientStep = ({ x, y }, rate) => ({ x: x * (1 - rate), y: y * (1 - 3 * rate) });
export const hasEscaped = (point) => !Number.isFinite(loss(point)) || Math.abs(point.x) > 3 || Math.abs(point.y) > 3;

export function projectPoint(x, y, z, angle = -0.55) {
  const u = x * Math.cos(angle) - y * Math.sin(angle);
  const v = x * Math.sin(angle) + y * Math.cos(angle);
  return { x: 340 + u * 65, y: 315 + v * 29 - z * 10 };
}

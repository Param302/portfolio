import test from "node:test";
import assert from "node:assert/strict";
import { gradientStep, hasEscaped, initialPoint, loss, projectPoint } from "../src/app/components/ml-lab/gradientMath.mjs";

test("stable gradient descent monotonically reduces quadratic loss", () => {
  let point = initialPoint;
  for (let i = 0; i < 60; i++) {
    const next = gradientStep(point, 0.3);
    assert.ok(loss(next) < loss(point));
    point = next;
  }
  assert.ok(loss(point) < 1e-12);
});
test("large learning rate diverges along high-curvature axis", () => {
  let point = initialPoint;
  for (let i = 0; i < 10; i++) point = gradientStep(point, 0.9);
  assert.ok(hasEscaped(point));
  assert.ok(loss(point) > loss(initialPoint));
});
test("projection keeps the minimum centered under camera rotation", () => {
  assert.deepEqual(projectPoint(0, 0, 0, -2), projectPoint(0, 0, 0, 2));
});
test("surface remains inside its viewport at every supported rotation", () => {
  for (let angle = -2.8; angle <= 2.8; angle += 0.05) {
    for (let xi = 0; xi <= 20; xi++) {
      for (let yi = 0; yi <= 20; yi++) {
        const x = -3 + xi * 0.3, y = -3 + yi * 0.3;
        const p = projectPoint(x, y, loss({ x, y }), angle);
        assert.ok(p.x >= 0 && p.x <= 680 && p.y >= 0 && p.y <= 460);
      }
    }
  }
});

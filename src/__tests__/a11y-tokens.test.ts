import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "..", "styles", "index.css"),
  "utf8",
);

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function channel(c: number) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}
function contrast(a: string, b: string) {
  const L = (hex: string) => {
    const [r, g, b] = hexToRgb(hex).map(channel);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [x, y] = [L(a), L(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

describe("chat chrome contrast and focus", () => {
  it("defines :focus-visible rings and keeps body/placeholder/user-bubble text at 4.5:1", () => {
    expect(css).toMatch(/:focus-visible/);
    expect(css).toMatch(/--ac-text-tertiary:\s*#4b5563/);
    expect(css).toMatch(/--ac-user-bubble:\s*#4f46e5/);
    expect(css).toMatch(/--ac-text-tertiary:\s*#8b93a0/);
    expect(contrast("#111827", "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#4b5563", "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#ffffff", "#4f46e5")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#8b93a0", "#0f1117")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#6366f1", "#ffffff")).toBeGreaterThanOrEqual(3);
  });
});

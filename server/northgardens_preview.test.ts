import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const previewRoot = path.resolve(process.cwd(), "client/public/northgardens");

describe("Northgardens static preview mount", () => {
  it("keeps the supplied hero image and local dry-fruit assets available", () => {
    const homepage = readFileSync(path.join(previewRoot, "index.html"), "utf8");

    expect(homepage).toContain('src="/manus-storage/hero-section-image_ebb1a79b.png"');
    expect(homepage).toContain("/manus-storage/almonds_a5bde7bd.jpg");
    expect(homepage).not.toContain("dry-fruit-assets/");
    expect(existsSync(path.join(previewRoot, "index.html"))).toBe(true);
    expect(existsSync(path.join(previewRoot, "css/custom-northgardens.css"))).toBe(true);
  });
});

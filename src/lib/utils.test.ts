import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn (classnames utility)", () => {
  it("should merge class names", () => {
    const result = cn("foo", "bar");
    expect(result).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const result = cn("base", isActive && "active");
    expect(result).toBe("base active");
  });

  it("should filter falsy values", () => {
    const result = cn("foo", false, null, undefined, "bar");
    expect(result).toBe("foo bar");
  });

  it("should merge tailwind classes correctly", () => {
    // tailwind-merge should handle conflicting classes
    const result = cn("px-2 py-1", "px-4");
    expect(result).toBe("py-1 px-4");
  });

  it("should handle empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("should handle arrays", () => {
    const result = cn(["foo", "bar"]);
    expect(result).toBe("foo bar");
  });

  it("should handle objects", () => {
    const result = cn({ foo: true, bar: false, baz: true });
    expect(result).toBe("foo baz");
  });
});

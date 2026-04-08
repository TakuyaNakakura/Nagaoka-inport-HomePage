import { describe, expect, it } from "vitest";
import { HttpError, invariant, parsePagination } from "../src/lib/http";

describe("http utilities", () => {
  it("clamps pagination values", () => {
    const result = parsePagination({
      page: "0",
      pageSize: "999"
    });

    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(50);
    expect(result.skip).toBe(0);
  });

  it("throws on missing invariant value", () => {
    expect(() => invariant(null, "missing")).toThrow(HttpError);
  });

  it("returns invariant value when present", () => {
    expect(invariant("ok", "missing")).toBe("ok");
  });
});

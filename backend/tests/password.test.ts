import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../src/auth/password";

describe("password helpers", () => {
  it("hashes and verifies a password", async () => {
    const password = "member-demo-123";
    const passwordHash = await hashPassword(password);

    expect(passwordHash).not.toBe(password);
    await expect(verifyPassword(password, passwordHash)).resolves.toBe(true);
  });

  it("rejects a different password", async () => {
    const passwordHash = await hashPassword("correct-password");
    await expect(verifyPassword("wrong-password", passwordHash)).resolves.toBe(false);
  });
});


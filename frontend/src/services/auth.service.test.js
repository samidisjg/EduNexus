import authService from "./auth.service";

describe("authService", () => {
  it("signs up successfully with JSON response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      statusText: "Created",
      headers: {
        get: vi.fn().mockReturnValue("application/json"),
      },
      json: vi.fn().mockResolvedValue({ message: "Created" }),
    });

    const result = await authService.signUp({
      userName: "Sam",
      userEmail: "sam@example.com",
      userPassword: "secret123",
      role: "ADMIN",
    });

    expect(globalThis.fetch).toHaveBeenCalledOnce();
    expect(result).toEqual({
      success: true,
      data: { message: "Created" },
      message: "Created",
    });
  });

  it("handles non-json signup failures gracefully", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      headers: {
        get: vi.fn().mockReturnValue("text/plain"),
      },
    });

    const result = await authService.signUp({
      userName: "Sam",
      userEmail: "sam@example.com",
      userPassword: "secret123",
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain("Sign up failed: 403 Forbidden");
  });

  it("stores auth tokens after successful sign in", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: vi.fn().mockResolvedValue({
        message: "Signed in",
        body: {
          accessToken: "access",
          refreshToken: "refresh",
          userName: "Sam",
        },
      }),
    });

    const result = await authService.signIn({
      userEmail: "sam@example.com",
      userPassword: "secret123",
    });

    expect(result.success).toBe(true);
    expect(localStorage.getItem("accessToken")).toBe("access");
    expect(localStorage.getItem("refreshToken")).toBe("refresh");
  });

  it("returns a readable message for invalid sign in responses", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 502,
      statusText: "Bad Gateway",
      json: vi.fn().mockRejectedValue(new Error("bad json")),
    });

    const result = await authService.signIn({
      userEmail: "sam@example.com",
      userPassword: "secret123",
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain("Invalid response from server: 502 Bad Gateway");
  });

  it("clears tokens when validateToken runs without a token", async () => {
    localStorage.setItem("accessToken", "access");
    authService.clearTokens();

    const result = await authService.validateToken();

    expect(result.success).toBe(false);
    expect(localStorage.getItem("accessToken")).toBeNull();
  });
});

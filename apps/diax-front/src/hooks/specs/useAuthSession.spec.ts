import { renderHook, act } from "@testing-library/react";
import { useAuthSession } from "../useAuthSession"; // Adjust path
import { useSession } from "next-auth/react";

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

describe("useAuthSession Hook", () => {
  beforeEach(() => {
    jest.useFakeTimers(); // Mock timers
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("should refresh the session before expiration", async () => {
    const mockUpdate = jest.fn();
    (useSession as jest.Mock).mockReturnValue({
      data: {
        accessToken: "mock-token",
        expiresTokenAt: Date.now() + 61000, // Expires in 61 seconds
      },
      status: "authenticated",
      update: mockUpdate,
    });

    renderHook(() => useAuthSession());

    // Simulate time passing until just before expiration
    act(() => {
      jest.advanceTimersByTime(60000); // Move forward by 60 seconds
    });

    expect(mockUpdate).toHaveBeenCalled(); // Should attempt to refresh session
  });

  it("should not refresh if session has no accessToken", () => {
    const mockUpdate = jest.fn();
    (useSession as jest.Mock).mockReturnValue({
      data: null, // No session
      status: "unauthenticated",
      update: mockUpdate,
    });

    renderHook(() => useAuthSession());

    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(mockUpdate).not.toHaveBeenCalled(); // Should not refresh
  });
});

import { renderHook, act } from "@testing-library/react";
import { useAuthSession } from "../useAuthSession";
import { useSession } from "next-auth/react";
import { handleSignOut } from "../../components/layout/user-popover";

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

jest.mock("../../components/layout/user-popover", () => ({
  handleSignOut: jest.fn(),
}));

describe("useAuthSession", () => {
  let updateMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    updateMock = jest.fn();
  });

  it("should refresh the session before expiration", async () => {
    const mockSession = {
      accessToken: "mock-token",
      expires_at: Date.now() + 61000, // Expiring in 61 seconds
    };

    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: "authenticated",
      update: updateMock,
    });

    renderHook(() => useAuthSession());

    // Simulate time passing until just before expiration
    jest.advanceTimersByTime(60000);

    expect(updateMock).toHaveBeenCalled(); // Should attempt to refresh the session
  });

  it("should call handleSignOut if session refresh fails", async () => {
    updateMock.mockRejectedValue(new Error("Refresh failed"));

    const mockSession = {
      accessToken: "mock-token",
      expires_at: Date.now() + 61000,
    };

    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: "authenticated",
      update: updateMock,
    });

    renderHook(() => useAuthSession());

    jest.advanceTimersByTime(60000);

    expect(updateMock).toHaveBeenCalled();
    expect(handleSignOut).toHaveBeenCalled(); // Should log out on failure
  });

  it("should not refresh session if no accessToken or expires_at", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: updateMock,
    });

    renderHook(() => useAuthSession());

    jest.advanceTimersByTime(60000);

    expect(updateMock).not.toHaveBeenCalled();
    expect(handleSignOut).not.toHaveBeenCalled();
  });
});

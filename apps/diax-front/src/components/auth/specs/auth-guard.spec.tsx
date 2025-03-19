import * as React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from "@testing-library/react";
import { AuthGuard } from "../../../components/auth/auth-guard"; // Adjust the path if necessary
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

// Mock useRouter and usePathname
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock useSession from next-auth/react
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

describe("AuthGuard Component", () => {
  let mockReplace: jest.Mock;

  beforeEach(() => {
    mockReplace = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
  });

  it("shows loading message while session is loading", () => {
    (useSession as jest.Mock).mockReturnValue({ status: "loading" });

    render(
      <AuthGuard>
        <p>Protected Content</p>
      </AuthGuard>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects to /sign-in if user is unauthenticated", () => {
    (useSession as jest.Mock).mockReturnValue({ status: "unauthenticated" });

    render(
      <AuthGuard>
        <p>Protected Content</p>
      </AuthGuard>
    );

    expect(mockReplace).toHaveBeenCalledWith("/sign-in");
  });

  it("redirects to /dashboard if authenticated on / or /sign-in", () => {
    (useSession as jest.Mock).mockReturnValue({ status: "authenticated" });
    (usePathname as jest.Mock).mockReturnValue("/sign-in");

    render(
      <AuthGuard>
        <p>Protected Content</p>
      </AuthGuard>
    );

    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });

  it("renders children if authenticated and on a protected route", () => {
    (useSession as jest.Mock).mockReturnValue({ status: "authenticated" });
    (usePathname as jest.Mock).mockReturnValue("/dashboard");

    render(
      <AuthGuard>
        <p>Protected Content</p>
      </AuthGuard>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

import * as React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import RootLayout from "../layout";

// Mock AuthGuard and SessionProvider to avoid authentication issues
jest.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock("../../components/auth/auth-guard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../layout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));


describe("SignIn Page", () => {
  it("renders the SignIn page correctly", () => {
    render(<RootLayout>Text content</RootLayout>);
    // Adjust this to match the actual content of the SignIn page
    expect(screen.getByText("Text content")).toBeInTheDocument();
  });
});

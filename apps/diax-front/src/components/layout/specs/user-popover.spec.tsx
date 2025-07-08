import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserPopover } from "../user-popover";
import { signOut } from "next-auth/react";


jest.mock("next-auth/react", () => ({
  useSession: jest.fn(()=> ({
    data: { user: { name: "John Doe", email: "john@example.com" } },
  })),
  signOut: jest.fn(),
}));

describe("UserPopover Component", () => {
  let setOpenMock: jest.Mock;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_COGNITO_DOMAIN = 'https://mock-cognito-domain.com';
    process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID = 'mock-client-id';
    process.env.NEXT_PUBLIC_FRONT_URI = 'https://mock-front-uri.com';
  }
  );

  beforeEach(() => {
    setOpenMock = jest.fn();
    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "" },
    }); // Mock window.location.href

    window.location.replace = jest.fn(); // Mock window.location.replace
  });

  it("renders user information", () => {
    render(<UserPopover open={true} setOpen={setOpenMock} />);

    // Check if user name and email are displayed
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("calls signOut and redirects on sign-out", async () => { 
    render(<UserPopover open={true} setOpen={setOpenMock} />);    
    // Click the sign-out button
    const signOutButton = screen.getByText("Sign out");
    fireEvent.click(signOutButton);
    await waitFor(() => expect(signOut).toHaveBeenCalledWith({ redirect: true, callbackUrl: "https://mock-cognito-domain.com/logout?client_id=mock-client-id&logout_uri=https%3A%2F%2Fmock-front-uri.com"}));
  });
});

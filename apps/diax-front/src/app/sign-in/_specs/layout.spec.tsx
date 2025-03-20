import { render, screen } from "@testing-library/react";
import Layout from "../layout";
import "@testing-library/jest-dom";
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("../../../components/core/logo", () => ({
  Logo: () => <div data-testid="logo">Mocked Logo</div>,
}));

describe("Layout Component", () => {
  it("renders the layout correctly", () => {
    render(
      <Layout>
        <div data-testid="child">Child Component</div>
      </Layout>
    );

    // Check if logo exists
    expect(screen.getByTestId("logo")).toBeInTheDocument();

    // Check if children render
    expect(screen.getByTestId("child")).toBeInTheDocument();

    // Check for the welcome message
    expect(screen.getByText(/Welcome to/i)).toBeInTheDocument();
    expect(screen.getByText(/DIAX's dashboard/i)).toBeInTheDocument();
  });

  it("renders the banner image", () => {
    render(<Layout><div /></Layout>);

    const bannerImg = screen.getByAltText("Widgets");
    expect(bannerImg).toBeInTheDocument();
    expect(bannerImg).toHaveAttribute("src", "/assets/banner-home-esp.png");
  });
});

import '@testing-library/jest-dom';
import { render, screen } from "@testing-library/react";
import { Logo } from "../../../components/core/logo";

describe("Logo Component", () => {
    it("renders the logo with default width and height", () => {
        render(<Logo />);

        const logo = screen.getByRole("img", { name: /logo/i });

        expect(logo).toBeInTheDocument();
        expect(logo).toHaveAttribute("src", "/assets/logo-company.svg");
    });

});

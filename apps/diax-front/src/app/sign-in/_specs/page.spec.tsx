import '@testing-library/jest-dom'; 
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import SignIn from "../page";

describe("Sign in component", () => {
    it("renders the sign in component", () => {
        render(<SignIn/>);
        const component = screen.getByText("Sign in");
        expect(component).toBeDefined();
    });
})
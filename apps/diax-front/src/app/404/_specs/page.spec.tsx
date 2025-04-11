import * as React from 'react';
import { render, screen, act } from '@testing-library/react';
import NotFound from '../page'; // Adjust the import path as necessary
import '@testing-library/jest-dom'; // Import jest-dom matchers
import { MemoryRouterProvider } from 'next-router-mock/MemoryRouterProvider'; // Mock Next.js router


describe('NotFound Component', () => {
  it('renders the 404 image', () => {
    render(<NotFound />, { wrapper: MemoryRouterProvider });
    const image = screen.getByRole('img', { name: /under development/i });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/assets/error-404.png');
  });

  it('renders the 404 message', () => {
    render(<NotFound />, { wrapper: MemoryRouterProvider });
    const heading = screen.getByRole('heading', { level: 3, name: /404: the page you are looking for isn't here/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders the explanatory text', () => {
    render(<NotFound />, { wrapper: MemoryRouterProvider });
    const text = screen.getByText(/you either tried some shady route or you came here by mistake/i);
    expect(text).toBeInTheDocument();
  });

  it('renders the "Go back to home" button', () => {
    render(<NotFound />, { wrapper: MemoryRouterProvider });
    const button = screen.getByRole('link', { name: /go back to home/i });
    expect(button).toBeInTheDocument();
  });

  it('navigates to /redirect when the button is clicked', async () => {
    // Render the component with the MemoryRouterProvider
    render(<NotFound />, { wrapper: MemoryRouterProvider });
    const button = screen.getByRole('link', { name: /go back to home/i });
   
    expect(button).toHaveAttribute('href', '/redirect');
    await act(async () => {
      button.click();
    });
  });
});
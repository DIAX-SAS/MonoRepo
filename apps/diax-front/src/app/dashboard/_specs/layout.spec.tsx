import * as React from 'react';
import '@testing-library/jest-dom'; // Import jest-dom matchers
import { render, screen } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react'; // Import SessionProvider
import Layout from '../layout'; // Adjust the import path

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { name: 'Test User' } },
    status: 'authenticated',
  })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Layout Component', () => {
  it('renders GlobalStyles with correct styles', () => {
    render(
      <SessionProvider>
        <Layout>Test Children</Layout>
      </SessionProvider>
    );

    // Check if GlobalStyles is applied
    const globalStyles = document.querySelector('style');
    expect(globalStyles).toBeInTheDocument();
  });

  it('renders the Navigation component', () => {
    render(
      <SessionProvider>
        <Layout>Test Children</Layout>
      </SessionProvider>
    );

    // Check if the mocked Navigation component is rendered
    const navigation = screen.getByTestId('mock-navigation');
    expect(navigation).toBeInTheDocument();    
  });

  it('renders the children prop correctly', () => {
    render(
      <SessionProvider>
        <Layout>Test Children</Layout>
      </SessionProvider>
    );

    // Check if the children prop is rendered
    const children = screen.getByText('Test Children');
    expect(children).toBeInTheDocument();
  });
  it('renders the Container with correct props', () => {
    render(
      <SessionProvider>
        <Layout>Test Children</Layout>
      </SessionProvider>
    );

    // Check if the Container is rendered with the correct props
    const container = screen.getByRole('main').querySelector('.MuiContainer-maxWidthXl');
    expect(container).toBeInTheDocument();
  });
});
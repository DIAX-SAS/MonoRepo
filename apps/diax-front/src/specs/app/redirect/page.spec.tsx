import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { useSearchParams, redirect } from 'next/navigation';
import WrappedRedirectPage from '../../../app/redirect/page'; // Adjust the import path

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  redirect: jest.fn(),
}));

describe('RedirectPage Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('redirects to /dashboard when code and state are present', () => {
    // Mock useSearchParams to return code and state
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('code=123&state=abc'));

    render(<WrappedRedirectPage />);

    // Verify that redirect was called with /dashboard
    expect(redirect).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects to / when code is missing', () => {
    // Mock useSearchParams to return only state
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('state=abc'));

    render(<WrappedRedirectPage />);

    // Verify that redirect was called with /
    expect(redirect).toHaveBeenCalledWith('/');
  });

  it('redirects to / when state is missing', () => {
    // Mock useSearchParams to return only code
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('code=123'));

    render(<WrappedRedirectPage />);

    // Verify that redirect was called with /
    expect(redirect).toHaveBeenCalledWith('/');
  });
  
});
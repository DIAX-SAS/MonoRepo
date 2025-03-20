import { render, screen, fireEvent } from '@testing-library/react';
import { Navigation } from '../main-nav';
import '@testing-library/jest-dom';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('next/navigation', () => ({
  usePathname: () => '/redirect',
}));

jest.mock('@/components/core/logo', () => ({
  Logo: () => <div data-testid="logo">Mocked Logo</div>,
}));

jest.mock('@/components/layout/user-popover', () => ({
  UserPopover: ({ open }: { open: boolean }) =>
    open ? <div data-testid="user-popover">User Popover</div> : null,
}));

describe('Navigation Component', () => {
  it('renders correctly', async () => {
    render(<Navigation />);

    // Check if header is present
    const navigation = screen.getByRole('start-navigation');
    expect(navigation).toBeInTheDocument();

    await fireEvent.click(navigation);

    // Check if logo is present
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('toggles the navigation drawer', async () => {
    render(<Navigation />);

    // Click the navigation toggle button
    const navButton = screen.getByTitle('Start Navigation');
    fireEvent.click(navButton);

    // Since Drawer content isn't lazy-loaded, this checks for its presence
    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });

  it('toggles the user popover', async () => {
    render(<Navigation />);

    // Click the avatar to open the user popover
    const avatar = screen.getByRole('avatar'); // Avatar renders as an image
    await fireEvent.click(avatar);

    // Verify that user popover appears
    expect(screen.getByTestId('user-popover')).toBeInTheDocument();
  });

  it('renders the navigation items correctly', () => {
    render(<Navigation />);
    // Check if the navigation item "Overview" exists
    // Click the navigation toggle button
    const navButton = screen.getByTitle('Start Navigation');
    fireEvent.click(navButton);
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });
});

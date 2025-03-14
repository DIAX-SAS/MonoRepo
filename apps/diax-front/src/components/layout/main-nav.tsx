'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import { List as ListIcon } from '@phosphor-icons/react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../../components/core/logo';
import { UserPopover } from './user-popover';
import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ChartPie as ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';

const navIcons = {
  'chart-pie': ChartPieIcon,
  user: UserIcon,
  users: UsersIcon,
} as Record<string, Icon>;

interface NavItemConfig {
  key: string;
  title?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: string;
  href?: string;
  items?: NavItemConfig[];
}

const navItems = [
  { key: 'overview', title: 'Overview', href: '/redirect', icon: 'chart-pie' },
] satisfies NavItemConfig[];

function isNavItemActive({
  disabled,
  external,
  href,
  pathname,
}: Pick<NavItemConfig, 'disabled' | 'external' | 'href'> & {
  pathname: string;
}): boolean {
  if (disabled || !href || external) {
    return false;
  }
  return pathname === href;
}

// Reducer for managing navigation state
const initialState = { openNav: false, openUser: false };
function reducer(
  state: { openNav: boolean; openUser: boolean },
  action: { type: string }
) {
  switch (action.type) {
    case 'TOGGLE_NAV':
      return { ...state, openNav: !state.openNav };
    case 'TOGGLE_USER':
      return { ...state, openUser: !state.openUser };
    case 'CLOSE_NAV':
      return { ...state, openNav: false };
    case 'CLOSE_USER':
      return { ...state, openUser: false };
    default:
      return state;
  }
}

export function Navigation(): React.JSX.Element {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  return (
    <>
      {/* Header */}
      <Box
        component="header"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          position: 'sticky',
          top: 0,
          zIndex: 'appBar',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 64,
            px: 2,
          }}
        >
          <IconButton title='Start Navigation' aria-label='Start Navigation' onClick={() => dispatch({ type: 'TOGGLE_NAV' })}>
            <ListIcon />
          </IconButton>
          <Avatar
            onClick={() => dispatch({ type: 'TOGGLE_USER' })}
            sx={{ cursor: 'pointer' }}
          />
        </Stack>
      </Box>

      {/* User Popover */}
      <UserPopover
        open={state.openUser}
        setOpen={() => dispatch({ type: 'CLOSE_USER' })}
      />

      {/* Drawer (Navigation) */}
      <Drawer
        slotProps={{ paper: { sx: drawerStyles } }}
        onClose={() => dispatch({ type: 'CLOSE_NAV' })}
        open={state.openNav}
      >
        <NavContent />
      </Drawer>
    </>
  );
}

// Drawer Styles
const drawerStyles = {
  bgcolor: 'neutral.950',
  color: 'common.white',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: 280,
  top: 0,
  left: 0,
  zIndex: 1200,
  '&::-webkit-scrollbar': { display: 'none' },
};

// Navigation Content Component
function NavContent() {
  const pathname = usePathname();

  return (
    <>
      <Stack spacing={2} sx={{ p: 3 }}>
        <Box
          component={RouterLink}
          href="/redirect"
          sx={{ display: 'inline-flex' }}
        >
          <Logo color="light" height={32} width={122} />
        </Box>
      </Stack>
      <Divider sx={{ borderColor: 'neutral.700' }} />
      <Box component="nav" sx={{ flex: 1, p: 2 }}>
        <Stack
          component="ul"
          spacing={1}
          sx={{ listStyle: 'none', m: 0, p: 0 }}
        >
          {navItems.map(({ key, ...item }) => (
            <NavItem key={key} pathname={pathname} {...item} />
          ))}
        </Stack>
      </Box>
      <Divider sx={{ borderColor: 'neutral.700' }} />
    </>
  );
}

// Individual Navigation Item
interface NavItemProps {
  disabled?: boolean;
  external?: boolean;
  href?: string;
  icon?: string;
  pathname: string;
  title: string;
}

function NavItem({
  disabled,
  external,
  href,
  icon,
  pathname,
  title,
}: NavItemProps) {
  const active = isNavItemActive({
    disabled,
    external,
    href,
    pathname,
  });
  const Icon = icon ? navIcons[icon] : null;
  return (
    <li>
      <Box
        id='nav-item'
        aria-label="Navigation Item"
        component={href ? (external ? 'a' : RouterLink) : 'button'}
        href={href}
        title='Navigation Item'
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        role={href ? 'link' : 'button'} 
        aria-disabled={disabled ? 'true' : 'false'} 
        tabIndex={disabled ? -1 : 0} 
        sx={{
          alignItems: 'center',
          borderRadius: 1,
          color: disabled
            ? 'neutral.500'
            : active
            ? 'primary.contrastText'
            : 'neutral.300',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          gap: 1,
          p: '6px 16px',
          textDecoration: 'none',
          bgcolor: active ? 'primary.main' : 'transparent',
          '&:focus': { outline: '2px solid #1976d2' }, // 👈 Adds visible focus styles
        }}
      >
        {Icon && <Icon fontSize="24px" weight={active ? 'fill' : undefined} />}
        <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{title}</Typography>
      </Box>
    </li>
  );
}

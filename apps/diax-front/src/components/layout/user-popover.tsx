import * as React from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  Box,
  Popover,
  Typography,
  Divider,
  MenuList,
  MenuItem,
  ListItemIcon,
  SignOutIcon,
} from '../core';
export interface UserPopoverProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
}

export const handleSignOut = async (): Promise<void> => {
  const cognitoLogoutUrl =
    `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/logout?` +
    new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
      logout_uri: process.env.NEXT_PUBLIC_FRONT_URI || '',
    }).toString();

  // Sign out from NextAuth first
  await signOut({ redirect: true, callbackUrl: cognitoLogoutUrl });
};

export function UserPopover({
  setOpen,
  open,
}: UserPopoverProps): React.JSX.Element {
  const { data: session } = useSession();

  return (
    <Popover
      role="pop-over-user"
      anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      onClose={() => setOpen(false)}
      open={open}
      slotProps={{ paper: { sx: { width: '240px' } } }}
    >
      <Box sx={{ p: '16px 20px ' }}>
        <Typography variant="subtitle1">
          {session?.user?.name as string | undefined}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {session?.user?.email as string | undefined}
        </Typography>
      </Box>
      <Divider />
      <MenuList
        disablePadding
        sx={{ p: '8px', '& .MuiMenuItem-root': { borderRadius: 1 } }}
      >
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <SignOutIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </MenuList>
    </Popover>
  );
}

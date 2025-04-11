import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { SignOut as SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';
import * as React from 'react';
import { useSession, signOut } from "next-auth/react"
export interface UserPopoverProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
}

export const handleSignOut = async (): Promise<void> => {
  const cognitoLogoutUrl = `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/logout?` +
    new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "",
      logout_uri: process.env.NEXT_PUBLIC_FRONT_URI || "",
    }).toString();


  // Sign out from NextAuth first
  await signOut({ redirect: false });

  // Redirect to Cognito's logout URL to fully sign out
  window.location.href = cognitoLogoutUrl;
};

export function UserPopover({
  setOpen,
  open,
}: UserPopoverProps): React.JSX.Element {


  const { data: session } = useSession();

  return (
    <Popover
      role='pop-over-user'
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

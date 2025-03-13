import { config } from '../../config';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { SignOut as SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';
import * as React from 'react';
import { useAuth } from 'react-oidc-context';

export interface UserPopoverProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
}

export function UserPopover({
  setOpen,
  open,
}: UserPopoverProps): React.JSX.Element {
  const auth = useAuth();
  const handleSignOut = React.useCallback(async (): Promise<void> => {
    await auth.signoutRedirect({
      post_logout_redirect_uri: config.auth.cognitoDomain,
      extraQueryParams: {
        client_id: config.auth.clientId,
        logout_uri: config.auth.logoutUri,
        redirect_uri: config.auth.redirectUri
      },
    });
  }, [auth]);

  return (
    <Popover
      anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      onClose={() => setOpen(false)}
      open={open}
      slotProps={{ paper: { sx: { width: '240px' } } }}
    >
      <Box sx={{ p: '16px 20px ' }}>
        <Typography variant="subtitle1">
          {auth.user?.profile["cognito:username"] as string | undefined}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {auth.user?.profile.email}
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

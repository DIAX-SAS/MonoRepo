import { config } from '@/config';
import { IdToken } from '@/types/user';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { SignOut as SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';
import { jwtDecode } from 'jwt-decode';
import * as React from 'react';
import { useAuth } from 'react-oidc-context';

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
}

export function UserPopover({
  anchorEl,
  onClose,
  open,
}: UserPopoverProps): React.JSX.Element {
  const auth = useAuth();
  const user: IdToken | null = auth.user?.id_token
    ? jwtDecode(auth.user.id_token)
    : null;
  const handleSignOut = React.useCallback(async (): Promise<void> => {
    await auth.signoutRedirect({
      post_logout_redirect_uri: config.auth.cognitoDomain,
      extraQueryParams: {
        client_id: config.auth.clientId,
        logout_uri: config.auth.logoutUri,
      },
    });
  }, [auth]);

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: '240px' } } }}
    >
      <Box sx={{ p: '16px 20px ' }}>
        <Typography variant="subtitle1">
          {user ? user['cognito:username'] : null}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {user ? user.email : null}
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

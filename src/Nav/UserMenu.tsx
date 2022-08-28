import React from 'react';
import { getAuth } from 'firebase/auth';
import { Link as RouterLink } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { NavPath } from '../constants';
import { stringAvatar } from './utils';
import type { MouseEvent } from 'react';
import type { NavItem } from './types';

type Props = {
  anchorElUser: HTMLElement | null;
  handleOpen: (event: MouseEvent<HTMLElement>) => void;
  handleClose: () => void;
  currentPath?: string;
};

export const UserMenu = ({ anchorElUser, currentPath, handleOpen, handleClose }: Props) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;

  const isOpen = !!anchorElUser;

  const signOut = async () => {
    await getAuth().signOut();
  };

  const userMenuItems: NavItem[] = [
    {
      title: 'Account',
      path: NavPath.Account,
      matchingPaths: new Set([NavPath.Account]),
    },
  ];

  return (
    <Box sx={{ flexGrow: 0 }}>
      <Tooltip title="Open settings">
        <IconButton onClick={handleOpen} sx={{ p: 0 }}>
          <Avatar
            alt={user.displayName ?? "User's Avatar"}
            src={user.photoURL ?? undefined}
            {...stringAvatar(user.displayName ?? '')}
          />
        </IconButton>
      </Tooltip>
      <Menu
        sx={{ mt: '45px' }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={isOpen}
        onClose={handleClose}
      >
        {userMenuItems.map(({ matchingPaths, path, title }) => (
          <MenuItem
            key={title}
            to={path}
            component={RouterLink}
            selected={!!currentPath && matchingPaths.has(currentPath)}
          >
            <Typography textAlign="center">{title}</Typography>
          </MenuItem>
        ))}
        <MenuItem onClick={signOut}>
          <Typography textAlign="center">Sign Out</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserMenu;

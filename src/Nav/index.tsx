import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { getAuth } from 'firebase/auth';
import { NavPath, NAVBAR_HEIGHT } from '../constants';
import UserMenu from './UserMenu';
import { DRAWER_WIDTH, NAV_ITEMS } from './constants';
import { useRouteMatch } from './utils';
import Loading from './Loading';
import type { MouseEvent } from 'react';

/** `NavTabs` renders routing buttons on desktop nav bar.
 * @link https://mui.com/material-ui/guides/routing/#button
 */
const NavTabs = React.memo(
  ({ hasUser, currentPath }: { hasUser: boolean; currentPath: string | undefined }) => {
    let navItems = NAV_ITEMS;
    if (!hasUser)
      navItems = [
        ...NAV_ITEMS,
        {
          title: 'Sign In',
          path: NavPath.SignIn,
          matchingPaths: new Set([NavPath.SignIn]),
        },
      ];
    // Give `Tabs` a value of a matching `currentPath` OR false to avoid console errors
    const value = navItems.some((navItem) => navItem.matchingPaths.has(currentPath ?? '')) && (currentPath ?? false);
    return (
      <Tabs value={value} sx={{ display: { xs: 'none', sm: 'block' } }} aria-label="Site navigation">
        {navItems.map(({ title, path }) => (
          <Tab key={title} label={title} value={path} to={path} component={RouterLink} />
        ))}
      </Tabs>
    );
  },
  (prevProps, nextProps) => prevProps === nextProps
);

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  // You need to provide the routes in descendant order.
  // This means that if you have nested routes like:
  // users, users/new, users/edit.
  // Then the order should be ['users/add', 'users/edit', 'users'].
  const routeMatch = useRouteMatch(Object.values(NavPath));
  const user = getAuth().currentUser;

  // Remove /:id and other subroutes for this purpose
  const currentPath = routeMatch?.pattern?.path?.split('/:')?.[0];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const SiteTitle = () => (
    <Typography
      variant="h5" // Overriden within theme at '../material.ts'
      noWrap
      component={RouterLink}
      to="/"
      sx={{
        mr: 2,
        display: { xs: 'flex' },
        flexGrow: 1,
        fontWeight: 500,
        color: 'inherit',
        textDecoration: 'none',
      }}
    >
      Tsunami Events
    </Typography>
  );

  const renderDrawer = () => (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <List>
        {NAV_ITEMS.map((item) => (
          <ListItem key={item.title} disablePadding>
            <ListItemButton
              sx={{ textAlign: 'center' }}
              selected={!!currentPath && item.matchingPaths.has(currentPath)}
              component={RouterLink}
              to={item.path}
            >
              <ListItemText primary={item.title} />
            </ListItemButton>
          </ListItem>
        ))}
        {!user && (
          <ListItem disablePadding>
            <ListItemButton
              sx={{ textAlign: 'center' }}
              selected={currentPath === NavPath.SignIn}
              to={NavPath.SignIn}
              component={RouterLink}
            >
              <ListItemText primary="Sign In" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar component="nav" sx={{ height: NAVBAR_HEIGHT }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <SiteTitle />
          <NavTabs hasUser={!!user} currentPath={currentPath} />
          <UserMenu
            anchorElUser={anchorElUser}
            handleOpen={handleOpenUserMenu}
            handleClose={handleCloseUserMenu}
            currentPath={currentPath}
          />
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {renderDrawer()}
        </Drawer>
      </Box>
    </Box>
  );
};

export default Navbar;
export { Loading };

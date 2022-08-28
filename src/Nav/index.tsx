import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { NavPath, NAVBAR_HEIGHT } from '../constants';
import UserMenu from './UserMenu';
import { DRAWER_WIDTH, NAV_ITEMS } from './constants';
import { useRouteMatch } from './utils';
import { getAuth } from 'firebase/auth';

export default function DrawerAppBar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
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

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const SiteTitle = () => (
    <Typography
      variant="h5" // Overriden within theme'../material.ts'
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

  /** `MyTabs` renders routing buttons on desktop nav bar.
   * @link https://mui.com/material-ui/guides/routing/#button
   */
  const renderTabs = () => {
    return (
      <Tabs value={currentPath} sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Tab value={'undefined'} sx={{ display: 'none' }} />
        <Tab value={'/'} sx={{ display: 'none' }} />
        {NAV_ITEMS.map(({ title, path }) => (
          <Tab key={title} label={title} value={path} to={path} component={RouterLink} />
        ))}
        {!user && <Tab label="Sign In" value={NavPath.SignIn} to={NavPath.SignIn} component={RouterLink} />}
      </Tabs>
    );
  };

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
      <AppBar component="nav" sx={{ height: NAVBAR_HEIGHT }} color="secondary">
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
          {renderTabs()}
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
}

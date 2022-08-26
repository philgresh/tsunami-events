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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { NavPath, NAVBAR_HEIGHT } from '../constants';
import { useRouteMatch } from './utils';

interface Props {}

const drawerWidth = 240;
const navItems: {
  title: string;
  path: string;
  matchingPaths: Set<string>;
}[] = [
  {
    title: 'Events',
    path: NavPath.Events,
    matchingPaths: new Set([NavPath.EventsCollection, NavPath.Events]),
  },
  {
    title: 'Profile',
    path: NavPath.Profile,
    matchingPaths: new Set([NavPath.Profile]),
  },
];

export default function DrawerAppBar(props: Props) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  // You need to provide the routes in descendant order.
  // This means that if you have nested routes like:
  // users, users/new, users/edit.
  // Then the order should be ['users/add', 'users/edit', 'users'].
  const routeMatch = useRouteMatch([NavPath.EventsCollection, NavPath.Events, NavPath.Profile]);

  // Remove /:id and other subroutes for this purpose
  const currentPath = routeMatch?.pattern?.path?.split('/:')?.[0];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const SiteTitle = () => (
    <Typography
      variant="h5" // Overriden within theme'../material.ts'
      noWrap
      component="a"
      href=""
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
  const MyTabs = () => {
    return (
      <Tabs value={currentPath} sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Tab label="Events" value={NavPath.Events} to={NavPath.Events} component={RouterLink} />
        <Tab label="Profile" value={NavPath.Profile} to={NavPath.Profile} component={RouterLink} />
      </Tabs>
    );
  };

  const renderDrawer = () => (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <List>
        {navItems.map((item) => (
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
          <MyTabs />
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {renderDrawer()}
        </Drawer>
      </Box>
    </Box>
  );
}

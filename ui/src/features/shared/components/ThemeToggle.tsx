import { useDispatch, useSelector } from 'react-redux';
import { Switch, Box, IconButton, Tooltip, ListItemIcon } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { RootState } from '../../../redux/store';
import { toggleTheme } from '../redux/preferencesSlice';

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.preferences.theme);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <ListItemIcon>
        {mode === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
      </ListItemIcon>
      <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
        <Switch
          checked={mode === 'dark'}
          onChange={handleToggle}
          aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          inputProps={{ 'aria-label': 'Toggle between light and dark mode' }}
        />
      </Tooltip>
    </Box>
  );
};

export default ThemeToggle;

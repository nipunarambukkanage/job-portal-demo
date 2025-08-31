import { IconButton } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setTheme } from '../../store/slices/uiSlice';

export default function ThemeSwitcher(){
  const dispatch = useAppDispatch();
  const mode = useAppSelector(s=>s.ui.theme);
  return <IconButton onClick={()=>dispatch(setTheme(mode==='light'?'dark':'light'))} aria-label='theme'>
    {mode==='light'?<DarkModeIcon/>:<LightModeIcon/>}
  </IconButton>;
}

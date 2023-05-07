import {useState, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import LinearProgress from '@mui/material/LinearProgress';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import {
  useTabData,
  useIsLoading,
  useActiveCategory,
  useAssetData,
} from 'features/assetlist';
import {SET_ACTIVE_CATEGORY} from 'features/assetlist/actionTypes';
import AssetTable from './AssetTable';

export default function AssetList() {
  const dispatch = useDispatch();

  const assetData = useAssetData();
  const tabData = useTabData();
  const isLoading = useIsLoading();
  const {activeCategoryIndex, activeCategoryName} = useActiveCategory();

  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    console.log('[AssetList] >> [init]');
  };

  const onMenuSelect = index => {
    console.log('[AssetList] >> [onMenuSelect]');

    // Close menu
    handleClose();

    if (activeCategoryIndex === index) return;
    // debugger; // eslint-disable-line no-debugger

    dispatch({
      type: SET_ACTIVE_CATEGORY,
      payload: {
        activeCategoryIndex: index,
        activeCategoryName: assetData[index]?.marketDisplayName,
        activeCategoryId: assetData[index]?.market,
        activeCategoryData: assetData[index]?.data,
      },
    });
  };

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (isLoading && Array.isArray(tabData) && tabData.length < 1) {
    return (
      <Box sx={{width: '100%'}}>
        <LinearProgress />
      </Box>
    );
  }

  if (Array.isArray(tabData) && tabData.length > 0) {
    return (
      <Box sx={{maxWidth: '100%', bgcolor: 'background.paper'}}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{mr: 2}}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
              {activeCategoryName}
            </Typography>
            <Button
              id="demo-positioned-button"
              aria-controls={open ? 'demo-positioned-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
              color="inherit">
              Select Category
            </Button>
            <Menu
              id="demo-positioned-menu"
              aria-labelledby="demo-positioned-button"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}>
              {Array.isArray(tabData) &&
                tabData.map((item, index) => (
                  <MenuItem onClick={() => onMenuSelect(index)} key={index}>
                    {index === activeCategoryIndex ? (
                      <CheckCircleOutlineIcon />
                    ) : (
                      <RadioButtonUncheckedIcon />
                    )}
                    <span style={{width: 10}} />
                    {item?.marketDisplayName}
                  </MenuItem>
                ))}
            </Menu>
          </Toolbar>
        </AppBar>

        <AssetTable />
      </Box>
    );
  }
}

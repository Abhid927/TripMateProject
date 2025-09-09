import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, useScrollTrigger, Slide } from '@mui/material';
import { styled } from '@mui/system';

const NavBar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const trigger = useScrollTrigger();

  const handleThemeToggle = () => setDarkMode(!darkMode);

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      <AppBar
        position="fixed"
        sx={{
          background: darkMode ? 'linear-gradient(to right, #3a3a3a, #232323)' : 'linear-gradient(to right, #ffb6c1, #ff6347)',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            TripMate
          </Typography>
          <Button color="inherit" onClick={handleThemeToggle}>
            Toggle Dark Mode
          </Button>
        </Toolbar>
      </AppBar>
    </Slide>
  );
};

export default NavBar;

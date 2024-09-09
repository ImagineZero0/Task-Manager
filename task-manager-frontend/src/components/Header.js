// src/components/Header.js
import React from 'react';
import { Button, Box, Typography, AppBar, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';


const Header = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static" sx={{ backgroundColor: '#007bff' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
        </Typography>
        <Button color="inherit" onClick={() => navigate('/login')} sx={{ marginRight: 2 }}>
          Login
        </Button>
        <Button color="inherit" onClick={() => navigate('/register')}>
          Sign Up
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

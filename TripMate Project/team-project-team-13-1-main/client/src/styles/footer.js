import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      sx={{
        mt: 8,
        backgroundColor: '#232323',
        padding: '30px',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Typography variant="body2">&copy; 2025 TripMate. All rights reserved.</Typography>
      <Box>
        <Link href="#" sx={{ color: 'white', marginRight: '15px', transition: 'color 0.3s' }}>
          About Us
        </Link>
        <Link href="#" sx={{ color: 'white', marginRight: '15px', transition: 'color 0.3s' }}>
          Privacy Policy
        </Link>
        <Link href="#" sx={{ color: 'white', marginRight: '15px', transition: 'color 0.3s' }}>
          Terms of Service
        </Link>
      </Box>
    </Box>
  );
};

export default Footer;

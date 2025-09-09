import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { styled } from '@mui/system';

const HeroSection = () => {
  return (
    <Box
      sx={{
        backgroundImage: 'url(/path/to/your/hero-image.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: '#fff',
        position: 'relative',
      }}
    >
      <Box sx={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '20px', borderRadius: '10px' }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', fontSize: '3rem', animation: 'fadeIn 2s ease-in-out' }}>
          Plan Your Dream Trip with TripMate
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{
            marginTop: '20px',
            padding: '10px 20px',
            fontSize: '1.2rem',
            borderRadius: '25px',
            backgroundColor: '#ff6347',
            '&:hover': { backgroundColor: '#ffb6c1' },
            transition: 'all 0.3s ease',
          }}
        >
          Start Your Journey
        </Button>
      </Box>
    </Box>
  );
};

export default HeroSection;

import React from 'react';
import { Card, CardContent, Typography, Button, Grid } from '@mui/material';
import { styled } from '@mui/system';

const FancyCard = ({ title, description, onClick }) => {
  return (
    <Card
      sx={{
        borderRadius: '15px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.2)',
        },
      }}
    >
      <CardContent>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ marginTop: '10px' }}>
          {description}
        </Typography>
        <Button
          variant="outlined"
          sx={{
            marginTop: '15px',
            borderRadius: '20px',
            textTransform: 'none',
            fontSize: '0.9rem',
            padding: '8px 20px',
            '&:hover': {
              backgroundColor: '#ff6347',
              color: '#fff',
            },
          }}
          onClick={onClick}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

const FancyCardsGrid = () => {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12} sm={6} md={4}>
        <FancyCard title="Trip to Paris" description="Expense breakdown and budget summary" />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <FancyCard title="Trip to Japan" description="Receipts, purchases, and more" />
      </Grid>
    </Grid>
  );
};

export default FancyCardsGrid;

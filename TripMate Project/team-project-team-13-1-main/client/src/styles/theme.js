import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#003366', // Dark Blue as the primary color
      contrastText: '#ffffff', // White text on the primary color
    },
    secondary: {
      main: '#ffffff', // White as the secondary color
      contrastText: '#003366', // Dark blue text on secondary color
    },
    background: {
      default: '#f5f5f5', // Light Grey background to make the content pop
      paper: '#ffffff', // White paper background for content
    },
    text: {
      primary: '#2C2C2C', // Dark text for readability
      secondary: '#757575', // Light grey text for less prominent information
    },
    success: {
      main: '#4CAF50', // Green for success
    },
    error: {
      main: '#FF5252', // Light Red for error messages
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", sans-serif', // Poppins is a clean and modern font
    h1: {
      fontSize: '3.5rem',
      fontWeight: '600',
      color: '#003366', // Dark blue for main title
      letterSpacing: '1px',
    },
    h2: {
      fontSize: '2.8rem',
      fontWeight: '500',
      color: '#003366', // Dark blue for subheadings
      letterSpacing: '0.5px',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: '400',
      color: '#333333', // Dark grey for less important headings
    },
    body1: {
      fontSize: '1.1rem',
      fontWeight: '300',
      color: '#2C2C2C', // Dark text for body
      lineHeight: '1.8',
    },
    body2: {
      fontSize: '1rem',
      color: '#757575',
      lineHeight: '1.6',
    },
    subtitle1: {
      fontSize: '1.1rem',
      fontWeight: '400',
      color: '#003366', // Dark blue for subtitles
    },
    button: {
      backgroundColor: "#003366",
      color: "white",
      textTransform: 'none', // Keep the button text in normal case
      fontWeight: '500',
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 12, // Slightly larger border radius for a modern look
  },
  spacing: 8,
  components: {
    // Button styling for AppBar or Navbar buttons
    MuiButton: {
      defaultProps: {
        variant: 'text', // Change to text variant for no background
      },
      styleOverrides: {
        root: {
          padding: '0px', // Remove padding
          backgroundColor: 'transparent', // No background color
          '&:hover': {
            backgroundColor: 'transparent', // Ensure no background on hover
          },
          marginRight: '20px', // Add margin between buttons
        },
      },
    },
    // AppBar styling
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#003366', // Dark Blue AppBar
        },
      },
    },
    // Input fields
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

export default theme;

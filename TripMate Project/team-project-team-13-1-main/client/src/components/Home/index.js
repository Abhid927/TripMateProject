import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import CurrencyConverter from "../CurrencyConverter/CurrencyConverter";

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        height: "auto",
        pb: 10,
        backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        px: 2,
        pt: 10,
      }}
    >
      <Typography
        variant="h1"
        align="center"
        sx={{
          fontWeight: 550,
          fontSize: { xs: "3rem", sm: "4rem", md: "5rem" },
          color: "white",
          textShadow: "3px 3px 8px rgba(0,0,0,0.7)",
          mt: 1,
          fontSize: 65
        }}
      >
        Welcome to Trip Mate
      </Typography>
      {currentUser && (
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: "bold",
            mt: 5,
            color: "white",
            textShadow: "2px 2px 5px rgba(0,0,0,0.6)",
            fontSize : 35
          }}
        >
          Good {new Date().getHours() < 12 ? "morning" : "afternoon"},{" "}
          {"traveler"}.
        </Typography>
      )}
      <Paper
        elevation={10}
        sx={{
          mt: 8,
          p: 5,
          width: "100%",
          maxWidth: 500,
          textAlign: "center",
          borderRadius: 4,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", mb: 3, color: "#0a3d62", fontSize:30}}
        >
          Currency Converter
        </Typography>
        <CurrencyConverter />

        <Typography
          variant="caption"
          sx={{ display: "block", mt: 4, color: "#8395a7", fontSize:18}}
        >
          Made for explorers, by explorers 🌍
        </Typography>
      </Paper>

      <Typography
        variant="h6"
        align="center"
        sx={{
          fontWeight: "bold",
          fontStyle: "italic",
          mt: 8,
          color: "white",
          textShadow: "1px 1px 4px rgba(0,0,0,0.5)",
          fontSize: 20
        }}
      >
        “Life is short and the world is wide.”
      </Typography>
    </Box>
  );
}

import React, { useState } from "react";
import { TextField, Button, Card, CardContent, Typography, MenuItem, Alert, Select, InputLabel, FormControl } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { countries, provinces, cities, currencies} from "../../constants/info";

export default function UserProfile() {
  const { currentUser } = useAuth();
  const [ error, setError ] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    country: "",
    province: "",
    city: "",
    currency: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setError("You must be logged in to create a profile!")
      return;
    }

    try {
      const response = await fetch("/api/create-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          uid: currentUser.uid, // Firebase UID
          email: currentUser.email,
          ...formData
        })
      });

      if (!response.ok) {
        console.log(response)
        throw new Error("Failed to save profile");
      }
    
      navigate("/login")
    } catch (error) {
      setError(error.message);
      console.error("Error saving profile:", error);
    }
  };

  return (
    <Card sx={{ maxWidth: 500, mx: "auto", mt: 5, p: 3 }}>
      <CardContent>
        <Typography variant="h5" align="center" gutterBottom>
          User Profile
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField label="First Name" name="firstName" value={formData.firstName} fullWidth margin="dense" required onChange={handleChange} />
          <TextField label="Last Name" name="lastName" value={formData.lastName} fullWidth margin="dense" required onChange={handleChange} />
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Country</InputLabel>
            <Select label="Country" name="country" value={formData.country} onChange={handleChange}>
              {countries.map((country) => (
                <MenuItem key={country} value={country}>
                  {country}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Province</InputLabel>
            <Select label="Province" name="province" value={formData.province} onChange={handleChange}>
              {provinces.map((province) => (
                <MenuItem key={province} value={province}>
                  {province}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* TODO make city change based on province */}
          <FormControl fullWidth margin="dense" required>
            <InputLabel>City</InputLabel>
            <Select label="City" name="city" value={formData.city} onChange={handleChange}>
              {cities.map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Currency</InputLabel>
            <Select label="Currency" value={formData.currency} name="currency" onChange={handleChange}>
              {currencies.map((currency) => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </Select>
          </FormControl>  
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Save Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

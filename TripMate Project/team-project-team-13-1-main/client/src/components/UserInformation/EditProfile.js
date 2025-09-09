import React, { useState, useEffect } from "react";
import { TextField, Button, Card, CardContent, Typography, MenuItem, FormControl, InputLabel, Select, Alert } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { countries, provinces, cities, currencies } from "../../constants/info";
import DeleteAccountButton from "../auth/DeleteAccountButton";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
    const { currentUser } = useAuth();
    const [ error, setError ] = useState("")
    const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    country: "",
    province: "",
    city: "",
    currency: ""
    });
    const navigate = useNavigate()

    useEffect(() => {

        const fetchProfile = async () => {
            try {
                const response = await fetch(`/api/user-profile/${currentUser.uid}`);
                if (!response.ok) {
                    navigate("/login")
                    return;
                };
                const data = await response.json();
                setFormData({
                    firstName: data.first_name || "",
                    lastName: data.last_name || "",
                    country: data.country || "",
                    province: data.province || "",
                    city: data.city || "",
                    currency: data.currency || ""
                });
            } catch (error) {
                navigate("/login")
                console.error("Error fetching profile:", error);
                return;
            }
        };

        fetchProfile();
    }, [currentUser]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            navigate("/login")
            return;
        }

        try {
            const response = await fetch("/api/update-profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                uid: currentUser.uid,
                ...formData
            })
            });

            if (!response.ok) throw new Error("Failed to update profile");

            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    // TODO change country, province, city to dropdown
    return (
        <Card sx={{ maxWidth: 500, mx: "auto", mt: 5, p: 3 }}>
            <CardContent>
            <Typography variant="h5" align="center" gutterBottom>
                Edit Profile
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <form onSubmit={handleSubmit}>
                <TextField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                />
                <TextField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                />
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
                <Button type="submit" variant="contained" fullWidth sx={{mt:2, backgroundColor: "#003366"}}>
                Save Changes
                </Button>
            </form>
            <DeleteAccountButton />
            </CardContent>
        </Card>
    );
}

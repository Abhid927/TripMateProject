import React from "react";
import { Button } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Failed to log out:", error);
        }
    };

    return (
        <Button variant="contained" color="inherit" onClick={handleLogout}>
            Logout
        </Button>
    );
}

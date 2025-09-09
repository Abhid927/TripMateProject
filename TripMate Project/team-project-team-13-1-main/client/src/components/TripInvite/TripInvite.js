import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import callApiSendInvite from "./callApiSendInvite";
import { Card, CardContent, Typography, TextField, Button, Alert } from "@mui/material";

const TripInvite = ({ tripID }) => {
    const { currentUser } = useAuth();
    const [email, setEmail] = useState("");
    const [inviteLink, setInviteLink] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSendInvite = async () => {
        if (!email) {
            setError("Please enter an email.");
            return;
        }

        try {
            const response = await callApiSendInvite(tripID, currentUser.uid, email);
            setMessage(response.message);
            setEmail("");
            setError("");
        } catch (error) {
            setError("Invite has already been sent to this email.");
        }
    };

    const handleGenerateLink = async () => {
        const frontendURL = window.location.origin;
        try {
            const response = await fetch("/api/invite/link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tripID, inviterID: currentUser.uid, frontendURL }),
            });

            const data = await response.json();
            if (data.inviteLink) {
                setInviteLink(data.inviteLink);
                setMessage("Shareable invite link generated!");
                setError("");
            } else {
                setError("Error generating link.");
            }
        } catch (error) {
            setError("Error generating link. Please try again.");
        }
    };

    if (!currentUser) {
        return (
            <Typography align="center" sx={{ mt: 2 }}>
                You must be logged in to invite friends.
            </Typography>
        );
    }

    {/* TODO add error handling for email and make sure only one message shows at a time*/}
    return (
        <>
            <Card sx={{ maxWidth: 400, mx: "auto", mt: 5, p: 2 }}>
                <CardContent>
                    <Typography variant="h5" align="center" gutterBottom>
                        Invite a Friend to Your Trip
                    </Typography>
                    
                    {error && <Alert severity="error">{error}</Alert>}
                    {message && <Alert severity="success">{message}</Alert>}

                    <TextField
                        label="Enter email address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSendInvite}
                        sx={{mt:2, backgroundColor: "#003366"}}
                    >
                        Send Invite
                    </Button>

                    <Typography variant="h6" align="center" sx={{ mt: 3 }}>
                        Or Generate a Shareable Link
                    </Typography>

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleGenerateLink}
                        sx={{mt:2, backgroundColor: "#003366"}}
                    >
                        Create Shareable Link
                    </Button>

                    {inviteLink && (
                        <TextField
                            fullWidth
                            margin="normal"
                            value={inviteLink}
                            InputProps={{ readOnly: true }}
                        />
                    )}
                </CardContent>
            </Card>
        </>
    );
};

export default TripInvite;
import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { deleteUser } from "firebase/auth";

export default function DeleteAccountButton() {
  const { currentUser, logout } = useAuth();
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDeleteAccount = async () => {
    if (!currentUser) return;

    try {
      await fetch("/api/delete-user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: currentUser.uid })
      });

      await deleteUser(currentUser);

      await logout();
      navigate("/signup");
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  return (
    <>
      <Button fullWidth variant="outlined" color="error" onClick={handleOpen} sx={ {mt: 1.5} }>
        Delete Account
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action is permanent and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteAccount} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

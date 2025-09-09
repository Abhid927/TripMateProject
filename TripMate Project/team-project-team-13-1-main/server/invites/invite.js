import mysql from 'mysql';
import config from '../../config.js';
import express from 'express';
import jwt from 'jsonwebtoken';
import sendInviteEmail from './mailer.js';
import path from "path";

const router = express.Router()
const __dirname = path.resolve();
const connection = mysql.createConnection(config);


//sending an invite via email
router.post('/send', async (req, res) => {
    const { tripID, inviterID, invitedEmail, frontendURL } = req.body;

    if (!tripID || !inviterID || !invitedEmail) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    //Create unique token for invitation
    const token = jwt.sign({ tripID, invitedEmail }, 'your-secret-key', { expiresIn: '48h' });
    //const inviteLink = `${FRONTEND_URL}/invite-accept?tripID=${tripID}&token=${token}`;
    const inviteLink = `${frontendURL}/accept-invite?token=${token}`;


    const deleteExpiredSQL = `DELETE FROM Invitations WHERE expiresAt < NOW()`;

    connection.query(deleteExpiredSQL, (err) => {
        if (err) {
            console.error("Error deleting expired invites:", err);
        } else {
            console.log("Expired invites deleted successfully.");
        }
    });
    //check if invite exists
    const checkInviteSQL = `SELECT * FROM Invitations WHERE tripID = ? AND invitedEmail = ? AND status = 'pending'`;
    const checkData = [tripID, invitedEmail];

    connection.query(checkInviteSQL, checkData, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err.message });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: 'User already invited to this trip.' });
        }

        const insertInviteSQL = `
            INSERT INTO Invitations (tripID, inviterID, invitedEmail, token)
            VALUES (?, ?, ?, ?)
        `;
        const insertData = [tripID, inviterID, invitedEmail, token];

        connection.query(insertInviteSQL, insertData, async (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: err.message });
            }

            try {
                await sendInviteEmail(invitedEmail, inviteLink); // Send email using mailer.js
                res.json({ message: 'Invitation sent successfully!', inviteLink });
            } catch (error) {
                console.log(err);
                res.status(500).json({ message: 'Error sending email', error });
            }
        });
    });
});

//accepting an invite

// router.post('/send', async (req, res) => {
//     console.log("Received request:", req.body);
//     const { tripID, inviterID, invitedEmail } = req.body;

//     if (!tripID || !inviterID || !invitedEmail) {
//         console.error("Missing required fields:", { tripID, inviterID, invitedEmail });
//         return res.status(400).json({ error: 'Missing required fields.' });
//     }

//     const deleteExpiredSQL = `DELETE FROM Invitations WHERE expiresAt < NOW()`;
//     connection.query(deleteExpiredSQL, (err) => {
//         if (err) {
//             console.error("Error deleting expired invites:", err);
//         } else {
//             console.log("Expired invites deleted.");
//         }
//     });

//     // Check if an invite already exists
//     const checkInviteSQL = `SELECT * FROM Invitations WHERE tripID = ? AND invitedEmail = ? AND status = 'pending'`;
//     const checkData = [tripID, invitedEmail];

//     connection.query(checkInviteSQL, checkData, (err, results) => {
//         if (err) {
//             return res.status(500).json({ error: "Database error while checking invite." });
//         }

//         if (results.length > 0) {
//             console.warn("Invite already sent to:", invitedEmail);
//             return res.status(400).json({ error: "Invite has already been sent to this email." });
//         }

//         // Generate new invite
//         const token = jwt.sign({ tripID, invitedEmail }, 'your-secret-key', { expiresIn: '48h' });
//         const inviteLink = `${FRONTEND_URL}?token=${token}`;

//         const insertInviteSQL = `
//             INSERT INTO Invitations (tripID, inviterID, invitedEmail, token)
//             VALUES (?, ?, ?, ?)
//         `;
//         const insertData = [tripID, inviterID, invitedEmail, token];

//         connection.query(insertInviteSQL, insertData, async (err) => {
//             if (err) {
//                 return res.status(500).json({ error: "Database error while inserting invite." });
//             }

//             console.log("Invite inserted successfully");

//             try {
//                 await sendInviteEmail(invitedEmail, inviteLink);
//                 res.json({ message: 'Invitation sent successfully!', inviteLink });
//             } catch (error) {
//                 res.status(500).json({ error: "Error sending email" });
//             }
//         });
//     });
// });

router.post('/link', (req, res) => {
    const { tripID, inviterID, frontendURL} = req.body;

    if (!tripID || !inviterID) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    // Generate token and invite link
    const token = jwt.sign({ tripID }, 'your-secret-key', { expiresIn: '48h' });
    const inviteLink = `${frontendURL}/accept-invite?token=${token}`;

    res.json({ inviteLink });
});

router.post("/accept", (req, res) => {
    const { token, userID } = req.body;

    if (!token || !userID) {
        return res.status(400).json({ error: "Missing invite token or user ID." });
    }

    jwt.verify(token, 'your-secret-key', (err, decoded) => {
        if (err) {
            return res.status(400).json({ error: "Invalid or expired token." });
        }

        const { tripID, invitedEmail } = decoded;

        // Check if user is already a trip member
        const checkMembershipSQL = `SELECT * FROM TripMembers WHERE tripID = ? AND userID = ?`;
        connection.query(checkMembershipSQL, [tripID, userID], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (results.length > 0) {
                return res.status(400).json({ error: "User is already a member of this trip." });
            }

            // Insert into TripMembers table
            const insertMemberSQL = `INSERT INTO TripMembers (tripID, userID) VALUES (?, ?)`;
            connection.query(insertMemberSQL, [tripID, userID], (insertErr) => {
                if (insertErr) {
                    return res.status(500).json({ error: insertErr.message });
                }

                // Update invitation status
                const updateInviteSQL = `UPDATE Invitations SET status = 'accepted' WHERE tripID = ? AND invitedEmail = ?`;
                connection.query(updateInviteSQL, [tripID, invitedEmail], (updateErr) => {
                    if (updateErr) {
                        return res.status(500).json({ error: updateErr.message });
                    }

                    res.json({ message: "You have joined the trip!" });
                });
            });
        });
    });
});

router.post("/decline", (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: "Missing invite token." });
    }

    jwt.verify(token, 'your-secret-key', (err, decoded) => {
        if (err) {
            return res.status(400).json({ error: "Invalid or expired token." });
        }

        const { tripID, invitedEmail } = decoded;

        const deleteInviteSQL = `DELETE FROM Invitations WHERE tripID = ? AND invitedEmail = ? AND status = 'pending'`;
        connection.query(deleteInviteSQL, [tripID, invitedEmail], (deleteError) => {
            if (deleteError) {
                return res.status(500).json({ error: deleteError.message });
            }
            res.json({ message: "Invitation declined." });
        });
    });
});

router.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });

export default router;

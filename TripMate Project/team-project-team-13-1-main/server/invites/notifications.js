import mysql from "mysql";
import config from "../../config.js";
import express from "express";
import cron from "node-cron";
import { sendActivityNotification } from "./mailer.js";


const router = express.Router();
const pool = mysql.createPool(config);


async function getUpcomingActivities(userID) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT ia.id, ia.trip_id, ia.name, ia.date, ia.time, ia.location, ia.category, ia.userID
            FROM ItineraryActivities ia
            WHERE TIMESTAMP(ia.date, ia.time) >= NOW()
            AND TIMESTAMP(ia.date, ia.time) < DATE_ADD(NOW(), INTERVAL 1 DAY)
            AND ia.userID = ?;
        `;


        pool.query(query, [userID], (error, results) => {
            if (error) {
                console.error("Error fetching upcoming activities:", error);
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}


async function getAllUsers() {
    return new Promise((resolve, reject) => {
        const query = `SELECT uid, email FROM UserProfile WHERE email IS NOT NULL`;
        pool.query(query, (error, results) => {
            if (error) {
                console.error("Error fetching users:", error);
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}


async function sendReminderForUser(userID, userEmail) {
    try {
        if (!userID || !userEmail) {
            console.error(`Error: Missing userID or email for user ${userID}`);
            return;
        }


        const activities = await getUpcomingActivities(userID);


        if (activities.length === 0) {
            console.log(`No upcoming activities for userID: ${userID}`);
            return;
        }


        console.log(`Sending email to ${userEmail} for ${activities.length} activities.`);
        await sendActivityNotification(userEmail, activities);


    } catch (error) {
        console.error(`Error sending reminder for userID ${userID}:`, error);
    }
}


router.post("/send-reminder", async (req, res) => {
    const { userID } = req.body;


    if (!userID) {
        console.error("Error: Missing user ID in request");
        return res.status(400).json({ error: "Missing user ID." });
    }


    try {
        const query = `SELECT email FROM UserProfile WHERE uid = ?`;
        pool.query(query, [userID], async (error, results) => {
            if (error || results.length === 0) {
                console.error(`Error fetching email for userID ${userID}:`, error);
                return res.status(400).json({ error: "No email found for this user." });
            }


            const userEmail = results[0].email;
            await sendReminderForUser(userID, userEmail);


            res.json({ message: "Reminder email sent successfully!" });
        });


    } catch (error) {
        console.error("Error sending activity notifications:", error);
        res.status(500).json({ error: "Failed to send notifications." });
    }
});


// code below runs an automated task every day at midnight (when server is active)
cron.schedule("0 0 * * *", async () => { 
// the code immediately below runs an automated task every minute (for immediate testing)
//cron.schedule("* * * * *", async () => {
    console.log("Running scheduled task: Sending activity reminders.");
   
    try {
        const users = await getAllUsers();
       
        for (const user of users) {
            await sendReminderForUser(user.uid, user.email);
        }
    } catch (error) {
        console.error("Error in cron job:", error);
    }
});


export default router;
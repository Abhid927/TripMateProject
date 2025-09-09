import { sendActivityNotification } from "./mailer.js";

const testEmail = "shayaan.kazi99@gmail.com";

const sampleActivities = [
  {
    name: "Dinner with Friends",
    date: "2025-03-12",
    time: "19:00",
    location: "New York City",
    category: "Dining",
  },
  {
    name: "Museum Tour",
    date: "2025-03-12",
    time: "15:00",
    location: "The Louvre, Paris",
    category: "Sightseeing",
  },
];

async function testEmailNotification() {
  try {
    console.log("Testing email notification...");
    await sendActivityNotification(testEmail, sampleActivities);
    console.log("Test email sent successfully!");
  } catch (error) {
    console.error("Error sending test email:", error);
  }
}

testEmailNotification();
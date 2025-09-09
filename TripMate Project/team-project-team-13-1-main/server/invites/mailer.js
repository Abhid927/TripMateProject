import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "tripmate460@gmail.com",
    pass: "ubassbvbauoexvxc",
  },
});


async function sendInviteEmail(recipientEmail, inviteLink) {
  try {
    const mailOptions = {
      from: "tripmate460@gmail.com",
      to: recipientEmail,
      subject: "You're Invited to a Trip! 🌍✈️",
      text: `Hello! A friend has invited you to join their trip. Click the link below to accept the invite:\n\n${inviteLink}\n\nThis link will expire in 48 hours.`,
      html: `
      <p>Hello!</p>
      <p>A friend has invited you to join their trip. Click the button below to accept the invite:</p>
      <p><a href="${inviteLink}" style="padding: 10px 15px; background-color: #008CBA; color: white; text-decoration: none; border-radius: 5px;">Join Trip</a></p>
      <p><i>This link will expire in 48 hours.</i></p>
    `,
    };


    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${recipientEmail}, Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(`Error sending email to ${recipientEmail}:`, error);
    throw error;
  }
}


async function sendActivityNotification(recipientEmail, activities) {
  try {
    if (!activities || activities.length === 0) {
      console.log(`No upcoming activities to notify for ${recipientEmail}`);
      return;
    }
    let activitiesListHTML = activities.map(activity => `
      <li>
        <strong>${activity.name}</strong><br>
        📅 Date: ${activity.date}<br>
        ⏰ Time: ${activity.time}<br>
        📍 Location: ${activity.location || "N/A"}<br>
        🏷️ Category: ${activity.category}
      </li>
    `).join("");


    let activitiesListText = activities.map(activity => `
      - ${activity.name}
        Date: ${activity.date}
        Time: ${activity.time}
        Location: ${activity.location || "N/A"}
        Category: ${activity.category}
    `).join("\n");


    const mailOptions = {
      from: "tripmate460@gmail.com",
      to: recipientEmail,
      subject: `Your Upcoming Activities in the Next 24 Hours! 📅`,
      text: `Hello,\n\nYou have the following upcoming activities within the next 24 hours:\n\n${activitiesListText}\n\nThis is an automated reminder from TripMate. Have a great time!`,
      html: `
        <p>Hello,</p>
        <p>You have the following upcoming activities within the next 24 hours:</p>
        <ul>${activitiesListHTML}</ul>
        <p>This is an automated reminder from TripMate. Have a great time!</p>
      `,
    };


    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${recipientEmail} with ${activities.length} activities, Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(`Error sending notification email to ${recipientEmail}:`, error);
    throw error;
  }
}


export default sendInviteEmail;
export { sendActivityNotification };
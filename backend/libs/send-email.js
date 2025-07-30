import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const fromEmail = process.env.FROM_EMAIL;
const emailPassword = process.env.EMAIL_APP_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: fromEmail,
    pass: emailPassword,
  },
});

export const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `Trackwise <${fromEmail}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

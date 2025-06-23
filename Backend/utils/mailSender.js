import nodemailer from "nodemailer";

export const sendResetCodeEmail = async (email, resetCode) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Password Reset Code",
      html: `<p>Your password reset code is: <b>${resetCode}</b></p>
             <p>This code will expire in 15 minutes.</p>`,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmails = async ({ to, subject, html }: EmailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ||"smtp.office365.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || "takeover@takeovermobile.com",
        pass: process.env.SMTP_PASS|| "Wunnatakeover",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER || "takeover@takeovermobile.com",
      to,
      subject,
      html,
    });

    console.log("Email sent to:", to);
  } catch (error) {
    console.error("sendEmail error:", error);
    throw new Error("Email could not be sent");
  }
};

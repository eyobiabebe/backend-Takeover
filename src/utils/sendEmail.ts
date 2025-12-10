import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmails = async ({ to, subject, html }: EmailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true for 465, false for other ports
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
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

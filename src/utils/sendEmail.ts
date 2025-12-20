import sgMail from "@sendgrid/mail";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export const sendEmails = async ({ to, subject, html }: EmailOptions) => {
  try {
    await sgMail.send({
      to,
      from: process.env.EMAIL_FROM as string, 
      subject,
      html,
    });

    console.log("Email sent to:", to);
  } catch (error: any) {
    console.error("SendGrid error:", error.response?.body || error);
    throw new Error("Email could not be sent");
  }
};

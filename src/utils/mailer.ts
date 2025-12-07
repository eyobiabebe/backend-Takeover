// backend/utils/mailer.ts
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import fs from "fs";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT), 
  secure: false,
  auth: {
    user: process.env.SMTP_USER, // full email: info@yourdomain.com
    pass: process.env.SMTP_PASS, // email password
  },
});

export const sendResetEmail = async (to: string, resetUrl: string) => {
  const mailOptions = {
    from: process.env.SMTP_USER ,
    to,
    subject: "Password Reset Request",
    html: `
      <p>You requested a password reset for your account.</p>
      <p>Click the link below to reset your password (valid for 1 hour):</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};


export const sendEmail = async (to: string, type: string, data: Record<string, any>) => {
  const frontend_url = process.env.FRONTEND_URL
  if (type === "draft_listing") {

    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject: "Your Lease Draft is Saved — Complete Payment to Publish",
      html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Lease Draft Saved</title>
      <style>
        body {
          background-color: #f4f7fa;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 0;
          color: #333333;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(90deg, #2563eb, #1d4ed8);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 30px 25px;
          line-height: 1.6;
        }
        .content h2 {
          font-size: 20px;
          color: #111827;
        }
        .button {
          display: inline-block;
          background-color: #2563eb;
          color: white !important;
          text-decoration: none;
          padding: 12px 25px;
          border-radius: 8px;
          font-weight: 600;
          margin-top: 20px;
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px;
          font-size: 13px;
          text-align: center;
          color: #6b7280;
        }
        a {
          color: #2563eb;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Lease Draft Saved Successfully</h1>
        </div>
        <div class="content">
          <p>Hi ${data.username},</p>
          <p>Your lease titled <strong>${data.title}</strong> has been saved as a draft. To make it visible to potential takers, please complete your payment.</p>
          
          <p>Once payment is made, your listing will be published immediately and visible to thousands of users.</p>

         
          <p>Thank you for choosing <strong>Takeover</strong>!</p>
        </div>
        <div class="footer">
          <p>© 2025 Takeover. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `,
    };

    await transporter.sendMail(mailOptions);

  } else if (type === "publish_listing") {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject: "🎉 Your Lease Has Been Published Successfully!",
      html: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lease Published</title>
    <style>
      body {
        background-color: #f4f7fa;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 0;
        color: #333333;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(90deg, #16a34a, #15803d);
        color: white;
        padding: 30px 20px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
      .content {
        padding: 30px 25px;
        line-height: 1.6;
      }
      .content h2 {
        font-size: 20px;
        color: #111827;
      }
      .button {
        display: inline-block;
        background-color: #16a34a;
        color: white !important;
        text-decoration: none;
        padding: 12px 25px;
        border-radius: 8px;
        font-weight: 600;
        margin-top: 20px;
      }
      .footer {
        background-color: #f9fafb;
        padding: 20px;
        font-size: 13px;
        text-align: center;
        color: #6b7280;
      }
      a {
        color: #16a34a;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Lease Published Successfully 🎉</h1>
      </div>
      <div class="content">
        <p>Hi ${data.username},</p>
        <p>Great news! Your lease titled <strong>${data.title}</strong> has been <strong>successfully published</strong> and is now live on <strong>Takeover</strong>.</p>

        <p>Interested users can now view your listing and reach out to you directly. You can track views, messages, and offers anytime in your account.</p>

        <a href="${frontend_url}/dashboard/mylistings/${data.lease_id}" class="button">View My Listing</a>

        <p style="margin-top: 30px;">If you’d like to make any updates or pause the listing, you can do so from your <a href="">dashboard</a>.</p>

        <p>Thank you for using <strong>Takeover</strong> to share your lease!</p>
      </div>
      <div class="footer">
        <p>© 2025 Takeover. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `,
    };

    await transporter.sendMail(mailOptions);


  } else if (type === "proceed_takeoverer") {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject: "🎉 Takeover proceeded Successfully!",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Takeover Proceeded Successfully</title>
  <style>
    body {
      background-color: #f4f7fa;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(90deg, #0ea5e9, #0284c7);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 30px 25px;
      line-height: 1.6;
    }
    .content h2 {
      font-size: 20px;
      color: #111827;
    }
    .button {
      display: inline-block;
      background-color: #0ea5e9;
      color: white !important;
      text-decoration: none;
      padding: 12px 25px;
      border-radius: 8px;
      font-weight: 600;
      margin-top: 20px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px;
      font-size: 13px;
      text-align: center;
      color: #6b7280;
    }
    a {
      color: #0ea5e9;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Takeover Proceeded Successfully 🚀</h1>
    </div>
    <div class="content">
      <p>Hi ${data.username},</p>
      <p>You are successfuly proceeding with listing "${data.title}", wait for acceptance by the tenant.</p>

      <p>The tenant will accept you.</p>

      
      <p>Thank you for using <strong>Takeover</strong> — where leasing made simple and secure!</p>
    </div>
    <div class="footer">
      <p>© 2025 Takeover. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`,
    };

    await transporter.sendMail(mailOptions);

  } else if (type === "proceed_tenant") {
    const mailOptions = {

      from: process.env.SMTP_USER,
      to,
      subject: "🎉 Takeover proceeded Successfully!",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Takeover Proceeded Successfully</title>
  <style>
    body {
      background-color: #f4f7fa;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(90deg, #0ea5e9, #0284c7);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 30px 25px;
      line-height: 1.6;
    }
    .content h2 {
      font-size: 20px;
      color: #111827;
    }
    .button {
      display: inline-block;
      background-color: #0ea5e9;
      color: white !important;
      text-decoration: none;
      padding: 12px 25px;
      border-radius: 8px;
      font-weight: 600;
      margin-top: 20px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px;
      font-size: 13px;
      text-align: center;
      color: #6b7280;
    }
    a {
      color: #0ea5e9;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Takeover Attempt Found.</h1>
    </div>
    <div class="content">
      <p>Hi ${data.tenant},</p>
      <p>User ${data.username} have proceeded for Your listing "${data?.title}", review and Aceept the user to go further with the takeover.</p>

      
      <p>Thank you for using <strong>Takeover</strong> — where leasing made simple and secure!</p>
    </div>
    <div class="footer">
      <p>© 2025 Takeover. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`,
    };

    await transporter.sendMail(mailOptions);

  } else if (type === "accepted_tenant") {

    if(!to){
      console.error("No email address provided for landlord.");
      return;
    }
    // Step 1: Create PDF
    const pdfPath = `./tmp/Takeover_Lease_Transfer_${Date.now()}.pdf`;
    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    // Title
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("Takeover – Lease Transfer Confirmation", { align: "center" })
      .moveDown(2);

    // Intro paragraph
    doc
      .font("Helvetica")
      .fontSize(12)
      .text(
        "Dear User,\n\nThis document confirms the successful initiation of your lease transfer through Takeover. Below are the key details of your transfer for your records. Please ensure all information is correct and keep this confirmation for your reference.\n",
        { align: "left" }
      )
      .moveDown(2);

    // Key details
    doc
      .font("Helvetica")
      .fontSize(12)
      .text(`Lessee Name: ${data.lessee}`)
      .moveDown(0.2)
      .text(`Lessor Name: ${data.lessor}`)
      .moveDown(0.2)
      .text(`Property Address: ${data.address}`)
      .moveDown(0.2)
      .text(`Lease Start Date: ${data.startDate}`)
      .moveDown(0.2)
      .text(`Lease End Date: ${data.endDate}`)
      .moveDown(0.2)
      .text(`Monthly Rent: ${data.rent}`)
      .moveDown(0.2)
      // .text(`Security Deposit: ${data.deposit}`)
      .text(`Transfer Date: ${new Date().toLocaleDateString()}`)
      .moveDown();

    // Notes
    doc.font("Helvetica-Bold").text("Important Notes:", { underline: true });
    doc.moveDown(0.5);
    doc.font("Helvetica").list([
      "The new lessee assumes all responsibilities and obligations of the lease agreement as of the transfer date.",
      "The lessor has approved this transfer, and all parties are bound by the original lease terms.",
      "Security deposits will be transferred in accordance with the original agreement.",
    ]);

    // Footer
    doc.moveDown();
    doc.text(
      "\nIf you have any questions regarding your lease transfer, please log into your Takeover account for further details. This confirmation serves as official proof of your lease transfer.\n\nThank you for using Takeover.",
      { align: "left" }
    );

    doc.end();
    await new Promise((resolve) => writeStream.on("finish", resolve as any));

    const mailOptions = {

      from: process.env.SMTP_USER,
      to,
      subject: "🎉 Takeover Accepted Successfully!",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Takeover Accepted Successfully</title>
          <style>
            body {
              background-color: #f4f7fa;
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 0;
              color: #333333;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.05);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(90deg, #0ea5e9, #0284c7);
              color: white;
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .content {
              padding: 30px 25px;
              line-height: 1.6;
            }
            .content h2 {
              font-size: 20px;
              color: #111827;
            }
            .button {
              display: inline-block;
              background-color: #0ea5e9;
              color: white !important;
              text-decoration: none;
              padding: 12px 25px;
              border-radius: 8px;
              font-weight: 600;
              margin-top: 20px;
            }
            .footer {
              background-color: #f9fafb;
              padding: 20px;
              font-size: 13px;
              text-align: center;
              color: #6b7280;
            }
            a {
              color: #0ea5e9;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Takeover Accepted Successfully</h1>
            </div>
            <div class="content">
              <p>Hi ${data.lessee},</p>
              <p>You have Accepted ${data.lessor} as your takeoverer for Your listing "${data?.title}", congratulations!</p>

              <p style="margin-top: 30px;">If you have any questions or need assistance, please contact our <a href="${frontend_url}/support">support team</a>.</p>

              <p>Thank you for using <strong>Takeover</strong> — where leasing made simple and secure!</p>
            </div>
            <div class="footer">
              <p>© 2025 Takeover. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
        `,
      attachments: [
        {
          filename: `Takeover_Lease_Transfer_${Date.now()}.pdf`,
          path: pdfPath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  } else if (type === "accepted_landlord") {

    if(!to){
      console.error("No email address provided for landlord.");
      return;
    }
    // Step 1: Create PDF
    const pdfPath = `./tmp/Takeover_Lease_Transfer_${Date.now()}.pdf`;
    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    // Title
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("Takeover – Lease Transfer Confirmation", { align: "center" })
      .moveDown(2);

    // Intro paragraph
    doc
      .font("Helvetica")
      .fontSize(12)
      .text(
        "Dear User,\n\nThis document confirms the successful initiation of your lease transfer through Takeover. Below are the key details of your transfer for your records. Please ensure all information is correct and keep this confirmation for your reference.\n",
        { align: "left" }
      ).moveDown(1);

    // Key details
    doc
      .font("Helvetica")
      .fontSize(12)
      .text(`Lessee Name: ${data.lessee}`)
      .moveDown(0.2)
      .text(`Lessor Name: ${data.lessor}`)
      .moveDown(0.2)
      .text(`Property Address: ${data.address}`)
      .moveDown(0.2)
      .text(`Lease Start Date: ${data.startDate}`)
      .moveDown(0.2)
      .text(`Lease End Date: ${data.endDate}`)
      .moveDown(0.2)
      .text(`Monthly Rent: ${data.rent}`)
      .moveDown(0.2)
      

    // Notes
    doc.font("Helvetica-Bold").text("Important Notes:", { underline: true });
    doc.moveDown(0.5);
    doc.font("Helvetica").list([
      "The new lessee assumes all responsibilities and obligations of the lease agreement as of the transfer date.",
      "The lessor has approved this transfer, and all parties are bound by the original lease terms.",
      "Security deposits will be transferred in accordance with the original agreement.",
    ]);

    // Footer
    doc.moveDown();
    doc.text(
      "\nIf you have any questions regarding your lease transfer, please log into your Takeover account for further details. This confirmation serves as official proof of your lease transfer.\n\nThank you for using Takeover.",
      { align: "left" }
    );

    doc.end();
    await new Promise((resolve) => writeStream.on("finish", resolve as any));

    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject: "🎉 Takeover Accepted Successfully!",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Takeover Accepted Successfully</title>
  <style>
    body {
      background-color: #f4f7fa;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(90deg, #0ea5e9, #0284c7);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 30px 25px;
      line-height: 1.6;
    }
    .content h2 {
      font-size: 20px;
      color: #111827;
    }
    .button {
      display: inline-block;
      background-color: #0ea5e9;
      color: white !important;
      text-decoration: none;
      padding: 12px 25px;
      border-radius: 8px;
      font-weight: 600;
      margin-top: 20px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px;
      font-size: 13px;
      text-align: center;
      color: #6b7280;
    }
    a {
      color: #0ea5e9;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Takeover Accepted Successfully</h1>
    </div>
    <div class="content">
      <p>Hi ${data.lessee},</p>
      <p>You have Accepted ${data.lessor} as your takeoverer for Your listing "${data?.title}", congratulations!</p>

      <p style="margin-top: 30px;">If you have any questions or need assistance, please contact our <a href="${frontend_url}/support">support team</a>.</p>

      <p>Thank you for using <strong>Takeover</strong> — where leasing made simple and secure!</p>
    </div>
    <div class="footer">
      <p>© 2025 Takeover. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`,
      attachments: [
        {
          filename: `Takeover_Lease_Transfer_${Date.now()}.pdf`,
          path: pdfPath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  } else if (type === "accepted_takeoverer") {
    // Step 1: Create PDF
    const pdfPath = `./tmp/Takeover_Lease_Transfer_${Date.now()}.pdf`;
    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    // Title
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("Takeover Lease Transfer Confirmation", { align: "center" })
      .moveDown(2);

    // Intro paragraph
    doc
      .font("Helvetica")
      .fontSize(12) 
      .text(
        "Dear User,\n\nThis document confirms the successful initiation of your lease transfer through Takeover. Below are the key details of your transfer for your records. Please ensure all information is correct and keep this confirmation for your reference.\n",
        { align: "left" }
      )
      .moveDown(1);

    // Key details
    doc
      .font("Helvetica")
      .fontSize(12)
      .text(`Lessee Name: ${data.lessee}`)
      .moveDown(0.2)
      .text(`Lessor Name: ${data.lessor}`)
      .moveDown(0.2)
      .text(`Property Address: ${data.address}`)
      .moveDown(0.2)
      .text(`Lease Start Date: ${data.startDate}`)
      .moveDown(0.2)
      .text(`Lease End Date: ${data.endDate}`)
      .moveDown(0.2)
      .text(`Monthly Rent: ${data.rent}`)
      .moveDown(0.2)

    // Notes
    doc.font("Helvetica-Bold").text("Important Notes:", { underline: true });
    doc.moveDown(0.5);
    doc.font("Helvetica").list([
      "The new lessee assumes all responsibilities and obligations of the lease agreement as of the transfer date.",
      "The lessor has approved this transfer, and all parties are bound by the original lease terms.",
      "Security deposits will be transferred in accordance with the original agreement.",
    ]);

    // Footer
    doc.moveDown();
    doc.text(
      "\nIf you have any questions regarding your lease transfer, please log into your Takeover account for further details. This confirmation serves as official proof of your lease transfer.\n\nThank you for using Takeover.",
      { align: "left" }
    );

    doc.end();
    await new Promise((resolve) => writeStream.on("finish", resolve as any));

    const mailOptions = {

      from: process.env.SMTP_USER,
      to,
      subject: "🎉 Takeover Accepted Successfully!",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Takeover Accepted Successfully</title>
  <style>
    body {
      background-color: #f4f7fa;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(90deg, #0ea5e9, #0284c7);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 30px 25px;
      line-height: 1.6;
    }
    .content h2 {
      font-size: 20px;
      color: #111827;
    }
    .button {
      display: inline-block;
      background-color: #0ea5e9;
      color: white !important;
      text-decoration: none;
      padding: 12px 25px;
      border-radius: 8px;
      font-weight: 600;
      margin-top: 20px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px;
      font-size: 13px;
      text-align: center;
      color: #6b7280;
    }
    a {
      color: #0ea5e9;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Takeover Accepted Successfully</h1>
    </div>
    <div class="content">
      <p>Hi ${data.lessee},</p>
      <p>You have Accepted ${data.lessor} as your takeoverer for Your listing "${data?.title}", congratulations!</p>

      <p style="margin-top: 30px;">If you have any questions or need assistance, please contact our <a href="${frontend_url}/support">support team</a>.</p>

      <p>Thank you for using <strong>Takeover</strong> — where leasing made simple and secure!</p>
    </div>
    <div class="footer">
      <p>© 2025 Takeover. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`,
      attachments: [
        {
          filename: `Takeover_Lease_Transfer_${Date.now()}.pdf`,
          path: pdfPath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  }

};

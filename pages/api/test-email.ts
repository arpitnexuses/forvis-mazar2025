import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { testEmail } = req.body

  if (!testEmail) {
    return res.status(400).json({ message: 'Test email address is required' })
  }

  // Create a transporter using SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  try {
    console.log("Testing email configuration...");
    console.log("SMTP Config:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: process.env.SMTP_USER ? "***" : "NOT SET",
      from: process.env.FROM_EMAIL
    });

    // Send test email
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: testEmail,
      subject: "Test Email - Cybersecurity Assessment",
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify the SMTP configuration.</p>
        <p>If you receive this email, the email functionality is working correctly.</p>
        <p>Time: ${new Date().toISOString()}</p>
      `,
    })

    console.log("Test email sent successfully");
    res.status(200).json({ message: 'Test email sent successfully' })
  } catch (error) {
    console.error('Error sending test email:', error)
    res.status(500).json({ 
      message: 'Failed to send test email',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
} 
import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'

// Define the structure of the request body
interface AssessmentData {
  personalInfo: {
    name: string;
    date: string;
    role: string;
    environmentType: string;
    environmentSize: string;
    environmentImportance: string;
    environmentMaturity: string;
    environmentUniqueName: string;
    marketSector: string;
    country: string;
    email: string;
  };
  answers: Record<string, string>;
  score: number;
  language?: 'en' | 'fr';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { personalInfo, language = 'en' } = req.body as AssessmentData

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

  // Professional email template for reaching back to the user
  const userEmailContent = `
    <!DOCTYPE html>
    <html lang="${language}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mazars Cybersecurity Assessment</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            padding: 30px 20px;
            text-align: center;
          }
          .logo { 
            max-width: 200px; 
            height: auto;
            margin-bottom: 20px;
          }
          .header h1 { 
            color: #ffffff; 
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content { 
            padding: 40px 30px; 
          }
          .greeting { 
            font-size: 18px; 
            color: #374151; 
            margin-bottom: 20px;
          }
          .assessment-details {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #374151;
          }
          .detail-value {
            color: #6b7280;
          }

          .next-steps {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .next-steps h3 {
            color: #92400e;
            margin-top: 0;
            margin-bottom: 15px;
          }
          .contact-info {
            background-color: #ecfdf5;
            border: 1px solid #10b981;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .contact-info h3 {
            color: #065f46;
            margin-top: 0;
            margin-bottom: 15px;
          }
          .footer {
            background-color: #1f2937;
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
          }
          .footer p {
            margin: 5px 0;
            font-size: 14px;
          }
          .social-links {
            margin-top: 20px;
          }
          .social-links a {
            color: #ffffff;
            text-decoration: none;
            margin: 0 10px;
          }
          @media (max-width: 600px) {
            .container { margin: 0; }
            .content { padding: 20px; }
            .detail-row { flex-direction: column; }
            .detail-value { margin-top: 5px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="/favicon.png" alt="Mazars Logo" class="logo">
            <h1>Cybersecurity Assessment Completed</h1>
          </div>
          
          <div class="content">
            <div class="greeting">
              <p>Dear ${personalInfo.name.split(' ')[0] || 'Valued Client'},</p>
              <p>Thank you for completing the Cybersecurity Self-Assessment. We have received your assessment results and are pleased to provide you with a comprehensive analysis.</p>
            </div>

            <div class="assessment-details">
              <h3 style="margin-top: 0; color: #1f2937;">Assessment Details</h3>
              <div class="detail-row">
                <span class="detail-label">Environment Name:</span>
                <span class="detail-value">${personalInfo.environmentUniqueName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Environment Type:</span>
                <span class="detail-value">${personalInfo.environmentType}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Environment Size:</span>
                <span class="detail-value">${personalInfo.environmentSize}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Market Sector:</span>
                <span class="detail-value">${personalInfo.marketSector}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Country:</span>
                <span class="detail-value">${personalInfo.country}</span>
              </div>
            </div>



            <div class="next-steps">
              <h3>📋 Next Steps</h3>
              <p>Our cybersecurity experts will review your assessment results and prepare a detailed analysis including:</p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Comprehensive risk analysis</li>
                <li>Gap identification and prioritization</li>
                <li>Customized recommendations</li>
                <li>Implementation roadmap</li>
                <li>Best practices guidance</li>
              </ul>
              <p><strong>We will contact you within 2-3 business days</strong> to schedule a detailed discussion about your cybersecurity posture and next steps.</p>
            </div>

            <div class="contact-info">
              <h3>📞 Contact Information</h3>
              <p><strong>Forvis Mazars Cybersecurity Team</strong></p>
              <p>📧 Email: <a href="mailto:alexander.b@skilloncall.com" style="color: #065f46;">alexander.b@skilloncall.com</a></p>
              <p>🌐 Website: <a href="https://www.forvismazars.com" style="color: #065f46;">www.forvismazars.com</a></p>
              <p>If you have any immediate questions or concerns, please don't hesitate to reach out to us.</p>
            </div>

            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              This assessment is part of our comprehensive cybersecurity services designed to help organizations strengthen their security posture and protect against evolving cyber threats.
            </p>
          </div>

          <div class="footer">
            <p><strong>Forvis Mazars</strong></p>
            <p>Your Trusted Cybersecurity Partner</p>
            <div class="social-links">
              <a href="https://www.linkedin.com/company/forvismazars" target="_blank">LinkedIn</a>
              <a href="https://twitter.com/forvismazars" target="_blank">Twitter</a>
              <a href="https://www.forvismazars.com" target="_blank">Website</a>
            </div>
            <p style="margin-top: 20px; font-size: 12px; opacity: 0.8;">
              © 2024 Forvis Mazars. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    console.log("Attempting to send user email...");
    console.log("User email:", personalInfo.email);
    console.log("SMTP Config:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: process.env.SMTP_USER ? "***" : "NOT SET",
      from: process.env.FROM_EMAIL
    });
    
    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP not configured, skipping user email sending");
      return res.status(200).json({ 
        message: 'Assessment stored successfully (user email skipped - SMTP not configured)',
        skipped: true
      });
    }
    
    // Send email to the user using their provided email address
    const userEmail = personalInfo.email || process.env.USER_EMAIL || "alexander.b@skilloncall.com";
    
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
      subject: "Mazars Cybersecurity Assessment Completed",
      html: userEmailContent,
    })

    console.log("User email sent successfully to:", userEmail);
    res.status(200).json({ message: 'User email sent successfully' })
  } catch (error) {
    console.error('Error sending user email:', error)
    res.status(200).json({ 
      message: 'Assessment stored successfully (email failed but data saved)',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
} 
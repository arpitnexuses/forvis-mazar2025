import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'
import { questionsData } from '@/lib/questions';

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
  selectedCategories: string[];
  selectedAreas: string[];
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
  completedQuestions: number;
  assessmentMetadata: {
    language: string;
    assessmentDate: string;
    assessmentDuration: number;
    userAgent: string;
    screenResolution: string;
  };
  questionDetails: Array<{
    id: string;
    text: string;
    category: string;
    area: string;
    topic: string;
    options: Array<{ value: string; label: string; score: number }>;
    selectedAnswer: string | null;
  }>;
  language?: 'en' | 'fr';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

      const { 
      personalInfo, 
      answers, 
      score, 
      language = 'en' 
    } = req.body as AssessmentData
    // const t = translations[language as keyof typeof translations];
    const currentQuestions = questionsData[language as keyof typeof questionsData];

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



  // Internal notification email (for the team)
  const internalEmailContent = `
    <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333;
          }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #2c3e50; text-align: center; }
          .score { font-size: 24px; font-weight: bold; color: #27ae60; text-align: center; }
          .section { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; }
          .logo { display: block; margin: 0 auto; max-width: 200px; }
        </style>
      </head>
      <body>
        <div class="container">
                      <img src="/favicon.png" alt="Mazars Logo" class="logo">
          <h1>New Cybersecurity Assessment Completed</h1>
          <div class="section">
            <table>
              <tr>
                <th colspan="2">Client Information</th>
              </tr>
              <tr>
                <td><strong>Name:</strong></td>
                <td>${personalInfo.name}</td>
              </tr>
              <tr>
                <td><strong>Date:</strong></td>
                <td>${personalInfo.date}</td>
              </tr>
              <tr>
                <td><strong>Role:</strong></td>
                <td>${personalInfo.role}</td>
              </tr>
              <tr>
                <td><strong>Environment Name:</strong></td>
                <td>${personalInfo.environmentUniqueName}</td>
              </tr>
              <tr>
                <td><strong>Environment Type:</strong></td>
                <td>${personalInfo.environmentType}</td>
              </tr>
              <tr>
                <td><strong>Environment Size:</strong></td>
                <td>${personalInfo.environmentSize}</td>
              </tr>
              <tr>
                <td><strong>Environment Importance:</strong></td>
                <td>${personalInfo.environmentImportance}</td>
              </tr>
              <tr>
                <td><strong>Environment Maturity:</strong></td>
                <td>${personalInfo.environmentMaturity}</td>
              </tr>
              <tr>
                <td><strong>Market Sector:</strong></td>
                <td>${personalInfo.marketSector}</td>
              </tr>
              <tr>
                <td><strong>Country:</strong></td>
                <td>${personalInfo.country}</td>
              </tr>
              <tr>
                <td><strong>Email:</strong></td>
                <td>${personalInfo.email}</td>
              </tr>
            </table>
          </div>
          <div class="section">
            <h2 class="score">Assessment Score: ${score}%</h2>
          </div>
          <div class="section">
            <table>
              <tr>
                <th>Question</th>
                <th>Answer</th>
              </tr>
              ${Object.entries(answers).map(([questionId, answerValue]) => {
                const question = currentQuestions.find((q) => q.id === questionId);
                const answer = question?.options.find((opt) => opt.value === answerValue);
                return `
                  <tr>
                    <td>${question?.text || 'Unknown question'}</td>
                    <td>${answer?.label || 'Unknown answer'}</td>
                  </tr>
                `;
              }).join('')}
            </table>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    console.log("Attempting to send internal email...");
    console.log("SMTP Config:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: process.env.SMTP_USER ? "***" : "NOT SET",
      from: process.env.FROM_EMAIL
    });
    
    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP not configured, skipping email sending");
      return res.status(200).json({ 
        message: 'Assessment stored successfully (email skipped - SMTP not configured)',
        skipped: true
      });
    }
    
    // Note: Assessment data is already stored via /api/store-assessment endpoint
    // This endpoint only handles email notifications
    
    // Send internal notification email
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
      subject: `New Mazars Cybersecurity Assessment - ${personalInfo.environmentUniqueName}`,
      html: internalEmailContent,
    })

    console.log("Internal email sent successfully");
    res.status(200).json({ message: 'Assessment results sent successfully' })
  } catch (error) {
    console.error('Error sending email:', error)
    res.status(500).json({ 
      message: 'Failed to send assessment results',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
}

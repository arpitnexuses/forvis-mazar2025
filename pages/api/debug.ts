import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[DEBUG] ${req.method} request received`);
  console.log(`[DEBUG] URL: ${req.url}`);
  console.log(`[DEBUG] Headers:`, req.headers);
  console.log(`[DEBUG] Body:`, req.body);
  console.log(`[DEBUG] Query:`, req.query);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('[DEBUG] Handling OPTIONS request');
    return res.status(200).end();
  }

  // Allow all methods for debugging
  try {
    const response = {
      message: 'Debug API is working',
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      query: req.query,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      mongodbConfigured: !!process.env.MONGODB_URI,
      nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nextAuthUrl: process.env.NEXTAUTH_URL
    };

    console.log('[DEBUG] Sending response:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('[DEBUG] Error:', error);
    res.status(500).json({ 
      message: 'Debug API error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
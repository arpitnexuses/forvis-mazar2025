import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { getMongoClient, COLLECTIONS } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const client = await getMongoClient();
    const adminUsers = client.db().collection(COLLECTIONS.ADMIN_USERS);

    // Check if admin user already exists
    const existingUser = await adminUsers.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const result = await adminUsers.insertOne({
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
    });

    return res.status(201).json({
      message: 'Admin user created successfully',
      userId: result.insertedId,
    });
  } catch (error) {
    console.error('Error in admin signup:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 
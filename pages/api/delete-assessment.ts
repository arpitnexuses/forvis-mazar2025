import type { NextApiRequest, NextApiResponse } from 'next';
import { getMongoClient, COLLECTIONS } from '@/lib/mongodb';
import { ObjectId, MongoClient } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let client: MongoClient | null = null;

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Assessment ID is required' });
    }

    console.log('Connecting to MongoDB for delete-assessment...');
    client = await getMongoClient();
    const db = client.db();
    const collection = db.collection(COLLECTIONS.ASSESSMENTS);

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid assessment ID format' });
    }

    console.log(`Attempting to delete assessment with ID: ${id}`);

    // Delete the assessment
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    console.log(`Successfully deleted assessment with ID: ${id}`);

    res.status(200).json({ 
      message: 'Assessment deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    res.status(500).json({ 
      message: 'Error deleting assessment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    // Ensure connection is properly closed in production
    if (client && process.env.NODE_ENV === 'production') {
      try {
        await client.close();
        console.log('MongoDB connection closed in delete-assessment');
      } catch (closeError) {
        console.error('Error closing MongoDB connection in delete-assessment:', closeError);
      }
    }
  }
} 
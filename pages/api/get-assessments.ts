import type { NextApiRequest, NextApiResponse } from 'next';
import { getMongoClient, COLLECTIONS } from '@/lib/mongodb';
import { Filter, MongoClient, Document } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let client: MongoClient | null = null;

  try {
    const { limit = 10, skip = 0, email = '', environmentName = '', dateFrom = '', dateTo = '' } = req.query;

    console.log('Connecting to MongoDB for get-assessments...');
    client = await getMongoClient();
    const db = client.db();
    const collection = db.collection(COLLECTIONS.ASSESSMENTS);

    // Build query filters
    const query: Filter<Document> = {};
    if (email) {
      query['personalInfo.email'] = { $regex: email as string, $options: 'i' };
    }
    if (environmentName) {
      query['personalInfo.environmentUniqueName'] = { $regex: environmentName as string, $options: 'i' };
    }
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo as string);
      }
    }

    console.log('Executing MongoDB queries...');

    // Get total count for pagination
    const total = await collection.countDocuments(query);

    // Get assessments with pagination
    const assessments = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .toArray();

    console.log(`Retrieved ${assessments.length} assessments out of ${total} total`);

    // Convert Date objects to strings for frontend compatibility
    const processedAssessments = assessments.map((assessment: Document) => ({
      ...assessment,
      createdAt: assessment.createdAt ? new Date(assessment.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: assessment.updatedAt ? new Date(assessment.updatedAt).toISOString() : new Date().toISOString()
    }));

    // Calculate statistics
    const allScores = await collection.find({}).project({ score: 1 }).toArray();
    const scores = allScores.map((a: Document) => a.score as number);
    const statistics = {
      totalAssessments: total,
      averageScore: scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0,
      minScore: scores.length > 0 ? Math.min(...scores) : 0,
      maxScore: scores.length > 0 ? Math.max(...scores) : 0,
    };

    res.status(200).json({
      assessments: processedAssessments,
      pagination: {
        total,
        limit: Number(limit),
        skip: Number(skip),
        hasMore: total > (Number(skip) + Number(limit))
      },
      statistics
    });
  } catch (error) {
    console.error('Error retrieving assessments:', error);
    res.status(500).json({ 
      message: 'Error retrieving assessments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    // Ensure connection is properly closed in production
    if (client && process.env.NODE_ENV === 'production') {
      try {
        await client.close();
        console.log('MongoDB connection closed in get-assessments');
      } catch (closeError) {
        console.error('Error closing MongoDB connection in get-assessments:', closeError);
      }
    }
  }
} 
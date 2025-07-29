import type { NextApiRequest, NextApiResponse } from 'next';
import { getMongoClient } from '@/lib/mongodb';
import { MongoClient } from 'mongodb';

// Define the enhanced structure of the request body
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
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  let client: MongoClient | null = null;
  
  try {
    // Log environment check
    console.log('Checking environment variables...');
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set');
      console.error('📝 Please create a .env.local file with your MongoDB connection string');
      return res.status(500).json({ 
        message: 'Database configuration error',
        error: 'MONGODB_URI is not configured. Please check your environment variables.',
        details: 'Create a .env.local file with your MongoDB connection string'
      });
    }

    const { 
      personalInfo, 
      selectedCategories, 
      selectedAreas, 
      answers, 
      score, 
      totalQuestions, 
      completedQuestions, 
      assessmentMetadata, 
      questionDetails, 
      language = 'en' 
    } = req.body as AssessmentData;

    // Validate required fields
    if (!personalInfo?.email || !personalInfo?.environmentUniqueName) {
      throw new Error('Missing required fields: email or environmentUniqueName');
    }

    console.log('Attempting to connect to MongoDB...');
    // Get database connection with improved retry logic
    client = await getMongoClient();
    const db = client.db();
    const collection = db.collection('assessments');

    console.log('Preparing enhanced assessment data...');
    // Prepare the comprehensive assessment data for storage
    const assessmentRecord = {
      personalInfo,
      selectedCategories,
      selectedAreas,
      answers,
      score,
      totalQuestions,
      completedQuestions,
      assessmentMetadata,
      questionDetails,
      language,
      // Add detailed question and answer mapping with enhanced information
      detailedAnswers: questionDetails.map((questionDetail) => {
        const answerValue = answers[questionDetail.id];
        const answer = questionDetail.options.find((opt) => opt.value === answerValue);
        return {
          questionId: questionDetail.id,
          questionText: questionDetail.text,
          answerValue: answerValue || null,
          answerLabel: answer?.label || 'Not answered',
          category: questionDetail.category,
          area: questionDetail.area,
          topic: questionDetail.topic
        };
      }),
      // Add a unique submission identifier to prevent duplicates
      submissionId: `${personalInfo.email}-${personalInfo.environmentUniqueName}-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Inserting enhanced assessment into MongoDB...');
    
    // IMPROVED: Simplified duplicate detection - only check for exact duplicates
    const existingSubmission = await collection.findOne({
      'personalInfo.email': personalInfo.email,
      'personalInfo.environmentUniqueName': personalInfo.environmentUniqueName,
      'score': score,
      'totalQuestions': totalQuestions,
      'completedQuestions': completedQuestions
    });
    
    let result: any = null;
    
    if (existingSubmission) {
      console.log('Duplicate submission detected with identical data, skipping...');
      if (!res.writableEnded) {
        return res.status(200).json({ 
          message: 'Assessment already submitted for this environment with identical data',
          assessmentId: existingSubmission._id,
          data: {
            score,
            totalQuestions,
            completedQuestions,
            selectedCategories: selectedCategories.length,
            selectedAreas: selectedAreas.length
          }
        });
      }
    } else {
      // Insert new assessment with improved error handling
      try {
        result = await collection.insertOne(assessmentRecord);
        console.log('New assessment stored in MongoDB with ID:', result.insertedId);
      } catch (insertError) {
        console.error('Error inserting assessment:', insertError);
        
        // If it's a duplicate key error, try to find the existing record
        if (insertError instanceof Error && insertError.message.includes('duplicate key')) {
          const existingRecord = await collection.findOne({
            'personalInfo.email': personalInfo.email,
            'personalInfo.environmentUniqueName': personalInfo.environmentUniqueName
          });
          
          if (existingRecord) {
            console.log('Found existing record after duplicate key error');
            return res.status(200).json({ 
              message: 'Assessment already exists for this environment',
              assessmentId: existingRecord._id,
              data: {
                score: existingRecord.score,
                totalQuestions: existingRecord.totalQuestions,
                completedQuestions: existingRecord.completedQuestions,
                selectedCategories: existingRecord.selectedCategories?.length || 0,
                selectedAreas: existingRecord.selectedAreas?.length || 0
              }
            });
          }
        }
        
        throw insertError;
      }
    }

    const assessmentId = result?.insertedId;

    if (!res.writableEnded) {
      res.status(200).json({ 
        message: 'Assessment stored successfully',
        assessmentId,
        data: {
          score,
          totalQuestions,
          completedQuestions,
          selectedCategories: selectedCategories.length,
          selectedAreas: selectedAreas.length
        }
      });
    }

  } catch (error) {
    console.error('Detailed error in store-assessment:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      mongodbUri: process.env.MONGODB_URI ? 'Configured' : 'Missing',
      nodeEnv: process.env.NODE_ENV,
      requestBody: req.body ? 'Present' : 'Missing'
    });
    
    // Check if response has already been sent
    if (!res.writableEnded) {
      res.status(500).json({ 
        message: 'Failed to store assessment',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  } finally {
    // Ensure connection is properly closed in production
    if (client && process.env.NODE_ENV === 'production') {
      try {
        await client.close();
        console.log('MongoDB connection closed');
      } catch (closeError) {
        console.error('Error closing MongoDB connection:', closeError);
      }
    }
  }
} 
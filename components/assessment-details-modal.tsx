'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Assessment {
  _id: string;
  personalInfo: {
    name: string;
    email: string;
    environmentUniqueName: string;
    role: string;
    marketSector: string;
    country: string;
    date: string;
    environmentType: string;
    environmentSize: string;
    environmentImportance: string;
    environmentMaturity: string;
  };
  selectedCategories: string[];
  selectedAreas: string[];
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
  detailedAnswers: Array<{
    questionText: string;
    answerLabel: string;
    category: string;
    area: string;
    topic: string;
  }>;
  createdAt: string;
}

interface AssessmentDetailsModalProps {
  assessment: Assessment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AssessmentDetailsModal({ assessment, isOpen, onClose }: AssessmentDetailsModalProps) {
  if (!assessment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900">Assessment Details</DialogTitle>
          <p className="text-gray-600 mt-2">Complete assessment information and answers</p>
        </DialogHeader>

        <div className="space-y-8 pt-4">
          {/* Personal Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Name</p>
                <p className="font-semibold text-gray-900">{assessment.personalInfo.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Email</p>
                <p className="font-semibold text-gray-900">{assessment.personalInfo.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Role</p>
                <p className="font-semibold text-gray-900">{assessment.personalInfo.role}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Date</p>
                <p className="font-semibold text-gray-900">{new Date(assessment.personalInfo.date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Assessment Summary */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Assessment Summary
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Score</p>
                <p className={`font-bold text-2xl ${
                  assessment.score >= 85 ? 'text-green-600' :
                  assessment.score >= 65 ? 'text-yellow-600' :
                  assessment.score >= 35 ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {assessment.score}%
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Questions Completed</p>
                <p className="font-semibold text-gray-900">{assessment.completedQuestions}/{assessment.totalQuestions}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Categories Selected</p>
                <p className="font-semibold text-gray-900">{assessment.selectedCategories?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Areas Selected</p>
                <p className="font-semibold text-gray-900">{assessment.selectedAreas?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Assessment Duration</p>
                <p className="font-semibold text-gray-900">{Math.round(assessment.assessmentMetadata?.assessmentDuration / 1000 / 60)} minutes</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Language</p>
                <p className="font-semibold text-gray-900">{assessment.assessmentMetadata?.language?.toUpperCase() || 'EN'}</p>
              </div>
            </div>
          </div>

          {/* Environment Information */}
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-6 border border-purple-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Environment Information
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Environment Name</p>
                <p className="font-semibold text-gray-900">{assessment.personalInfo.environmentUniqueName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Market Sector</p>
                <p className="font-semibold text-gray-900">{assessment.personalInfo.marketSector}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Country</p>
                <p className="font-semibold text-gray-900">{assessment.personalInfo.country}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Environment Type</p>
                <p className="font-semibold text-gray-900">{assessment.personalInfo.environmentType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Environment Size</p>
                <p className="font-semibold text-gray-900">{assessment.personalInfo.environmentSize}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Environment Importance</p>
                <p className="font-semibold text-gray-900">{assessment.personalInfo.environmentImportance}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Environment Maturity</p>
                <p className="font-semibold text-gray-900">{assessment.personalInfo.environmentMaturity}</p>
              </div>
            </div>
          </div>

          {/* Assessment Answers */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-6 border border-orange-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Assessment Answers
            </h3>
            <div className="space-y-4">
              {assessment.detailedAnswers.map((answer, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="space-y-4">
                    {/* Question */}
                    <div className="border-b border-gray-100 pb-3">
                      <h4 className="font-semibold text-gray-900 text-lg mb-2">
                        Question {index + 1}
                      </h4>
                      <p className="text-gray-700 leading-relaxed">{answer.questionText}</p>
                    </div>
                    
                    {/* Answer */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-blue-700">Selected Answer</span>
                      </div>
                      <p className="text-blue-900 font-medium text-lg">{answer.answerLabel}</p>
                    </div>
                    
                    {/* Categories */}
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {answer.category}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {answer.area}
                      </span>
                      {answer.topic && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                          {answer.topic}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
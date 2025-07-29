'use client';

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Calendar, Globe, Eye, LogOut, Search, Filter, Download, RefreshCw, Trash2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { AssessmentDetailsModal } from './assessment-details-modal';

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

export function AdminDashboard() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAssessments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "10",
        skip: "0",
        _t: Date.now().toString(), // Cache busting parameter
      });

      console.log("🔍 Fetching assessments...");
      const response = await fetch(`/api/get-assessments?${params}`, {
        cache: 'no-cache', // Force fresh data
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      console.log("📡 Response status:", response.status);
      
      const data = await response.json();
      console.log("📊 API Response data:", data);
      console.log("📋 Assessments array:", data.assessments);
      console.log("📊 Number of assessments:", data.assessments?.length || 0);
      
      setAssessments(data.assessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleViewDetails = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setIsModalOpen(true);
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (!confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/delete-assessment?id=${assessmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the assessment from the local state
        setAssessments(prev => prev.filter(a => a._id !== assessmentId));
      } else {
        const errorData = await response.json();
        alert(`Error deleting assessment: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error deleting assessment:', error);
      alert('Error deleting assessment. Please try again.');
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/admin' });
  };

  // Calculate statistics
  const totalAssessments = assessments?.length || 0;
  const uniqueCountries = assessments ? new Set(assessments.map(a => a.personalInfo.country)).size : 0;
  const currentMonth = new Date().getMonth();
  const thisMonthAssessments = assessments ? assessments.filter(a => 
    new Date(a.personalInfo.date).getMonth() === currentMonth
  ).length : 0;
  
  // Check for potential duplicates
  const potentialDuplicates = assessments ? assessments.reduce((acc, assessment) => {
    const key = `${assessment.personalInfo.email}-${assessment.personalInfo.environmentUniqueName}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(assessment);
    return acc;
  }, {} as Record<string, Assessment[]>) : {};
  
  const duplicateCount = Object.values(potentialDuplicates).filter(group => group.length > 1).length;
  
  // Filter assessments based on search term
  const filteredAssessments = assessments?.filter(assessment => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      assessment.personalInfo.name.toLowerCase().includes(searchLower) ||
      assessment.personalInfo.email.toLowerCase().includes(searchLower) ||
      assessment.personalInfo.environmentUniqueName.toLowerCase().includes(searchLower) ||
      assessment.personalInfo.role.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Calculate average score
  const averageScore = assessments && assessments.length > 0 
    ? Math.round(assessments.reduce((sum, a) => sum + (a.score || 0), 0) / assessments.length)
    : 0;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Modern Header with requested color */}
        <div className="bg-[#3B3FA1] text-white shadow-lg">
          <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-blue-100 text-sm">Cybersecurity Assessment Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">Admin</p>
                <p className="text-blue-100 text-sm">admin@forvismazars.com</p>
              </div>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-white hover:bg-white/10 border border-white/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Duplicate Warning Banner */}
          {duplicateCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Duplicate Submissions Detected
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        {duplicateCount} user(s) have multiple submissions for the same environment. 
                        Duplicate entries are highlighted in yellow. The system now prevents new duplicates.
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchAssessments}
                  className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          )}
          
          {/* Modern Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Assessments</p>
                    <h3 className="text-3xl font-bold text-gray-900">{totalAssessments}</h3>
                    <p className="text-xs text-gray-500 mt-1">All time submissions</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Average Score</p>
                    <h3 className="text-3xl font-bold text-gray-900">{averageScore}%</h3>
                    <p className="text-xs text-gray-500 mt-1">Overall performance</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">This Month</p>
                    <h3 className="text-3xl font-bold text-gray-900">{thisMonthAssessments}</h3>
                    <p className="text-xs text-gray-500 mt-1">Current period</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-3 rounded-xl">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Countries</p>
                    <h3 className="text-3xl font-bold text-gray-900">{uniqueCountries}</h3>
                    <p className="text-xs text-gray-500 mt-1">Global reach</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Modern Search and Actions */}
          <div className="bg-white rounded-xl shadow-sm border-0 p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, environment name, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-[#3B3FA1] focus:ring-[#3B3FA1]"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="border-gray-200 hover:border-[#3B3FA1] hover:text-[#3B3FA1]"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button 
                  variant="outline" 
                  className="border-gray-200 hover:border-[#3B3FA1] hover:text-[#3B3FA1]"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button 
                  onClick={fetchAssessments}
                  disabled={isLoading}
                  className="bg-[#3B3FA1] hover:bg-[#2d3180] text-white"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh Data
                </Button>
              </div>
            </div>
          </div>

          {/* Modern Assessment List */}
          <div className="bg-white rounded-xl shadow-sm border-0 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Assessment Submissions</h2>
              <p className="text-gray-500 text-sm">View and manage all cybersecurity assessment submissions</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700 text-sm">Name</th>
                    <th className="text-left p-4 font-medium text-gray-700 text-sm">Environment</th>
                    <th className="text-left p-4 font-medium text-gray-700 text-sm">Score</th>
                    <th className="text-left p-4 font-medium text-gray-700 text-sm">Categories</th>
                    <th className="text-left p-4 font-medium text-gray-700 text-sm">Date</th>
                    <th className="text-left p-4 font-medium text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAssessments.map((assessment) => {
                    const key = `${assessment.personalInfo.email}-${assessment.personalInfo.environmentUniqueName}`;
                    const isDuplicate = potentialDuplicates[key] && potentialDuplicates[key].length > 1;
                    
                    return (
                      <tr key={assessment._id} className={`hover:bg-gray-50 transition-colors duration-150 ${isDuplicate ? 'bg-yellow-50' : ''}`}>
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900">{assessment.personalInfo.name}</div>
                          <div className="text-sm text-gray-500">{assessment.personalInfo.email}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900">{assessment.personalInfo.environmentUniqueName}</div>
                          <div className="text-sm text-gray-500">{assessment.personalInfo.marketSector}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className={`font-semibold text-lg ${
                            assessment.score >= 85 ? 'text-green-600' :
                            assessment.score >= 65 ? 'text-yellow-600' :
                            assessment.score >= 35 ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {assessment.score}%
                          </div>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                assessment.score >= 85 ? 'bg-green-500' :
                                assessment.score >= 65 ? 'bg-yellow-500' :
                                assessment.score >= 35 ? 'bg-orange-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${assessment.score}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {assessment.completedQuestions}/{assessment.totalQuestions} questions
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-900">
                          {assessment.selectedCategories?.slice(0, 2).join(', ')}
                          {assessment.selectedCategories?.length > 2 && '...'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {assessment.selectedAreas?.length} areas
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-900">
                          {new Date(assessment.personalInfo.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewDetails(assessment)}
                            className="text-[#3B3FA1] hover:bg-[#3B3FA1]/10"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteAssessment(assessment._id)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
              {(!assessments || assessments.length === 0) && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Users className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-gray-500">No assessments found</p>
                  <p className="text-sm text-gray-400">Assessments will appear here once submitted</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <AssessmentDetailsModal
        assessment={selectedAssessment}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAssessment(null);
        }}
      />
    </>
  );
} 
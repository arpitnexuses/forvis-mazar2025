import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, X, ChevronDown, ChevronUp, FileText, BarChart3, Users, Building, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '@/lib/questions';

interface AssessmentReportProps {
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
  questions: Question[];
  score: number;
  onClose: () => void;
}

interface ResponseTypeSummary {
  label: string;
  count: number;
  percentage: number;
}

interface CategoryBreakdown {
  category: string;
  categoryCode: string;
  breakdown: Record<string, number>;
}

interface QuestionAnswer {
  id: string;
  question: string;
  answer: string;
  category: string;
  area: string;
}

export function AssessmentReport({
  personalInfo,
  selectedCategories,
  selectedAreas,
  answers,
  questions,
  score,
  onClose
}: AssessmentReportProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personalInfo: true,
    summary: true,
    categoryBreakdown: false,
    detailedAnswers: false
  });

  // Calculate response type summary
  const responseTypes = [
    { value: "1", label: "In no case" },
    { value: "2", label: "In a few cases" },
    { value: "3", label: "About half cases" },
    { value: "4", label: "In most cases" },
    { value: "5", label: "In all cases" },
    { value: "6", label: "Don't know" },
    { value: "7", label: "Other" },
    { value: "8", label: "Not applicable" },
    { value: "9", label: "Not answered" },
  ];

  const totalAnswered = Object.keys(answers).length;
  const responseTypeSummary: ResponseTypeSummary[] = responseTypes.map(type => {
    const count = Object.values(answers).filter(answer => answer === type.value).length;
    const percentage = totalAnswered > 0 ? (count / totalAnswered) * 100 : 0;
    return {
      label: type.label,
      count,
      percentage
    };
  });

  // Calculate category breakdown
  const categoryBreakdown: CategoryBreakdown[] = selectedCategories.map(category => {
    const categoryQuestions = questions.filter(q => q.category === category);
    const breakdown: Record<string, number> = {};
    
    responseTypes.forEach(type => {
      const count = categoryQuestions.filter(q => 
        answers[q.id] === type.value
      ).length;
      breakdown[type.label] = count;
    });

    return {
      category,
      categoryCode: getCategoryCode(category),
      breakdown
    };
  });

  // Create detailed question-answer pairs
  const questionAnswers: QuestionAnswer[] = Object.entries(answers).map(([questionId, answerValue]) => {
    const question = questions.find(q => q.id === questionId);
    const answer = question?.options.find(opt => opt.value === answerValue);
    return {
      id: questionId,
      question: question?.text || 'Unknown question',
      answer: answer?.label || 'Unknown answer',
      category: question?.category || 'Unknown',
      area: question?.area || 'Unknown'
    };
  });

  function getCategoryCode(category: string): string {
    const codes: Record<string, string> = {
      "Security Governance": "SG",
      "Information Risk Assessment": "IR",
      "Security Management": "SM",
      "People Management": "PM",
      "Information Management": "IM",
      "Physical Asset Management": "PA",
      "System Development": "SD",
      "Business Application Management": "BA",
      "System Access": "SA",
      "System Management": "SY",
      "Networks and Communications": "NC",
      "Supply Chain Management": "SC",
      "Technical Security Management": "TS",
      "Threat and Incident Management": "TM",
      "Physical and Environmental Management": "PE",
      "Business Continuity": "BC",
      "Security Assurance": "SA"
    };
    return codes[category] || category.substring(0, 2).toUpperCase();
  }

  const maxPercentage = Math.max(...responseTypeSummary.map(r => r.percentage));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleDownload = () => {
    const assessmentData = {
      personalInfo,
      selectedCategories,
      selectedAreas,
      answers,
      questions,
      score,
      responseTypeSummary,
      categoryBreakdown,
      questionAnswers,
      totalAnswered,
      language: 'en',
    };
    
    fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assessmentData),
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comprehensive-cybersecurity-assessment-${personalInfo.name}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
    .catch(error => {
      console.error('Error downloading report:', error);
      alert('There was an issue downloading the report. Please try again.');
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#3B3FA1] text-white p-6 rounded-t-2xl sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Comprehensive Assessment Report</h2>
                  <p className="text-sm text-blue-100">Cybersecurity Self-Assessment Results</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleDownload}
                  className="bg-white text-[#3B3FA1] hover:bg-gray-100"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Personal Information Section */}
            <Card className="border border-gray-200">
              <CardHeader 
                className="bg-gray-50 rounded-t-lg cursor-pointer"
                onClick={() => toggleSection('personalInfo')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-[#3B3FA1]" />
                    <CardTitle className="text-lg text-[#3B3FA1]">Personal & Environment Information</CardTitle>
                  </div>
                  {expandedSections.personalInfo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </CardHeader>
              <AnimatePresence>
                {expandedSections.personalInfo && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                                  <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <div className="w-[70%]">
                              <label className="text-sm font-medium text-gray-600">Name:</label>
                              <div className="mt-1 p-2 bg-gray-50 rounded border text-gray-800">
                                {personalInfo.name}
                              </div>
                            </div>
                            <div className="w-[30%]">
                              <label className="text-sm font-medium text-gray-600">Date:</label>
                              <div className="mt-1 p-2 bg-gray-50 rounded border text-gray-800">
                                {personalInfo.date.split('-').reverse().join('-')}
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Name of environment:</label>
                            <div className="mt-1 p-2 bg-gray-50 rounded border text-gray-800">
                              {personalInfo.environmentUniqueName}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Questions answered:</label>
                            <div className="mt-1 p-2 bg-gray-50 rounded border text-gray-800">
                              {totalAnswered} / 149
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Overall score:</label>
                            <div className="mt-1 p-2 bg-gray-50 rounded border text-gray-800">
                              {score}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Assessment Summary Section */}
            <Card className="border border-gray-200">
              <CardHeader 
                className="bg-gray-50 rounded-t-lg cursor-pointer"
                onClick={() => toggleSection('summary')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-[#3B3FA1]" />
                    <CardTitle className="text-lg text-[#3B3FA1]">Assessment Summary</CardTitle>
                  </div>
                  {expandedSections.summary ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </CardHeader>
              <AnimatePresence>
                {expandedSections.summary && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-3xl font-bold text-[#3B3FA1]">{score}%</div>
                          <div className="text-sm text-gray-600">Overall Score</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-3xl font-bold text-green-600">{totalAnswered}</div>
                          <div className="text-sm text-gray-600">Questions Answered</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-3xl font-bold text-purple-600">{selectedCategories.length}</div>
                          <div className="text-sm text-gray-600">Categories Assessed</div>
                        </div>
                      </div>

                      {/* Response Type Summary */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800">Response Type Distribution</h4>
                        <div className="space-y-3">
                          {responseTypeSummary.map((response, index) => (
                            <div key={index} className="flex items-center space-x-4">
                              <div className="w-40 text-sm text-gray-600">
                                {response.label}
                              </div>
                              <div className="flex-1">
                                <div className="relative h-6 bg-gray-200 rounded">
                                  <motion.div
                                    className="absolute top-0 left-0 h-full bg-[#3B3FA1] rounded"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(response.percentage / maxPercentage) * 100}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                  />
                                </div>
                              </div>
                              <div className="w-20 text-sm text-gray-600 text-right">
                                {response.count} ({response.percentage.toFixed(1)}%)
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Category Breakdown Section */}
            <Card className="border border-gray-200">
              <CardHeader 
                className="bg-gray-50 rounded-t-lg cursor-pointer"
                onClick={() => toggleSection('categoryBreakdown')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building className="w-5 h-5 text-[#3B3FA1]" />
                    <CardTitle className="text-lg text-[#3B3FA1]">Category Breakdown</CardTitle>
                  </div>
                  {expandedSections.categoryBreakdown ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </CardHeader>
              <AnimatePresence>
                {expandedSections.categoryBreakdown && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="p-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left p-3 bg-gray-50 font-medium text-gray-700">Category</th>
                              {responseTypes.map((type, index) => (
                                <th key={index} className="p-3 bg-gray-50 font-medium text-gray-700 text-center">
                                  {type.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {categoryBreakdown.map((category, index) => (
                              <tr key={index} className="border-b border-gray-100">
                                <td className="p-3 bg-[#3B3FA1]/10 font-medium text-gray-800">
                                  <div>
                                    <span className="font-bold">{category.categoryCode}</span>
                                    <span className="ml-2">{category.category}</span>
                                  </div>
                                </td>
                                {responseTypes.map((type, typeIndex) => {
                                  const count = category.breakdown[type.label] || 0;
                                  const totalCategoryQuestions = questions.filter(q => q.category === category.category).length;
                                  const percentage = totalCategoryQuestions > 0 ? (count / totalCategoryQuestions) * 100 : 0;
                                  const hasData = count > 0;
                                  
                                  return (
                                    <td key={typeIndex} className="p-3 text-center">
                                      {hasData ? (
                                        <div className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                                          percentage > 20 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                          {percentage.toFixed(0)}%
                                        </div>
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Detailed Answers Section */}
            <Card className="border border-gray-200">
              <CardHeader 
                className="bg-gray-50 rounded-t-lg cursor-pointer"
                onClick={() => toggleSection('detailedAnswers')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-[#3B3FA1]" />
                    <CardTitle className="text-lg text-[#3B3FA1]">Detailed Question & Answer Report</CardTitle>
                  </div>
                  {expandedSections.detailedAnswers ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </CardHeader>
              <AnimatePresence>
                {expandedSections.detailedAnswers && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {questionAnswers.map((qa, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800 mb-1">Question {index + 1}</h4>
                                <p className="text-gray-700 mb-3">{qa.question}</p>
                              </div>
                              <div className="ml-4">
                                <span className="inline-block px-2 py-1 bg-[#3B3FA1] text-white text-xs rounded">
                                  {qa.category}
                                </span>
                              </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              <span className="text-sm font-medium text-gray-600">Answer: </span>
                              <span className="text-gray-800">{qa.answer}</span>
                            </div>
                          </div>
                        ))}
            </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

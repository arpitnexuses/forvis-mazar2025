import type { NextApiRequest, NextApiResponse } from 'next';
import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer';

// Add language parameter to the request body type
interface RequestBody {
  personalInfo: PersonalInfo;
  score: number;
  answers: Record<string, string>;
  questions: Question[];
  selectedCategories: string[];
  selectedAreas: string[];
  responseTypeSummary: ResponseTypeSummary[];
  categoryBreakdown: CategoryBreakdown[];
  questionAnswers: QuestionAnswer[];
  totalAnswered: number;
  language: 'en' | 'fr';
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

// Add this interface at the top of the file
interface PersonalInfo {
  name: string;
  email: string;
  environmentUniqueName?: string;
  company?: string;
  position?: string;
}

// Add these types
type Question = {
  id: string;
  text: string;
  category: string;
  area: string;
  options: Array<{ value: string; label: string }>;
};

// Create styles for the PDF
const createStyles = () => StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 15,
    fontFamily: 'Helvetica',
    fontSize: 8,
  },
  // Header styles
  header: {
    backgroundColor: '#3B3FA1',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 45,
    height: 30,
    marginRight: 10,
  },
  headerText: {
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 3,
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#E0E7FF',
  },
  // Card styles
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#ffffff',
  },
  cardHeader: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3B3FA1',
  },
  cardContent: {
    padding: 15,
  },
  // Grid styles
  grid: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  gridCol: {
    flex: 1,
    marginHorizontal: 6,
  },
  metricBox: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B3FA1',
    marginBottom: 3,
  },
  metricLabel: {
    fontSize: 8,
    color: '#6B7280',
  },
  // Progress bar styles
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  progressLabel: {
    width: 120,
    fontSize: 8,
    color: '#6B7280',
    flexShrink: 0,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginHorizontal: 10,
    minWidth: 100,
  },
  progressFill: {
    height: 12,
    backgroundColor: '#3B3FA1',
    borderRadius: 6,
  },
  progressText: {
    width: 70,
    fontSize: 8,
    color: '#6B7280',
    textAlign: 'right',
    flexShrink: 0,
  },
  // Table styles
  table: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
  },
  tableHeader: {
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableCell: {
    padding: 8,
    fontSize: 7,
    flex: 1,
  },
  tableCellHeader: {
    fontWeight: 'bold',
    color: '#374151',
  },
  tableCellCategory: {
    backgroundColor: '#E0E7FF',
    fontWeight: 'bold',
    color: '#374151',
    padding: 8,
  },
  categoryCode: {
    fontWeight: 'bold',
    fontSize: 9,
    color: '#000000',
  },
  categoryName: {
    fontSize: 7,
    color: '#374151',
    marginTop: 2,
    lineHeight: 1.2,
  },
  percentageBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  percentageBadgeHigh: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
  },
  percentageBadgeLow: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
  },
  // Q&A styles
  qaItem: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  qaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  qaQuestion: {
    flex: 1,
    fontSize: 10,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 1.4,
  },
  qaCategory: {
    backgroundColor: '#3B3FA1',
    color: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 8,
    marginLeft: 10,
  },
  qaAnswer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 6,
    fontSize: 10,
    color: '#374151',
    marginTop: 8,
  },
  // Text styles
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  label: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 5,
  },
  value: {
    fontSize: 8,
    color: '#374151',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
        const {
      personalInfo,
      score, 
      answers, 
      questions,
      selectedCategories,
      responseTypeSummary,
      categoryBreakdown,
      questionAnswers,
      totalAnswered
    } = req.body as RequestBody;

    // Validate required fields
    if (!personalInfo || !personalInfo.name || !personalInfo.email) {
      return res.status(400).json({ message: 'Missing required personal information (name and email)' });
    }

    if (score === undefined || score === null) {
      return res.status(400).json({ message: 'Score is required' });
    }

    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({ message: 'Answers are required' });
    }

    if (!responseTypeSummary || !Array.isArray(responseTypeSummary)) {
      return res.status(400).json({ message: 'Response type summary is required' });
    }

    if (!categoryBreakdown || !Array.isArray(categoryBreakdown)) {
      return res.status(400).json({ message: 'Category breakdown is required' });
    }

    if (!questionAnswers || !Array.isArray(questionAnswers)) {
      return res.status(400).json({ message: 'Question answers are required' });
    }

    // Use the language parameter to get the correct translations
    const styles = createStyles();

    // Create the PDF document using React.createElement
    const createDocument = () => {
      // Create header section
      const headerSection = React.createElement(View, { style: styles.header },
        React.createElement(View, { style: styles.headerContent },
          React.createElement(View, { style: styles.headerLeft },
            React.createElement(Image, {
              style: styles.logo,
              src: "https://22527425.fs1.hubspotusercontent-na1.net/hubfs/22527425/Group%20427319510-1.png"
            }),
            React.createElement(View, { style: styles.headerText },
              React.createElement(Text, { style: styles.headerTitle }, "Comprehensive Assessment Report"),
              React.createElement(Text, { style: styles.headerSubtitle }, "Cybersecurity Self-Assessment Results")
            )
          )
        )
      );

      // Create personal information card
      const personalInfoCard = React.createElement(View, { style: styles.card },
        React.createElement(View, { style: styles.cardHeader },
          React.createElement(Text, { style: styles.cardTitle }, "Personal & Environment Information")
        ),
        React.createElement(View, { style: styles.cardContent },
          React.createElement(View, { style: styles.grid },
            React.createElement(View, { style: styles.gridCol },
              React.createElement(Text, { style: styles.label }, "Name:"),
              React.createElement(Text, { style: styles.value }, personalInfo.name),
              React.createElement(Text, { style: { ...styles.label, marginTop: 10 } }, "Environment Name:"),
              React.createElement(Text, { style: styles.value }, personalInfo.environmentUniqueName || 'N/A')
            ),
            React.createElement(View, { style: styles.gridCol },
              React.createElement(Text, { style: styles.label }, "Date:"),
              React.createElement(Text, { style: styles.value }, new Date().toLocaleDateString()),
              React.createElement(Text, { style: { ...styles.label, marginTop: 10 } }, "Questions Answered:"),
              React.createElement(Text, { style: styles.value }, `${totalAnswered} / 149`)
            )
          )
        )
      );

      // Create assessment summary card
      const assessmentSummaryCard = React.createElement(View, { style: styles.card },
        React.createElement(View, { style: styles.cardHeader },
          React.createElement(Text, { style: styles.cardTitle }, "Assessment Summary")
        ),
        React.createElement(View, { style: [styles.cardContent, { width: '100%' }] },
          // Metrics grid
          React.createElement(View, { style: styles.grid },
            React.createElement(View, { style: styles.gridCol },
              React.createElement(View, { style: styles.metricBox },
                React.createElement(Text, { style: styles.metricValue }, `${score}%`),
                React.createElement(Text, { style: styles.metricLabel }, "Overall Score")
              )
            ),
            React.createElement(View, { style: styles.gridCol },
              React.createElement(View, { style: styles.metricBox },
                React.createElement(Text, { style: styles.metricValue }, totalAnswered.toString()),
                React.createElement(Text, { style: styles.metricLabel }, "Questions Answered")
              )
            ),
            React.createElement(View, { style: styles.gridCol },
              React.createElement(View, { style: styles.metricBox },
                React.createElement(Text, { style: styles.metricValue }, selectedCategories.length.toString()),
                React.createElement(Text, { style: styles.metricLabel }, "Categories Assessed")
              )
            )
          ),
          // Response type distribution
          React.createElement(Text, { style: styles.sectionTitle }, "Response Type Distribution"),
          React.createElement(View, { style: { marginBottom: 8 } }),
          React.createElement(View, { style: { width: '100%', paddingHorizontal: 5 } },
            ...responseTypeSummary.map((response, index) => {
              const maxPercentage = Math.max(...responseTypeSummary.map(r => r.percentage));
              const progressWidth = maxPercentage > 0 ? (response.percentage / maxPercentage) * 100 : 0;
              const displayWidth = Math.max(progressWidth, 3); // Minimum 3% width for visibility
              return React.createElement(View, { key: index, style: styles.progressContainer },
                React.createElement(Text, { style: styles.progressLabel }, response.label),
                React.createElement(View, { style: styles.progressBar },
                  React.createElement(View, { 
                    style: [styles.progressFill, { width: `${displayWidth}%` }] 
                  })
                ),
                React.createElement(Text, { style: styles.progressText }, `${response.count} (${response.percentage.toFixed(1)}%)`)
              );
            })
          )
        )
      );

      // Create category breakdown card
      const categoryBreakdownCard = React.createElement(View, { style: styles.card },
        React.createElement(View, { style: styles.cardHeader },
          React.createElement(Text, { style: styles.cardTitle }, "Category Breakdown")
        ),
        React.createElement(View, { style: styles.cardContent },
          React.createElement(View, { style: styles.table },
            // Table header
            React.createElement(View, { style: styles.tableHeader },
              React.createElement(Text, { style: [styles.tableCell, styles.tableCellHeader] }, "Category"),
              ...responseTypeSummary.map((type, index) =>
                React.createElement(Text, { key: index, style: [styles.tableCell, styles.tableCellHeader] }, type.label)
              )
            ),
            // Table rows
            ...categoryBreakdown.map((category, index) =>
              React.createElement(View, { key: index, style: styles.tableRow },
                React.createElement(View, { style: [styles.tableCell, styles.tableCellCategory] },
                  React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 } },
                    React.createElement(Text, { style: styles.categoryCode }, category.categoryCode),
                    React.createElement(Text, { style: { marginLeft: 6, fontSize: 8, color: '#000000', fontWeight: 'bold' } }, category.category)
                  )
                ),
                ...responseTypeSummary.map((type, typeIndex) => {
                  const count = category.breakdown[type.label] || 0;
                  const totalCategoryQuestions = questions.filter(q => q.category === category.category).length;
                  const percentage = totalCategoryQuestions > 0 ? (count / totalCategoryQuestions) * 100 : 0;
                  const hasData = count > 0;
                  
                  if (hasData) {
                    const badgeStyle = percentage > 20 
                      ? [styles.percentageBadge, styles.percentageBadgeHigh]
                      : [styles.percentageBadge, styles.percentageBadgeLow];
                    
                    return React.createElement(View, { key: typeIndex, style: styles.tableCell },
                      React.createElement(Text, { style: badgeStyle }, `${percentage.toFixed(0)}%`)
                    );
                  } else {
                    return React.createElement(Text, { key: typeIndex, style: [styles.tableCell, { color: '#9CA3AF' }] }, '-');
                  }
                })
              )
            )
          )
        )
      );

      // Create detailed Q&A card
      const detailedAnswersCard = React.createElement(View, { style: styles.card },
        React.createElement(View, { style: styles.cardHeader },
          React.createElement(Text, { style: styles.cardTitle }, "Detailed Question & Answer Report")
        ),
        React.createElement(View, { style: styles.cardContent },
          ...questionAnswers.map((qa, index) =>
            React.createElement(View, { key: index, style: styles.qaItem },
              React.createElement(View, { style: styles.qaHeader },
                React.createElement(View, { style: { flex: 1, marginRight: 10 } },
                  React.createElement(Text, { style: styles.qaQuestion }, `Question ${index + 1}: ${qa.question}`)
                ),
                React.createElement(Text, { style: styles.qaCategory }, qa.category)
              ),
              React.createElement(View, { style: styles.qaAnswer },
                React.createElement(Text, { style: { fontSize: 10, fontWeight: 'bold', color: '#6B7280', marginBottom: 5 } }, "Answer: "),
                React.createElement(Text, { style: { fontSize: 10, color: '#374151', lineHeight: 1.4 } }, qa.answer)
              )
            )
          )
        )
      );

      return React.createElement(Document, {},
        React.createElement(Page, { size: "A4", style: styles.page },
          headerSection,
          personalInfoCard,
          assessmentSummaryCard,
          categoryBreakdownCard,
          detailedAnswersCard
        )
      );
    };

    // Generate PDF buffer
    const pdfBuffer = await pdf(createDocument()).toBuffer();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=comprehensive_cybersecurity_assessment_report.pdf');

    // Send the PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Provide more detailed error information
    if (error instanceof Error) {
      res.status(500).json({ 
        message: 'Error generating PDF', 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } else {
      res.status(500).json({ message: 'Unknown error generating PDF' });
    }
  }
}
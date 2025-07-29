"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import {
  ChevronLeft,
  Check,
  Mail,
  ChevronDown,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import ReactConfetti from "react-confetti";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
// import ReactSpeedometer, {
// } from "react-d3-speedometer";
// import styles from "@/styles/CybersecurityAssessmentForm.module.css";
import { translations } from '@/lib/translations';
import { questionsData, Question } from '@/lib/questions';
import { AssessmentReport } from './assessment-report';
import { CountryDropdown } from './ui/country-dropdown';
import { RoleDropdown } from './ui/role-dropdown';
import { EnvironmentDropdown } from './ui/environment-dropdown';
import { EnvironmentSizeDropdown } from './ui/environment-size-dropdown';
import { EnvironmentImportanceDropdown } from './ui/environment-importance-dropdown';
import { EnvironmentMaturityDropdown } from './ui/environment-maturity-dropdown';
import { MarketSectorDropdown } from './ui/market-sector-dropdown';

// Add this custom hook
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function updateSize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
}

type Language = 'en';

// Add this near the top of the file, before the component
// const BLOCKED_EMAIL_DOMAINS = [
//   "gmail.com",
//   "yahoo.com",
//   "hotmail.com",
//   "outlook.com",
//   "aol.com",
//   "icloud.com",
//   "mail.com",
// ];

export const getResultText = (score: number, language: Language = 'en') => {
  const t = translations[language].resultTexts;
  if (score >= 85) return t.advanced;
  if (score >= 65) return t.solid;
  if (score >= 35) return t.basic;
  return t.urgent;
};

// Define all categories with their areas
const CATEGORIES_WITH_AREAS: Record<string, string[]> = {
  "Security Governance": [
    "Security Governance Approach",
    "Security Governance Components"
  ],
  "Information Risk Assessment": [
    "Information Risk Assessment Framework",
    "Information Risk Assessment Process"
  ],
  "Security Management": [
    "Security Policy Management",
    "Information Security Management"
  ],
  "People Management": [
    "Human Resource Security",
    "Security Education, Training and Awareness"
  ],
  "Information Management": [
    "Information Protection",
    "Specialised Information Protection"
  ],
  "Physical Asset Management": [
    "Equipment Management",
    "Mobile Computing"
  ],
  "System Development": [
    "System Development Management",
    "System Development Lifecycle"
  ],
  "Business Application Management": [
    "Corporate Business Applications",
    "End User Developed Applications (EUDA)"
  ],
  "System Access": [
    "Access Management",
    "Customer Access"
  ],
  "System Management": [
    "System Configuration",
    "System Maintenance"
  ],
  "Networks and Communications": [
    "Network Management",
    "Electronic Communications"
  ],
  "Supply Chain Management": [
    "External Supplier Management",
    "Cloud Services"
  ],
  "Technical Security Management": [
    "Security Solutions",
    "Cryptography"
  ],
  "Threat and Incident Management": [
    "Cyber Security Resilience",
    "Security Incident Management"
  ],
  "Physical and Environmental Management": [
    "Physical Security",
    "Local Environments"
  ],
  "Business Continuity": [
    "Business Continuity Framework",
    "Business Continuity Process"
  ],
  "Security Assurance": [
    "Security Performance",
    "Security Audit"
  ]
};

const ALL_CATEGORIES = Object.keys(CATEGORIES_WITH_AREAS);

export function CybersecurityAssessmentForm() {
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    date: "",
    role: "",
    environmentType: "",
    environmentSize: "",
    environmentImportance: "",
    environmentMaturity: "",
    environmentUniqueName: "",
    marketSector: "",
    country: "",
    email: "",
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [currentLanguage] = useState<Language>('en');
  const [questions] = useState<Question[]>(questionsData[currentLanguage]);
  const [showReport, setShowReport] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRTL = false;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const t = translations[currentLanguage];

  // Click outside handler for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const formSchema = z.object({
    name: z.string().min(2, { message: "Please enter your name." }),
    date: z.string(), // Date is automatically set, no validation needed
    role: z.string().min(2, { message: "Please select your role or job title." }),
    environmentType: z.string().min(2, { message: "Please specify the type of environment." }),
    environmentSize: z.string().min(1, { message: "Please specify the size of the environment." }),
    environmentImportance: z.string().min(2, { message: "Please specify the importance of the environment." }),
    environmentMaturity: z.string().min(2, { message: "Please specify the maturity of the environment." }),
    environmentUniqueName: z.string().min(2, { message: "Please enter a unique name for this environment." }),
    marketSector: z.string().min(2, { message: "Please specify the market sector." }),
    country: z.string().min(2, { message: "Please select your country." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      date: new Date().toISOString().split('T')[0], // Set current date automatically
      role: "",
      environmentType: "",
      environmentSize: "",
      environmentImportance: "",
      environmentMaturity: "",
      environmentUniqueName: "",
      marketSector: "",
      country: "",
      email: "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit"
  });

  const handlePersonalInfoSubmit = (values: z.infer<typeof formSchema>) => {
    setPersonalInfo(values);
    setCurrentQuestion(1); // Move to category selection
  };

  const handleCategorySelection = () => {
    if (selectedAreas.length === 0) {
      setFormErrors(["Please select at least one area to continue."]);
      return;
    }
    setFormErrors([]);
    // Track assessment start time
    (window as typeof window & { assessmentStartTime?: number }).assessmentStartTime = Date.now();
    setCurrentQuestion(2); // Move to the first question
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        // Remove category and all its areas
        const areasToRemove = CATEGORIES_WITH_AREAS[category] || [];
        setSelectedAreas(prevAreas => 
          prevAreas.filter(area => !areasToRemove.includes(area))
        );
        setExpandedCategories(prev => prev.filter(c => c !== category));
        return prev.filter(c => c !== category);
      } else {
        // Add category and all its areas
        const areasToAdd = CATEGORIES_WITH_AREAS[category] || [];
        setSelectedAreas(prevAreas => [...prevAreas, ...areasToAdd]);
        setExpandedCategories(prev => [...prev, category]);
        return [...prev, category];
      }
    });
  };

  const handleAreaToggle = (area: string) => {
    setSelectedAreas(prev => {
      if (prev.includes(area)) {
        return prev.filter(a => a !== area);
      } else {
        return [...prev, area];
      }
    });
  };

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const getQuestionsForSelectedAreas = () => {
    return questions.filter(question => selectedAreas.includes(question.area));
  };

  const getQuestionCountForCategory = (category: string) => {
    const areas = CATEGORIES_WITH_AREAS[category] || [];
    return questions.filter(question => areas.includes(question.area)).length;
  };

  const getQuestionCountForArea = (area: string) => {
    return questions.filter(question => question.area === area).length;
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [questionId]: value }));
    
    // Get filtered questions based on selected areas
    const filteredQuestions = getQuestionsForSelectedAreas();
    const currentQuestionIndex = filteredQuestions.findIndex(q => q.id === questionId);
    
    // Automatically move to next question after a short delay
    setTimeout(() => {
      // Ensure we're checking the correct condition for the last question
      const isLastQuestion = currentQuestionIndex === filteredQuestions.length - 1;
      
      if (!isLastQuestion) {
        setFormErrors([]);
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // If this is the last question, calculate score
        // Only call calculateScore if not already submitting
        if (!isSubmitting) {
          calculateScore();
        }
      }
    }, 300); // 300ms delay for better UX
  };

  // const handleNext = () => {
  //   if (currentQuestion === 0) {
  //     form.handleSubmit(handlePersonalInfoSubmit)();
  //   } else if (currentQuestion < questions.length) {
  //     // Since we're auto-advancing, we don't need to check for answers here
  //     // The validation is handled in handleAnswerChange
  //     setFormErrors([]);
  //     setCurrentQuestion(currentQuestion + 1);
  //   } else {
  //     calculateScore();
  //   }
  // };

  const calculateScore = async () => {
    // Prevent duplicate submissions
    if (isSubmitting) {
      console.log("Assessment submission already in progress, skipping...");
      return;
    }

    setIsSubmitting(true);

    try {
      const totalAnswered = Object.keys(answers).length;
      const totalPossibleScore = totalAnswered * 5; // Assuming 5 is the highest score
      const totalScore = Object.values(answers).reduce(
        (sum, value) => sum + parseInt(value),
        0
      );
      const percentageScore = totalPossibleScore > 0 ? Math.round((totalScore / totalPossibleScore) * 100) : 0;
      setScore(percentageScore);

      // Animate the score
      const animationDuration = 1000; // 1 second
      const frameDuration = 1000 / 60; // 60 fps
      const totalFrames = Math.round(animationDuration / frameDuration);
      let frame = 0;
      const animate = () => {
        if (frame < totalFrames) {
          frame++;
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

      // Prepare the data to be sent via API
      const assessmentData = {
        personalInfo,
        selectedCategories,
        selectedAreas,
        answers,
        score: percentageScore,
        totalQuestions: filteredQuestions.length,
        completedQuestions: Object.keys(answers).length,
        assessmentMetadata: {
          language: currentLanguage,
          assessmentDate: new Date().toISOString(),
          assessmentDuration: Date.now() - ((window as typeof window & { assessmentStartTime?: number }).assessmentStartTime || 0),
          userAgent: navigator.userAgent,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
        },
        questionDetails: filteredQuestions.map(question => ({
          id: question.id,
          text: question.text,
          category: question.category,
          area: question.area,
          topic: question.topic,
          options: question.options,
          selectedAnswer: answers[question.id] || null,
        })),
      };

      console.log("Sending assessment data:", assessmentData);
      
      // Store assessment data in MongoDB with improved retry logic
      let storeResponse;
      let storeResult;
      let retryCount = 0;
      const maxRetries = 5; // Increased from 3 to 5
      
      while (retryCount < maxRetries) {
        try {
          console.log(`Attempting to store assessment (attempt ${retryCount + 1}/${maxRetries})...`);
          
          storeResponse = await fetch("/api/store-assessment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(assessmentData),
          });

          // Read the response body only once
          const responseData = await storeResponse.json();

          if (storeResponse.ok) {
            console.log("Assessment stored successfully on attempt", retryCount + 1);
            storeResult = responseData;
            break; // Success, exit retry loop
          }

          console.error(`Store assessment error (attempt ${retryCount + 1}):`, responseData);
          
          // If it's a duplicate submission or already exists, don't retry
          if (responseData.message && (
            responseData.message.includes('already submitted') || 
            responseData.message.includes('already exists')
          )) {
            console.log("Duplicate submission detected, not retrying");
            storeResult = responseData;
            break;
          }
          
          retryCount++;
          if (retryCount < maxRetries) {
            const delay = Math.min(2000 * Math.pow(2, retryCount - 1), 10000); // Exponential backoff with max 10s
            console.log(`Retrying store assessment in ${delay}ms... (${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } catch (fetchError) {
          console.error(`Fetch error (attempt ${retryCount + 1}):`, fetchError);
          retryCount++;
          if (retryCount < maxRetries) {
            const delay = Math.min(2000 * Math.pow(2, retryCount - 1), 10000);
            console.log(`Retrying store assessment in ${delay}ms... (${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      if (!storeResponse || !storeResponse.ok) {
        throw new Error(
          storeResult?.message || "Failed to store assessment data after multiple attempts"
        );
      }

      console.log("Assessment data stored successfully:", storeResult);

      // Send internal notification (non-blocking) with timeout
      fetch("/api/send-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assessmentData),
      })
      .then(response => {
        if (!response.ok) {
          console.warn("Internal email failed, but assessment was stored");
        } else {
          console.log("Internal email sent successfully");
        }
      })
      .catch(emailError => {
        console.warn("Internal email sending failed, but assessment data was stored:", emailError);
      });

      // Send user email notification (non-blocking) with timeout
      fetch("/api/send-user-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assessmentData),
      })
      .then(response => {
        if (!response.ok) {
          console.warn("User email failed, but assessment was stored");
        } else {
          console.log("User email sent successfully to:", personalInfo.email);
        }
      })
      .catch(emailError => {
        console.warn("User email sending failed, but assessment data was stored:", emailError);
      });

      // Set timeout for email operations to prevent hanging
      setTimeout(() => {
        console.log("Email operations timed out, but assessment was stored successfully");
      }, 30000); // 30 second timeout

    } catch (error) {
      console.error("Error processing assessment results:", error);
      // Show error to user with more specific message
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`There was an issue processing the assessment results: ${errorMessage}. Please try again or contact support.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // const getScoreColor = (score: number) => {
  //   if (score >= 85) return "text-green-500";
  //   if (score >= 65) return "text-yellow-500";
  //   if (score >= 35) return "text-orange-500";
  //   return "text-red-500";
  // };

  // Get filtered questions for the current flow
  const filteredQuestions = getQuestionsForSelectedAreas();
  const currentQuestionData = currentQuestion > 1 ? filteredQuestions[currentQuestion - 2] : null;

  return (
    <div className={`min-h-screen w-full py-4 sm:py-8 md:py-12 px-2 sm:px-4 md:px-6 lg:px-8 flex items-center justify-center ${isRTL ? 'rtl' : 'ltr'}`}>
      {showConfetti && <ReactConfetti width={width} height={height} />}
              <div className="w-full max-w-6xl -mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-2xl rounded-2xl overflow-hidden mb-4 sm:mb-8 border border-gray-100"
        >
          <div className="rounded-t-2xl">
            <Image
              src="https://cdn-nexlink.s3.us-east-2.amazonaws.com/Frame_46_(3)_e95f9944-bc4a-4dae-aefb-02c89335e8c3.png"
              alt="Cyber Self Assessment Tool Banner"
              width={1200}
              height={300}
              className="w-full h-auto"
            />

          </div>

          <div className="bg-white p-4 sm:p-6 md:p-8">
            <AnimatePresence mode="wait">
              {currentQuestion === 0 ? (
                <motion.div
                  key="personal-info"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="m-2 sm:m-4 md:m-8 border border-gray-200 shadow-lg bg-white">
                    <CardHeader className="bg-[#3B3FA1] text-white rounded-t-lg">
                      <CardTitle className="text-xl sm:text-2xl">
                        Organisational and Environmental Information
                      </CardTitle>
                      <CardDescription className="text-blue-100">
                        Please provide the following details:
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(handlePersonalInfoSubmit)}
                          className="space-y-6"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="flex gap-4">
                              <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem className="w-7/10">
                                    <FormLabel className="text-gray-700 font-semibold">
                                      Please enter your name:
                                    </FormLabel>
                                    <FormControl>
                                      <Input {...field} className="border-gray-300 focus:border-[#3B3FA1] focus:ring-[#3B3FA1]" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                  <FormItem className="w-3/10">
                                    <FormLabel className="text-gray-700 font-semibold">
                                      Date: (Auto-set)
                                    </FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        type="date" 
                                        readOnly
                                        className="border-gray-300 focus:border-[#3B3FA1] focus:ring-[#3B3FA1] bg-gray-50" 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                                                          <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700 font-semibold">
                                      Please select your role or job title:
                                    </FormLabel>
                                    <FormControl>
                                      <RoleDropdown
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Please select an option"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                                                          <FormField
                                control={form.control}
                                name="environmentType"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700 font-semibold">
                                      What type of environment are you assessing?
                                    </FormLabel>
                                    <FormControl>
                                      <EnvironmentDropdown
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Please select an option"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                                                          <FormField
                                control={form.control}
                                name="environmentSize"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700 font-semibold">
                                      What is the size of the environment covered by this questionnaire?
                                    </FormLabel>
                                    <FormControl>
                                      <EnvironmentSizeDropdown
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Please select an option"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                                                          <FormField
                                control={form.control}
                                name="environmentImportance"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700 font-semibold">
                                      What is the overall importance of the environment to the organisation?
                                    </FormLabel>
                                    <FormControl>
                                      <EnvironmentImportanceDropdown
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Please select an option"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                                                          <FormField
                                control={form.control}
                                name="environmentMaturity"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700 font-semibold">
                                      What is the overall maturity of the environment in relation to information security?
                                    </FormLabel>
                                    <FormControl>
                                      <EnvironmentMaturityDropdown
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Please select an option"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            <FormField
                              control={form.control}
                              name="environmentUniqueName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700 font-semibold">
                                    Please enter a unique name for this environment:
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field} className="border-gray-300 focus:border-[#3B3FA1] focus:ring-[#3B3FA1]" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="marketSector"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700 font-semibold">
                                    What market sector best applies to this environment?
                                  </FormLabel>
                                  <FormControl>
                                    <MarketSectorDropdown
                                      value={field.value}
                                      onChange={field.onChange}
                                      placeholder="Please select an option"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="country"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700 font-semibold">
                                    Please select your country:
                                  </FormLabel>
                                  <FormControl>
                                    <CountryDropdown
                                      value={field.value}
                                      onChange={field.onChange}
                                      placeholder="Select your country"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700 font-semibold">
                                    Please enter your email address:
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field} type="email" className="border-gray-300 focus:border-[#3B3FA1] focus:ring-[#3B3FA1]" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="flex justify-end pt-4">
                            <Button
                              type="submit"
                              className="bg-[#3B3FA1] hover:bg-[#2A2D8A] text-white px-8 py-3 rounded-lg font-semibold shadow-lg transform transition-all duration-200 hover:scale-105"
                            >
                              Start Assessment
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : currentQuestion === 1 ? (
                <motion.div
                  key="category-selection"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="m-2 sm:m-4 md:m-8 border border-gray-200 shadow-lg bg-white">
                    <CardHeader className="bg-[#3B3FA1] text-white rounded-t-lg">
                      <CardTitle className="text-xl sm:text-2xl">
                        Select Assessment Categories and Areas
                      </CardTitle>
                      <CardDescription className="text-blue-100">
                        Choose the categories and specific areas you want to assess. You can expand categories to see and select individual areas.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <p className="text-gray-700 mb-6">
                          Select the categories and areas you want to include in your assessment. Each area shows the number of questions it contains.
                        </p>
                        <div className="space-y-3">
                          {ALL_CATEGORIES.map((category) => {
                            const areas = CATEGORIES_WITH_AREAS[category] || [];
                            const isCategorySelected = selectedCategories.includes(category);
                            const categoryQuestionCount = getQuestionCountForCategory(category);
                            const isExpanded = expandedCategories.includes(category);
                            
                            return (
                              <div
                                key={category}
                                className={cn(
                                  "border-2 rounded-lg transition-all duration-200",
                                  isCategorySelected
                                    ? "border-[#3B3FA1] bg-[#3B3FA1]/5 shadow-md"
                                    : "border-gray-200 bg-white hover:border-gray-300"
                                )}
                              >
                                <div
                                  className="p-4 cursor-pointer"
                                  onClick={() => handleCategoryToggle(category)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3">
                                        <div className={cn(
                                          "w-6 h-6 border-2 rounded-full flex items-center justify-center",
                                          isCategorySelected
                                            ? "border-[#3B3FA1] bg-[#3B3FA1]"
                                            : "border-gray-300"
                                        )}>
                                          {isCategorySelected && (
                                            <Check className="w-4 h-4 text-white" />
                                          )}
                                        </div>
                                        <div>
                                          <h3 className="font-semibold text-gray-800">
                                            {category}
                                          </h3>
                                          <p className="text-sm text-gray-600">
                                            {categoryQuestionCount} question{categoryQuestionCount !== 1 ? 's' : ''} total
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleCategoryExpansion(category);
                                        }}
                                        className="p-1 hover:bg-gray-100 rounded"
                                      >
                                        {isExpanded ? (
                                          <ChevronUp className="w-4 h-4 text-gray-600" />
                                        ) : (
                                          <ChevronRight className="w-4 h-4 text-gray-600" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="border-t border-gray-200 bg-gray-50"
                                  >
                                    <div className="p-4 space-y-2">
                                      {areas.map((area: string) => {
                                        const areaQuestionCount = getQuestionCountForArea(area);
                                        const isAreaSelected = selectedAreas.includes(area);
                                        
                                        return (
                                          <div
                                            key={area}
                                            className={cn(
                                              "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200",
                                              isAreaSelected
                                                ? "bg-[#3B3FA1]/10 border border-[#3B3FA1]/30"
                                                : "bg-white border border-gray-200 hover:border-gray-300"
                                            )}
                                            onClick={() => handleAreaToggle(area)}
                                          >
                                            <div className="flex items-center gap-3">
                                              <div className={cn(
                                                "w-5 h-5 border-2 rounded-full flex items-center justify-center",
                                                isAreaSelected
                                                  ? "border-[#3B3FA1] bg-[#3B3FA1]"
                                                  : "border-gray-300"
                                              )}>
                                                {isAreaSelected && (
                                                  <Check className="w-3 h-3 text-white" />
                                                )}
                                              </div>
                                              <div>
                                                <h4 className="font-medium text-gray-800 text-sm">
                                                  {area}
                                                </h4>
                                                <p className="text-xs text-gray-600">
                                                  {areaQuestionCount} question{areaQuestionCount !== 1 ? 's' : ''}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {formErrors.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm mt-4"
                          >
                            {formErrors.map((error, index) => (
                              <p key={index}>{error}</p>
                            ))}
                          </motion.div>
                        )}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-semibold text-[#3B3FA1] bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                              Selected: {selectedAreas.length} area{selectedAreas.length !== 1 ? 's' : ''} 
                              ({filteredQuestions.length} available questions)
                            </div>
                            <div className="flex gap-3">
                              <Button
                                onClick={handleBack}
                                variant="outline"
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                              >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back
                              </Button>
                              <Button
                                onClick={handleCategorySelection}
                                className="bg-[#3B3FA1] hover:bg-[#2A2D8A] text-white px-6 py-2 rounded-lg font-semibold shadow-lg transform transition-all duration-200 hover:scale-105"
                              >
                                Start Assessment
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : score === null ? (
                <motion.div
                  key={`question-${currentQuestion}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="m-2 sm:m-4 md:m-8 border border-gray-200 shadow-lg bg-white">
                    <CardHeader className="bg-[#3B3FA1] text-white rounded-t-lg">
                      <CardTitle className="text-xl sm:text-2xl">
                        Question {currentQuestion - 1} of {filteredQuestions.length}
                      </CardTitle>
                      <div className="space-y-2">
                        <div className="text-sm text-blue-100">
                          <span className="font-semibold">Category:</span> {currentQuestionData?.category}
                        </div>
                        <div className="text-sm text-blue-100">
                          <span className="font-semibold">Area:</span> {currentQuestionData?.area}
                        </div>
                        <div className="text-sm text-blue-100">
                          <span className="font-semibold">Topic:</span> {currentQuestionData?.topic}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4 sm:space-y-6">
                        <p className="text-base sm:text-lg font-medium text-gray-800 leading-relaxed">
                          {currentQuestionData?.text}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                          {currentQuestionData?.options.map(
                            (option) => {
                              const id = `${currentQuestionData.id}-${option.value}`;
                              return (
                                <div
                                  key={option.value}
                                  className="flex items-center"
                                >
                                  <input
                                    type="radio"
                                    id={id}
                                    name={currentQuestionData.id}
                                    value={option.value}
                                    checked={
                                      answers[
                                        currentQuestionData.id
                                      ] === option.value
                                    }
                                    onChange={() =>
                                      handleAnswerChange(
                                        currentQuestionData.id,
                                        option.value,
                                      )
                                    }
                                    className="sr-only peer"
                                    required
                                  />
                                  <Label
                                    htmlFor={id}
                                    className={cn(
                                      "flex flex-1 items-center rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium shadow-sm hover:bg-gray-50 hover:border-[#3B3FA1] focus:outline-none cursor-pointer h-full transition-all duration-200",
                                      answers[
                                        currentQuestionData.id
                                      ] === option.value &&
                                        "border-[#3B3FA1] ring-2 ring-[#3B3FA1]/20 bg-[#3B3FA1]/5",
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded-full mr-3 flex items-center justify-center",
                                        answers[
                                          currentQuestionData.id
                                        ] === option.value &&
                                          "border-[#3B3FA1] bg-[#3B3FA1]",
                                      )}
                                    >
                                      <Check
                                        className={cn(
                                          "w-3 h-3 text-white",
                                          answers[
                                            currentQuestionData.id
                                          ] === option.value
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                    </div>
                                    <span className="flex-grow text-center text-gray-700">
                                      {option.label}
                                    </span>
                                  </Label>
                                </div>
                              );
                            },
                          )}
                        </div>
                        {formErrors.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm mt-2"
                          >
                            {formErrors.map((error, index) => (
                              <p key={index}>{error}</p>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between bg-gray-50 border-t border-gray-200">
                      <Button
                        onClick={handleBack}
                        disabled={currentQuestion === 2}
                        className="bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        {t.back}
                      </Button>
                      <div className="text-sm text-gray-600 italic">
                        Select an option to continue automatically
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="m-2 sm:m-4 md:m-8 border border-gray-200 shadow-lg bg-white">
                    <CardContent className="p-6">
                      {/* Thank You Message */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="text-center space-y-6"
                      >
                          <div className="flex justify-center">
                          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                            </div>
                          </div>
                          <div>
                          <h3 className="text-3xl font-bold text-gray-800 mb-4">
                              {t.thankYou.title}
                            </h3>
                          <p className="text-gray-600 text-lg leading-relaxed mb-4">
                              {t.thankYou.message}
                          </p>
                          <p className="text-gray-600 leading-relaxed mb-3">
                              {t.thankYou.followUp}
                          </p>
                          <p className="text-gray-600 leading-relaxed">
                              {t.thankYou.contact}
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                        className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:items-center mt-8"
                      >
                        <div className="relative inline-block text-left w-full sm:w-56" ref={dropdownRef}>
                          <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            type="button"
                            className="w-full flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg bg-[#3B3FA1] text-white hover:bg-[#2A2D8A] transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md"
                          >
                            <Mail className="w-5 h-5" />
                            <span className="text-sm font-semibold whitespace-nowrap">
                              {t.bookAppointment}
                            </span>
                            <ChevronDown className="w-5 h-5 ml-2" />
                          </button>
                          <AnimatePresence>
                            {isDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="origin-top-right absolute left-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
                              >
                                <div
                                  className="py-1"
                                  role="menu"
                                  aria-orientation="vertical"
                                >
                                  <a
                                    href="https://mail.google.com/mail/?view=cm&fs=1&to=shamil.k@forvismazars-sa.com&su=Cybersecurity Assessment Consultation"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    role="menuitem"
                                    onClick={() => setIsDropdownOpen(false)}
                                  >
                                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    <span className="font-medium">Gmail</span>
                                  </a>
                                  <a
                                    href="https://outlook.live.com/mail/0/deeplink/compose?to=shamil.k@forvismazars-sa.com&subject=Cybersecurity Assessment Consultation"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    role="menuitem"
                                    onClick={() => setIsDropdownOpen(false)}
                                  >
                                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                      <path fill="#0078D4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                    </svg>
                                    <span className="font-medium">Outlook</span>
                                  </a>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <div className="w-full sm:w-56">
                          <button
                            onClick={() => setShowReport(true)}
                            type="button"
                            className="w-full flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg bg-[#3B3FA1] text-white hover:bg-[#2A2D8A] transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                            <span className="text-sm font-semibold whitespace-nowrap">
                              {t.viewComprehensiveReport}
                            </span>
                          </button>
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {score === null && currentQuestion > 1 && (
              <motion.div
                className="px-2 sm:px-4 md:px-8 pb-4 sm:pb-6 md:pb-8 mt-4 sm:mt-6 md:mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-[#3B3FA1]"
                    style={{ width: `${((currentQuestion - 1) / filteredQuestions.length) * 100}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion - 1) / filteredQuestions.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center px-1">
                    {Array.from({ length: filteredQuestions.length }).map(
                      (_, index) => (
                        <motion.div
                          key={index}
                          className={`w-3 h-3 rounded-full ${
                            index <= currentQuestion - 2
                              ? "bg-white shadow-md"
                              : "bg-gray-300"
                          } ${index === currentQuestion - 2 ? "ring-2 ring-blue-500" : ""}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                        />
                      ),
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Assessment Report Modal */}
      {showReport && (
        <AssessmentReport
          personalInfo={personalInfo}
          selectedCategories={selectedCategories}
          selectedAreas={selectedAreas}
          answers={answers}
          questions={filteredQuestions}
          score={score || 0}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}

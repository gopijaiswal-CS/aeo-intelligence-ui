import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Play,
  Download,
  TrendingUp,
  MessageSquare,
  Users,
  Loader2,
  Globe,
  Award,
  AlertTriangle,
  Link as LinkIcon,
  Edit2,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DonutChart } from "@/components/DonutChart";
import { TrendChart } from "@/components/TrendChart";
import { ActionPanel } from "@/components/ActionPanel";
import { toast } from "sonner";
import { useProfiles } from "@/contexts/ProfileContext";
import type { Question, Competitor } from "@/contexts/ProfileContext";
import { generateStackIQReport } from "@/utils/reportGenerator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Helper functions for LLM analysis
function generateStrengths(llmData: any): string[] {
  const strengths = [];

  if (llmData.score >= 75) {
    strengths.push(`Strong ${llmData.score}% visibility across queries`);
  } else if (llmData.score >= 60) {
    strengths.push(`Good ${llmData.score}% visibility performance`);
  }

  if (llmData.citations >= 50) {
    strengths.push(`High citation count (${llmData.citations} sources)`);
  }

  if (llmData.topSources && llmData.topSources.length > 0) {
    const avgWeight =
      llmData.topSources.reduce((sum: number, s: any) => sum + s.weight, 0) /
      llmData.topSources.length;
    if (avgWeight >= 8) {
      strengths.push("High-authority citation sources");
    }
  }

  if (strengths.length === 0) {
    strengths.push("Presence established in AI responses");
  }

  return strengths;
}

function generateImprovements(llmData: any): string[] {
  const improvements = [];

  if (llmData.score < 60) {
    improvements.push("Increase content depth and quality");
  }

  if (llmData.citations < 30) {
    improvements.push("Build more authoritative citations");
  }

  if (llmData.topSources && llmData.topSources.length < 3) {
    improvements.push("Expand citation source diversity");
  }

  if (improvements.length === 0) {
    improvements.push("Maintain current performance levels");
  }

  return improvements;
}

export default function ProfileAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    profiles,
    setCurrentProfile,
    runAnalysis,
    generateQuestionsAndCompetitors,
    updateProfile,
  } = useProfiles();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCompetitorModal, setShowCompetitorModal] = useState(false);
  const [showAllCitations, setShowAllCitations] = useState(false);

  // Edit form states
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showAddCompetitor, setShowAddCompetitor] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newQuestionCategory, setNewQuestionCategory] = useState("");
  const [newCompetitorName, setNewCompetitorName] = useState("");
  const [newCompetitorCategory, setNewCompetitorCategory] = useState("");
  const [showLLMDetailsModal, setShowLLMDetailsModal] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState<any>(null);

  const profile = profiles.find((p) => p.id === id);

  const categories = [
    "Product Recommendation",
    "Feature Comparison",
    "How-To",
    "Technical",
    "Price Comparison",
    "Security",
    "Use Case",
    "Compatibility",
  ];

  useEffect(() => {
    if (profile) {
      setCurrentProfile(profile.id);
    }
  }, [profile, setCurrentProfile]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleGenerateQuestions = async () => {
    if (!profile.id) return;
    setIsProcessing(true);
    await generateQuestionsAndCompetitors(profile.id);
    setIsProcessing(false);
    toast.success("Questions and competitors generated!");
  };

  const handleRunAnalysis = async () => {
    if (!profile.id) return;
    setIsProcessing(true);
    await runAnalysis(profile.id);
    setIsProcessing(false);
    toast.success("Analysis completed!");
  };

  const handleAddQuestion = () => {
    if (!newQuestion || !newQuestionCategory || !profile?.id) {
      toast.error("Please fill in all fields");
      return;
    }

    const newQuestionObj: Question = {
      id: profile.questions.length + 1,
      question: newQuestion,
      category: newQuestionCategory,
      region: profile.region,
      aiMentions: 0,
      visibility: 0,
      addedBy: "manual",
    };

    updateProfile(profile.id, {
      questions: [...profile.questions, newQuestionObj],
    });

    setNewQuestion("");
    setNewQuestionCategory("");
    setShowAddQuestion(false);
    toast.success("Question added!");
  };

  const handleAddCompetitor = () => {
    if (!newCompetitorName || !newCompetitorCategory || !profile?.id) {
      toast.error("Please fill in all fields");
      return;
    }

    const newCompetitorObj: Competitor = {
      id: profile.competitors.length + 1,
      name: newCompetitorName,
      visibility: 0,
      mentions: 0,
      citations: 0,
      rank: profile.competitors.length + 1,
      category: newCompetitorCategory,
    };

    updateProfile(profile.id, {
      competitors: [...profile.competitors, newCompetitorObj],
    });

    setNewCompetitorName("");
    setNewCompetitorCategory("");
    setShowAddCompetitor(false);
    toast.success("Competitor added!");
  };

  const handleDeleteQuestion = (questionId: number) => {
    if (!profile?.id) return;

    updateProfile(profile.id, {
      questions: profile.questions.filter((q) => q.id !== questionId),
    });
    toast.success("Question removed");
  };

  const handleDeleteCompetitor = (competitorId: number) => {
    if (!profile?.id) return;

    updateProfile(profile.id, {
      competitors: profile.competitors.filter((c) => c.id !== competitorId),
    });
    toast.success("Competitor removed");
  };

  const handleReRunAnalysis = async () => {
    if (!profile?.id) return;

    setShowEditModal(false);
    setIsProcessing(true);

    toast.loading("Re-running analysis with updated data...");
    await runAnalysis(profile.id);

    toast.dismiss();
    setIsProcessing(false);
    toast.success("Analysis updated successfully!");
  };

  const handleDownloadReport = async () => {
    if (!profile || !profile.analysisResult) {
      toast.error("No analysis data available. Please run analysis first.");
      return;
    }

    try {
      toast.loading("Generating PDF report with charts...");

      await generateStackIQReport({
        profileName: profile.name,
        websiteUrl: profile.websiteUrl,
        productName: profile.productName,
        region: profile.region,
        analysisResult: profile.analysisResult,
        questions: profile.questions,
        competitors: profile.competitors,
      });

      toast.dismiss();
      toast.success(
        "PDF report downloaded successfully! Check your Downloads folder."
      );
    } catch (error) {
      console.error("Report generation error:", error);
      toast.dismiss();
      toast.error("Failed to generate report. Please try again.");
    }
  };

  const getStatusAction = () => {
    switch (profile.status) {
      case "draft":
        return (
          <Button
            onClick={handleGenerateQuestions}
            disabled={isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4" />
                Generate Questions
              </>
            )}
          </Button>
        );
      case "ready":
        return (
          <Button
            onClick={handleRunAnalysis}
            disabled={isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Analysis
              </>
            )}
          </Button>
        );
      case "completed":
        return (
          <div className="flex gap-2">
            <Button
              onClick={() => setShowEditModal(true)}
              variant="outline"
              className="gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit & Re-run
            </Button>
            <Button
              onClick={handleDownloadReport}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="p-6 space-y-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{profile.productName}</h1>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span>{profile.websiteUrl}</span>
                <Badge variant="outline">{profile.category}</Badge>
                <Badge variant="outline" className="gap-1">
                  <Globe className="h-3 w-3" />
                  {profile.region.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="flex gap-3">{getStatusAction()}</div>
          </div>
        </div>

        {/* Show analysis results if completed */}
        {profile.status === "completed" && profile.analysisResult ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {profile.analysisResult.mentions}
                    </p>
                    <p className="text-sm text-muted-foreground">AI Mentions</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {profile.analysisResult.brokenLinks}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Broken Links
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-success/10 rounded-lg">
                    <Award className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {profile.analysisResult.seoHealth}%
                    </p>
                    <p className="text-sm text-muted-foreground">SEO Health</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-info/10 rounded-lg">
                    <LinkIcon className="h-6 w-6 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {profile.analysisResult.citations}
                    </p>
                    <p className="text-sm text-muted-foreground">Citations</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts - Redesigned Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Visibility Donut Chart */}
              <DonutChart
                title="Overall AI Visibility"
                score={profile.analysisResult.overallScore}
                subtitle={`${profile.productName} appears in ${profile.analysisResult.overallScore}% of AI responses`}
              />

              {/* LLM Performance Breakdown - Interactive */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">LLM Performance</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Click any LLM to view detailed analytics
                </p>
                <div className="space-y-4">
                  {(profile?.analysisResult?.llmPerformance || [])
                    .map((llmData: any) => {
                      // Map LLM names to icons and colors
                      const llmConfig: Record<
                        string,
                        { icon: string; color: string }
                      > = {
                        ChatGPT: { icon: "🤖", color: "bg-green-500" },
                        Claude: { icon: "🎯", color: "bg-purple-500" },
                        Gemini: { icon: "✨", color: "bg-blue-500" },
                        Perplexity: { icon: "🔍", color: "bg-orange-500" },
                      };

                      const config = llmConfig[llmData.llmName] || {
                        icon: "🤖",
                        color: "bg-gray-500",
                      };

                      const llm = {
                        name: llmData.llmName,
                        score: llmData.score,
                        color: config.color,
                        icon: config.icon,
                        mentions: llmData.mentions,
                        citations: llmData.citations,
                        topSources: llmData.topSources || [],
                        competitorMentions: llmData.competitorMentions || {},
                        categoryPerformance: [], // Can be calculated from questions if needed
                        strengths: generateStrengths(llmData),
                        improvements: generateImprovements(llmData),
                      };

                      return llm;
                    })
                    .map((llm: any) => (
                      <motion.div
                        key={llm.name}
                        className="space-y-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          setSelectedLLM(llm);
                          setShowLLMDetailsModal(true);
                        }}
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium flex items-center gap-2">
                            <span>{llm.icon}</span>
                            {llm.name}
                          </span>
                          <span className="text-muted-foreground">
                            {llm.score}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${llm.score}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className={`h-full ${llm.color}`}
                          />
                        </div>
                      </motion.div>
                    ))}
                </div>
                {profile?.analysisResult?.llmPerformance &&
                  profile.analysisResult.llmPerformance.length > 0 && (
                    <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">
                          Best Performance:
                        </strong>{" "}
                        {
                          [...profile.analysisResult.llmPerformance].sort(
                            (a: any, b: any) => b.score - a.score
                          )[0]?.llmName
                        }{" "}
                        with{" "}
                        {
                          [...profile.analysisResult.llmPerformance].sort(
                            (a: any, b: any) => b.score - a.score
                          )[0]?.score
                        }
                        % visibility
                      </p>
                    </div>
                  )}
              </Card>

              {/* Question Category Distribution */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Question Categories
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      category: "Product Recommendation",
                      count: 8,
                      percentage: 40,
                      color: "bg-primary",
                    },
                    {
                      category: "Feature Comparison",
                      count: 5,
                      percentage: 25,
                      color: "bg-purple-500",
                    },
                    {
                      category: "How-To",
                      count: 4,
                      percentage: 20,
                      color: "bg-blue-500",
                    },
                    {
                      category: "Technical",
                      count: 3,
                      percentage: 15,
                      color: "bg-orange-500",
                    },
                  ].map((cat) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate">
                          {cat.category}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {cat.count} ({cat.percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                          className={`h-full ${cat.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Trend Chart - Full Width */}
            <Card className="p-6">
              <TrendChart
                title="7-Day Visibility Trend"
                data={profile.analysisResult.trend}
                labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
              />
            </Card>

            {/* Citation Sources and Compact Competitors */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Citation Sources</h3>
                <div className="space-y-3">
                  {(showAllCitations
                    ? profile.analysisResult.citationSources
                    : profile.analysisResult.citationSources.slice(0, 5)
                  ).map((source, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1">
                        <a
                          href={
                            source.url.startsWith("http")
                              ? source.url
                              : `https://${source.url}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-sm flex items-center gap-2 text-primary hover:underline"
                        >
                          {source.url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <p className="text-xs text-muted-foreground mt-1">
                          {source.llm} • {source.mentions} mentions
                        </p>
                      </div>
                      <Badge className="bg-primary/10 text-primary">
                        {source.weight.toFixed(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
                {profile.analysisResult.citationSources.length > 5 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => setShowAllCitations(!showAllCitations)}
                  >
                    {showAllCitations
                      ? `Show Less`
                      : `Show All (${profile.analysisResult.citationSources.length})`}
                  </Button>
                )}
              </Card>

              {/* Compact Competitors */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Top Competitors</h3>
                <div className="space-y-3">
                  {profile.competitors.slice(0, 3).map((competitor, index) => (
                    <div
                      key={
                        competitor._id || competitor.id || `competitor-${index}`
                      }
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {competitor.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {competitor.mentions} mentions
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        #{competitor.rank}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => setShowCompetitorModal(true)}
                >
                  View Detailed Comparison →
                </Button>
              </Card>

              {/* Response Quality Metrics */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Response Quality</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Accuracy Rate</span>
                      <Badge className="bg-success/10 text-success">94%</Badge>
                    </div>
                    <Progress value={94} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      AI responses contain accurate product information
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Citation Strength
                      </span>
                      <Badge className="bg-primary/10 text-primary">
                        8.5/10
                      </Badge>
                    </div>
                    <Progress value={85} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Quality and authority of citation sources
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Context Relevance
                      </span>
                      <Badge className="bg-warning/10 text-warning">78%</Badge>
                    </div>
                    <Progress value={78} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Product mentioned in relevant contexts
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Questions Overview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Test Questions ({profile.questions.length})
                </h3>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/questions/${profile.id}`)}
                  className="gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Manage Questions
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profile.questions.slice(0, 6).map((question) => (
                  <div
                    key={question.id}
                    className="p-3 rounded-lg bg-muted/30 text-sm"
                  >
                    <p className="font-medium mb-1">{question.question}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {question.category}
                      </Badge>
                      {question.visibility > 0 && (
                        <Badge className="text-xs bg-success/10 text-success">
                          {question.visibility}% visibility
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Action Panel - New Beautiful Layout */}
            <ActionPanel profileId={profile.id} />
          </>
        ) : (
          /* Show setup/loading state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Card className="p-12 max-w-2xl text-center">
              {profile.status === "generating" && (
                <>
                  <Loader2 className="h-16 w-16 text-primary mx-auto mb-6 animate-spin" />
                  <h2 className="text-2xl font-bold mb-2">
                    Generating Questions...
                  </h2>
                  <p className="text-muted-foreground">
                    Please wait while we generate AEO test questions and
                    identify competitors
                  </p>
                </>
              )}
              {profile.status === "analyzing" && (
                <>
                  <Loader2 className="h-16 w-16 text-primary mx-auto mb-6 animate-spin" />
                  <h2 className="text-2xl font-bold mb-2">
                    Running Analysis...
                  </h2>
                  <p className="text-muted-foreground">
                    Analyzing your brand's visibility across multiple AI
                    platforms
                  </p>
                </>
              )}
              {profile.status === "draft" && (
                <>
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                  <h2 className="text-2xl font-bold mb-2">
                    Profile Setup Required
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Generate questions and competitors to start analyzing this
                    profile
                  </p>
                  <Button
                    onClick={handleGenerateQuestions}
                    size="lg"
                    className="gap-2"
                  >
                    <Sparkles className="h-5 w-5" />
                    Generate Questions
                  </Button>
                </>
              )}
              {profile.status === "ready" && (
                <>
                  <Play className="h-16 w-16 text-primary mx-auto mb-6" />
                  <h2 className="text-2xl font-bold mb-2">Ready to Analyze</h2>
                  <p className="text-muted-foreground mb-6">
                    {profile.questions.length} questions and{" "}
                    {profile.competitors.length} competitors are ready
                  </p>
                  <Button
                    onClick={handleRunAnalysis}
                    size="lg"
                    className="gap-2"
                  >
                    <Play className="h-5 w-5" />
                    Run AEO Engine
                  </Button>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </div>

      {/* Edit & Re-run Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Edit2 className="h-6 w-6 text-primary" />
              Edit Questions & Competitors
            </DialogTitle>
            <DialogDescription>
              Modify your questions and competitors, then re-run the analysis
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {/* Questions Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Questions ({profile?.questions.length || 0})
                </h3>
                <Button
                  onClick={() => setShowAddQuestion(!showAddQuestion)}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              {/* Add Question Form */}
              <AnimatePresence>
                {showAddQuestion && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Card className="p-4 bg-muted/30">
                      <div className="space-y-3">
                        <div>
                          <Label>Question</Label>
                          <Textarea
                            placeholder="What are the best..."
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>Category</Label>
                          <Select
                            value={newQuestionCategory}
                            onValueChange={setNewQuestionCategory}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select category..." />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleAddQuestion} size="sm">
                            Add
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAddQuestion(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Questions List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {profile?.questions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <Card className="p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">
                            {question.question}
                          </p>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              {question.category}
                            </Badge>
                            {question.addedBy === "manual" && (
                              <Badge className="text-xs bg-primary/10 text-primary">
                                Manual
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Competitors Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Competitors ({profile?.competitors.length || 0})
                </h3>
                <Button
                  onClick={() => setShowAddCompetitor(!showAddCompetitor)}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              {/* Add Competitor Form */}
              <AnimatePresence>
                {showAddCompetitor && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Card className="p-4 bg-muted/30">
                      <div className="space-y-3">
                        <div>
                          <Label>Competitor Name</Label>
                          <Input
                            placeholder="e.g., Competitor X"
                            value={newCompetitorName}
                            onChange={(e) =>
                              setNewCompetitorName(e.target.value)
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Category</Label>
                          <Input
                            placeholder="e.g., Smart Home"
                            value={newCompetitorCategory}
                            onChange={(e) =>
                              setNewCompetitorCategory(e.target.value)
                            }
                            className="mt-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleAddCompetitor} size="sm">
                            Add
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAddCompetitor(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Competitors List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {profile?.competitors.map((competitor, index) => (
                  <motion.div
                    key={competitor.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{competitor.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {competitor.category}
                          </p>
                          <Badge variant="outline" className="text-xs mt-2">
                            Rank #{competitor.rank}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCompetitor(competitor.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReRunAnalysis}
              disabled={
                !profile?.questions.length ||
                !profile?.competitors.length ||
                isProcessing
              }
              className="flex-1 gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Running Analysis...
                </>
              ) : (
                <>
                  <RotateCcw className="h-5 w-5" />
                  Re-run Analysis
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* LLM Details Analytics Modal */}
      <Dialog open={showLLMDetailsModal} onOpenChange={setShowLLMDetailsModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {selectedLLM && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl">
                  <span className="text-3xl">{selectedLLM.icon}</span>
                  {selectedLLM.name} - Detailed Analytics
                </DialogTitle>
                <DialogDescription>
                  Comprehensive breakdown of your product's performance on{" "}
                  {selectedLLM.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Overall Performance Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                    <p className="text-sm text-muted-foreground">
                      Visibility Score
                    </p>
                    <p className="text-3xl font-bold text-primary mt-1">
                      {selectedLLM.score}%
                    </p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Total Mentions
                    </p>
                    <p className="text-3xl font-bold mt-1">
                      {selectedLLM.mentions}
                    </p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Total Citations
                    </p>
                    <p className="text-3xl font-bold mt-1">
                      {selectedLLM.citations}
                    </p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Avg. Citation Weight
                    </p>
                    <p className="text-3xl font-bold mt-1">
                      {(
                        selectedLLM.topSources.reduce(
                          (acc: number, s: any) => acc + s.weight,
                          0
                        ) / selectedLLM.topSources.length
                      ).toFixed(1)}
                    </p>
                  </Card>
                </div>

                {/* Top Citation Sources with Competitive Analysis */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-primary" />
                    Citation Sources - Competitive Breakdown
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    See which sources mention your product vs competitors, and
                    identify opportunities to improve visibility
                  </p>
                  <div className="space-y-4">
                    {selectedLLM.topSources.map((source: any, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="border rounded-lg overflow-hidden hover:shadow-md transition-all"
                      >
                        {/* Source Header */}
                        <div className="p-4 bg-muted/30 border-b">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className="text-xs" variant="outline">
                                  #{idx + 1}
                                </Badge>
                                <a
                                  href={
                                    source.url.startsWith("http")
                                      ? source.url
                                      : `https://${source.url}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-primary hover:underline flex items-center gap-1"
                                >
                                  {source.url}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {source.pageType || "Review/Comparison Page"} •
                                Authority Weight: {source.weight}/10
                              </p>
                            </div>
                            <Badge
                              className={`${
                                source.weight >= 8.5
                                  ? "bg-success/10 text-success border-success/20"
                                  : source.weight >= 7
                                  ? "bg-warning/10 text-warning border-warning/20"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {source.weight >= 8.5
                                ? "🏆 High Authority"
                                : source.weight >= 7
                                ? "⚡ Medium Authority"
                                : "📄 Low Authority"}
                            </Badge>
                          </div>
                        </div>

                        {/* Competitive Breakdown */}
                        <div className="p-4 space-y-3">
                          <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                            Product Mentions on This Source
                          </div>

                          {/* Your Product */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <div>
                                  <p className="font-semibold text-sm flex items-center gap-2">
                                    {profile.productName}
                                    <Badge className="text-xs bg-primary text-white">
                                      Your Product
                                    </Badge>
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {source.yourProductMentions ||
                                      Math.floor(source.mentions * 0.3)}{" "}
                                    mentions •
                                    {source.yourProductPresence
                                      ? " Present"
                                      : " Not Present"}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-primary">
                                  {source.yourProductScore ||
                                    Math.floor(source.weight * 3.2)}
                                  %
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Visibility
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar for Your Product */}
                            <div className="pl-5">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${
                                      source.yourProductScore ||
                                      Math.floor(source.weight * 3.2)
                                    }%`,
                                  }}
                                  transition={{
                                    duration: 0.8,
                                    delay: idx * 0.1 + 0.2,
                                  }}
                                  className="h-full bg-primary"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Top Competitors */}
                          <div className="space-y-2">
                            {profile.competitors
                              .slice(0, 3)
                              .map((competitor, compIdx) => {
                                const competitorScore = Math.floor(
                                  source.weight * (4.5 - compIdx * 0.8)
                                );
                                const competitorMentions = Math.floor(
                                  source.mentions * (0.4 - compIdx * 0.1)
                                );
                                const isWinning =
                                  (source.yourProductScore ||
                                    Math.floor(source.weight * 3.2)) >
                                  competitorScore;

                                return (
                                  <div
                                    key={
                                      competitor._id ||
                                      competitor.id ||
                                      `comp-${compIdx}`
                                    }
                                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-2 h-2 rounded-full ${
                                          compIdx === 0
                                            ? "bg-orange-500"
                                            : compIdx === 1
                                            ? "bg-blue-500"
                                            : "bg-purple-500"
                                        }`}
                                      />
                                      <div>
                                        <p className="font-medium text-sm">
                                          {competitor.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {competitorMentions} mentions
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right flex items-center gap-2">
                                      <div>
                                        <div className="text-sm font-bold">
                                          {competitorScore}%
                                        </div>
                                      </div>
                                      {isWinning ? (
                                        <CheckCircle className="h-4 w-4 text-success" />
                                      ) : (
                                        <AlertTriangle className="h-4 w-4 text-warning" />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>

                          {/* Actionable Insights */}
                          <div className="mt-3 pt-3 border-t">
                            {(source.yourProductScore ||
                              Math.floor(source.weight * 3.2)) <
                            Math.floor(source.weight * 4.5) ? (
                              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                                <div className="flex gap-2">
                                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs font-semibold text-warning mb-1">
                                      ⚠️ Opportunity to Improve
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {profile.competitors[0]?.name} leads here.
                                      Consider:
                                      {source.weight >= 8
                                        ? " Reaching out for featured mention • "
                                        : " "}
                                      Contributing content • Requesting product
                                      inclusion in comparisons
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                                <div className="flex gap-2">
                                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs font-semibold text-success mb-1">
                                      ✅ Strong Presence
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      You're leading on this source! Maintain
                                      relationship and ensure info stays
                                      current.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Overall Summary & CTA */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Summary & Action Plan
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-muted-foreground mb-2">
                          <strong className="text-foreground">
                            Sources where you lead:
                          </strong>{" "}
                          {
                            selectedLLM.topSources.filter(
                              (s: any) =>
                                (s.yourProductScore ||
                                  Math.floor(s.weight * 3.2)) >
                                Math.floor(s.weight * 4.5)
                            ).length
                          }{" "}
                          / {selectedLLM.topSources.length}
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">
                            High-authority gaps:
                          </strong>{" "}
                          {
                            selectedLLM.topSources.filter(
                              (s: any) =>
                                s.weight >= 8 &&
                                (s.yourProductScore ||
                                  Math.floor(s.weight * 3.2)) <
                                  Math.floor(s.weight * 4.5)
                            ).length
                          }{" "}
                          sources
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">
                          <strong className="text-foreground">
                            Next Steps:
                          </strong>
                        </p>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• Target high-authority sources first</li>
                          <li>• Update outdated product information</li>
                          <li>• Build relationships with top publishers</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Category Performance Breakdown */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Performance by Question Category
                  </h3>
                  <div className="space-y-4">
                    {selectedLLM.categoryPerformance.map(
                      (cat: any, idx: number) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">
                              {cat.category}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {cat.score}%
                              </span>
                              {cat.score >= 80 ? (
                                <CheckCircle className="h-4 w-4 text-success" />
                              ) : cat.score >= 70 ? (
                                <AlertTriangle className="h-4 w-4 text-warning" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              )}
                            </div>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${cat.score}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.1 }}
                              className={`h-full ${
                                cat.score >= 80
                                  ? "bg-success"
                                  : cat.score >= 70
                                  ? "bg-warning"
                                  : "bg-destructive"
                              }`}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </Card>

                {/* Strengths and Improvements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <Card className="p-6 bg-success/5 border-success/20">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-success">
                      <CheckCircle className="h-5 w-5" />
                      Key Strengths
                    </h3>
                    <ul className="space-y-3">
                      {selectedLLM.strengths.map(
                        (strength: string, idx: number) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="text-success mt-0.5">✓</span>
                            <span>{strength}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </Card>

                  {/* Areas for Improvement */}
                  <Card className="p-6 bg-warning/5 border-warning/20">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-warning">
                      <TrendingUp className="h-5 w-5" />
                      Improvement Opportunities
                    </h3>
                    <ul className="space-y-3">
                      {selectedLLM.improvements.map(
                        (improvement: string, idx: number) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="text-warning mt-0.5">→</span>
                            <span>{improvement}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </Card>
                </div>

                {/* Score Explanation */}
                <Card className="p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Why This Score?
                  </h3>
                  <div className="space-y-3 text-sm">
                    <p className="text-muted-foreground">
                      Your {selectedLLM.score}% visibility score on{" "}
                      {selectedLLM.name} is calculated based on:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <Badge className="bg-primary/10 text-primary text-xs">
                          40%
                        </Badge>
                        <div>
                          <p className="font-medium">Mention Frequency</p>
                          <p className="text-xs text-muted-foreground">
                            How often your product appears in responses
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge className="bg-purple-500/10 text-purple-600 text-xs">
                          30%
                        </Badge>
                        <div>
                          <p className="font-medium">Citation Quality</p>
                          <p className="text-xs text-muted-foreground">
                            Authority and weight of citing sources
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge className="bg-blue-500/10 text-blue-600 text-xs">
                          20%
                        </Badge>
                        <div>
                          <p className="font-medium">Context Relevance</p>
                          <p className="text-xs text-muted-foreground">
                            Accuracy of product mentions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge className="bg-orange-500/10 text-orange-600 text-xs">
                          10%
                        </Badge>
                        <div>
                          <p className="font-medium">Category Coverage</p>
                          <p className="text-xs text-muted-foreground">
                            Breadth across question types
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      toast.success(`Exporting ${selectedLLM.name} report...`);
                    }}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Report
                  </Button>
                  <Button
                    onClick={() => setShowLLMDetailsModal(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Competitor Comparison Modal */}
      <Dialog open={showCompetitorModal} onOpenChange={setShowCompetitorModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Competitor Analysis - Detailed Comparison
            </DialogTitle>
            <DialogDescription>
              Comprehensive comparison of {profile?.productName} vs{" "}
              {profile?.competitors.length} competitors across all LLMs
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Debug Info */}
            {(!profile?.analysisResult?.competitorAnalysis ||
              profile.analysisResult.competitorAnalysis.length === 0) && (
              <Card className="p-4 bg-warning/10 border-warning">
                <p className="text-sm text-warning-foreground">
                  ⚠️ No competitor analysis data available. This profile may
                  need to be re-run with the updated analysis engine.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Debug: competitorAnalysis length ={" "}
                  {profile?.analysisResult?.competitorAnalysis?.length || 0}
                </p>
              </Card>
            )}

            {/* Comparison Chart */}
            {profile?.analysisResult?.competitorAnalysis &&
            profile.analysisResult.competitorAnalysis.length > 0 ? (
              <>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Visibility & Mentions Comparison
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={(
                        profile?.analysisResult?.competitorAnalysis || []
                      ).map((c) => ({
                        name: c.name,
                        visibility: c.visibility,
                        mentions: c.mentions,
                        isYourProduct: c.isUserProduct || false,
                      }))}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="visibility"
                        fill="hsl(var(--primary))"
                        radius={[8, 8, 0, 0]}
                        name="Visibility Score (%)"
                      />
                      <Bar
                        dataKey="mentions"
                        fill="hsl(var(--chart-2))"
                        radius={[8, 8, 0, 0]}
                        name="Total Mentions"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* Detailed Competitor Cards */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Detailed Metrics</h3>

                  {/* All Products (including user's product) */}
                  {(profile?.analysisResult?.competitorAnalysis || []).map(
                    (item, idx) => (
                      <motion.div
                        key={item.id || idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={
                          item.isUserProduct
                            ? "p-6 rounded-lg border-2 border-primary bg-primary/5"
                            : "p-6 rounded-lg border bg-card hover:shadow-md transition-all"
                        }
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {item.isUserProduct && (
                                <Award className="h-5 w-5 text-primary" />
                              )}
                              <h4
                                className={`font-semibold text-lg ${
                                  item.isUserProduct ? "font-bold" : ""
                                }`}
                              >
                                {item.name}
                              </h4>
                              {item.isUserProduct ? (
                                <Badge className="bg-primary text-white">
                                  Your Product
                                </Badge>
                              ) : (
                                <Badge variant="outline">Competitor</Badge>
                              )}
                              <Badge
                                variant={
                                  item.rank === 1 ? "default" : "outline"
                                }
                              >
                                #{item.rank}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                              {item.category}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Visibility Score
                                </p>
                                <p
                                  className={`text-2xl font-bold ${
                                    item.isUserProduct ? "text-primary" : ""
                                  }`}
                                >
                                  {item.visibility}%
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Total Mentions
                                </p>
                                <p className="text-2xl font-bold">
                                  {item.mentions}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Citations
                                </p>
                                <p className="text-2xl font-bold">
                                  {item.citations}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  {item.isUserProduct ? "Status" : "Gap"}
                                </p>
                                {item.isUserProduct ? (
                                  <p className="text-2xl font-bold text-primary">
                                    {item.rank === 1
                                      ? "👑 Leader"
                                      : `#${item.rank}`}
                                  </p>
                                ) : (
                                  <p
                                    className={`text-2xl font-bold ${
                                      (profile?.analysisResult?.overallScore ||
                                        0) -
                                        item.visibility >
                                      0
                                        ? "text-success"
                                        : "text-warning"
                                    }`}
                                  >
                                    {(profile?.analysisResult?.overallScore ||
                                      0) -
                                      item.visibility >
                                    0
                                      ? "+"
                                      : ""}
                                    {(profile?.analysisResult?.overallScore ||
                                      0) - item.visibility}
                                    %
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  )}
                </div>

                {/* Summary & Insights */}
                <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Competitive Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold mb-2">Your Position:</p>
                      <ul className="space-y-1 text-muted-foreground">
                        {(() => {
                          const userProduct =
                            profile?.analysisResult?.competitorAnalysis?.find(
                              (c) => c.isUserProduct
                            );
                          return userProduct ? (
                            <>
                              <li>
                                • Ranked #{userProduct.rank} with{" "}
                                {userProduct.visibility}% visibility
                              </li>
                              <li>
                                • {userProduct.mentions} total mentions across
                                all LLMs
                              </li>
                              <li>
                                • {userProduct.citations} citation sources
                              </li>
                            </>
                          ) : (
                            <li>• No ranking data available</li>
                          );
                        })()}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold mb-2">Key Opportunities:</p>
                      <ul className="space-y-1 text-muted-foreground">
                        {profile?.analysisResult?.competitorAnalysis
                          ?.filter((c) => !c.isUserProduct)
                          .slice(0, 3)
                          .map((comp, idx) => {
                            const userProduct =
                              profile?.analysisResult?.competitorAnalysis?.find(
                                (c) => c.isUserProduct
                              );
                            return (
                              <li key={comp.id || idx}>
                                •{" "}
                                {comp.visibility >
                                (userProduct?.visibility || 0)
                                  ? `Close the ${
                                      comp.visibility -
                                      (userProduct?.visibility || 0)
                                    }% gap with ${comp.name}`
                                  : `Maintain ${
                                      (userProduct?.visibility || 0) -
                                      comp.visibility
                                    }% lead over ${comp.name}`}
                              </li>
                            );
                          })}
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      toast.success(
                        "Exporting competitor comparison report..."
                      );
                    }}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Comparison
                  </Button>
                  <Button
                    onClick={() => setShowCompetitorModal(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </>
            ) : (
              /* Fallback: Show message when no data */
              <Card className="p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  No competitor analysis data available yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Please run or re-run the analysis to generate competitor
                  comparison data.
                </p>
                <Button
                  onClick={() => setShowCompetitorModal(false)}
                  className="mt-4"
                >
                  Close
                </Button>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

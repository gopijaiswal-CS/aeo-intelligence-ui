import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit2,
  Play,
  Download,
  ArrowLeft,
  Globe,
  MessageSquare,
  Users,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import questionsData from "@/data/questions.json";
import competitorsData from "@/data/competitors.json";

interface Question {
  id: number;
  question: string;
  category: string;
  region: string;
  aiMentions: number;
  visibility: number;
  addedBy: string;
}

interface Competitor {
  id: number;
  name: string;
  visibility: number;
  mentions: number;
  citations: number;
  rank: number;
  category: string;
}

export default function QuestionManagement() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>(questionsData);
  const [competitors, setCompetitors] = useState<Competitor[]>(competitorsData);
  const [isRunning, setIsRunning] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showAddCompetitor, setShowAddCompetitor] = useState(false);

  // New question form state
  const [newQuestion, setNewQuestion] = useState("");
  const [newQuestionCategory, setNewQuestionCategory] = useState("");
  const [newQuestionRegion, setNewQuestionRegion] = useState("");

  // New competitor form state
  const [newCompetitorName, setNewCompetitorName] = useState("");
  const [newCompetitorCategory, setNewCompetitorCategory] = useState("");

  const categories = ["Product Recommendation", "Feature Comparison", "How-To", "Technical", "Price Comparison", "Security"];
  const regions = ["us", "uk", "eu", "asia", "global"];

  const handleAddQuestion = () => {
    if (!newQuestion || !newQuestionCategory || !newQuestionRegion) {
      toast.error("Please fill in all fields");
      return;
    }

    const question: Question = {
      id: questions.length + 1,
      question: newQuestion,
      category: newQuestionCategory,
      region: newQuestionRegion,
      aiMentions: 0,
      visibility: 0,
      addedBy: "manual",
    };

    setQuestions([...questions, question]);
    setNewQuestion("");
    setNewQuestionCategory("");
    setNewQuestionRegion("");
    setShowAddQuestion(false);
    toast.success("Question added successfully!");
  };

  const handleAddCompetitor = () => {
    if (!newCompetitorName || !newCompetitorCategory) {
      toast.error("Please fill in all fields");
      return;
    }

    const competitor: Competitor = {
      id: competitors.length + 1,
      name: newCompetitorName,
      visibility: 0,
      mentions: 0,
      citations: 0,
      rank: competitors.length + 1,
      category: newCompetitorCategory,
    };

    setCompetitors([...competitors, competitor]);
    setNewCompetitorName("");
    setNewCompetitorCategory("");
    setShowAddCompetitor(false);
    toast.success("Competitor added successfully!");
  };

  const handleDeleteQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
    toast.success("Question deleted");
  };

  const handleDeleteCompetitor = (id: number) => {
    setCompetitors(competitors.filter((c) => c.id !== id));
    toast.success("Competitor removed");
  };

  const handleRunAnalysis = async () => {
    setIsRunning(true);
    
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    toast.success("Analysis complete! Check the dashboard for results.");
    setIsRunning(false);
    
    // Navigate to dashboard
    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="p-6 space-y-6">
        <div>
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Question & Competitor Management</h1>
              <p className="text-muted-foreground">
                Manage AEO test questions and track competitors
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
              <Button
                onClick={handleRunAnalysis}
                disabled={isRunning}
                size="lg"
                className="gap-2"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Running Analysis...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Run AEO Engine
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{questions.length}</p>
                <p className="text-sm text-muted-foreground">Test Questions</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{competitors.length}</p>
                <p className="text-sm text-muted-foreground">Competitors Tracked</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">Target Regions</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
          </TabsList>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">AEO Test Questions ({questions.length})</h3>
              <Button onClick={() => setShowAddQuestion(!showAddQuestion)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Question
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
                  <Card className="p-6">
                    <h4 className="font-semibold mb-4">Add New Question</h4>
                    <div className="space-y-4">
                      <div>
                        <Label>Question</Label>
                        <Input
                          placeholder="What are the best smart speakers for..."
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Category</Label>
                          <Select value={newQuestionCategory} onValueChange={setNewQuestionCategory}>
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
                        <div>
                          <Label>Region</Label>
                          <Select value={newQuestionRegion} onValueChange={setNewQuestionRegion}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select region..." />
                            </SelectTrigger>
                            <SelectContent>
                              {regions.map((region) => (
                                <SelectItem key={region} value={region}>
                                  {region.toUpperCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button onClick={handleAddQuestion}>Add Question</Button>
                        <Button variant="outline" onClick={() => setShowAddQuestion(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Questions List */}
            <div className="space-y-2">
              {questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <span className="text-sm font-medium text-muted-foreground mt-1">
                            #{question.id}
                          </span>
                          <p className="font-medium flex-1">{question.question}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline">{question.category}</Badge>
                          <Badge variant="outline" className="gap-1">
                            <Globe className="h-3 w-3" />
                            {question.region.toUpperCase()}
                          </Badge>
                          {question.addedBy === "manual" && (
                            <Badge className="bg-primary/10 text-primary">Custom</Badge>
                          )}
                          {question.visibility > 0 && (
                            <Badge className="bg-success/10 text-success">
                              {question.visibility}% visibility
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Competitors Tab */}
          <TabsContent value="competitors" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Tracked Competitors ({competitors.length})</h3>
              <Button onClick={() => setShowAddCompetitor(!showAddCompetitor)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Competitor
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
                  <Card className="p-6">
                    <h4 className="font-semibold mb-4">Add New Competitor</h4>
                    <div className="space-y-4">
                      <div>
                        <Label>Competitor Name</Label>
                        <Input
                          placeholder="e.g., Competitor F"
                          value={newCompetitorName}
                          onChange={(e) => setNewCompetitorName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Input
                          placeholder="e.g., Home Tech"
                          value={newCompetitorCategory}
                          onChange={(e) => setNewCompetitorCategory(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button onClick={handleAddCompetitor}>Add Competitor</Button>
                        <Button variant="outline" onClick={() => setShowAddCompetitor(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Competitors List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {competitors.map((competitor, index) => (
                <motion.div
                  key={competitor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{competitor.name}</h4>
                        <p className="text-sm text-muted-foreground">{competitor.category}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCompetitor(competitor.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Visibility</p>
                        <p className="text-lg font-bold">{competitor.visibility}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Rank</p>
                        <p className="text-lg font-bold">#{competitor.rank}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Mentions</p>
                        <p className="text-lg font-bold">{competitor.mentions}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Citations</p>
                        <p className="text-lg font-bold">{competitor.citations}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


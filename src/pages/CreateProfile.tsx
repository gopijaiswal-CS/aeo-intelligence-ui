import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Globe,
  Package,
  MessageSquare,
  Play,
  Loader2,
  Home,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useProfiles } from "@/contexts/ProfileContext";
import productsData from "@/data/products.json";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Question, Competitor } from "@/contexts/ProfileContext";
import { generateProducts } from "@/services/api";

type Step = 1 | 2 | 3 | 4;

interface GeneratedProduct {
  id: number;
  name: string;
  category: string;
}

export default function CreateProfile() {
  const navigate = useNavigate();
  const {
    profiles,
    createProfile,
    generateQuestionsAndCompetitors,
    runAnalysis,
    updateProfile,
  } = useProfiles();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [urlTouched, setUrlTouched] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProducts, setGeneratedProducts] = useState<
    GeneratedProduct[]
  >([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [createdProfileId, setCreatedProfileId] = useState<string>("");
  const [questionsGenerated, setQuestionsGenerated] = useState(false);
  const [isRunningEngine, setIsRunningEngine] = useState(false);

  // Manual add states
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showAddCompetitor, setShowAddCompetitor] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newQuestionCategory, setNewQuestionCategory] = useState("");
  const [newCompetitorName, setNewCompetitorName] = useState("");
  const [newCompetitorCategory, setNewCompetitorCategory] = useState("");

  const regions = [
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "eu", label: "European Union" },
    { value: "asia", label: "Asia Pacific" },
    { value: "global", label: "Global" },
  ];

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

  const progress = (currentStep / 4) * 100;

  // Get current profile
  const currentProfile = profiles.find((p) => p.id === createdProfileId);

  // URL Validation Function
  const isValidUrl = (url: string): boolean => {
    if (!url || url.trim() === "") return false;

    try {
      const urlObject = new URL(
        url.startsWith("http") ? url : `https://${url}`
      );

      // Check for valid protocol
      if (!["http:", "https:"].includes(urlObject.protocol)) {
        return false;
      }

      const hostname = urlObject.hostname;

      // Check hostname is not empty
      if (!hostname || hostname.length < 3) {
        return false;
      }

      // Check for trailing or leading dots
      if (hostname.startsWith(".") || hostname.endsWith(".")) {
        return false;
      }

      // Check for consecutive dots
      if (hostname.includes("..")) {
        return false;
      }

      // Check for valid domain pattern (must have at least one dot)
      if (!hostname.includes(".")) {
        return false;
      }

      // Remove 'www.' if present for validation
      const domain = hostname.replace(/^www\./, "");

      // Split into parts
      const parts = domain.split(".");

      // Must have at least 2 parts (domain + TLD)
      if (parts.length < 2) {
        return false;
      }

      // Validate each part
      for (const part of parts) {
        // Each part must exist and be between 1-63 characters
        if (!part || part.length === 0 || part.length > 63) {
          return false;
        }
        // Must start and end with alphanumeric
        if (!/^[a-zA-Z0-9]/.test(part) || !/[a-zA-Z0-9]$/.test(part)) {
          return false;
        }
        // Can only contain alphanumeric and hyphens
        if (!/^[a-zA-Z0-9-]+$/.test(part)) {
          return false;
        }
        // Cannot be all numbers (domain parts should have letters)
        if (/^\d+$/.test(part)) {
          return false;
        }
      }

      // Validate TLD (last part)
      const tld = parts[parts.length - 1].toLowerCase();

      // TLD must be 2-24 characters and contain only letters
      if (tld.length < 2 || tld.length > 24 || !/^[a-zA-Z]+$/.test(tld)) {
        return false;
      }

      // Check against common valid TLDs (this helps reject nonsense)
      const commonTlds = [
        "com",
        "org",
        "net",
        "edu",
        "gov",
        "mil",
        "int",
        "io",
        "co",
        "ai",
        "app",
        "dev",
        "tech",
        "online",
        "us",
        "uk",
        "ca",
        "au",
        "de",
        "fr",
        "jp",
        "cn",
        "in",
        "info",
        "biz",
        "name",
        "pro",
        "museum",
        "coop",
        "travel",
        "xxx",
        "tel",
        "mobi",
        "asia",
        "jobs",
        "cat",
        "post",
        "tv",
        "cc",
        "ws",
        "me",
        "mx",
        "br",
      ];

      // If TLD is longer than 6 chars or not in common list, be more strict
      if (tld.length > 6 && !commonTlds.includes(tld)) {
        return false;
      }

      // Domain name (before TLD) must contain at least one letter
      const domainName = parts[parts.length - 2];
      if (!/[a-zA-Z]/.test(domainName)) {
        return false;
      }

      // Domain name shouldn't be too long
      if (domainName.length > 63) {
        return false;
      }

      // Check for suspicious patterns (too many subdomains)
      if (parts.length > 5) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  };

  // Validate URL and set error message
  const validateUrl = (url: string) => {
    if (!url || url.trim() === "") {
      setUrlError("Website URL is required");
      return false;
    }

    if (!isValidUrl(url)) {
      setUrlError(
        "Please enter a valid URL (e.g., example.com or https://example.com)"
      );
      return false;
    }

    setUrlError("");
    return true;
  };

  // Handle URL change with real-time validation
  const handleUrlChange = (value: string) => {
    setWebsiteUrl(value);
    setUrlTouched(true); // Mark as touched immediately for real-time feedback
    validateUrl(value);
  };

  // Handle URL blur (when user leaves the field)
  const handleUrlBlur = () => {
    setUrlTouched(true);
    validateUrl(websiteUrl);
  };

  const handleGenerateProducts = async () => {
    // Trigger validation
    setUrlTouched(true);

    if (!validateUrl(websiteUrl)) {
      return;
    }

    setIsGenerating(true);

    // TODO: Replace with actual API call
    const response = await generateProducts(websiteUrl);
    setGeneratedProducts(response.data.products);
    toast.success("Products generated successfully!");
    setIsGenerating(false);
    setCurrentStep(2);
    return response;
  };

  const handleSelectProductAndRegion = async () => {
    if (!selectedProduct || !selectedRegion) {
      toast.error("Please select both product and region");
      return;
    }

    const product = generatedProducts.find(
      (p) => p.id.toString() === selectedProduct
    );
    if (!product) return;

    // Create profile
    const newProfile = await createProfile(
      websiteUrl,
      product.name,
      product.category,
      selectedRegion
    );
    if (!newProfile) {
      toast.error("Failed to create profile");
      return;
    }

    setCreatedProfileId(newProfile.id);

    toast.success("Profile created! Generating questions and competitors...");
    setCurrentStep(3);
  };

  const handleGenerateQuestionsAndCompetitors = async () => {
    if (!createdProfileId) return;

    await generateQuestionsAndCompetitors(createdProfileId);
    setQuestionsGenerated(true);
    toast.success("Questions and competitors generated!");
  };

  const handleAddQuestion = () => {
    if (!newQuestion || !newQuestionCategory || !createdProfileId) {
      toast.error("Please fill in all fields");
      return;
    }

    const currentProfile = profiles.find((p) => p.id === createdProfileId);
    if (!currentProfile) return;

    const newQuestionObj: Question = {
      id: currentProfile.questions.length + 1,
      question: newQuestion,
      category: newQuestionCategory,
      region: selectedRegion,
      aiMentions: 0,
      visibility: 0,
      addedBy: "manual",
    };

    updateProfile(createdProfileId, {
      questions: [...currentProfile.questions, newQuestionObj],
    });

    setNewQuestion("");
    setNewQuestionCategory("");
    setShowAddQuestion(false);
    toast.success("Question added!");
  };

  const handleAddCompetitor = () => {
    if (!newCompetitorName || !newCompetitorCategory || !createdProfileId) {
      toast.error("Please fill in all fields");
      return;
    }

    const currentProfile = profiles.find((p) => p.id === createdProfileId);
    if (!currentProfile) return;

    const newCompetitorObj: Competitor = {
      id: currentProfile.competitors.length + 1,
      name: newCompetitorName,
      visibility: 0,
      mentions: 0,
      citations: 0,
      rank: currentProfile.competitors.length + 1,
      category: newCompetitorCategory,
    };

    updateProfile(createdProfileId, {
      competitors: [...currentProfile.competitors, newCompetitorObj],
    });

    setNewCompetitorName("");
    setNewCompetitorCategory("");
    setShowAddCompetitor(false);
    toast.success("Competitor added!");
  };

  const handleDeleteQuestion = (questionId: number) => {
    if (!createdProfileId) return;
    const currentProfile = profiles.find((p) => p.id === createdProfileId);
    if (!currentProfile) return;

    updateProfile(createdProfileId, {
      questions: currentProfile.questions.filter((q) => q.id !== questionId),
    });
    toast.success("Question removed");
  };

  const handleDeleteCompetitor = (competitorId: number) => {
    if (!createdProfileId) return;
    const currentProfile = profiles.find((p) => p.id === createdProfileId);
    if (!currentProfile) return;

    updateProfile(createdProfileId, {
      competitors: currentProfile.competitors.filter(
        (c) => c.id !== competitorId
      ),
    });
    toast.success("Competitor removed");
  };

  const handleRunEngine = async () => {
    if (!createdProfileId) return;

    setIsRunningEngine(true);
    await runAnalysis(createdProfileId);
    setIsRunningEngine(false);

    toast.success("Analysis completed! Redirecting to profile...");

    setTimeout(() => {
      navigate(`/profile/${createdProfileId}`);
    }, 1500);
  };

  // Auto-generate questions when reaching step 3
  useEffect(() => {
    if (currentStep === 3 && createdProfileId && !questionsGenerated) {
      handleGenerateQuestionsAndCompetitors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, createdProfileId, questionsGenerated]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Create New AEO Profile</h1>
            <p className="text-muted-foreground">
              Step {currentStep} of 4 -{" "}
              {currentStep === 1
                ? "Enter Website URL"
                : currentStep === 2
                ? "Select Product & Region"
                : currentStep === 3
                ? "Generate Questions"
                : "Run Analysis"}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm">
            <span
              className={
                currentStep >= 1
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              }
            >
              URL
            </span>
            <span
              className={
                currentStep >= 2
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              }
            >
              Product
            </span>
            <span
              className={
                currentStep >= 3
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              }
            >
              Questions
            </span>
            <span
              className={
                currentStep >= 4
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              }
            >
              Analysis
            </span>
          </div>
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          {/* Step 1: Enter Website URL */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    Enter Your Website URL
                  </h2>
                  <p className="text-muted-foreground">
                    We'll analyze your website and generate a list of products
                    to track
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Website URL <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="url"
                        placeholder="https://yourcompany.com or example.com"
                        value={websiteUrl}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        onBlur={handleUrlBlur}
                        className={`pl-10 h-12 text-lg ${
                          urlError && urlTouched
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }`}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleGenerateProducts()
                        }
                      />
                    </div>
                    {urlError && urlTouched && (
                      <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 rounded-full bg-destructive/10 flex items-center justify-center text-xs">
                          !
                        </span>
                        {urlError}
                      </p>
                    )}
                    {!urlError && websiteUrl && urlTouched && (
                      <p className="text-sm text-success mt-2 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Valid URL
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleGenerateProducts}
                    disabled={
                      isGenerating || !websiteUrl || (urlTouched && !!urlError)
                    }
                    className="w-full h-12 text-lg gap-2"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Analyzing Website...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Generate Products
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    💡 Tip: Enter your company website and we'll automatically
                    detect your products
                  </p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Select Product and Region */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    Select Product & Region
                  </h2>
                  <p className="text-muted-foreground">
                    Choose which product to analyze and your target market
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Generated Products ({generatedProducts.length})
                    </label>
                    <Select
                      value={selectedProduct}
                      onValueChange={setSelectedProduct}
                    >
                      <SelectTrigger className="h-12 text-lg">
                        <SelectValue placeholder="Choose a product..." />
                      </SelectTrigger>
                      <SelectContent>
                        {generatedProducts.map((product) => (
                          <SelectItem
                            key={product.id}
                            value={product.id.toString()}
                          >
                            {product.name} ({product.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Target Region
                    </label>
                    <Select
                      value={selectedRegion}
                      onValueChange={setSelectedRegion}
                    >
                      <SelectTrigger className="h-12 text-lg">
                        <SelectValue placeholder="Select target region..." />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region.value} value={region.value}>
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              {region.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={handleSelectProductAndRegion}
                      disabled={!selectedProduct || !selectedRegion}
                      className="flex-1 gap-2"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Manage Questions & Competitors */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-5xl mx-auto"
            >
              {!questionsGenerated ? (
                <Card className="p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                      Generating Questions
                    </h2>
                    <p className="text-muted-foreground">
                      Please wait while we generate relevant questions and
                      identify competitors...
                    </p>
                  </div>
                </Card>
              ) : (
                <Card className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">
                      Manage Questions & Competitors
                    </h2>
                    <p className="text-muted-foreground">
                      Review generated items and add more manually if needed
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Questions Section */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">
                          Questions ({currentProfile?.questions.length || 0})
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
                                    onChange={(e) =>
                                      setNewQuestion(e.target.value)
                                    }
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
                        {currentProfile?.questions.map((question, index) => (
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
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
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
                                  onClick={() =>
                                    handleDeleteQuestion(question.id)
                                  }
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
                          Competitors ({currentProfile?.competitors.length || 0}
                          )
                        </h3>
                        <Button
                          onClick={() =>
                            setShowAddCompetitor(!showAddCompetitor)
                          }
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
                                  <Button
                                    onClick={handleAddCompetitor}
                                    size="sm"
                                  >
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
                        {currentProfile?.competitors.map(
                          (competitor, index) => (
                            <motion.div
                              key={competitor.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.02 }}
                            >
                              <Card className="p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-semibold">
                                      {competitor.name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {competitor.category}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className="text-xs mt-2"
                                    >
                                      Rank #{competitor.rank}
                                    </Badge>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    onClick={() =>
                                      handleDeleteCompetitor(competitor.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </Card>
                            </motion.div>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-3 mt-6 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      className="flex-1 gap-2"
                      disabled={
                        !currentProfile?.questions.length ||
                        !currentProfile?.competitors.length
                      }
                    >
                      Continue to Analysis
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              )}
            </motion.div>
          )}

          {/* Step 4: Run Analysis */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    Ready to Run Analysis
                  </h2>
                  <p className="text-muted-foreground">
                    Click the button below to start the AEO engine and analyze
                    your brand's AI visibility
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Website:
                      </span>
                      <span className="text-sm font-medium">{websiteUrl}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Product:
                      </span>
                      <span className="text-sm font-medium">
                        {
                          generatedProducts.find(
                            (p) => p.id.toString() === selectedProduct
                          )?.name
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Region:
                      </span>
                      <span className="text-sm font-medium uppercase">
                        {selectedRegion}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Questions:
                      </span>
                      <span className="text-sm font-medium">20 generated</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Competitors:
                      </span>
                      <span className="text-sm font-medium">5 identified</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleRunEngine}
                    disabled={isRunningEngine}
                    className="w-full h-14 text-lg gap-2"
                    size="lg"
                  >
                    {isRunningEngine ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        Running AEO Engine...
                      </>
                    ) : (
                      <>
                        <Play className="h-6 w-6" />
                        Run AEO Engine
                      </>
                    )}
                  </Button>

                  {isRunningEngine && (
                    <div className="text-center text-sm text-muted-foreground">
                      <p>
                        Analyzing your brand across multiple AI platforms...
                      </p>
                      <p className="mt-2">This may take a few moments.</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

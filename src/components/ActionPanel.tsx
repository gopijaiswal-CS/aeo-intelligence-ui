import { useState } from "react";
import { FileText, Activity, Sparkles, CheckCircle, AlertTriangle, XCircle, TrendingUp, Download, X, Wand2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ActionPanelProps {
  onSimulate?: () => void;
  onOptimize?: () => void;
}

export const ActionPanel = ({ onSimulate, onOptimize }: ActionPanelProps) => {
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateInsights = async () => {
    if (onSimulate) {
      onSimulate();
    } else {
      setIsGenerating(true);
      toast.loading("Analyzing AI visibility data...");
      
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      toast.dismiss();
      setIsGenerating(false);
      setShowInsightsModal(true);
      toast.success("LLM insights generated successfully!");
    }
  };

  const handleHealthCheck = async () => {
    setIsGenerating(true);
    toast.loading("Running SEO health check...");
    
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast.dismiss();
    setIsGenerating(false);
    setShowHealthModal(true);
    toast.success("Health check complete!");
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: "Generating comprehensive report...",
        success: "Report generated successfully!",
        error: "Failed to generate report",
      }
    );

    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Simulate PDF download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `AEO-Report-${new Date().toISOString().split('T')[0]}.pdf`;
    link.click();
    
    setIsGenerating(false);
  };

  const handleOptimize = async () => {
    if (onOptimize) {
      onOptimize();
    } else {
      setIsGenerating(true);
      toast.loading("Analyzing content optimization opportunities...");
      
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      toast.dismiss();
      setIsGenerating(false);
      setShowOptimizeModal(true);
      toast.success("Optimization suggestions ready!");
    }
  };

  const actions = [
    {
      id: "insights",
      icon: Sparkles,
      title: "LLM Insights",
      description: "AI-powered visibility analysis across multiple models",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      action: handleGenerateInsights,
      variant: "outline" as const,
    },
    {
      id: "health",
      icon: Activity,
      title: "SEO Health Check",
      description: "Comprehensive website health and performance audit",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      action: handleHealthCheck,
      variant: "outline" as const,
    },
    {
      id: "optimize",
      icon: Wand2,
      title: "Content Optimizer",
      description: "Get AI-powered content recommendations to boost visibility",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
      action: handleOptimize,
      variant: "outline" as const,
    },
    {
      id: "report",
      icon: FileText,
      title: "Generate Report",
      description: "Download comprehensive AEO analysis report (PDF)",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      action: handleGenerateReport,
      variant: "outline" as const,
    },
  ];

  return (
    <>
      <div className="space-y-6 mt-8">
        {/* Header with prominent visual emphasis */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          {/* Gradient background card */}
          <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-orange-500/10 rounded-2xl p-6 border-2 border-primary/20 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary rounded-xl shadow-md">
                <Zap className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-600 to-orange-600 bg-clip-text text-transparent">
                  Take Action
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  🚀 Boost your AEO performance with these powerful AI-driven tools
                </p>
              </div>
              <Badge className="bg-primary text-primary-foreground px-3 py-1 text-sm">
                4 Tools Available
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
  return (
    <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative overflow-hidden h-full ${action.bgColor} border-0 hover:shadow-xl transition-all duration-300 group`}>
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  
                  <div className="p-6 relative space-y-4">
                    {/* Icon */}
                    <div className={`${action.iconBg} w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-7 w-7 ${action.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg">{action.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed min-h-[3rem]">
                        {action.description}
                      </p>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={action.action}
                      disabled={isGenerating}
                      className="w-full gap-2 group-hover:scale-105 transition-transform"
                      variant={action.variant}
                    >
                      <Icon className="h-4 w-4" />
                      {isGenerating ? "Processing..." : "Run Now"}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* LLM Insights Modal */}
      <Dialog open={showInsightsModal} onOpenChange={setShowInsightsModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-primary" />
              AI-Powered LLM Insights
            </DialogTitle>
            <DialogDescription>
              Analysis of your brand's AI visibility across multiple language models
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Overall Score */}
            <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Overall AI Visibility Score</h3>
                  <p className="text-sm text-muted-foreground">Based on 50+ LLM queries</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary">76%</p>
                  <Badge className="mt-2 bg-success text-white">+12% vs last week</Badge>
                </div>
              </div>
              <Progress value={76} className="h-2" />
            </div>

            {/* Key Insights */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
              <div className="grid gap-4">
                <div className="flex gap-3 p-4 bg-success/10 border border-success/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-success">Strong Product Citations</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your products are frequently cited by ChatGPT and Claude in tech-related queries
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-4 bg-info/10 border border-info/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-info mt-0.5" />
                  <div>
                    <p className="font-medium text-info">Growing Mention Velocity</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      15% increase in AI mentions over the past 7 days, particularly in Gemini responses
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <p className="font-medium text-warning">Competitor Gap</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Competitor C has 8% higher visibility in price comparison queries
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* LLM Breakdown */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Visibility by LLM</h3>
              <div className="space-y-3">
                {[
                  { name: "ChatGPT", score: 82, color: "bg-green-500" },
                  { name: "Claude", score: 78, color: "bg-purple-500" },
                  { name: "Gemini", score: 74, color: "bg-blue-500" },
                  { name: "Perplexity", score: 70, color: "bg-orange-500" },
                ].map((llm) => (
                  <div key={llm.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{llm.name}</span>
                      <span className="text-muted-foreground">{llm.score}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${llm.color} transition-all duration-500`}
                        style={{ width: `${llm.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Recommended Actions</h3>
              <ul className="space-y-2">
                <li className="flex gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span>Increase content depth for price comparison queries</span>
                </li>
                <li className="flex gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span>Add more technical specifications to product pages</span>
                </li>
                <li className="flex gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span>Build authority citations from tech review sites</span>
                </li>
              </ul>
            </div>

            <Button onClick={() => setShowInsightsModal(false)} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SEO Health Check Modal */}
      <Dialog open={showHealthModal} onOpenChange={setShowHealthModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Activity className="h-6 w-6 text-primary" />
              SEO Health Check Results
            </DialogTitle>
            <DialogDescription>
              Comprehensive analysis of your website's SEO health
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Overall Health Score */}
            <div className="p-6 bg-gradient-to-r from-success/10 to-success/5 rounded-lg border border-success/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Overall SEO Health</h3>
                  <p className="text-sm text-muted-foreground">Based on 25+ factors</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-success">88/100</p>
                  <Badge className="mt-2 bg-success text-white">Excellent</Badge>
                </div>
              </div>
              <Progress value={88} className="h-2" />
            </div>

            {/* Health Categories */}
            <div className="grid gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="font-medium">Technical SEO</span>
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success">95/100</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Site speed, mobile responsiveness, and crawlability are excellent
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="font-medium">On-Page SEO</span>
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success">92/100</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Meta tags, headers, and content optimization are well-structured
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    <span className="font-medium">Content Quality</span>
                  </div>
                  <Badge variant="outline" className="bg-warning/10 text-warning">78/100</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Some pages lack sufficient content depth and internal linking
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-destructive" />
                    <span className="font-medium">Broken Links</span>
                  </div>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive">4 Found</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  4 broken links detected across product pages - fix immediately
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="font-medium">Schema Markup</span>
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success">90/100</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Good implementation of structured data across main pages
                </p>
              </div>
            </div>

            {/* Action Items */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Priority Action Items</h3>
              <div className="space-y-2">
                <div className="flex gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <span className="text-destructive font-bold">1.</span>
                  <div>
                    <p className="font-medium">Fix Broken Links</p>
                    <p className="text-sm text-muted-foreground">4 links need immediate attention</p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                  <span className="text-warning font-bold">2.</span>
                  <div>
                    <p className="font-medium">Improve Content Depth</p>
                    <p className="text-sm text-muted-foreground">Add 300+ words to 12 product pages</p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-info/5 border border-info/20 rounded-lg">
                  <span className="text-info font-bold">3.</span>
                  <div>
                    <p className="font-medium">Enhance Internal Linking</p>
                    <p className="text-sm text-muted-foreground">Create contextual links between related products</p>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={() => setShowHealthModal(false)} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Content Optimizer Modal - Enhanced with full details */}
      <Dialog open={showOptimizeModal} onOpenChange={setShowOptimizeModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Wand2 className="h-6 w-6 text-primary" />
              Content Optimization Recommendations
            </DialogTitle>
            <DialogDescription>
              Comprehensive AI-powered analysis to maximize your AEO visibility
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Summary Card with Current vs Projected */}
            <div className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg border border-primary/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Analysis Summary
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Based on analysis of your content, we've identified key opportunities to improve 
                    visibility and citation weight through strategic content optimization and technical improvements.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Score</p>
                  <p className="text-3xl font-bold">68%</p>
                </div>
                <div className="text-3xl text-muted-foreground">→</div>
                <div>
                  <p className="text-sm text-muted-foreground">Projected Score</p>
                  <p className="text-3xl font-bold text-primary">83%</p>
                </div>
                <Badge className="ml-4 bg-success text-white text-sm px-3 py-1">
                  +15% improvement
                </Badge>
              </div>
            </div>

            {/* Detailed Recommendations */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Detailed Recommendations</h3>
              <div className="space-y-4">
                {[
                  {
                    icon: "⚙️",
                    priority: "CRITICAL",
                    title: "Add Technical Specifications",
                    description: "Include detailed technical specs (dimensions, compatibility, certifications) to significantly improve LLM citation confidence and ranking in technical queries",
                    category: "technical",
                    difficulty: "Easy",
                    impact: "High",
                    improvement: "+8% visibility",
                    priorityColor: "bg-destructive text-white",
                    impactColor: "bg-destructive text-white",
                    actionItems: [
                      "Add product dimensions and weight to specification section",
                      "Include compatibility list for operating systems and devices",
                      "List all certifications (FCC, CE, Energy Star, etc.)",
                      "Add warranty and support information",
                      "Include technical requirements and dependencies"
                    ]
                  },
                  {
                    icon: "📝",
                    priority: "HIGH",
                    title: "Enhance Use Case Content",
                    description: "Add 3-5 real-world use cases with specific scenarios and outcomes to rank better in how-to queries and practical application searches",
                    category: "content",
                    difficulty: "Medium",
                    impact: "High",
                    improvement: "+5% visibility",
                    priorityColor: "bg-primary text-primary-foreground",
                    impactColor: "bg-destructive text-white",
                    actionItems: [
                      "Create detailed use case scenarios for different user types",
                      "Include before/after examples with metrics",
                      "Add customer testimonials linked to use cases",
                      "Provide step-by-step implementation guides",
                      "Include video demonstrations for each use case"
                    ]
                  },
                  {
                    icon: "📊",
                    priority: "HIGH",
                    title: "Create Comparison Tables",
                    description: "Build comprehensive side-by-side comparison with top 3 competitors highlighting key differentiators to improve citation in comparison queries",
                    category: "citations",
                    difficulty: "Medium",
                    impact: "Medium",
                    improvement: "+4% visibility",
                    priorityColor: "bg-primary text-primary-foreground",
                    impactColor: "bg-warning text-white",
                    actionItems: [
                      "Research competitor products and features",
                      "Create detailed feature comparison matrix",
                      "Add pricing comparison with TCO analysis",
                      "Include performance benchmarks with sources",
                      "Highlight unique selling points clearly"
                    ]
                  },
                  {
                    icon: "🔍",
                    priority: "MEDIUM",
                    title: "Optimize SEO Elements",
                    description: "Improve meta descriptions, title tags, and schema markup to enhance search visibility and AI model understanding of your content",
                    category: "seo",
                    difficulty: "Easy",
                    impact: "Medium",
                    improvement: "+3% visibility",
                    priorityColor: "bg-warning text-white",
                    impactColor: "bg-warning text-white",
                    actionItems: [
                      "Update meta descriptions to be more descriptive and keyword-rich",
                      "Optimize title tags with primary keywords",
                      "Implement Product schema markup",
                      "Add FAQ schema for common questions",
                      "Improve internal linking structure"
                    ]
                  },
                  {
                    icon: "💡",
                    priority: "LOW",
                    title: "Add FAQ Section",
                    description: "Include 10+ frequently asked questions with detailed answers and structured data markup to capture long-tail query traffic",
                    category: "content",
                    difficulty: "Easy",
                    impact: "Low",
                    improvement: "+2% visibility",
                    priorityColor: "bg-muted text-foreground",
                    impactColor: "bg-info text-white",
                    actionItems: [
                      "Compile common customer questions from support tickets",
                      "Research 'People Also Ask' queries from Google",
                      "Write comprehensive answers (150-300 words each)",
                      "Implement FAQPage schema markup",
                      "Include internal links to relevant pages"
                    ]
                  },
                ].map((rec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{rec.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-bold text-lg">{rec.title}</h4>
                            <div className="flex gap-2">
                              <Badge className={`${rec.priorityColor} text-xs`}>
                                {rec.priority}
                              </Badge>
                              <Badge className={`${rec.impactColor} text-xs`}>
                                {rec.impact.toUpperCase()} IMPACT
                              </Badge>
                            </div>
                          </div>
                          <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                            {rec.description}
                          </p>
                          
                          <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Difficulty</p>
                              <p className="font-semibold capitalize">{rec.difficulty}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Expected Gain</p>
                              <p className="font-semibold text-primary">{rec.improvement}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Category</p>
                              <p className="font-semibold capitalize">{rec.category}</p>
                            </div>
                          </div>

                          <div className="border-t pt-3">
                            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-primary" />
                              Action Items:
                            </p>
                            <ul className="space-y-2">
                              {rec.actionItems.map((item, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary mt-0.5 font-bold">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Win Highlight */}
            <div className="p-4 bg-success/10 border-2 border-success/20 rounded-lg">
              <div className="flex gap-3">
                <Sparkles className="h-6 w-6 text-success mt-0.5" />
                <div>
                  <h4 className="font-bold text-success mb-2">🚀 Quick Win Strategy</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Start with <strong>Technical Specifications</strong> and <strong>FAQ Section</strong> - 
                    both are marked as "Easy" difficulty and can deliver <strong>+10% combined visibility gain</strong> in just 2-3 days.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    These can be implemented quickly by extracting data from existing product documentation 
                    and support tickets without requiring new content creation.
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={() => setShowOptimizeModal(false)} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import productsData from "@/data/products.json";
import { Product } from "@/types";

interface Recommendation {
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  difficulty: "easy" | "moderate" | "hard";
  estimatedImprovement: string;
  priority: "low" | "medium" | "high" | "critical";
  category: "content" | "seo" | "citations" | "technical";
  actionItems: string[];
}

interface OptimizationResult {
  recommendations: Recommendation[];
  summary: string;
  projectedScore: number;
}

export default function ContentOptimizer() {
  const navigate = useNavigate();
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);

  const selectedProduct = productsData.find((p) => p.id.toString() === selectedProductId);

  const handleAnalyze = async () => {
    if (!selectedProduct) {
      toast.error("Please select a product first");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("optimize-content", {
        body: { productData: selectedProduct },
      });

      if (error) throw error;

      setResult(data as OptimizationResult);
      toast.success("Optimization analysis complete!");
    } catch (error: any) {
      console.error("Optimization error:", error);
      if (error.message?.includes("429")) {
        toast.error("Rate limit exceeded. Please try again in a moment.");
      } else if (error.message?.includes("402")) {
        toast.error("AI credits exhausted. Please add more credits to continue.");
      } else {
        toast.error("Failed to generate optimization recommendations");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-success text-white";
      case "medium":
        return "bg-warning text-white";
      case "low":
        return "bg-info text-white";
      default:
        return "bg-muted text-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-destructive text-white";
      case "high":
        return "bg-primary text-primary-foreground";
      case "medium":
        return "bg-warning text-white";
      case "low":
        return "bg-muted text-foreground";
      default:
        return "bg-muted text-foreground";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "content":
        return "📝";
      case "seo":
        return "🔍";
      case "citations":
        return "📊";
      case "technical":
        return "⚙️";
      default:
        return "💡";
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-2">Content Optimizer</h1>
          <p className="text-muted-foreground">
            AI-powered recommendations to boost your citation weight and visibility scores
          </p>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Select Product to Analyze</h3>
          <div className="flex gap-4">
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Choose a product..." />
              </SelectTrigger>
              <SelectContent>
                {productsData.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.name} - {product.visibility}% visibility
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAnalyze}
              disabled={!selectedProductId || isAnalyzing}
              size="lg"
              className="gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Recommendations
                </>
              )}
            </Button>
          </div>

          {selectedProduct && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-muted/50 rounded-lg"
            >
              <h4 className="font-semibold mb-2">{selectedProduct.name}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Visibility:</span>
                  <p className="font-medium">{selectedProduct.visibility}%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">SEO Health:</span>
                  <p className="font-medium">{selectedProduct.seoHealth}%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Mentions:</span>
                  <p className="font-medium">{selectedProduct.mentions}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Citations:</span>
                  <p className="font-medium">{selectedProduct.citations}</p>
                </div>
              </div>
            </motion.div>
          )}
        </Card>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Analysis Summary
                    </h3>
                    <p className="text-muted-foreground mb-4">{result.summary}</p>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Score</p>
                        <p className="text-2xl font-bold">{selectedProduct?.visibility}%</p>
                      </div>
                      <div className="text-2xl text-muted-foreground">→</div>
                      <div>
                        <p className="text-sm text-muted-foreground">Projected Score</p>
                        <p className="text-2xl font-bold text-primary">{result.projectedScore}%</p>
                      </div>
                      <Badge className="ml-4 bg-success text-white">
                        +{result.projectedScore - (selectedProduct?.visibility || 0)}% improvement
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid gap-4">
                {result.recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{getCategoryIcon(rec.category)}</div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-lg">{rec.title}</h4>
                            <div className="flex gap-2">
                              <Badge className={getPriorityColor(rec.priority)}>
                                {rec.priority.toUpperCase()}
                              </Badge>
                              <Badge className={getImpactColor(rec.impact)}>
                                {rec.impact.toUpperCase()} IMPACT
                              </Badge>
                            </div>
                          </div>
                          <p className="text-muted-foreground mb-4">{rec.description}</p>
                          
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Difficulty</p>
                              <p className="font-medium capitalize">{rec.difficulty}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Expected Improvement</p>
                              <p className="font-medium text-primary">{rec.estimatedImprovement}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Category</p>
                              <p className="font-medium capitalize">{rec.category}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-2">Action Items:</p>
                            <ul className="space-y-1">
                              {rec.actionItems.map((item, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

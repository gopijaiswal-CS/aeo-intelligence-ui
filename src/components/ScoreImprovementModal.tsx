import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Award, Link, Sparkles } from "lucide-react";

interface ScoreImprovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScore: number;
  productName?: string;
}

export const ScoreImprovementModal = ({
  isOpen,
  onClose,
  currentScore,
  productName = "Your Product",
}: ScoreImprovementModalProps) => {
  const [animatedScore, setAnimatedScore] = useState(currentScore);
  const [showMetrics, setShowMetrics] = useState(false);
  
  const projectedScore = Math.min(currentScore + Math.floor(Math.random() * 15 + 10), 95);
  const improvement = projectedScore - currentScore;

  const metrics = [
    { name: "SEO Score", current: 85, projected: 93, icon: TrendingUp },
    { name: "Citations", current: 15, projected: 24, icon: Award },
    { name: "Broken Links", current: 3, projected: 0, icon: Link },
    { name: "AI Mentions", current: currentScore, projected: projectedScore, icon: Sparkles },
  ];

  useEffect(() => {
    if (isOpen) {
      setAnimatedScore(currentScore);
      setShowMetrics(false);
      
      setTimeout(() => {
        const interval = setInterval(() => {
          setAnimatedScore((prev) => {
            if (prev >= projectedScore) {
              clearInterval(interval);
              setTimeout(() => setShowMetrics(true), 300);
              return projectedScore;
            }
            return prev + 1;
          });
        }, 30);
      }, 500);
    }
  }, [isOpen, currentScore, projectedScore]);

  const data = [
    { name: "Score", value: animatedScore },
    { name: "Remaining", value: 100 - animatedScore },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Score Improvement Simulation</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Projected improvement for <span className="font-semibold text-foreground">{productName}</span>
            </p>

            <div className="relative h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="hsl(var(--muted))" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <motion.div
                className="absolute inset-0 flex items-center justify-center flex-col"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="text-5xl font-bold">{animatedScore}%</div>
                <div className="text-sm text-muted-foreground mt-2">
                  {animatedScore >= projectedScore && (
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-success font-medium flex items-center gap-1"
                    >
                      <TrendingUp className="h-4 w-4" />
                      +{improvement}% improvement
                    </motion.span>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          <AnimatePresence>
            {showMetrics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h4 className="font-semibold text-center mb-4">Key Metrics Improvement</h4>
                {metrics.map((metric, index) => (
                  <motion.div
                    key={metric.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <metric.icon className="h-4 w-4 text-primary" />
                        {metric.name}
                      </span>
                      <span className="font-medium">
                        {metric.current} → {metric.projected}
                        {metric.name === "Broken Links" ? "" : metric.name.includes("Score") ? "%" : ""}
                      </span>
                    </div>
                    <Progress
                      value={(metric.projected / (metric.name.includes("Score") ? 100 : 30)) * 100}
                      className="h-2"
                    />
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20"
                >
                  <p className="text-sm text-center">
                    💡 <strong>With suggested optimizations</strong>, your visibility could improve from{" "}
                    <span className="font-bold text-primary">{currentScore}%</span> to{" "}
                    <span className="font-bold text-primary">{projectedScore}%</span>
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { FileText, Activity, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ActionPanelProps {
  onSimulate?: () => void;
}

export const ActionPanel = ({ onSimulate }: ActionPanelProps) => {
  const handleGenerateInsights = () => {
    if (onSimulate) {
      onSimulate();
    } else {
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 2000)),
        {
          loading: "Analyzing AI visibility data...",
          success: "LLM insights generated successfully!",
          error: "Failed to generate insights",
        }
      );
    }
  };

  const handleHealthCheck = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: "Running SEO health check...",
        success: "Health check complete! No critical issues found.",
        error: "Health check failed",
      }
    );
  };

  const handleGenerateReport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: "Generating comprehensive report...",
        success: "Report generated! Check your downloads.",
        error: "Failed to generate report",
      }
    );
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-lg"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={handleGenerateInsights} size="lg" className="gap-2">
            <Sparkles className="h-5 w-5" />
            Generate LLM Insights
          </Button>
          <Button onClick={handleHealthCheck} variant="outline" size="lg" className="gap-2">
            <Activity className="h-5 w-5" />
            SEO Health Check
          </Button>
          <Button onClick={handleGenerateReport} variant="outline" size="lg" className="gap-2">
            <FileText className="h-5 w-5" />
            Generate Report
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

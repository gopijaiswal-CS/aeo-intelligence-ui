import { useState } from "react";
import { TrendingUp, Award, AlertTriangle, Link, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { DonutChart } from "@/components/DonutChart";
import { TrendChart } from "@/components/TrendChart";
import { ProductTable } from "@/components/ProductTable";
import { ActionPanel } from "@/components/ActionPanel";
import { ScoreImprovementModal } from "@/components/ScoreImprovementModal";
import productsData from "@/data/products.json";
import aiVisibilityData from "@/data/aiVisibility.json";

export default function Dashboard() {
  const [showSimulation, setShowSimulation] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-24">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor your AI visibility and SEO performance across all products
            </p>
          </div>
          <Button onClick={() => navigate("/optimizer")} size="lg" className="gap-2">
            <Sparkles className="h-5 w-5" />
            Content Optimizer
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Top AI Mentions"
            value={aiVisibilityData.topMentions}
            icon={TrendingUp}
            trend="+12% from last week"
            trendUp={true}
          />
          <StatCard
            title="Broken Links"
            value={aiVisibilityData.brokenLinksTotal}
            icon={AlertTriangle}
            trend="Fix immediately"
            trendUp={false}
          />
          <StatCard
            title="SEO Health Score"
            value="88%"
            icon={Award}
            trend="+5% this month"
            trendUp={true}
          />
          <StatCard
            title="Avg Citation Weight"
            value={aiVisibilityData.avgCitationWeight}
            icon={Link}
            trend="Above industry avg"
            trendUp={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DonutChart
            title="Overall AI Visibility"
            score={aiVisibilityData.overallScore}
            subtitle="Your brand appears in 64% of AI responses"
          />
          <TrendChart
            title="Weekly Visibility Trend"
            data={aiVisibilityData.weeklyTrend}
            labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
          />
        </div>

        <ProductTable products={productsData} />
      </div>

      <ActionPanel onSimulate={() => setShowSimulation(true)} />
      <ScoreImprovementModal
        isOpen={showSimulation}
        onClose={() => setShowSimulation(false)}
        currentScore={aiVisibilityData.overallScore}
        productName="Overall Brand"
      />
    </div>
  );
}

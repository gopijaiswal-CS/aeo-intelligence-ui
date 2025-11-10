import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DonutChart } from "@/components/DonutChart";
import { TrendChart } from "@/components/TrendChart";
import { ActionPanel } from "@/components/ActionPanel";
import { ScoreImprovementModal } from "@/components/ScoreImprovementModal";
import productsData from "@/data/products.json";
import competitorsData from "@/data/competitors.json";
import aiVisibilityData from "@/data/aiVisibility.json";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showSimulation, setShowSimulation] = useState(false);

  const product = productsData.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const topCompetitors = competitorsData.slice(0, 5);

  return (
    <div className="min-h-screen pb-24">
      <div className="p-6 space-y-6">
        <div>
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-muted-foreground">{product.category} • Detailed Analytics</p>
            </div>
            <Button onClick={() => navigate("/optimizer")} className="gap-2">
              <Sparkles className="h-5 w-5" />
              Optimize This Product
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DonutChart
            title="Product Visibility Score"
            score={product.visibility}
            subtitle={`${product.mentions} total AI mentions across platforms`}
          />
          <TrendChart
            title="7-Day Visibility Trend"
            data={product.trend}
            labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top 5 Competitors</h3>
            <div className="space-y-3">
              {topCompetitors.map((competitor) => (
                <div
                  key={competitor.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium">{competitor.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {competitor.mentions} mentions • {competitor.citations} citations
                    </p>
                  </div>
                  <Badge variant="outline">Rank #{competitor.rank}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Citation Sources</h3>
            <div className="space-y-3">
              {aiVisibilityData.citationSources.slice(0, 5).map((source, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm flex items-center gap-2">
                      {source.url}
                      <ExternalLink className="h-3 w-3" />
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {source.llm} • {source.mentions} mentions
                    </p>
                  </div>
                  <Badge className="bg-primary/10 text-primary">
                    Weight: {source.weight}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">SEO & AEO Recommendations</h3>
          <div className="space-y-4">
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <p className="font-medium text-success mb-1">✓ Strong Technical SEO</p>
              <p className="text-sm text-muted-foreground">
                Your site structure and meta tags are well-optimized
              </p>
            </div>
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="font-medium text-warning mb-1">⚠ Improve Content Depth</p>
              <p className="text-sm text-muted-foreground">
                Add more detailed product specifications and comparisons to increase AI citations
              </p>
            </div>
            <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
              <p className="font-medium text-info mb-1">💡 Build Authority Links</p>
              <p className="text-sm text-muted-foreground">
                Focus on getting featured in tech review sites to boost citation weight
              </p>
            </div>
            {product.brokenLinks > 0 && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="font-medium text-destructive mb-1">✗ Fix Broken Links</p>
                <p className="text-sm text-muted-foreground">
                  {product.brokenLinks} broken link{product.brokenLinks > 1 ? "s" : ""} detected - fix immediately
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <ActionPanel onSimulate={() => setShowSimulation(true)} />
      <ScoreImprovementModal
        isOpen={showSimulation}
        onClose={() => setShowSimulation(false)}
        currentScore={product.visibility}
        productName={product.name}
      />
    </div>
  );
}

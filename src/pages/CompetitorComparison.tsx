import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DonutChart } from "@/components/DonutChart";
import { ActionPanel } from "@/components/ActionPanel";
import competitorsData from "@/data/competitors.json";
import productsData from "@/data/products.json";

export default function CompetitorComparison() {
  const yourProduct = productsData[0];

  const comparisonData = [
    {
      name: yourProduct.name.split(" ")[0],
      mentions: yourProduct.mentions,
      visibility: yourProduct.visibility,
    },
    ...competitorsData.slice(0, 4).map((c) => ({
      name: c.name,
      mentions: c.mentions,
      visibility: c.visibility,
    })),
  ];

  return (
    <div className="min-h-screen pb-24">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Competitor Comparison</h1>
          <p className="text-muted-foreground">
            Analyze how you stack up against the competition
          </p>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">AI Mentions Comparison</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="mentions" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              <Bar dataKey="visibility" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Detailed Competitor Metrics</h3>
            <div className="space-y-3">
              {competitorsData.map((competitor) => (
                <div
                  key={competitor.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium">{competitor.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {competitor.mentions} mentions • {competitor.citations} citations
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        competitor.visibility >= 80
                          ? "bg-success text-white"
                          : competitor.visibility >= 65
                          ? "bg-primary text-primary-foreground"
                          : "bg-warning text-white"
                      }
                    >
                      {competitor.visibility}%
                    </Badge>
                    <Badge variant="outline">#{competitor.rank}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <DonutChart
            title="Citation Weight Distribution"
            score={yourProduct.visibility}
            subtitle="Your competitive position in AI responses"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h4 className="font-semibold mb-2 text-primary">Competitive Advantage</h4>
            <p className="text-sm text-muted-foreground">
              You outperform 60% of competitors in citation quality and SEO health scores
            </p>
          </Card>
          <Card className="p-6 bg-warning/5 border-warning/20">
            <h4 className="font-semibold mb-2 text-warning">Growth Opportunity</h4>
            <p className="text-sm text-muted-foreground">
              Increasing content depth could help you surpass Competitor C in the next quarter
            </p>
          </Card>
          <Card className="p-6 bg-info/5 border-info/20">
            <h4 className="font-semibold mb-2 text-info">Market Position</h4>
            <p className="text-sm text-muted-foreground">
              You're currently ranked 2nd in your category with strong momentum
            </p>
          </Card>
        </div>
      </div>

      <ActionPanel />
    </div>
  );
}

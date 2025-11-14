import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Sparkles,
  Plus,
  ArrowRight,
  Brain,
  Target,
  BarChart3,
  Lightbulb,
  Shield,
  Zap,
  Globe,
  TrendingUp,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-16 pb-16 pt-8 px-4 sm:px-8 lg:px-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-4xl mx-auto space-y-6 relative"
      >
        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/20 via-purple-500/20 to-orange-500/20 border border-primary/30 text-primary text-sm font-semibold mb-4 shadow-lg backdrop-blur-sm"
        >
          <Sparkles className="h-4 w-4 animate-pulse" />
          Answer Engine Optimization Platform
          <Sparkles className="h-4 w-4 animate-pulse delay-150" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-purple-600 to-orange-600 bg-clip-text text-transparent leading-tight"
        >
          Dominate AI Search Results
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Track, analyze, and optimize your brand's visibility across{" "}
          <span className="font-semibold text-foreground">ChatGPT</span>,{" "}
          <span className="font-semibold text-foreground">Claude</span>,{" "}
          <span className="font-semibold text-foreground">Gemini</span>, and{" "}
          <span className="font-semibold text-foreground">Perplexity</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8"
        >
          <Button
            onClick={() => navigate("/create-profile")}
            size="lg"
            className="gap-2 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            Create Your First Profile
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            size="lg"
            className="gap-2 text-lg px-8 py-6 border-2 hover:bg-accent"
          >
            <Eye className="h-5 w-5" />
            View Dashboard
          </Button>
        </motion.div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="space-y-8"
      >
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            Everything You Need to Win in AI Search
          </h2>
          <p className="text-muted-foreground text-lg">
            Comprehensive tools for Answer Engine Optimization
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {[
            {
              icon: Brain,
              title: "AI Visibility Tracking",
              description:
                "Monitor how ChatGPT, Claude, Gemini, and Perplexity mention your brand across 20+ question categories",
              color: "from-purple-500 to-pink-500",
              iconBg: "bg-purple-100 dark:bg-purple-900/30",
              iconColor: "text-purple-600 dark:text-purple-400",
            },
            {
              icon: Target,
              title: "Competitor Analysis",
              description:
                "Track competitor rankings, citations, and visibility scores to stay ahead in AI search results",
              color: "from-blue-500 to-cyan-500",
              iconBg: "bg-blue-100 dark:bg-blue-900/30",
              iconColor: "text-blue-600 dark:text-blue-400",
            },
            {
              icon: BarChart3,
              title: "Deep Analytics",
              description:
                "Interactive LLM performance breakdowns, citation sources, and category-specific insights",
              color: "from-green-500 to-emerald-500",
              iconBg: "bg-green-100 dark:bg-green-900/30",
              iconColor: "text-green-600 dark:text-green-400",
            },
            {
              icon: Lightbulb,
              title: "Content Optimization",
              description:
                "AI-powered recommendations to boost visibility with prioritized action items and impact scores",
              color: "from-orange-500 to-red-500",
              iconBg: "bg-orange-100 dark:bg-orange-900/30",
              iconColor: "text-orange-600 dark:text-orange-400",
            },
            {
              icon: Shield,
              title: "SEO Health Check",
              description:
                "Comprehensive website audits covering technical SEO, content quality, and broken links",
              color: "from-red-500 to-pink-500",
              iconBg: "bg-red-100 dark:bg-red-900/30",
              iconColor: "text-red-600 dark:text-red-400",
            },
            {
              icon: Zap,
              title: "Real-time Monitoring",
              description:
                "Track visibility trends, citation weights, and response quality metrics over time",
              color: "from-yellow-500 to-orange-500",
              iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
              iconColor: "text-yellow-600 dark:text-yellow-400",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.8 }}
            >
              <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 group border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background via-background to-muted/10 relative overflow-hidden">
                {/* Gradient overlay on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`}
                />

                <div className="relative">
                  <div
                    className={`${feature.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}
                  >
                    <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-muted-foreground text-lg">
              Three simple steps to AI search dominance
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          {[
            {
              step: "1",
              title: "Add Your Website",
              description:
                "Enter your website URL and we'll automatically extract your products and regions",
              icon: Globe,
              color: "from-blue-500 to-cyan-500",
            },
            {
              step: "2",
              title: "Generate Questions",
              description:
                "Our AI creates 20+ test questions across multiple categories to query LLMs",
              icon: Sparkles,
              color: "from-purple-500 to-pink-500",
            },
            {
              step: "3",
              title: "Run Analysis",
              description:
                "Get comprehensive visibility reports with actionable insights and recommendations",
              icon: TrendingUp,
              color: "from-orange-500 to-red-500",
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 + index * 0.2 }}
              className="relative"
            >
              <Card className="p-8 text-center relative z-10 bg-card hover:shadow-2xl transition-all duration-300 group border-2 border-transparent hover:border-primary/20">
                {/* Step Number Badge */}
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform`}
                >
                  {step.step}
                </div>

                {/* Icon */}
                <div className="mb-4">
                  <step.icon className="h-10 w-10 text-primary mx-auto group-hover:scale-110 transition-transform" />
                </div>

                <h3 className="font-bold text-xl mb-3 group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow indicator (hidden on last item) */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 -right-4 z-20">
                    <ArrowRight className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2 }}
        className="text-center max-w-5xl mx-auto"
      >
        <Card className="relative p-12 sm:p-16 bg-gradient-to-br from-primary/10 via-purple-500/10 to-orange-500/10 border-2 border-primary/20 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-500 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-500 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            {/* Animated Icon Group */}
            <div className="flex justify-center items-center gap-3 mb-8">
              <div className="p-4 bg-primary/20 rounded-2xl backdrop-blur-sm animate-pulse">
                <Eye className="h-10 w-10 text-primary" />
              </div>
              <div className="p-4 bg-purple-500/20 rounded-2xl backdrop-blur-sm animate-pulse delay-150">
                <Sparkles className="h-10 w-10 text-purple-500" />
              </div>
              <div className="p-4 bg-orange-500/20 rounded-2xl backdrop-blur-sm animate-pulse delay-300">
                <TrendingUp className="h-10 w-10 text-orange-500" />
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Dominate AI Search?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Join innovative companies using our platform to track competitive
              intelligence, optimize AI visibility, and outrank competitors
              across ChatGPT, Claude, Gemini, and Perplexity
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-10">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">4+</p>
                <p className="text-sm text-muted-foreground">AI Engines</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-500">20+</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-500">∞</p>
                <p className="text-sm text-muted-foreground">Insights</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => navigate("/create-profile")}
                size="lg"
                className="gap-2 text-lg px-10 py-6 shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
              >
                <Plus className="h-5 w-5" />
                Get Started Now
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
                size="lg"
                className="gap-2 text-lg px-10 py-6 border-2 bg-background/50 backdrop-blur-sm hover:bg-accent"
              >
                <Eye className="h-5 w-5" />
                View Demo
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Welcome;

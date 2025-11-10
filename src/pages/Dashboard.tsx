import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ExternalLink, TrendingUp, Calendar, Globe, Trash2, Play, CheckCircle, Loader2, Clock, Sparkles, Target, BarChart3, Zap, Shield, Eye, Brain, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProfiles } from "@/contexts/ProfileContext";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profiles, deleteProfile } = useProfiles();

  const handleDeleteProfile = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProfile(id);
      toast.success("Profile deleted successfully");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Draft", className: "bg-muted text-muted-foreground", icon: Clock },
      generating: { label: "Generating...", className: "bg-info text-white", icon: Loader2 },
      ready: { label: "Ready", className: "bg-warning text-white", icon: Play },
      analyzing: { label: "Analyzing...", className: "bg-primary text-white", icon: Loader2 },
      completed: { label: "Completed", className: "bg-success text-white", icon: CheckCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className={`h-3 w-3 mr-1 ${status === 'generating' || status === 'analyzing' ? 'animate-spin' : ''}`} />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">AEO Analysis Profiles</h1>
            <p className="text-muted-foreground">
              Manage and track your Answer Engine Optimization analyses
            </p>
          </div>
          <Button
            onClick={() => navigate("/create-profile")}
            size="lg"
            className="gap-2"
          >
            <Plus className="h-5 w-5" />
            Create New Profile
          </Button>
        </div>

        {/* Stats Overview */}
        {profiles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{profiles.length}</p>
                  <p className="text-sm text-muted-foreground">Total Profiles</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {profiles.filter(p => p.status === 'completed').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-warning/10 rounded-lg">
                  <Play className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {profiles.filter(p => p.status === 'ready' || p.status === 'analyzing').length}
                  </p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {profiles.filter(p => p.status === 'draft' || p.status === 'generating').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Draft</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Profile Grid or Welcome Page */}
        {profiles.length === 0 ? (
          <div className="space-y-12 pb-12">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-4xl mx-auto space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                Answer Engine Optimization Platform
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-600 to-orange-600 bg-clip-text text-transparent">
                Dominate AI Search Results
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Track, analyze, and optimize your brand's visibility across ChatGPT, Claude, Gemini, and Perplexity
              </p>
              
              <Button
                onClick={() => navigate("/create-profile")}
                size="lg"
                className="gap-2 text-lg px-8 py-6 mt-4"
              >
                <Plus className="h-5 w-5" />
                Create Your First Analysis Profile
                <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Brain,
                  title: "AI Visibility Tracking",
                  description: "Monitor how ChatGPT, Claude, Gemini, and Perplexity mention your brand across 20+ question categories",
                  color: "from-purple-500 to-pink-500",
                  iconBg: "bg-purple-100 dark:bg-purple-900/30",
                  iconColor: "text-purple-600 dark:text-purple-400",
                },
                {
                  icon: Target,
                  title: "Competitor Analysis",
                  description: "Track competitor rankings, citations, and visibility scores to stay ahead in AI search results",
                  color: "from-blue-500 to-cyan-500",
                  iconBg: "bg-blue-100 dark:bg-blue-900/30",
                  iconColor: "text-blue-600 dark:text-blue-400",
                },
                {
                  icon: BarChart3,
                  title: "Deep Analytics",
                  description: "Interactive LLM performance breakdowns, citation sources, and category-specific insights",
                  color: "from-green-500 to-emerald-500",
                  iconBg: "bg-green-100 dark:bg-green-900/30",
                  iconColor: "text-green-600 dark:text-green-400",
                },
                {
                  icon: Lightbulb,
                  title: "Content Optimization",
                  description: "AI-powered recommendations to boost visibility with prioritized action items and impact scores",
                  color: "from-orange-500 to-red-500",
                  iconBg: "bg-orange-100 dark:bg-orange-900/30",
                  iconColor: "text-orange-600 dark:text-orange-400",
                },
                {
                  icon: Shield,
                  title: "SEO Health Check",
                  description: "Comprehensive website audits covering technical SEO, content quality, and broken links",
                  color: "from-red-500 to-pink-500",
                  iconBg: "bg-red-100 dark:bg-red-900/30",
                  iconColor: "text-red-600 dark:text-red-400",
                },
                {
                  icon: Zap,
                  title: "Real-time Monitoring",
                  description: "Track visibility trends, citation weights, and response quality metrics over time",
                  color: "from-yellow-500 to-orange-500",
                  iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
                  iconColor: "text-yellow-600 dark:text-yellow-400",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 group border-0 bg-gradient-to-br from-background to-muted/20">
                    <div className={`${feature.iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* How It Works */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-16"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-3">How It Works</h2>
                <p className="text-muted-foreground">Get started in 3 simple steps</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {[
                  {
                    step: "1",
                    title: "Add Your Website",
                    description: "Enter your website URL and we'll automatically extract your products and regions",
                    icon: Globe,
                  },
                  {
                    step: "2",
                    title: "Generate Questions",
                    description: "Our AI creates 20+ test questions across multiple categories to query LLMs",
                    icon: Sparkles,
                  },
                  {
                    step: "3",
                    title: "Run Analysis",
                    description: "Get comprehensive visibility reports with actionable insights and recommendations",
                    icon: TrendingUp,
                  },
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.2 }}
                    className="relative"
                  >
                    {index < 2 && (
                      <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary to-transparent" />
                    )}
                    <Card className="p-6 text-center relative z-10 bg-card hover:shadow-lg transition-shadow">
                      <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                        {step.step}
                      </div>
                      <step.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              className="text-center"
            >
              <Card className="p-12 bg-gradient-to-r from-primary/10 via-purple-500/10 to-orange-500/10 border-primary/20">
                <Eye className="h-16 w-16 text-primary mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Optimize Your AI Visibility?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join companies using AEO Intelligence to dominate AI search results and stay ahead of competitors
                </p>
                <Button
                  onClick={() => navigate("/create-profile")}
                  size="lg"
                  className="gap-2 text-lg px-8 py-6"
                >
                  <Plus className="h-5 w-5" />
                  Get Started Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Card>
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="p-6 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                  onClick={() => navigate(`/profile/${profile.id}`)}
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(profile.status)}
                  </div>

                  {/* Profile Info */}
                  <div className="mb-4 pr-32">
                    <h3 className="text-xl font-bold mb-1 truncate">{profile.productName}</h3>
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {profile.websiteUrl}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {profile.category}
                    </Badge>
                  </div>

                  {/* Metrics */}
                  {profile.analysisResult ? (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {profile.analysisResult.overallScore}%
                        </p>
                        <p className="text-xs text-muted-foreground">Visibility Score</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {profile.analysisResult.mentions}
                        </p>
                        <p className="text-xs text-muted-foreground">AI Mentions</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">
                          {profile.analysisResult.seoHealth}%
                        </p>
                        <p className="text-xs text-muted-foreground">SEO Health</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">
                          {profile.analysisResult.citations}
                        </p>
                        <p className="text-xs text-muted-foreground">Citations</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        {profile.status === 'draft' && 'Configure and run analysis'}
                        {profile.status === 'generating' && 'Generating questions and competitors...'}
                        {profile.status === 'ready' && 'Ready to run analysis'}
                        {profile.status === 'analyzing' && 'Analysis in progress...'}
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span className="uppercase">{profile.region}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(profile.lastUpdated)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${profile.id}`);
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => handleDeleteProfile(profile.id, profile.name, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

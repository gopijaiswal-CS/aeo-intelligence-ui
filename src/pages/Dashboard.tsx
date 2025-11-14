import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  ExternalLink,
  TrendingUp,
  Calendar,
  Globe,
  Trash2,
  Play,
  CheckCircle,
  Loader2,
  Clock,
  Sparkles,
  Target,
  BarChart3,
  Zap,
  Shield,
  Eye,
  Brain,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProfiles } from "@/contexts/ProfileContext";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profiles, deleteProfile } = useProfiles();

  const handleDeleteProfile = (
    id: string,
    name: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProfile(id);
      toast.success("Profile deleted successfully");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: {
        label: "Draft",
        className: "bg-muted text-muted-foreground",
        icon: Clock,
      },
      generating: {
        label: "Generating...",
        className: "bg-info text-white",
        icon: Loader2,
      },
      ready: { label: "Ready", className: "bg-warning text-white", icon: Play },
      analyzing: {
        label: "Analyzing...",
        className: "bg-primary text-white",
        icon: Loader2,
      },
      completed: {
        label: "Completed",
        className: "bg-success text-white",
        icon: CheckCircle,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon
          className={`h-3 w-3 mr-1 ${
            status === "generating" || status === "analyzing"
              ? "animate-spin"
              : ""
          }`}
        />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
                  <p className="text-sm text-muted-foreground">
                    Total Profiles
                  </p>
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
                    {profiles.filter((p) => p.status === "completed").length}
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
                    {
                      profiles.filter(
                        (p) => p.status === "ready" || p.status === "analyzing"
                      ).length
                    }
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
                    {
                      profiles.filter(
                        (p) => p.status === "draft" || p.status === "generating"
                      ).length
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Draft</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Profile Grid or Empty State */}
        {profiles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center py-20"
          >
            <Card className="max-w-2xl w-full p-12 text-center bg-gradient-to-br from-background via-background to-primary/5 border-dashed border-2">
              <div className="mb-8 relative">
                {/* Decorative Icons */}
                <div className="absolute -top-4 left-1/4 opacity-20">
                  <Brain className="h-12 w-12 text-purple-500 animate-pulse" />
                </div>
                <div className="absolute top-8 right-1/4 opacity-20">
                  <Target className="h-10 w-10 text-blue-500 animate-pulse delay-150" />
                </div>
                <div className="absolute -bottom-4 left-1/3 opacity-20">
                  <Sparkles className="h-8 w-8 text-orange-500 animate-pulse delay-300" />
                </div>

                {/* Main Icon */}
                <div className="relative mx-auto w-24 h-24 bg-gradient-to-br from-primary via-purple-500 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <Eye className="h-12 w-12 text-white" />
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-4">
                Start Your AEO Journey
              </h2>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                No analysis profiles yet. Create your first profile to start
                tracking and optimizing your brand's visibility across AI search
                engines.
              </p>

              {/* Features List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">
                      Deep Analytics
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Track visibility across ChatGPT, Claude & more
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <div className="p-2 bg-purple-500/10 rounded-lg flex-shrink-0">
                    <Zap className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">
                      Real-time Monitoring
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Stay updated with live tracking
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <div className="p-2 bg-blue-500/10 rounded-lg flex-shrink-0">
                    <Shield className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">
                      SEO Health Check
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Comprehensive website audits
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <div className="p-2 bg-orange-500/10 rounded-lg flex-shrink-0">
                    <Lightbulb className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">
                      AI-Powered Insights
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Get actionable recommendations
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate("/create-profile")}
                size="lg"
                className="gap-2 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-5 w-5" />
                Create Your First Profile
                <ArrowRight className="h-5 w-5" />
              </Button>

              <p className="text-xs text-muted-foreground mt-6">
                Takes less than 2 minutes to set up
              </p>
            </Card>
          </motion.div>
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
                    <h3 className="text-xl font-bold mb-1 truncate">
                      {profile.productName}
                    </h3>
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
                        <p className="text-xs text-muted-foreground">
                          Visibility Score
                        </p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {profile.analysisResult.mentions}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          AI Mentions
                        </p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">
                          {profile.analysisResult.seoHealth}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          SEO Health
                        </p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">
                          {profile.analysisResult.citations}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Citations
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        {profile.status === "draft" &&
                          "Configure and run analysis"}
                        {profile.status === "generating" &&
                          "Generating questions and competitors..."}
                        {profile.status === "ready" && "Ready to run analysis"}
                        {profile.status === "analyzing" &&
                          "Analysis in progress..."}
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
                      onClick={(e) =>
                        handleDeleteProfile(profile.id, profile.name, e)
                      }
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

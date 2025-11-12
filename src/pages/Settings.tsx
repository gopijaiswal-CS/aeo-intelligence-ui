import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import productsData from "@/data/products.json";
import * as api from "@/services/api";
import { Loader2 } from "lucide-react";

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Account Information
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");

  // Default Preferences
  const [defaultProduct, setDefaultProduct] = useState("");
  const [defaultRegion, setDefaultRegion] = useState("");

  // LLM Configuration
  const [llmProvider, setLlmProvider] = useState("");
  const [llmApiKey, setLlmApiKey] = useState("");

  // Contentstack Integration
  const [contentstackUrl, setContentstackUrl] = useState("");
  const [contentstackApiKey, setContentstackApiKey] = useState("");
  const [contentstackToken, setContentstackToken] = useState("");

  // Analysis Settings
  const [testFrequency, setTestFrequency] = useState(4);
  const [maxQuestions, setMaxQuestions] = useState(20);

  // Notifications
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [brokenLinkAlerts, setBrokenLinkAlerts] = useState(true);
  const [competitorUpdates, setCompetitorUpdates] = useState(false);
  const [scoreImprovementAlerts, setScoreImprovementAlerts] = useState(true);

  // Alert Thresholds
  const [scoreDrop, setScoreDrop] = useState(10);
  const [mentionDrop, setMentionDrop] = useState(15);

  const regions = [
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "eu", label: "European Union" },
    { value: "asia", label: "Asia Pacific" },
    { value: "global", label: "Global" },
  ];

  const llmProviders = [
    { value: "openai", label: "OpenAI (ChatGPT)" },
    { value: "anthropic", label: "Anthropic (Claude)" },
    { value: "google", label: "Google (Gemini)" },
    { value: "perplexity", label: "Perplexity AI" },
  ];

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await api.getSettings();
      if (response.success && response.data) {
        const settings = response.data;
        
        // Populate form fields
        setCompanyName(settings.companyName || "");
        setEmail(settings.email || "");
        setWebsite(settings.website || "");
        setDefaultProduct(settings.defaultProduct || "");
        setDefaultRegion(settings.defaultRegion || "");
        setLlmProvider(settings.llmProvider || "");
        setLlmApiKey(settings.llmApiKey || "");
        setContentstackUrl(settings.contentstackUrl || "");
        setContentstackApiKey(settings.contentstackApiKey || "");
        setContentstackToken(settings.contentstackToken || "");
        setTestFrequency(settings.testFrequency || 4);
        setMaxQuestions(settings.maxQuestions || 20);
        setWeeklyReports(settings.notifications?.weeklyReports ?? true);
        setBrokenLinkAlerts(settings.notifications?.brokenLinkAlerts ?? true);
        setCompetitorUpdates(settings.notifications?.competitorUpdates ?? false);
        setScoreImprovementAlerts(settings.notifications?.scoreImprovementAlerts ?? true);
        setScoreDrop(settings.alertThresholds?.scoreDrop || 10);
        setMentionDrop(settings.alertThresholds?.mentionDrop || 15);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settings: Partial<api.UserSettings> = {
        companyName,
        email,
        website,
        defaultProduct,
        defaultRegion,
        llmProvider,
        llmApiKey,
        contentstackUrl,
        contentstackApiKey,
        contentstackToken,
        testFrequency,
        maxQuestions,
        notifications: {
          weeklyReports,
          brokenLinkAlerts,
          competitorUpdates,
          scoreImprovementAlerts,
        },
        alertThresholds: {
          scoreDrop,
          mentionDrop,
        },
      };

      const response = await api.updateSettings(settings);
      if (response.success) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error(response.error?.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset all settings to default?")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.resetSettings();
      if (response.success) {
        toast.success("Settings reset to default");
        await loadSettings(); // Reload settings
      } else {
        toast.error(response.error?.message || "Failed to reset settings");
      }
    } catch (error) {
      console.error("Error resetting settings:", error);
      toast.error("Failed to reset settings");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !companyName && !email) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="aeo">AEO Config</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input 
                    id="company" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your Company" 
                    className="mt-1" 
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com" 
                    className="mt-1" 
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com" 
                    className="mt-1" 
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Default Preferences</h3>
              <div className="space-y-4">
                <div>
                  <Label>Default Product</Label>
                  <Select value={defaultProduct} onValueChange={setDefaultProduct}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select default product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {productsData.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Default Region</Label>
                  <Select value={defaultRegion} onValueChange={setDefaultRegion}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select default region..." />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* AEO Configuration Tab */}
          <TabsContent value="aeo" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">LLM API Configuration</h3>
              <div className="space-y-4">
                <div>
                  <Label>LLM Provider</Label>
                  <Select value={llmProvider} onValueChange={setLlmProvider}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select LLM provider..." />
                    </SelectTrigger>
                    <SelectContent>
                      {llmProviders.map((provider) => (
                        <SelectItem key={provider.value} value={provider.value}>
                          {provider.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="llm-api-key">LLM API Key</Label>
                  <Input
                    id="llm-api-key"
                    type="password"
                    value={llmApiKey}
                    onChange={(e) => setLlmApiKey(e.target.value)}
                    placeholder="sk-••••••••••••••••"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your API key is encrypted and stored securely
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Contentstack Integration</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contentstack-url">Contentstack API URL</Label>
                  <Input
                    id="contentstack-url"
                    value={contentstackUrl}
                    onChange={(e) => setContentstackUrl(e.target.value)}
                    placeholder="https://api.contentstack.io/v3"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="contentstack-key">API Key</Label>
                  <Input
                    id="contentstack-key"
                    type="password"
                    value={contentstackApiKey}
                    onChange={(e) => setContentstackApiKey(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="contentstack-token">Access Token</Label>
                  <Input
                    id="contentstack-token"
                    type="password"
                    value={contentstackToken}
                    onChange={(e) => setContentstackToken(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="mt-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Connect to Contentstack to automatically optimize your content
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Analysis Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="test-frequency">Test Frequency (per day)</Label>
                  <Input
                    id="test-frequency"
                    type="number"
                    value={testFrequency}
                    onChange={(e) => setTestFrequency(Number(e.target.value))}
                    min="1"
                    max="24"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="max-questions">Max Questions per Test</Label>
                  <Input
                    id="max-questions"
                    type="number"
                    value={maxQuestions}
                    onChange={(e) => setMaxQuestions(Number(e.target.value))}
                    min="5"
                    max="100"
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly AI Visibility Reports</p>
                    <p className="text-sm text-muted-foreground">
                      Receive comprehensive weekly reports
                    </p>
                  </div>
                  <Switch 
                    checked={weeklyReports}
                    onCheckedChange={setWeeklyReports}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Broken Link Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified immediately when broken links are detected
                    </p>
                  </div>
                  <Switch 
                    checked={brokenLinkAlerts}
                    onCheckedChange={setBrokenLinkAlerts}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Competitor Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Track competitor visibility changes
                    </p>
                  </div>
                  <Switch 
                    checked={competitorUpdates}
                    onCheckedChange={setCompetitorUpdates}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Score Improvement Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when your visibility score increases
                    </p>
                  </div>
                  <Switch 
                    checked={scoreImprovementAlerts}
                    onCheckedChange={setScoreImprovementAlerts}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Alert Thresholds</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="score-drop">Alert on Score Drop (%)</Label>
                  <Input
                    id="score-drop"
                    type="number"
                    value={scoreDrop}
                    onChange={(e) => setScoreDrop(Number(e.target.value))}
                    min="1"
                    max="50"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="mention-drop">Alert on Mention Drop (%)</Label>
                  <Input
                    id="mention-drop"
                    type="number"
                    value={mentionDrop}
                    onChange={(e) => setMentionDrop(Number(e.target.value))}
                    min="1"
                    max="50"
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3">
          <Button 
            variant="outline"
            onClick={handleReset}
            disabled={isLoading || isSaving}
          >
            Reset to Default
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

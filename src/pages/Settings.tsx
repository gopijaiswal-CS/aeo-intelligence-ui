import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import productsData from "@/data/products.json";

export default function Settings() {
  const [defaultProduct, setDefaultProduct] = useState("");
  const [defaultRegion, setDefaultRegion] = useState("");
  const [llmProvider, setLlmProvider] = useState("");

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

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

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
                  <Input id="company" placeholder="Your Company" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@example.com" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" placeholder="https://yourwebsite.com" className="mt-1" />
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
                    placeholder="https://api.contentstack.io/v3"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="contentstack-key">API Key</Label>
                  <Input
                    id="contentstack-key"
                    type="password"
                    placeholder="••••••••••••••••"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="contentstack-token">Access Token</Label>
                  <Input
                    id="contentstack-token"
                    type="password"
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
                    defaultValue="4"
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
                    defaultValue="20"
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
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Broken Link Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified immediately when broken links are detected
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Competitor Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Track competitor visibility changes
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Score Improvement Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when your visibility score increases
                    </p>
                  </div>
                  <Switch defaultChecked />
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
                    defaultValue="10"
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
                    defaultValue="15"
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
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}

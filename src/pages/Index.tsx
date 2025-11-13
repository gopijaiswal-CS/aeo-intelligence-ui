import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { generateProducts } from "@/services/api";
import type { Product } from "@/services/api";

const Index = () => {
  const navigate = useNavigate();
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [generatedProducts, setGeneratedProducts] = useState<Product[]>([]);

  const regions = [
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "eu", label: "European Union" },
    { value: "asia", label: "Asia Pacific" },
    { value: "global", label: "Global" },
  ];

  // Debounced function to fetch products from API
  const fetchProducts = useCallback(async (url: string) => {
    if (!url) {
      setGeneratedProducts([]);
      return;
    }

    // Basic URL validation
    const urlPattern =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(url)) {
      return;
    }

    setIsLoadingProducts(true);
    try {
      const response = await generateProducts(url);

      if (response.success && response.data) {
        setGeneratedProducts(response.data.products);
        toast.success(
          `Found ${response.data.products.length} products/services!`
        );

        // Auto-select first product if available
        if (response.data.products.length > 0) {
          setSelectedProduct(response.data.products[0].id.toString());
        }
      } else {
        toast.error(response.error?.message || "Failed to fetch products");
        setGeneratedProducts([]);
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products from website");
      setGeneratedProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // Debounce URL input
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (websiteUrl) {
  //       fetchProducts(websiteUrl);
  //     }
  //   }, 1000); // Wait 1 second after user stops typing

  //   return () => clearTimeout(timer);
  // }, [websiteUrl, fetchProducts]);

  const handleStartAnalysis = async () => {
    if (!websiteUrl || !selectedProduct || !selectedRegion) {
      toast.error("Please fill in all fields to continue");
      return;
    }

    setIsAnalyzing(true);

    // Simulate URL analysis
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast.success("Analysis started successfully!");
    setIsAnalyzing(false);

    // Navigate to dashboard with context
    navigate(`/product/${selectedProduct}`, {
      state: {
        url: websiteUrl,
        region: selectedRegion,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              AI-Powered AEO Intelligence
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Optimize Your Brand for
            <br />
            <span className="text-primary">AI Search Engines</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Discover how ChatGPT, Gemini, and other AI models perceive your
            brand. Get actionable insights to improve your Answer Engine
            Optimization.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            <Card className="p-6 border-primary/20 hover:border-primary/40 transition-colors">
              <TrendingUp className="h-10 w-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">AI Visibility Score</h3>
              <p className="text-sm text-muted-foreground">
                Track how often AI models mention your brand
              </p>
            </Card>

            <Card className="p-6 border-primary/20 hover:border-primary/40 transition-colors">
              <Award className="h-10 w-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Citation Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Analyze quality and weight of AI citations
              </p>
            </Card>

            <Card className="p-6 border-primary/20 hover:border-primary/40 transition-colors">
              <CheckCircle className="h-10 w-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">AEO Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                Get AI-powered optimization suggestions
              </p>
            </Card>
          </div>
        </motion.div>

        {/* Analysis Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="p-8 shadow-xl border-primary/10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">
                Start Your AEO Analysis
              </h2>
              <p className="text-muted-foreground">
                Enter your website URL and select a product to analyze
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Website URL
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="pl-10 h-12 text-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Product{" "}
                  {isLoadingProducts && (
                    <span className="text-muted-foreground text-xs">
                      (Loading...)
                    </span>
                  )}
                </label>
                <Select
                  value={selectedProduct}
                  onValueChange={setSelectedProduct}
                  disabled={isLoadingProducts || generatedProducts.length === 0}
                >
                  <SelectTrigger className="h-12 text-lg">
                    {isLoadingProducts ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Fetching products...</span>
                      </div>
                    ) : (
                      <SelectValue
                        placeholder={
                          generatedProducts.length > 0
                            ? "Choose a product to analyze..."
                            : "Enter website URL first to fetch products"
                        }
                      />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {generatedProducts.map((product) => (
                      <SelectItem
                        key={product.id}
                        value={product.id.toString()}
                      >
                        {product.name}{" "}
                        {product.category && `(${product.category})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {generatedProducts.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {generatedProducts.length} product
                    {generatedProducts.length !== 1 ? "s" : ""} found from
                    website
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Target Region
                </label>
                <Select
                  value={selectedRegion}
                  onValueChange={setSelectedRegion}
                >
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder="Select target region..." />
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

              <Button
                onClick={handleStartAnalysis}
                disabled={isAnalyzing}
                className="w-full h-14 text-lg gap-2"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Start AEO Analysis
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => navigate("/dashboard")}
                  className="text-primary"
                >
                  Or view existing dashboard →
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center text-muted-foreground"
        >
          <p className="text-sm mb-4">Trusted by leading brands worldwide</p>
          <div className="flex justify-center gap-8 opacity-60">
            <span className="text-2xl font-bold">ChatGPT</span>
            <span className="text-2xl font-bold">Gemini</span>
            <span className="text-2xl font-bold">Claude</span>
            <span className="text-2xl font-bold">Perplexity</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;

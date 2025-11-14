import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import CreateProfile from "./pages/CreateProfile";
import Dashboard from "./pages/Dashboard";
import ProfileAnalysis from "./pages/ProfileAnalysis";
import ProductDetail from "./pages/ProductDetail";
import CompetitorComparison from "./pages/CompetitorComparison";
import ContentOptimizer from "./pages/ContentOptimizer";
import QuestionManagement from "./pages/QuestionManagement";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Welcome from "./pages/Welcome";

const queryClient = new QueryClient();

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ProfileProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" />
          <BrowserRouter>
            <div className="flex min-h-screen w-full bg-background">
              <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
              <div className="flex-1 flex flex-col w-full">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Welcome />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/create-profile" element={<CreateProfile />} />
                    <Route path="/profile/:id" element={<ProfileAnalysis />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/products" element={<Dashboard />} />
                    <Route
                      path="/competitors"
                      element={<CompetitorComparison />}
                    />
                    <Route path="/optimizer" element={<ContentOptimizer />} />
                    <Route
                      path="/questions/:profileId"
                      element={<QuestionManagement />}
                    />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </ProfileProvider>
    </QueryClientProvider>
  );
};

export default App;

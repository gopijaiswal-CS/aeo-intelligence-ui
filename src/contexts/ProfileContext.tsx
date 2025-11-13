import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as api from "@/services/api";
import { toast } from "sonner";

export interface Question {
  id: number;
  question: string;
  category: string;
  region: string;
  aiMentions: number;
  visibility: number;
  addedBy: string;
}

export interface Competitor {
  _id?: string;  // MongoDB document ID
  id: number;
  name: string;
  visibility: number;
  mentions: number;
  citations: number;
  rank: number;
  category: string;
  isUserProduct?: boolean;  // Flag to identify if this is the user's product
}

export interface AnalysisResult {
  overallScore: number;
  seoHealth: number;
  mentions: number;
  citations: number;
  brokenLinks: number;
  trend: number[];
  lastAnalyzed?: string;
  citationSources: Array<{
    url: string;
    llm: string;
    weight: number;
    mentions: number;
  }>;
  llmPerformance?: Array<{
    llmName: string;
    score: number;
    mentions: number;
    citations: number;
    topSources: Array<{
      url: string;
      weight: number;
      productMentioned: boolean;
      competitorsMentioned: string[];
    }>;
    competitorMentions: Record<string, number>;
  }>;
  competitorAnalysis?: Array<{
    id: string;
    name: string;
    category: string;
    visibility: number;
    mentions: number;
    citations: number;
    rank: number;
    isUserProduct?: boolean;
  }>;
}

export interface Profile {
  id: string;
  name: string;
  websiteUrl: string;
  productName: string;
  category: string;
  region: string;
  createdAt: string;
  lastUpdated: string;
  status: "draft" | "generating" | "ready" | "analyzing" | "completed";
  questions: Question[];
  competitors: Competitor[];
  analysisResult?: AnalysisResult;
}

interface ProfileContextType {
  profiles: Profile[];
  currentProfile: Profile | null;
  isLoading: boolean;
  createProfile: (websiteUrl: string, productName: string, category: string, region: string) => Promise<Profile | null>;
  updateProfile: (id: string, updates: Partial<Profile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  setCurrentProfile: (id: string | null) => void;
  generateQuestionsAndCompetitors: (profileId: string) => Promise<void>;
  runAnalysis: (profileId: string) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfile, setCurrentProfileState] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load profiles from API on mount
  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const response = await api.getProfiles();
      if (response.success && response.data) {
        setProfiles(response.data.profiles);
      } else {
        console.error("Failed to load profiles:", response.error);
        toast.error("Failed to load profiles");
      }
    } catch (error) {
      console.error("Error loading profiles:", error);
      toast.error("Error loading profiles");
    } finally {
      setIsLoading(false);
    }
  };

  const createProfile = async (websiteUrl: string, productName: string, category: string, region: string): Promise<Profile | null> => {
    try {
      const response = await api.createProfile({
        websiteUrl,
        productName,
        category,
        region,
      });

      if (response.success && response.data) {
        const newProfile = response.data;
        setProfiles((prev) => [...prev, newProfile]);
        toast.success("Profile created successfully!");
        return newProfile;
      } else {
        toast.error(response.error?.message || "Failed to create profile");
        return null;
      }
    } catch (error: any) {
      console.error("Error creating profile:", error);
      toast.error("Error creating profile");
      return null;
    }
  };

  const updateProfile = async (id: string, updates: Partial<Profile>): Promise<void> => {
    try {
      // Update locally first for immediate UI feedback
      setProfiles((prev) => {
        // Defensive check: ensure prev is always an array
        const profilesArray = Array.isArray(prev) ? prev : [];
        return profilesArray.map((profile) =>
          profile.id === id
            ? { ...profile, ...updates, lastUpdated: new Date().toISOString() }
            : profile
        );
      });

      if (currentProfile?.id === id) {
        setCurrentProfileState((prev) => prev ? { ...prev, ...updates } : null);
      }

      // Then update on server
      const response = await api.updateProfile(id, updates);
      if (!response.success) {
        console.error("Failed to update profile on server:", response.error);
        // Optionally revert changes or show warning
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const deleteProfile = async (id: string): Promise<void> => {
    try {
      const response = await api.deleteProfile(id);
      
      if (response.success) {
        setProfiles((prev) => prev.filter((profile) => profile.id !== id));
        if (currentProfile?.id === id) {
          setCurrentProfileState(null);
        }
        toast.success("Profile deleted successfully!");
      } else {
        toast.error(response.error?.message || "Failed to delete profile");
      }
    } catch (error: any) {
      console.error("Error deleting profile:", error);
      toast.error("Error deleting profile");
    }
  };

  const setCurrentProfile = (id: string | null) => {
    if (id) {
      const profile = profiles.find((p) => p.id === id);
      setCurrentProfileState(profile || null);
    } else {
      setCurrentProfileState(null);
    }
  };

  const generateQuestionsAndCompetitors = async (profileId: string): Promise<void> => {
    try {
      // Update status to generating
      await updateProfile(profileId, { status: "generating" });

      // Call the real API
      const response = await api.generateQuestionsAndCompetitors(profileId);

      if (response.success && response.data) {
        const { questions, competitors } = response.data;
        
        // Update profile with generated data
        await updateProfile(profileId, {
          questions,
          competitors,
          status: "ready",
        });

        // Reload profiles to get updated data from server
        await loadProfiles();
        
        toast.success(`Generated ${questions.length} questions and ${competitors.length} competitors!`);
      } else {
        throw new Error(response.error?.message || "Failed to generate questions and competitors");
      }
    } catch (error: any) {
      console.error("Error generating questions and competitors:", error);
      
      // Reset status on error
      await updateProfile(profileId, { status: "draft" });
      
      toast.error(error.message || "Failed to generate questions and competitors");
    }
  };

  const runAnalysis = async (profileId: string): Promise<void> => {
    try {
      // Update status to analyzing
      updateProfile(profileId, { status: "analyzing" });

      // Call REAL backend API
      const response = await api.runAnalysis(profileId);

      if (response.success && response.data) {
        // Fetch updated profile from backend
        const profileResponse = await api.getProfiles();
        if (profileResponse.success && profileResponse.data) {
          // API returns { data: { profiles: [...], total: N } }
          const profilesArray = Array.isArray(profileResponse.data) 
            ? profileResponse.data 
            : profileResponse.data.profiles || [];
          
          setProfiles(profilesArray);
          
          // Update current profile
          const updatedProfile = profilesArray.find((p: Profile) => p.id === profileId);
          if (updatedProfile) {
            setCurrentProfileState(updatedProfile);
          }
        }
      } else {
        throw new Error(response.error?.message || 'Analysis failed');
      }
    } catch (error: any) {
      console.error('❌ Analysis error:', error);
      // Reset status on error
      updateProfile(profileId, { status: "ready" });
      throw error;
    }
  };

  // OLD MOCK CODE - REMOVED
  const runAnalysis_OLD_MOCK = async (profileId: string): Promise<void> => {
    updateProfile(profileId, { status: "analyzing" });

    // Simulate analysis
    await new Promise((resolve) => setTimeout(resolve, 4000));

    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return;

    // Generate mock analysis results
    const mockAnalysis: AnalysisResult = {
      overallScore: Math.floor(Math.random() * 30) + 60,
      seoHealth: Math.floor(Math.random() * 20) + 75,
      mentions: Math.floor(Math.random() * 50) + 30,
      citations: Math.floor(Math.random() * 20) + 10,
      brokenLinks: Math.floor(Math.random() * 5),
      trend: Array.from({ length: 7 }, (_, i) => 50 + i * 2 + Math.random() * 5),
      lastAnalyzed: new Date().toISOString(),
      citationSources: Array.from({ length: 5 }, (_, i) => ({
        url: `example${i + 1}.com/${profile.category.toLowerCase()}`,
        llm: ["ChatGPT", "Gemini", "Claude", "Perplexity"][i % 4],
        weight: Math.random() * 3 + 6,
        mentions: Math.floor(Math.random() * 15) + 5,
      })),
    };

    updateProfile(profileId, {
      analysisResult: mockAnalysis,
      status: "completed",
    });
  };

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        currentProfile,
        isLoading,
        createProfile,
        updateProfile,
        deleteProfile,
        setCurrentProfile,
        generateQuestionsAndCompetitors,
        runAnalysis,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfiles = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfiles must be used within ProfileProvider");
  }
  return context;
};


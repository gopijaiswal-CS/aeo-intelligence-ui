import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  id: number;
  name: string;
  visibility: number;
  mentions: number;
  citations: number;
  rank: number;
  category: string;
}

export interface AnalysisResult {
  overallScore: number;
  seoHealth: number;
  mentions: number;
  citations: number;
  brokenLinks: number;
  trend: number[];
  lastAnalyzed: string;
  citationSources: Array<{
    url: string;
    llm: string;
    weight: number;
    mentions: number;
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
  createProfile: (websiteUrl: string, productName: string, category: string, region: string) => Profile;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
  setCurrentProfile: (id: string | null) => void;
  generateQuestionsAndCompetitors: (profileId: string) => Promise<void>;
  runAnalysis: (profileId: string) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfile, setCurrentProfileState] = useState<Profile | null>(null);

  // Load profiles from localStorage on mount
  useEffect(() => {
    const savedProfiles = localStorage.getItem("aeo-profiles");
    if (savedProfiles) {
      setProfiles(JSON.parse(savedProfiles));
    }
  }, []);

  // Save profiles to localStorage whenever they change
  useEffect(() => {
    if (profiles.length > 0) {
      localStorage.setItem("aeo-profiles", JSON.stringify(profiles));
    }
  }, [profiles]);

  const createProfile = (websiteUrl: string, productName: string, category: string, region: string): Profile => {
    const newProfile: Profile = {
      id: `profile-${Date.now()}`,
      name: `${productName} Analysis`,
      websiteUrl,
      productName,
      category,
      region,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status: "draft",
      questions: [],
      competitors: [],
    };

    setProfiles((prev) => [...prev, newProfile]);
    return newProfile;
  };

  const updateProfile = (id: string, updates: Partial<Profile>) => {
    setProfiles((prev) =>
      prev.map((profile) =>
        profile.id === id
          ? { ...profile, ...updates, lastUpdated: new Date().toISOString() }
          : profile
      )
    );

    if (currentProfile?.id === id) {
      setCurrentProfileState((prev) => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteProfile = (id: string) => {
    setProfiles((prev) => prev.filter((profile) => profile.id !== id));
    if (currentProfile?.id === id) {
      setCurrentProfileState(null);
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
    updateProfile(profileId, { status: "generating" });

    // Simulate generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return;

    // Generate mock questions based on product and region
    const mockQuestions: Question[] = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      question: `What are the best ${profile.category.toLowerCase()} products for ${profile.productName}?`,
      category: ["Product Recommendation", "Feature Comparison", "How-To", "Technical"][i % 4],
      region: profile.region,
      aiMentions: Math.floor(Math.random() * 20) + 5,
      visibility: Math.floor(Math.random() * 30) + 50,
      addedBy: "auto",
    }));

    // Generate mock competitors
    const mockCompetitors: Competitor[] = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      name: `Competitor ${String.fromCharCode(65 + i)}`,
      visibility: Math.floor(Math.random() * 30) + 50,
      mentions: Math.floor(Math.random() * 30) + 10,
      citations: Math.floor(Math.random() * 15) + 5,
      rank: i + 1,
      category: profile.category,
    }));

    updateProfile(profileId, {
      questions: mockQuestions,
      competitors: mockCompetitors,
      status: "ready",
    });
  };

  const runAnalysis = async (profileId: string): Promise<void> => {
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


/**
 * AEO Intelligence API Service
 *
 * This service handles all API communications with the backend.
 * Replace the mock implementations with actual API calls.
 */

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
const API_KEY = import.meta.env.VITE_API_KEY || "";

// Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface Product {
  id: number;
  name: string;
  category: string;
  description?: string;
}

export interface Question {
  _id: string;
  question: string;
  category: string;
  region: string;
  aiMentions: number;
  visibility: number;
  addedBy: string;
}

export interface Competitor {
  _id: string;
  name: string;
  category: string;
  visibility: number;
  mentions: number;
  citations: number;
  rank: number;
}

export interface AnalysisResult {
  overallScore: number;
  mentions: number;
  seoHealth: number;
  citations: number;
  brokenLinks: number;
  trend: number[];
  citationSources: any[];
  llmPerformance?: any[];
}

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        "X-API-Version": "1.0",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data.error?.code || "API_ERROR",
          message: data.error?.message || "An error occurred",
          details: data.error?.details,
        },
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: error.message || "Network error occurred",
      },
    };
  }
}

// ============================================
// 1. PROFILE MANAGEMENT
// ============================================

export interface CreateProfileData {
  websiteUrl: string;
  productName: string;
  category: string;
  region: string;
}

export interface Profile extends CreateProfileData {
  id: string;
  name: string;
  status: "draft" | "generating" | "ready" | "analyzing" | "completed";
  createdAt: string;
  lastUpdated: string;
  questions: Question[];
  competitors: Competitor[];
  analysisResult?: AnalysisResult;
}

/**
 * Create a new analysis profile
 */
export async function createProfile(
  data: CreateProfileData
): Promise<ApiResponse<Profile>> {
  const response = await apiRequest<any>("/profiles", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (response.success && response.data) {
    // Transform MongoDB _id to id for frontend compatibility
    const profile = {
      ...response.data,
      id: response.data._id,
      lastUpdated: response.data.updatedAt,
    };
    return {
      success: true,
      data: profile,
    };
  }

  return response;
}

/**
 * Get all profiles
 */
export async function getProfiles(): Promise<
  ApiResponse<{ profiles: Profile[]; total: number }>
> {
  const response = await apiRequest<{ profiles: any[]; total: number }>(
    "/profiles"
  );

  if (response.success && response.data) {
    // Transform MongoDB _id to id for frontend compatibility
    const profiles = response.data.profiles.map((profile: any) => ({
      ...profile,
      id: profile._id,
      lastUpdated: profile.updatedAt,
    }));
    return {
      success: true,
      data: {
        profiles,
        total: response.data.total,
      },
    };
  }

  return response;
}

/**
 * Get a single profile by ID
 */
export async function getProfile(
  profileId: string
): Promise<ApiResponse<Profile>> {
  const response = await apiRequest<any>(`/profiles/${profileId}`);

  if (response.success && response.data) {
    // Transform MongoDB _id to id for frontend compatibility
    const profile = {
      ...response.data,
      id: response.data._id,
      lastUpdated: response.data.updatedAt,
    };
    return {
      success: true,
      data: profile,
    };
  }

  return response;
}

/**
 * Update profile
 */
export async function updateProfile(
  profileId: string,
  updates: Partial<Profile>
): Promise<ApiResponse<Profile>> {
  const response = await apiRequest<any>(`/profiles/${profileId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });

  if (response.success && response.data) {
    const profile = {
      ...response.data,
      id: response.data._id,
      lastUpdated: response.data.updatedAt,
    };
    return {
      success: true,
      data: profile,
    };
  }

  return response;
}

/**
 * Delete profile
 */
export async function deleteProfile(
  profileId: string
): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/profiles/${profileId}`, {
    method: "DELETE",
  });
}

// ============================================
// 2. PRODUCT GENERATION
// ============================================

export interface GenerateProductsResponse {
  products: Product[];
  suggestedRegions: string[];
}

/**
 * Generate products from website URL
 */
export async function generateProducts(
  websiteUrl: string
): Promise<ApiResponse<GenerateProductsResponse>> {
  return apiRequest<GenerateProductsResponse>("/products/generate", {
    method: "POST",
    body: JSON.stringify({ websiteUrl }),
  });
}

// ============================================
// 3. QUESTION & COMPETITOR GENERATION
// ============================================

export interface GenerateQuestionsResponse {
  questions: Question[];
  competitors: Competitor[];
}

/**
 * Generate questions and competitors for a profile
 */
export async function generateQuestionsAndCompetitors(
  profileId: string
): Promise<ApiResponse<GenerateQuestionsResponse>> {
  return apiRequest<GenerateQuestionsResponse>(
    `/profiles/${profileId}/generate`,
    {
      method: "POST",
    }
  );
}

// ============================================
// 4. AEO ANALYSIS ENGINE
// ============================================

/**
 * Run AEO analysis for a profile
 */
export async function runAnalysis(
  profileId: string
): Promise<ApiResponse<Profile>> {
  return apiRequest<Profile>(`/profiles/${profileId}/analyze`, {
    method: "POST",
  });
}

// ============================================
// 5. CONTENT OPTIMIZATION
// ============================================

export interface OptimizationRecommendation {
  priority: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  impact: string;
  improvement: string;
  actionItems: string[];
}

export interface OptimizationResponse {
  summary: string;
  projectedScore: number;
  recommendations: OptimizationRecommendation[];
}

/**
 * Get content optimization recommendations
 */
export async function getOptimizationRecommendations(
  profileId: string
): Promise<ApiResponse<OptimizationResponse>> {
  return apiRequest<OptimizationResponse>("/optimize/content", {
    method: "POST",
    body: JSON.stringify({ profileId }),
  });
}

// ============================================
// 6. SEO HEALTH CHECK
// ============================================

export interface SEOHealthResponse {
  overallScore: number;
  categories: {
    technicalSeo: { score: number; status: string; issues: string[] };
    onPageSeo: { score: number; status: string; issues: string[] };
    contentQuality: { score: number; status: string; issues: string[] };
    brokenLinks: { score: number; status: string; count: number };
  };
  actionItems: Array<{ priority: string; title: string; description: string }>;
}

/**
 * Run SEO health check
 */
export async function runSEOHealthCheck(
  websiteUrl: string
): Promise<ApiResponse<SEOHealthResponse>> {
  return apiRequest<SEOHealthResponse>("/seo/health-check", {
    method: "POST",
    body: JSON.stringify({ websiteUrl }),
  });
}

// ============================================
// 7. REPORTS
// ============================================

export interface GenerateReportResponse {
  reportUrl: string;
  expiresAt: string;
}

/**
 * Generate PDF report
 */
export async function generateReport(
  profileId: string
): Promise<ApiResponse<GenerateReportResponse>> {
  // Note: Report generation is handled client-side via reportGenerator.ts
  // This endpoint can be implemented later for server-side PDF generation
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    success: true,
    data: {
      reportUrl: "https://example.com/report.pdf",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  };
}

// ============================================
// 8. SETTINGS MANAGEMENT
// ============================================

export interface UserSettings {
  _id?: string;
  companyName: string;
  email: string;
  website: string;
  defaultProduct: string;
  defaultRegion: string;
  llmProvider: string;
  llmApiKey: string;
  contentstackUrl: string;
  contentstackApiKey: string;
  contentstackToken: string;
  testFrequency: number;
  maxQuestions: number;
  notifications: {
    weeklyReports: boolean;
    brokenLinkAlerts: boolean;
    competitorUpdates: boolean;
    scoreImprovementAlerts: boolean;
  };
  alertThresholds: {
    scoreDrop: number;
    mentionDrop: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Get user settings
 */
export async function getSettings(): Promise<ApiResponse<UserSettings>> {
  return apiRequest<UserSettings>("/settings");
}

/**
 * Update user settings
 */
export async function updateSettings(
  settings: Partial<UserSettings>
): Promise<ApiResponse<UserSettings>> {
  return apiRequest<UserSettings>("/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}

/**
 * Reset settings to default
 */
export async function resetSettings(): Promise<ApiResponse<UserSettings>> {
  return apiRequest<UserSettings>("/settings/reset", {
    method: "POST",
  });
}

// Export all functions
// ============================================
// 9. NOTIFICATIONS
// ============================================

export interface Notification {
  _id: string;
  userId: string;
  type:
    | "profile_created"
    | "analysis_complete"
    | "score_improvement"
    | "score_drop"
    | "competitor_update"
    | "broken_link"
    | "questions_generated"
    | "report_ready"
    | "system"
    | "warning"
    | "error";
  title: string;
  message: string;
  profileId?: string;
  profileName?: string;
  metadata: any;
  isRead: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

/**
 * Get all notifications
 */
export async function getNotifications(
  limit = 50,
  skip = 0,
  unreadOnly = false
): Promise<ApiResponse<NotificationsResponse>> {
  return apiRequest<NotificationsResponse>(
    `/notifications?limit=${limit}&skip=${skip}&unreadOnly=${unreadOnly}`
  );
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<
  ApiResponse<{ count: number }>
> {
  return apiRequest<{ count: number }>("/notifications/unread-count");
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  id: string
): Promise<ApiResponse<Notification>> {
  return apiRequest<Notification>(`/notifications/${id}/read`, {
    method: "PUT",
  });
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<
  ApiResponse<{ modifiedCount: number }>
> {
  return apiRequest<{ modifiedCount: number }>("/notifications/read-all", {
    method: "PUT",
  });
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>(`/notifications/${id}`, {
    method: "DELETE",
  });
}

/**
 * Delete all notifications
 */
export async function deleteAllNotifications(): Promise<
  ApiResponse<{ deletedCount: number }>
> {
  return apiRequest<{ deletedCount: number }>("/notifications", {
    method: "DELETE",
  });
}

// ============================================
// 10. LLM.TXT GENERATOR
// ============================================

export interface LLMTextResponse {
  content: string;
  filename: string;
  generatedAt: string;
}

/**
 * Generate llm.txt file for a profile
 */
export async function generateLLMText(
  profileId: string
): Promise<ApiResponse<LLMTextResponse>> {
  return apiRequest<LLMTextResponse>("/llm-text/generate", {
    method: "POST",
    body: JSON.stringify({ profileId }),
  });
}

export default {
  createProfile,
  getProfiles,
  getProfile,
  updateProfile,
  deleteProfile,
  generateProducts,
  generateQuestionsAndCompetitors,
  runAnalysis,
  getOptimizationRecommendations,
  runSEOHealthCheck,
  generateReport,
  getSettings,
  updateSettings,
  resetSettings,
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  generateLLMText,
};

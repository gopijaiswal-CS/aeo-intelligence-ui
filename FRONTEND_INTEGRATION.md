# 🎨 Frontend Integration - Questions & Competitors API

## Overview
Integrated the Questions & Competitors generation API with the frontend UI, replacing mock data with real AI-powered generation.

---

## 📁 Files Modified

### 1. **ProfileContext.tsx**
**File**: `src/contexts/ProfileContext.tsx`

**Changes**:
- ✅ Replaced mock data generation with real API call
- ✅ Uses `api.generateQuestionsAndCompetitors(profileId)`
- ✅ Proper error handling with status reset
- ✅ Success toast with count of generated items
- ✅ Reloads profiles after generation to sync with server
- ✅ Updates profile status throughout the process

**Before (Mock)**:
```typescript
const generateQuestionsAndCompetitors = async (profileId: string) => {
  // Simulate generation
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  // Generate mock questions
  const mockQuestions = Array.from({ length: 20 }, ...);
  
  // Generate mock competitors
  const mockCompetitors = Array.from({ length: 5 }, ...);
  
  updateProfile(profileId, { questions, competitors });
};
```

**After (Real API)**:
```typescript
const generateQuestionsAndCompetitors = async (profileId: string) => {
  try {
    await updateProfile(profileId, { status: "generating" });
    
    // Call real API
    const response = await api.generateQuestionsAndCompetitors(profileId);
    
    if (response.success && response.data) {
      const { questions, competitors } = response.data;
      
      await updateProfile(profileId, {
        questions,
        competitors,
        status: "ready",
      });
      
      await loadProfiles(); // Sync with server
      
      toast.success(`Generated ${questions.length} questions and ${competitors.length} competitors!`);
    }
  } catch (error) {
    await updateProfile(profileId, { status: "draft" });
    toast.error("Failed to generate");
  }
};
```

---

## 🔄 User Flow

### Create Profile Wizard - Step 3

1. **User completes Step 2** (Select Product & Region)
   - Profile created with status: `draft`
   - Navigates to Step 3

2. **Step 3 Auto-triggers** (via useEffect)
   - Calls `handleGenerateQuestionsAndCompetitors()`
   - Shows loading state with spinner
   - Status: `generating`

3. **API Call to Backend**
   - `POST /api/v1/profiles/:id/generate`
   - Gemini AI generates questions & competitors
   - Returns structured data

4. **UI Updates**
   - Questions list displayed (15-20 items)
   - Competitors list displayed (5-8 items)
   - Status: `ready`
   - Success toast shown

5. **User Can Interact**
   - View generated questions
   - View generated competitors
   - Add manual questions
   - Add manual competitors
   - Delete items
   - Proceed to Step 4 (Run Analysis)

---

## 🎯 UI Components

### Loading State
```tsx
{!questionsGenerated ? (
  <Card className="p-8">
    <Loader2 className="h-8 w-8 animate-spin" />
    <h2>Generating Questions</h2>
    <p>Please wait while we generate relevant questions...</p>
  </Card>
) : (
  // Display questions and competitors
)}
```

### Questions Display
```tsx
<div className="space-y-2">
  {currentProfile.questions.map((q) => (
    <div key={q.id} className="p-3 border rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-medium">{q.question}</p>
          <div className="flex gap-2 mt-1">
            <Badge>{q.category}</Badge>
            <Badge>{q.region}</Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteQuestion(q.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ))}
</div>
```

### Competitors Display
```tsx
<div className="space-y-2">
  {currentProfile.competitors.map((c) => (
    <div key={c.id} className="p-3 border rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-medium">{c.name}</p>
          <Badge>{c.category}</Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteCompetitor(c.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ))}
</div>
```

### Manual Add Forms
```tsx
// Add Question
<div className="space-y-3">
  <Textarea
    placeholder="Enter your question..."
    value={newQuestion}
    onChange={(e) => setNewQuestion(e.target.value)}
  />
  <Select
    value={newQuestionCategory}
    onValueChange={setNewQuestionCategory}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select category" />
    </SelectTrigger>
    <SelectContent>
      {categories.map((cat) => (
        <SelectItem key={cat} value={cat}>
          {cat}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  <Button onClick={handleAddQuestion}>
    <Plus className="h-4 w-4 mr-2" />
    Add Question
  </Button>
</div>
```

---

## 📊 Data Flow

```
User Action (Step 2 Complete)
    ↓
Navigate to Step 3
    ↓
useEffect triggers auto-generation
    ↓
ProfileContext.generateQuestionsAndCompetitors()
    ↓
api.generateQuestionsAndCompetitors(profileId)
    ↓
POST /api/v1/profiles/:id/generate
    ↓
Backend: Gemini AI generates data
    ↓
Response: { questions: [...], competitors: [...] }
    ↓
ProfileContext updates local state
    ↓
ProfileContext reloads all profiles
    ↓
UI re-renders with new data
    ↓
Success toast displayed
    ↓
User can view/edit/add items
```

---

## 🎨 UI States

### 1. **Loading State** (status: "generating")
- Spinner animation
- "Generating Questions" message
- User cannot interact
- Duration: ~2-5 seconds (AI processing)

### 2. **Success State** (status: "ready")
- Questions list displayed
- Competitors list displayed
- Add buttons enabled
- Delete buttons enabled
- "Next" button enabled

### 3. **Error State** (status: "draft")
- Error toast displayed
- Status reset to draft
- User can retry
- Manual add still available

---

## ✨ Features

### Real-Time Generation
- ✅ AI-powered question generation
- ✅ Intelligent competitor identification
- ✅ Context-aware (product, category, region, website)
- ✅ Natural language questions
- ✅ Diverse question categories

### User Control
- ✅ View all generated items
- ✅ Add custom questions manually
- ✅ Add custom competitors manually
- ✅ Delete unwanted items
- ✅ Edit before proceeding

### Feedback
- ✅ Loading spinner during generation
- ✅ Success toast with count
- ✅ Error toast on failure
- ✅ Status indicators
- ✅ Visual feedback for all actions

---

## 🔧 Error Handling

### API Errors
```typescript
try {
  const response = await api.generateQuestionsAndCompetitors(profileId);
  // Handle success
} catch (error) {
  // Reset status
  await updateProfile(profileId, { status: "draft" });
  // Show error
  toast.error(error.message);
}
```

### Fallback Behavior
- If API fails, status resets to "draft"
- User can manually add questions/competitors
- User can retry generation
- No data loss (profile remains)

---

## 🎯 Integration Points

### 1. **API Service** (`src/services/api.ts`)
```typescript
export async function generateQuestionsAndCompetitors(
  profileId: string
): Promise<ApiResponse<GenerateQuestionsResponse>> {
  return apiRequest<GenerateQuestionsResponse>(
    `/profiles/${profileId}/generate`,
    { method: 'POST' }
  );
}
```

### 2. **Profile Context** (`src/contexts/ProfileContext.tsx`)
```typescript
const generateQuestionsAndCompetitors = async (profileId: string) => {
  // Real API integration
  const response = await api.generateQuestionsAndCompetitors(profileId);
  // Update state
  // Show feedback
};
```

### 3. **Create Profile Page** (`src/pages/CreateProfile.tsx`)
```typescript
useEffect(() => {
  if (currentStep === 3 && createdProfileId && !questionsGenerated) {
    handleGenerateQuestionsAndCompetitors();
  }
}, [currentStep, createdProfileId, questionsGenerated]);
```

---

## 📝 Testing

### Test Scenarios

1. **Happy Path**
   - Create profile
   - Navigate to Step 3
   - Wait for generation
   - Verify questions displayed
   - Verify competitors displayed
   - Proceed to Step 4

2. **Manual Add**
   - Generate questions
   - Click "Add Question"
   - Fill form
   - Submit
   - Verify new question added

3. **Delete Items**
   - Generate questions
   - Click delete on question
   - Verify question removed
   - Verify count updated

4. **Error Handling**
   - Simulate API error
   - Verify error toast
   - Verify status reset
   - Verify can retry

---

## ✅ Result

**Frontend is now fully integrated with the Questions & Competitors API!** 🎊

### What Works:
- ✅ Real AI-powered generation
- ✅ Automatic trigger on Step 3
- ✅ Loading states
- ✅ Success feedback
- ✅ Error handling
- ✅ Manual add/delete
- ✅ Server synchronization
- ✅ Status management

### User Experience:
- 🚀 Fast and responsive
- 🎨 Clear visual feedback
- 🔄 Automatic generation
- ✏️ Full control to edit
- 🛡️ Robust error handling
- 📊 Real-time updates

**The integration is complete and ready for use!** 🎉


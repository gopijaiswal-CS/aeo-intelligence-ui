# Duplicate Competitors Fix

## Problem
The "Top Competitors" section was showing duplicate entries (e.g., "Kite" appearing 3 times), causing confusion and incorrect data display.

## Root Cause
When the analysis completed, the backend was setting `profile.competitors = analysisResult.competitorAnalysis`. However, `competitorAnalysis` contains **both** competitors AND the user's product (with `isUserProduct: true` flag). This was overwriting the `profile.competitors` array with an array that incorrectly included the user's product.

### The Issue Flow
1. Initial state: `profile.competitors` = [Competitor1, Competitor2, Competitor3, ...]
2. Analysis runs and creates: `competitorAnalysis` = [UserProduct (isUserProduct: true), Competitor1, Competitor2, ...]
3. Backend overwrites: `profile.competitors = competitorAnalysis` (❌ includes user product!)
4. UI displays: Top Competitors shows [UserProduct, Competitor1, Competitor2, ...]
5. Result: User's product name appears in competitors list, potentially multiple times

## Solutions Applied

### 1. Backend: Filter Out User's Product
Modified `backend/src/controllers/profileController.js` to exclude the user's product when updating the competitors array:

```javascript
// Update competitor data (exclude user's product)
if (analysisResult.competitorAnalysis) {
  // Filter out user's product from competitor list
  profile.competitors = analysisResult.competitorAnalysis.filter(item => !item.isUserProduct);
}
```

### 2. Enhanced Logging
Added detailed logging to verify no duplicates:

```javascript
// Log competitor names to verify no duplicates
if (profile.competitors && profile.competitors.length > 0) {
  console.log('\n📋 Competitors saved:');
  profile.competitors.forEach((comp, idx) => {
    console.log(`  ${idx + 1}. ${comp.name} (Rank #${comp.rank})`);
  });
}
```

### 3. Frontend: Improved React Keys
Updated `src/pages/ProfileAnalysis.tsx` to use unique keys for competitor list items, preventing React rendering issues:

**Before:**
```typescript
{profile.competitors.slice(0, 3).map((competitor) => (
  <div key={competitor.id}>  // ❌ Numeric IDs can be duplicate
```

**After:**
```typescript
{profile.competitors.slice(0, 3).map((competitor, index) => (
  <div key={competitor._id || competitor.id || `competitor-${index}`}>  // ✅ Unique MongoDB ID or fallback
```

This change was applied to both locations:
- Main "Top Competitors" section (line 578)
- LLM details modal competitors list (line 1119)

### 4. TypeScript Type Updates
Updated `src/contexts/ProfileContext.tsx` to include optional `_id` and `isUserProduct` fields:

```typescript
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
```

### 5. Fixed API Function Signatures
Corrected `src/services/api.ts` function signatures to match backend expectations:

**Before:**
```typescript
export async function generateQuestionsAndCompetitors(
  profileId: string,
  data: { productName: string; category: string; region: string }  // ❌ Unnecessary
)

export async function runAnalysis(
  profileId: string,
  data: { questions: Question[]; competitors: Competitor[] }  // ❌ Unnecessary
)
```

**After:**
```typescript
export async function generateQuestionsAndCompetitors(
  profileId: string  // ✅ Backend gets data from profile
): Promise<ApiResponse<GenerateQuestionsResponse>>

export async function runAnalysis(
  profileId: string  // ✅ Backend gets data from profile
): Promise<ApiResponse<Profile>>
```

## How It Works Now

### Data Separation
- **`profile.competitors`**: Contains ONLY competitors (no user product)
  - Used in "Top Competitors" section
  - Used in LLM details modal
- **`profile.analysisResult.competitorAnalysis`**: Contains BOTH user product AND competitors
  - Used in "Competitor Comparison" modal
  - Each item has `isUserProduct` flag for identification

### Expected Behavior
1. User runs analysis
2. Backend generates `competitorAnalysis` with 6 items (1 user product + 5 competitors)
3. Backend filters and saves:
   - `profile.competitors` = 5 competitors only
   - `profile.analysisResult.competitorAnalysis` = all 6 items
4. Frontend displays:
   - "Top Competitors" section: Shows 3 competitors (no user product)
   - "Competitor Comparison" modal: Shows all 6 items with user product highlighted

### Backend Logs Example
After running analysis, you should see:

```
📋 Competitors saved:
  1. Zerodha (Rank #2)
  2. Upstox (Rank #3)
  3. Angel One (Rank #4)
  4. Groww (Rank #5)
  5. ICICI Direct (Rank #6)
```

Note: User's product (e.g., "Kite") is NOT in this list, even if it has Rank #1.

## Files Modified
- ✅ `backend/src/controllers/profileController.js` - Filter user product from competitors
- ✅ `src/pages/ProfileAnalysis.tsx` - Improved React keys
- ✅ `src/contexts/ProfileContext.tsx` - Updated Competitor interface
- ✅ `src/services/api.ts` - Fixed function signatures
- ✅ Backend server restarted

## Testing
To verify the fix:
1. Run a new analysis or re-run an existing profile
2. Check "Top Competitors" section - should show only actual competitors (no duplicates, no user product)
3. Check backend logs - should list competitors without user product
4. Click "View Detailed Comparison" - should show chart with user product highlighted and separated

## No More Duplicates! ✅
The "Top Competitors" section will now correctly display only the actual competitors, without the user's product appearing in the list.


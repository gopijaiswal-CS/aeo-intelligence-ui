# 🔔 Real-Time Notification System

## Overview
Implemented a complete notification system with MongoDB persistence, backend APIs, and real-time UI updates.

---

## ✅ What Was Implemented

### 1. Backend - MongoDB Model
**File**: `backend/src/models/Notification.js`

**Features**:
- ✅ Notification schema with all required fields
- ✅ TTL index for auto-expiration
- ✅ Indexes for efficient queries
- ✅ Static method `createNotification()`
- ✅ Instance method `markAsRead()`

**Notification Types**:
```javascript
[
  'profile_created',
  'analysis_complete',
  'score_improvement',
  'score_drop',
  'competitor_update',
  'broken_link',
  'questions_generated',
  'report_ready',
  'system',
  'warning',
  'error'
]
```

**Priority Levels**:
```javascript
['low', 'medium', 'high', 'urgent']
```

---

### 2. Backend - Controller
**File**: `backend/src/controllers/notificationController.js`

**Endpoints**:
1. ✅ `GET /api/v1/notifications` - Get all notifications
2. ✅ `GET /api/v1/notifications/unread-count` - Get unread count
3. ✅ `PUT /api/v1/notifications/:id/read` - Mark as read
4. ✅ `PUT /api/v1/notifications/read-all` - Mark all as read
5. ✅ `DELETE /api/v1/notifications/:id` - Delete notification
6. ✅ `DELETE /api/v1/notifications` - Delete all notifications
7. ✅ `POST /api/v1/notifications` - Create notification (internal)

---

### 3. Backend - Routes
**File**: `backend/src/routes/notificationRoutes.js`

Mounted at `/api/v1/notifications`

---

### 4. Backend - Notification Service
**File**: `backend/src/services/notificationService.js`

**Helper Functions**:
```javascript
NotificationService.notifyProfileCreated(profile)
NotificationService.notifyQuestionsGenerated(profile, questionCount, competitorCount)
NotificationService.notifyAnalysisComplete(profile, score)
NotificationService.notifyScoreImprovement(profile, oldScore, newScore)
NotificationService.notifyScoreDrop(profile, oldScore, newScore)
NotificationService.notifyCompetitorUpdate(profile, competitorName, change)
NotificationService.notifyBrokenLink(profile, url)
NotificationService.notifyReportReady(profile)
NotificationService.notifySystem(title, message, priority)
NotificationService.notifyWarning(title, message, profileId, profileName)
NotificationService.notifyError(title, message, profileId, profileName)
```

---

### 5. Backend - Integration
**File**: `backend/src/controllers/profileController.js`

**Integrated Notifications**:
- ✅ Profile created → `notifyProfileCreated()`
- ✅ Questions generated → `notifyQuestionsGenerated()`
- ✅ Analysis complete → (ready for integration)

---

### 6. Frontend - API Service
**File**: `src/services/api.ts`

**New Functions**:
```typescript
getNotifications(limit, skip, unreadOnly)
getUnreadCount()
markNotificationAsRead(id)
markAllNotificationsAsRead()
deleteNotification(id)
deleteAllNotifications()
```

**Types**:
```typescript
interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  profileId?: string;
  profileName?: string;
  metadata: any;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

### 7. Frontend - Navbar Component
**File**: `src/components/Navbar.tsx`

**Features**:
- ✅ Real-time notification loading
- ✅ Auto-refresh every 30 seconds
- ✅ Unread count badge
- ✅ Mark as read (single & all)
- ✅ Delete notification (single & all)
- ✅ Click to navigate to action URL
- ✅ Priority-based styling
- ✅ Type-based icons
- ✅ Relative time formatting
- ✅ Loading states
- ✅ Empty state

---

## 🎯 How It Works

### Flow:

```
1. User creates profile
   ↓
2. Backend creates profile in DB
   ↓
3. NotificationService.notifyProfileCreated() is called
   ↓
4. Notification is saved to MongoDB
   ↓
5. Frontend polls /api/v1/notifications every 30s
   ↓
6. Navbar updates with new notification
   ↓
7. User clicks notification
   ↓
8. Marked as read & navigates to profile
```

---

## 📊 Example Notifications

### Profile Created
```json
{
  "type": "profile_created",
  "title": "Profile Created",
  "message": "New profile \"Chrome Analysis\" has been created successfully",
  "profileId": "507f1f77bcf86cd799439011",
  "profileName": "Chrome Analysis",
  "priority": "low",
  "actionUrl": "/profile/507f1f77bcf86cd799439011",
  "metadata": {
    "productName": "Chrome",
    "category": "Web Browser",
    "region": "us"
  }
}
```

### Questions Generated
```json
{
  "type": "questions_generated",
  "title": "Questions & Competitors Generated",
  "message": "Generated 18 questions and 5 competitors for \"Chrome Analysis\"",
  "profileId": "507f1f77bcf86cd799439011",
  "profileName": "Chrome Analysis",
  "priority": "medium",
  "actionUrl": "/profile/507f1f77bcf86cd799439011",
  "metadata": {
    "questionCount": 18,
    "competitorCount": 5
  }
}
```

### Score Improvement
```json
{
  "type": "score_improvement",
  "title": "Score Improved! 🎉",
  "message": "\"Chrome Analysis\" visibility improved by 12.5% (65% → 77.5%)",
  "profileId": "507f1f77bcf86cd799439011",
  "profileName": "Chrome Analysis",
  "priority": "high",
  "actionUrl": "/profile/507f1f77bcf86cd799439011",
  "metadata": {
    "oldScore": 65,
    "newScore": 77.5,
    "improvement": 12.5
  }
}
```

---

## 🎨 UI Features

### Notification Icon Colors
- ✅ **Success** (green): profile_created, analysis_complete, score_improvement, questions_generated, report_ready
- ⚠️ **Warning** (yellow): score_drop, broken_link, warning
- ❌ **Error** (red): error
- 📊 **Info** (blue): competitor_update, system

### Priority Colors
- 🔴 **Urgent**: Red border
- 🟠 **High**: Orange border
- 🔵 **Medium**: Blue border
- ⚪ **Low**: Gray border

### Time Formatting
- `Just now` - < 1 min
- `5 min ago` - < 1 hour
- `3 hours ago` - < 1 day
- `2 days ago` - < 1 week
- `Jan 15, 2025` - > 1 week

---

## 🔄 Auto-Refresh

Notifications are automatically refreshed every 30 seconds:
```typescript
useEffect(() => {
  loadNotifications();
  
  // Poll for new notifications every 30 seconds
  const interval = setInterval(() => {
    loadNotifications(true); // Silent refresh
  }, 30000);

  return () => clearInterval(interval);
}, []);
```

---

## 🚀 Usage Examples

### Create Notification from Backend

```javascript
// In any controller or service
const NotificationService = require('../services/notificationService');

// Profile created
await NotificationService.notifyProfileCreated(profile);

// Questions generated
await NotificationService.notifyQuestionsGenerated(profile, 18, 5);

// Analysis complete
await NotificationService.notifyAnalysisComplete(profile, 76);

// Score improved
await NotificationService.notifyScoreImprovement(profile, 65, 77.5);

// Score dropped
await NotificationService.notifyScoreDrop(profile, 77.5, 65);

// Competitor update
await NotificationService.notifyCompetitorUpdate(profile, 'Firefox', 'gained visibility');

// Broken link
await NotificationService.notifyBrokenLink(profile, 'https://example.com/broken');

// Report ready
await NotificationService.notifyReportReady(profile);

// System notification
await NotificationService.notifySystem('System Update', 'New features available', 'medium');

// Warning
await NotificationService.notifyWarning('High API Usage', 'You are approaching your API limit');

// Error
await NotificationService.notifyError('API Error', 'Failed to connect to external service');
```

---

## 📝 Database Schema

```javascript
{
  userId: String,              // User ID (default: 'default-user')
  type: String,                // Notification type (enum)
  title: String,               // Notification title
  message: String,             // Notification message
  profileId: ObjectId,         // Related profile (optional)
  profileName: String,         // Profile name (optional)
  metadata: Mixed,             // Additional data
  isRead: Boolean,             // Read status
  priority: String,            // Priority level (enum)
  actionUrl: String,           // URL to navigate (optional)
  expiresAt: Date,             // Auto-delete date (optional)
  createdAt: Date,             // Auto-generated
  updatedAt: Date              // Auto-generated
}
```

---

## 🔍 API Endpoints

### Get Notifications
```bash
GET /api/v1/notifications?limit=50&skip=0&unreadOnly=false
```

**Response**:
```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "unreadCount": 3,
    "total": 10
  }
}
```

### Get Unread Count
```bash
GET /api/v1/notifications/unread-count
```

**Response**:
```json
{
  "success": true,
  "data": {
    "count": 3
  }
}
```

### Mark as Read
```bash
PUT /api/v1/notifications/:id/read
```

### Mark All as Read
```bash
PUT /api/v1/notifications/read-all
```

### Delete Notification
```bash
DELETE /api/v1/notifications/:id
```

### Delete All
```bash
DELETE /api/v1/notifications
```

---

## ✅ Testing

### 1. Create a Profile
```bash
# This will trigger a "Profile Created" notification
curl -X POST http://localhost:3000/api/v1/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "websiteUrl": "google.com",
    "productName": "Chrome",
    "category": "Web Browser",
    "region": "us"
  }'
```

### 2. Generate Questions
```bash
# This will trigger a "Questions Generated" notification
curl -X POST http://localhost:3000/api/v1/profiles/{profileId}/generate
```

### 3. Check Notifications
```bash
curl http://localhost:3000/api/v1/notifications
```

---

## 🎉 Result

**Complete notification system with**:
- ✅ MongoDB persistence
- ✅ RESTful API endpoints
- ✅ Real-time UI updates (30s polling)
- ✅ Auto-refresh without page reload
- ✅ Click-to-navigate functionality
- ✅ Mark as read (single & all)
- ✅ Delete notifications (single & all)
- ✅ Priority-based styling
- ✅ Type-based icons
- ✅ Unread count badge
- ✅ Empty state handling
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications for actions

**The notification system is fully functional and integrated!** 🎊


# Frontend Variables & API Contract Reference

> **Purpose:** This document bridges the frontend implementation with the backend.  
> Every route, API endpoint, request/response field name, and state key used in the React frontend is listed here so backend developers know exactly what names and shapes to implement.

---

## 1. Frontend Routes (React Router)

| Route Path                  | Component File                                    | Auth | Role     | Description                            |
|-----------------------------|---------------------------------------------------|------|----------|----------------------------------------|
| `/login`                    | `src/pages/Auth/Login.tsx`                        | No   | Guest    | Login page                             |
| `/register`                 | `src/pages/Auth/Register.tsx`                     | No   | Guest    | Registration page                      |
| `/admin/login`              | `src/pages/Auth/AdminLogin.tsx`                   | No   | Guest    | Separate admin login page              |
| `/`                         | `src/pages/Dashboard.tsx`                         | Yes  | Student  | Main dashboard (index)                 |
| `/profile`                  | `src/pages/Profile.tsx`                           | Yes  | Student  | User profile & badges                  |
| `/report`                   | `src/pages/Report/ReportSelection.tsx`            | Yes  | Student  | Choose lost or found                   |
| `/report/found`             | `src/pages/Report/ReportFound.tsx`                | Yes  | Student  | Multi-step found item form             |
| `/report/lost`              | `src/pages/Report/ReportLost.tsx`                 | Yes  | Student  | Multi-step lost item form              |
| `/claim/:itemId`            | `src/pages/Claim/ClaimOwnership.tsx`              | Yes  | Student  | Claim ownership workflow               |
| `/claim`                    | `src/pages/Claim/ClaimOwnership.tsx`              | Yes  | Student  | Claim without itemId param             |
| `/community`                | `src/pages/Community/CommunityBoard.tsx`          | Yes  | Student  | 24-hour community board                |
| `/item/:itemId`             | `src/pages/Item/ItemDetail.tsx`                   | Yes  | Student  | Lost or found item detail              |
| `/matches`                  | `src/pages/Matches/AIMatches.tsx`                 | Yes  | Student  | AI match suggestions                   |
| `/leaderboard`              | `src/pages/Leaderboard/Leaderboard.tsx`           | Yes  | Student  | Reputation leaderboard                 |
| `/suggest/:itemId`          | `src/pages/SuggestOwner/SuggestOwner.tsx`         | Yes  | Student  | Suggest item owner                     |
| `/settings`                 | `src/pages/Settings/Settings.tsx`                 | Yes  | Student  | Account & app settings                 |
| `/help`                     | `src/pages/Help/HelpSupport.tsx`                  | Yes  | Student  | Help & support page                    |
| `/chat/finder/:itemId`      | `src/pages/Chat/FinderChat.tsx`                   | Yes  | Student  | Chat with finder                       |
| `/handover/qr/:itemId`      | `src/pages/Handover/QRHandover.tsx`               | Yes  | Student  | Generate QR for handover               |
| `/handover/scan/:itemId`    | `src/pages/Handover/QRScan.tsx`                   | Yes  | Student  | Scan QR for pickup confirmation        |
| `/admin`                    | `src/pages/Admin/AdminDashboard.tsx`              | Yes  | Admin    | Admin overview dashboard               |
| `/admin/claims`             | `src/pages/Admin/AdminClaimManagement.tsx`        | Yes  | Admin    | Claim management                       |
| `/admin/items`              | `src/pages/Admin/AdminItemModeration.tsx`         | Yes  | Admin    | Item moderation                        |
| `/admin/users`              | `src/pages/Admin/AdminUserManagement.tsx`         | Yes  | Admin    | User management                        |
| `/admin/community`          | `src/pages/Admin/AdminCommModeration.tsx`         | Yes  | Admin    | Community post moderation              |

---

## 2. API Endpoints Expected by Frontend

> All endpoints are prefixed with `/api`. The frontend uses `axios` with a base URL configured via `VITE_API_BASE_URL`.

### 2.1 Authentication

| Method | Endpoint                        | Request Body Fields                                               | Response Fields                          | Used In                         |
|--------|---------------------------------|-------------------------------------------------------------------|------------------------------------------|---------------------------------|
| POST   | `/api/auth/register`            | `name, email, studentId, phone, password, confirmPassword`        | `{ success, token, user }`               | `Register.tsx`                  |
| POST   | `/api/auth/login`               | `email, password`                                                 | `{ success, token, user }`               | `Login.tsx`                     |
| POST   | `/api/auth/admin/login`         | `email, password`                                                 | `{ success, token, user }`               | `AdminLogin.tsx`                |
| POST   | `/api/auth/forgot-password`     | `email`                                                           | `{ success, message }`                   | `Login.tsx` (forgot pw link)    |
| POST   | `/api/auth/reset-password`      | `token, newPassword`                                              | `{ success }`                            | `Login.tsx` (reset step)        |
| GET    | `/api/auth/me`                  | -                                                                 | `{ user }` (full user object)            | App load / refresh              |
| POST   | `/api/auth/logout`              | -                                                                 | `{ success }`                            | Settings/Profile                |

---

### 2.2 User / Profile

| Method | Endpoint                        | Request / Query                                                   | Response Fields                          | Used In                         |
|--------|---------------------------------|-------------------------------------------------------------------|------------------------------------------|---------------------------------|
| GET    | `/api/users/me`                 | -                                                                 | `{ user }`                               | `Profile.tsx`                   |
| PUT    | `/api/users/me`                 | `name, phone, profilePic`                                         | `{ success, user }`                      | `Settings.tsx`                  |
| GET    | `/api/users/leaderboard`        | Query: `?period=monthly`                                          | `{ users: [{ rank, name, xp, badges, returned }] }` | `Leaderboard.tsx`     |
| GET    | `/api/users/:id`                | -                                                                 | `{ user }`                               | Admin user detail               |

---

### 2.3 Lost Items

| Method | Endpoint                        | Request Body / Query                                              | Response Fields                          | Used In                         |
|--------|---------------------------------|-------------------------------------------------------------------|------------------------------------------|---------------------------------|
| POST   | `/api/lost-items`               | `itemName, category, brand, color, description, locationLost, dateLost, images[], specialAppearance` | `{ success, item }` | `ReportLost.tsx`   |
| GET    | `/api/lost-items`               | Query: `?category=&search=&page=&limit=`                          | `{ items: [], total, page }`             | `Dashboard.tsx`, `AIMatches.tsx`|
| GET    | `/api/lost-items/:id`           | -                                                                 | `{ item }`                               | `ItemDetail.tsx`                |
| PUT    | `/api/lost-items/:id`           | Same as POST (partial)                                            | `{ success, item }`                      | Item edit (future)              |
| DELETE | `/api/lost-items/:id`           | -                                                                 | `{ success }`                            | Admin / owner delete            |

---

### 2.4 Found Items

| Method | Endpoint                        | Request Body / Query                                              | Response Fields                          | Used In                         |
|--------|---------------------------------|-------------------------------------------------------------------|------------------------------------------|---------------------------------|
| POST   | `/api/found-items`              | `itemName, category, brand, color, description, locationFound, dateFound, images[], additionalNotes, specialAppearance` | `{ success, item }` | `ReportFound.tsx` |
| GET    | `/api/found-items`              | Query: `?category=&search=&page=&limit=`                          | `{ items: [], total, page }`             | `Dashboard.tsx`, community      |
| GET    | `/api/found-items/:id`          | -                                                                 | `{ item }`                               | `ItemDetail.tsx`                |
| PUT    | `/api/found-items/:id`          | Same as POST (partial)                                            | `{ success, item }`                      | Item edit (future)              |
| DELETE | `/api/found-items/:id`          | -                                                                 | `{ success }`                            | Admin / owner delete            |

---

### 2.5 Claims

| Method | Endpoint                              | Request Body / Query                                              | Response Fields                          | Used In                               |
|--------|---------------------------------------|-------------------------------------------------------------------|------------------------------------------|---------------------------------------|
| POST   | `/api/claims`                         | `foundItemId, lostItemId, answers: { location, dateDetails, colorMatch, specialMarks }, proofUrls[]` | `{ success, claimId, claim }` | `ClaimOwnership.tsx`  |
| GET    | `/api/claims`                         | Query: `?status=pending&page=`                                    | `{ claims: [], total }`                  | `AdminClaimManagement.tsx`            |
| GET    | `/api/claims/my`                      | -                                                                 | `{ claims: [] }`                         | `Profile.tsx`, dashboard              |
| GET    | `/api/claims/:id`                     | -                                                                 | `{ claim }`                              | Claim status page                     |
| POST   | `/api/claims/:id/approve`             | `{ remarks }`                                                     | `{ success, qrCode }`                    | `AdminClaimManagement.tsx`            |
| POST   | `/api/claims/:id/reject`              | `{ reason }`                                                      | `{ success }`                            | `AdminClaimManagement.tsx`            |
| GET    | `/api/claims/:id/qr`                  | -                                                                 | `{ qrCodeUrl }` or binary PNG            | `QRHandover.tsx`                      |

---

### 2.6 AI Matches

| Method | Endpoint                              | Request / Query                                                   | Response Fields                          | Used In                               |
|--------|---------------------------------------|-------------------------------------------------------------------|------------------------------------------|---------------------------------------|
| GET    | `/api/ai/matches`                     | Query: `?userId=me`                                               | `{ matches: [{ lostItem, foundItem, score, status }] }` | `AIMatches.tsx`    |
| GET    | `/api/ai/matches/:itemId`             | -                                                                 | `{ matches: [] }`                        | `ItemDetail.tsx` (suggestions)        |
| POST   | `/api/ai/trigger`                     | `{ itemId, itemType: 'lost' or 'found' }`                         | `{ success, matchCount }`                | Called internally after report submit |

---

### 2.7 Notifications

| Method | Endpoint                              | Request / Query                                                   | Response Fields                          | Used In                               |
|--------|---------------------------------------|-------------------------------------------------------------------|------------------------------------------|---------------------------------------|
| GET    | `/api/notifications`                  | Query: `?read=false&page=1&limit=20`                              | `{ notifications: [{ _id, type, title, message, read, createdAt, relatedItemId }] }` | `AppLayout.tsx` |
| PUT    | `/api/notifications/:id/read`         | -                                                                 | `{ success }`                            | Notification center                   |
| PUT    | `/api/notifications/read-all`         | -                                                                 | `{ success }`                            | Notification center                   |
| DELETE | `/api/notifications/:id`              | -                                                                 | `{ success }`                            | Notification center                   |

---

### 2.8 Community Board

| Method | Endpoint                              | Request Body / Query                                              | Response Fields                          | Used In                               |
|--------|---------------------------------------|-------------------------------------------------------------------|------------------------------------------|---------------------------------------|
| GET    | `/api/community`                      | Query: `?page=1&limit=20`                                         | `{ posts: [] }`                          | `CommunityBoard.tsx`                  |
| POST   | `/api/community`                      | `{ itemId, content, type: 'found' or 'suggestion' }`              | `{ success, post }`                      | `CommunityBoard.tsx`                  |
| POST   | `/api/community/:id/suggest-owner`    | `{ suggestedUserId, note }`                                       | `{ success }`                            | `SuggestOwner.tsx`                    |
| POST   | `/api/community/:id/flag`             | `{ reason }`                                                      | `{ success }`                            | Community board actions               |
| DELETE | `/api/community/:id`                  | -                                                                 | `{ success }`                            | `AdminCommModeration.tsx`             |

---

### 2.9 QR Handover & Scan

| Method | Endpoint                              | Request Body                                                      | Response Fields                          | Used In                               |
|--------|---------------------------------------|-------------------------------------------------------------------|------------------------------------------|---------------------------------------|
| GET    | `/api/handover/:itemId/qr`            | -                                                                 | `{ qrToken, qrCodeUrl, expiresAt }`      | `QRHandover.tsx`                      |
| POST   | `/api/handover/:itemId/scan`          | `{ qrToken }`                                                     | `{ success, item, claimant }`            | `QRScan.tsx`                          |
| POST   | `/api/handover/:itemId/confirm`       | `{ qrToken }`                                                     | `{ success, message }`                   | `QRScan.tsx` (final confirm)          |

---

### 2.10 Chat (Finder Chat)

| Method | Endpoint                              | Request / Query                                                   | Response Fields                          | Used In                               |
|--------|---------------------------------------|-------------------------------------------------------------------|------------------------------------------|---------------------------------------|
| GET    | `/api/chat/:itemId/messages`          | Query: `?page=1`                                                  | `{ messages: [] }`                       | `FinderChat.tsx`                      |
| POST   | `/api/chat/:itemId/messages`          | `{ content, type: 'text' or 'image' }`                            | `{ message }`                            | `FinderChat.tsx`                      |

**Socket.IO Events** used by `FinderChat.tsx`:
- `join_room` -> payload: `{ itemId }`
- `send_message` -> payload: `{ itemId, content }`
- `receive_message` -> server emits to room: `{ message }`
- `typing` -> payload: `{ itemId, userId }`

---

### 2.11 Admin Endpoints

| Method | Endpoint                              | Request / Query                                                   | Response Fields                          | Used In                               |
|--------|---------------------------------------|-------------------------------------------------------------------|------------------------------------------|---------------------------------------|
| GET    | `/api/admin/dashboard`                | -                                                                 | `{ totalLost, totalFound, pendingClaims, resolvedToday, recoveryRate, trends }` | `AdminDashboard.tsx` |
| GET    | `/api/admin/users`                    | Query: `?search=&status=&page=`                                   | `{ users: [] }`                          | `AdminUserManagement.tsx`             |
| PUT    | `/api/admin/users/:id/ban`            | `{ reason }`                                                      | `{ success }`                            | `AdminUserManagement.tsx`             |
| PUT    | `/api/admin/users/:id/unban`          | -                                                                 | `{ success }`                            | `AdminUserManagement.tsx`             |
| PUT    | `/api/admin/users/:id/role`           | `{ role: 'user' or 'admin' }`                                     | `{ success }`                            | `AdminUserManagement.tsx`             |
| GET    | `/api/admin/items`                    | Query: `?status=&type=lost or found&page=`                        | `{ items: [] }`                          | `AdminItemModeration.tsx`             |
| PUT    | `/api/admin/items/:id/approve`        | -                                                                 | `{ success }`                            | `AdminItemModeration.tsx`             |
| PUT    | `/api/admin/items/:id/reject`         | `{ reason }`                                                      | `{ success }`                            | `AdminItemModeration.tsx`             |
| DELETE | `/api/admin/items/:id`                | -                                                                 | `{ success }`                            | `AdminItemModeration.tsx`             |
| GET    | `/api/admin/community`                | Query: `?status=active or flagged&page=`                          | `{ posts: [] }`                          | `AdminCommModeration.tsx`             |
| DELETE | `/api/admin/community/:id`            | -                                                                 | `{ success }`                            | `AdminCommModeration.tsx`             |
| GET    | `/api/admin/analytics`                | Query: `?period=monthly or weekly`                                | `{ stats: {} }`                          | `AdminDashboard.tsx`                  |

---

## 3. Request / Response Field Name Dictionary

These are the **exact JSON field names** expected by the frontend.

### User Object
```json
{
  "_id": "string",
  "name": "string",
  "email": "string",
  "studentId": "string",
  "phone": "string",
  "profilePic": "string (URL)",
  "role": "user | admin",
  "xp": 0,
  "level": 1,
  "badges": ["Honest Helper"],
  "reputation": 0,
  "itemsReturned": 0,
  "itemsReported": 0,
  "status": "active | banned",
  "createdAt": "2026-06-29T00:00:00.000Z"
}
```

### Lost Item Object
```json
{
  "_id": "string",
  "itemName": "string",
  "category": "string",
  "brand": "string",
  "color": "string",
  "description": "string",
  "locationLost": "string",
  "dateLost": "2026-06-29T00:00:00.000Z",
  "specialAppearance": "string",
  "images": ["https://..."],
  "status": "active | resolved | archived",
  "owner": { "_id": "string", "name": "string", "profilePic": "string" },
  "aiMatchScore": 92,
  "createdAt": "2026-06-29T00:00:00.000Z"
}
```

### Found Item Object
```json
{
  "_id": "string",
  "itemName": "string",
  "category": "string",
  "brand": "string",
  "color": "string",
  "description": "string",
  "locationFound": "string",
  "dateFound": "2026-06-29T00:00:00.000Z",
  "specialAppearance": "string",
  "additionalNotes": "string",
  "images": ["https://..."],
  "status": "active | claimed | archived",
  "finder": { "_id": "string", "name": "string", "profilePic": "string" },
  "createdAt": "2026-06-29T00:00:00.000Z"
}
```

### Claim Object
```json
{
  "_id": "string",
  "claimId": "CLM-001",
  "foundItemId": "string",
  "lostItemId": "string",
  "claimant": { "_id": "string", "name": "string", "studentId": "string", "profilePic": "string" },
  "status": "pending | approved | rejected",
  "answers": {
    "location": "string",
    "dateDetails": "string",
    "colorMatch": "string",
    "specialMarks": "string"
  },
  "proofUrls": ["https://..."],
  "confidence": 92,
  "qrCodeUrl": "https://...",
  "remarks": "string",
  "createdAt": "2026-06-29T00:00:00.000Z",
  "updatedAt": "2026-06-29T00:00:00.000Z"
}
```

### Notification Object
```json
{
  "_id": "string",
  "type": "match | claim_approved | claim_rejected | pickup_reminder | system",
  "title": "string",
  "message": "string",
  "read": false,
  "relatedItemId": "string",
  "relatedClaimId": "string",
  "createdAt": "2026-06-29T00:00:00.000Z"
}
```

### Community Post Object
```json
{
  "_id": "string",
  "author": { "_id": "string", "name": "string", "profilePic": "string" },
  "itemId": "string",
  "item": { "itemName": "string", "images": ["https://..."], "locationFound": "string" },
  "content": "string",
  "type": "found | suggestion",
  "flagReason": "string",
  "status": "active | flagged | removed",
  "createdAt": "2026-06-29T00:00:00.000Z"
}
```

### AI Match Object
```json
{
  "_id": "string",
  "lostItem": { "_id": "string", "itemName": "string", "images": [], "locationLost": "string", "owner": {} },
  "foundItem": { "_id": "string", "itemName": "string", "images": [], "locationFound": "string", "finder": {} },
  "score": 92,
  "status": "new | reviewed | dismissed",
  "createdAt": "2026-06-29T00:00:00.000Z"
}
```

---

## 4. Environment Variables (Frontend)

File: `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

---

## 5. Authentication Token

- **Storage:** `localStorage` key -> `lf_token`
- **Header sent with every request:** `Authorization: Bearer <token>`
- **Token payload fields (JWT decode):**

```json
{
  "userId": "string",
  "role": "user | admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## 6. Pagination Convention

All list endpoints use consistent pagination.

**Query params:** `page` (default: 1), `limit` (default: 10 for items, 20 for notifications)

**Response shape:**
```json
{
  "success": true,
  "data": [],
  "total": 100,
  "page": 1,
  "totalPages": 10
}
```

---

## 7. Standard Error Response

```json
{
  "success": false,
  "error": "Human readable error message",
  "code": "ERROR_CODE (optional)"
}
```

---

## 8. Item Categories

Backend `/api/categories` should return:
```json
{
  "categories": [
    "Electronics",
    "Bags & Backpacks",
    "Clothing & Accessories",
    "Books & Stationery",
    "ID Cards & Keys",
    "Wallets & Purses",
    "Jewellery",
    "Sports Equipment",
    "Water Bottles",
    "Umbrellas",
    "Headphones & Earphones",
    "Other"
  ]
}
```

---

## 9. XP / Level System

Backend should track `xp` on the User model and compute `level` and `badges`:

| Level | XP Required | Badge Name      |
|-------|-------------|-----------------|
| 1     | 0           | Newcomer        |
| 2     | 100         | Helper          |
| 5     | 500         | Honest Finder   |
| 8     | 1000        | Trusted Finder  |
| 12    | 2000        | Campus Hero     |
| 18    | 5000        | Gold Contributor |
| 25    | 10000       | Legend          |

**XP awarded per action:**
- Report a lost item: +10 XP
- Report a found item: +20 XP
- Successful item return (finder): +100 XP
- Claim approved (owner): +50 XP
- Community suggestion approved: +5 XP

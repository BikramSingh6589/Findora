# Claim & Conflict Claim — Complete User Flow

> **Last Updated:** July 2026  
> **Scope:** Covers the full lifecycle of a regular Claim and a Conflict Claim, including all statuses, socket events, backend actions, and what each user sees at every step.

---

## Chat Window — Status Badges Explained

Every chat card in the **Messages** page (`/chats`) shows a colored badge. Here is exactly what each one means:

| Badge | Color | Meaning |
|-------|-------|---------|
| **OPEN** | 🟢 Green | Claim is pending — finder and claimant are actively chatting. No action taken yet. |
| **WAITING TO SCAN** | 🟡 Yellow/Warning | Finder has approved and resolved the claim. A QR code has been generated. Waiting for the physical in-person scan to complete the handover. |
| **RESOLVED** | 🟢 Green | QR was scanned successfully. Item has been fully handed over. The process is complete. |
| **ADMIN APPROVED** | 🔵 Blue/AI | Admin reviewed and approved the claim (via the Admin Claim Management dashboard). The item is moving to handover. |
| **REJECTED** | 🔴 Red | Admin or finder rejected the claim. The item is released back to `active` status on the community board. |

---

## Part 1 — Regular Claim Flow

This is the standard flow when someone sees an item on the Community Board and believes it's theirs.

---

### Stage 1: Claiming the Item (Community Board)

**Trigger:** User clicks **"Claim Item"** button on a found item card.

**What happens:**
1. Frontend calls `POST /api/found-items/{itemId}/lock`
2. Item gets a **10-minute lock** in the database (`lockedBy`, `lockedUntil` fields set)
3. The item card on the board shows **"In process..."** (disabled, grey button) to everyone else
4. Socket emits `item_locked` → all other users see the item is locked in real-time
5. User is navigated to `/claim/{itemId}` — the 3-step claim form

**Item status at this point:** `active` (unchanged — the lock is separate from the status)

---

### Stage 2: The 3-Step Claim Form (`/claim/{itemId}`)

**Step 1 — Verification:**
- User fills in: Where they lost it, date, time
- AI match score is calculated based on these answers vs. the found item

**Step 2 — Proof Upload:**
- User uploads photo evidence (receipts, photos of the item, etc.)
- Files are uploaded to Cloudinary

**Step 3 — Review & Submit:**
- User reviews all their answers
- Clicks **"Submit Claim"**

**On Submit → `POST /api/claims` (backend):**
1. A new `Claim` document is created: `status: 'pending'`
2. `FoundItem.status` → `'claimed'`
3. Lock fields are cleared (`lockedBy: null`, `lockedUntil: null`)
4. Socket emits `item_claimed` → Community Board updates in real-time
5. User is navigated to `/chat/finder/{claimId}`

**Item status at this point:** `claimed`  
**Claim status at this point:** `pending`

---

### Stage 3: Chat Between Finder & Claimant (`/chat/finder/{claimId}`)

**Who is in the chat:** The person who found the item (Finder) + the person who filed the claim (Claimant)

**Real-time socket room:** `claim:{claimId}`

**Chat badge shows:** 🟢 **OPEN**

**What the Finder sees (action buttons):**
- ✅ **Approve & Resolve** — Confirms the claimant is the real owner
- 🛡️ **Request Admin Mediation** — Escalates to admin if uncertain

**What the Claimant sees:**
- The chat interface to communicate with the finder
- Their claim status (pending, approved, etc.)

---

### Stage 4A: Finder Approves → `PUT /api/claims/{id}/resolve`

**Backend actions:**
1. `claim.status` → `'resolved'`
2. A unique **QR code** is generated (via UUID + Cloudinary)
3. QR expiry is set (default 24h, max 48h)
4. `FoundItem.status` stays `'claimed'` (physical handover not yet done)
5. Socket emits `claim_resolved` to the chat room — both users see QR code appear instantly

**Chat badge shows:** 🟡 **WAITING TO SCAN**

**What happens next:**
- Claimant meets the finder in person
- Finder scans or validates the QR code
- `PUT /api/claims/{id}/handover/confirm` is called
- Claim is fully completed

**Chat badge shows:** 🟢 **RESOLVED**

---

### Stage 4B: Finder Requests Admin Mediation → `PUT /api/claims/{id}/mediate`

**When used:** Finder is unsure if the claimant is legitimate, or there's a dispute about ownership.

**Backend actions:**
1. `claim.mediationRequested` → `true`
2. `claim.mediationStatus` → `'pending'`
3. Claim appears in Admin Dashboard under pending claims
4. Socket emits `mediation_status` to chat room

**Chat badge shows:** 🟢 **OPEN** (no visual change — waiting for admin)

**Admin then:**
- Reviews proof, answers, and chat history
- Clicks **Approve** → `POST /api/claims/{id}/approve`
  - `claim.status` → `'approved'`, `claim.mediationStatus` → `'approved'`
  - Email sent to claimant
  - Chat badge → 🔵 **ADMIN APPROVED**
- Clicks **Reject** → `POST /api/claims/{id}/reject`
  - `claim.status` → `'rejected'`
  - `FoundItem.status` → `'active'` (item released back to community)
  - Email sent to claimant
  - Chat badge → 🔴 **REJECTED**

---

## Part 2 — Conflict Claim Flow

This is a **separate flow** for when someone sees an item is already claimed by someone else, but believes *they* are the real owner.

> ⚠️ **Key distinction:** A conflict claim is NOT the same as a regular claim. It is a dispute filed against an already-claimed item. It goes directly to Admin — there is no direct finder-claimant chat for conflicts.

---

### Stage 1: Filing a Conflict (Community Board)

**Trigger:** The item is already `claimed`. Another user sees the **"Conflict This Claim"** button and clicks it.

**What happens:**
1. User is navigated to `/conflict/{itemId}` — the conflict claim form
2. User fills in their evidence (answers + proof photos)
3. Clicks **"Submit Conflict Claim"**

**On Submit → `POST /api/claims/conflict` (backend):**
1. A **new separate Claim** document is created with:
   - `mediationRequested: true`
   - `mediationStatus: 'pending'`
   - `status: 'pending'`
2. The **original claimant's** claim also gets flagged: `mediationRequested: true`
3. `FoundItem.status` → `'disputed'`
4. Socket emits `item_disputed` → Community Board updates in real-time

**Item status at this point:** `disputed`  
**Community Board button:** Shows disabled 🔴 **"Conflict in Process"** — nobody else can claim or conflict

---

### Stage 2: Admin Reviews the Conflict (Admin Panel)

**Location:** `/admin/conflicts` — Admin Conflict Resolution Dashboard

**What admin sees:**
- A card for every disputed item (only items with `FoundItem.status === 'disputed'`)
- Clicking a card opens the full conflict detail page: `/admin/conflicts/{itemId}`
- Shows both parties' claims side by side: evidence, confidence scores, answers

**Admin has two actions:**

---

### Stage 3A: Admin Initiates In-Person Handover

**Admin clicks "Initiate In-Person Handover"** → `POST /api/claims/conflict/{foundItemId}/initiate-handover`

**Backend actions:**
1. All mediation claims get status → `'pending_handover'`
2. A unique `CFL-XXXX` code is generated for each party
3. `FoundItem.status` → `'conflict_handover'`
4. **In-app notification sent to BOTH users** with their CFL code
   - Claimant: *"Bring the item to the admin office. Your code: CFL-XXXX"*
   - Conflict user: *"Come collect the item at the same time. Your code: CFL-XXXX"*
5. Admin conflict card shows **"Pending..."** status

**What users see:**
- Bell notification pops up instantly (real-time socket)
- Clicking the notification opens a **code modal** showing their `CFL-XXXX` code prominently

---

### Stage 3B: Admin Finalizes Handover (After In-Person Meeting)

**Admin clicks "Finalize Handover to [Name]"** for one of the two claimants → `POST /api/claims/conflict/{foundItemId}/resolve` with `{ winningClaimId: "..." }`

**Backend actions:**
1. **Winner's claim:** `status: 'resolved'`, `mediationStatus: 'approved'`
   - Notification: *"Conflict resolved in your favor!"*
2. **Loser's claim:** `status: 'rejected'`, `mediationStatus: 'rejected'`
   - Notification: *"Conflict resolved in favor of another claimant."*
3. `FoundItem.status` → `'resolved'`
4. Item **stays visible** on Community Board (with CLAIMED stamp) — does NOT disappear
5. Conflict card is removed from Admin Conflicts page

---

### Stage 3C: Admin Denies the Conflict

**Admin clicks "Deny Conflict Claim"** → `POST /api/claims/conflict/{foundItemId}/resolve` with `{ denyConflict: true }`

**Used when:** The conflict was found to be fraudulent or without merit.

**Backend actions:**
1. **Newest claim (conflict filer):** `status: 'rejected'`
   - Notification: *"Your conflict claim has been denied."*
2. **Original claimant's claim:** Restored to `status: 'approved'`, `mediationRequested: false`
   - Notification: *"The conflict was denied. Your original claim is valid."*
3. `FoundItem.status` → `'claimed'` (restored)
4. Item goes back to showing "Conflict This Claim" button (since it's claimed again)
5. Conflict card is removed from Admin Conflicts page

---

## Database Status Reference

### FoundItem.status values

| Value | Meaning | Community Board shows |
|-------|---------|----------------------|
| `active` | Available for claiming | "Claim Item" button |
| `claimed` | Someone has claimed it | "CLAIMED" stamp + "Conflict This Claim" button |
| `disputed` | A conflict has been filed | "Conflict in Process" (disabled) |
| `conflict_handover` | Admin initiated in-person handover | "Conflict in Process" (disabled) |
| `resolved` | Fully handed over / admin resolved | "CLAIMED" stamp (no actions) |
| `archived` | Removed from community | Hidden from board |

### Claim.status values

| Value | Meaning | Chat badge |
|-------|---------|-----------|
| `pending` | Waiting for finder to act | 🟢 OPEN |
| `approved` | Admin approved | 🔵 ADMIN APPROVED |
| `resolved` | Finder approved + QR generated | 🟡 WAITING TO SCAN (if qrToken exists) / 🟢 RESOLVED |
| `rejected` | Rejected by finder or admin | 🔴 REJECTED |

### Claim.mediationStatus values

| Value | Meaning |
|-------|---------|
| `pending` | Mediation requested, admin not yet acted |
| `approved` | Admin approved the mediation |
| `rejected` | Admin denied the mediation |
| `pending_handover` | Admin has initiated in-person handover |

---

## Socket Events Reference

| Event | Direction | Trigger | Effect on UI |
|-------|-----------|---------|--------------|
| `item_locked` | Server → All | Item locked for claiming | Card shows "In process..." |
| `item_unlocked` | Server → All | Lock expired/cancelled | Card shows "Claim Item" again |
| `item_claimed` | Server → All | Claim submitted | Card shows CLAIMED stamp |
| `item_disputed` | Server → All | Conflict filed | Card shows "Conflict in Process" |
| `conflict_resolved` | Server → All | Admin resolved conflict | Card updates |
| `claim_resolved` | Server → Chat room | Finder approved | QR code appears in chat |
| `claim_rejected` | Server → Chat room | Admin/finder rejected | Rejection message in chat |
| `new_notification` | Server → User room | Any notification | Toast popup + bell count |
| `receive_message` | Server → Chat room | Message sent | Message appears in chat |

---

## Key Rules & Constraints

1. **A finder cannot claim their own item** — enforced in backend
2. **A user can only file one claim per item** — enforced in backend
3. **A conflict can only be filed on a `claimed` item** — enforced in backend
4. **Item lock expires in 10 minutes** — if user abandons the form, lock releases automatically
5. **QR codes expire in 24–48 hours** — enforced at scan time
6. **Only admin can resolve conflicts** — conflict parties do NOT have a direct chat with each other
7. **Original claim chat remains visible** even after a conflict is filed

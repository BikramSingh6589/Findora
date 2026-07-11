# Item Database Structure & Status Flow

> **Last Updated:** July 2026  
> **Scope:** Explains what "items" are in the database, which collections hold them, all their status values, and how each status is shown across the UI.

---

## There Is No Generic "Items" Table

There are **two separate MongoDB collections** — not one. They are distinct because the data structure and purpose differ between found and lost items.

| MongoDB Collection | Mongoose Model File | Created When |
|---|---|---|
| `founditems` | `FoundItem.ts` | Someone finds an item and reports it via "Report Found Item" |
| `lostitems` | `LostItem.ts` | Someone loses an item and reports it via "Report Lost Item" |

---

## How Item Detail Page Works (`/item/{itemId}`)

When user clicks any card on the Community Board, it navigates to `/item/{itemId}`.

**`ItemDetail.tsx` tries BOTH collections in sequence:**

```
Step 1 → GET /api/found-items/{itemId}
         ✅ 200 OK  → use this data (mark itemType: 'found')
         ❌ 404     → try next

Step 2 → GET /api/lost-items/{itemId}
         ✅ 200 OK  → use this data (mark itemType: 'lost')
         ❌ 404     → show "Item not found" error screen
```

This allows a single URL `/item/{id}` to work for both found and lost items seamlessly.

---

## FoundItem Schema Fields

```ts
finder:            ObjectId → User who found and reported this item
itemName:          String   → Name of the item
category:          String   → Electronics, Fashion, Keys, Cards & IDs, etc.
brand:             String   → Optional brand
color:             String   → Colour of the item
description:       String   → Full description
locationFound:     String   → Where the item was found
lastSeen:          String   → Optional last seen note
dateFound:         Date     → When it was found
specialAppearance: String   → Unique identifying marks
additionalNotes:   String   → Extras
images:            [String] → Array of Cloudinary image URLs
status:            String   → See status table below
lockedBy:          ObjectId → Who currently has a 10-min claim lock
lockedUntil:       Date     → When that lock expires
adminResolved:     Boolean  → Whether admin was involved in resolution
linkedLostItem:    ObjectId → Optional link to a matching LostItem
aiData:            Object   → Extracted text, keywords, identifiers from AI processing
```

---

## FoundItem — All Status Values

| Status | When it is set | What it means |
|---|---|---|
| `active` | On item creation | Item is available — anyone can claim it |
| `claimed` | When a claim is submitted (`POST /api/claims`) | Item is reserved for a claimant — direct claim process in progress |
| `disputed` | When a second person files a conflict claim | Two people are claiming the same item — admin must step in |
| `conflict_handover` | Admin clicks "Initiate In-Person Handover" | Admin has summoned both parties with CFL codes — physical meeting pending |
| `resolved` | Admin finalizes handover OR QR scan completes | Item has been fully returned to its owner |
| `archived` | Manual admin action | Item removed from community — no longer visible |

---

## How Status Shows in Each UI Location

### 1. Community Board Card (`/community`)

| Status | What the button/card shows |
|---|---|
| `active` | 🔵 **Claim Item** button + **Suggest** button |
| `active` (locked by someone else) | ⚪ **"In process..."** — disabled grey button |
| `active` (locked by *me*) | **Cancel** button + **Reclaim** button |
| `claimed` | 🟢 **CLAIMED stamp overlay** on the image + **"Conflict This Claim"** button |
| `resolved` | 🟢 **CLAIMED stamp overlay** + no action button (fully done) |
| `disputed` | 🔴 **"Conflict in Process"** — disabled button, no one can claim |
| `conflict_handover` | 🔴 **"Conflict in Process"** — disabled button |
| `archived` | ❌ **Hidden entirely** — filtered out from the board |

### 2. Item Detail Page (`/item/{id}`)

Shows raw status as a pill badge on the top-left of the main image:

```
● active        → shown in warning/yellow colour
● claimed       → shown in warning/yellow colour  
● disputed      → shown in warning/yellow colour
● resolved      → shown in success/green colour
```

> ⚠️ Note: The detail page currently shows the raw DB status string without human-friendly labels. This is a known UI improvement pending.

### 3. Chat History / Messages Page (`/chats`)

Chat cards show a coloured badge based on claim status:

| Badge | Colour | Condition |
|---|---|---|
| **OPEN** | 🟢 Green | `claim.status === 'pending'` — regular claim, chat active |
| **WAITING TO SCAN** | 🟡 Yellow | `claim.status === 'resolved'` AND `claim.qrToken` exists |
| **RESOLVED** | 🟢 Green | `claim.status === 'resolved'` AND no qrToken (already scanned) |
| **ADMIN APPROVED** | 🔵 Blue | `claim.status === 'approved'` |
| **REJECTED** | 🔴 Red | `claim.status === 'rejected'` |
| **Admin Review** | 🟡 Yellow | `claim.isConflictClaim === true` AND `status === 'pending'` |
| **Conflict Won** | 🟢 Green | `claim.isConflictClaim === true` AND `status === 'resolved'` |
| **Conflict Denied** | 🔴 Red | `claim.isConflictClaim === true` AND `status === 'rejected'` |

---

## LostItem Schema Fields

```ts
owner:             ObjectId → User who lost and reported this item
itemName:          String   → Name of the item
category:          String
brand:             String
color:             String
description:       String
locationLost:      String   → Where they last had it
dateLost:          Date     → When they lost it
specialAppearance: String   → Unique identifying marks
images:            [String] → Cloudinary image URLs
status:            String   → See table below
aiMatchScore:      Number   → AI confidence score for matching
communityHidden:   Boolean  → Hides from public board without deleting
aiData:            Object   → AI keywords and identifiers
```

---

## LostItem — All Status Values

| Status | When it is set | Meaning |
|---|---|---|
| `active` | On creation | Still lost — visible on the Lost Items feed |
| `claimed` | When a claim is submitted for a matching found item | Someone believes they found this person's item |
| `resolved` | After handover is confirmed | Item has been returned to owner |
| `archived` | Manual admin action | Removed from community |

---

## Key Relationship: FoundItem ↔ LostItem ↔ Claim

```
FoundItem  ←──── Claim ────→  LostItem (optional)
    │                               │
    └── finder (User)               └── owner (User)
    
Claim also links to:
    └── claimant (User) — the person claiming ownership of the FoundItem
```

A `Claim` is the bridge between a `FoundItem` and the person who says it belongs to them.  
The `LostItem` link in a claim is optional — it's set if the claimant had previously filed a "lost" report.

---

## AI Processing

Both `FoundItem` and `LostItem` have an `aiData` sub-object:
- When a new item is created, the backend AI worker processes it
- Extracts keywords and unique identifiers from the description and images
- These are used by the AI Matching engine to score potential matches between found and lost items
- The match score is shown on the Item Detail page and Claim form as "X% AI Match"

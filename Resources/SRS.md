# Software Requirements Specification (SRS)

# Software Requirements Specification (SRS)

## Project

Campus Lost & Found AI System

## Objective

Provide a secure, AI-assisted platform for reporting, matching,
verifying, and returning lost items within a university campus.

## Stakeholders

-   Students
-   Admin (Lost & Found Office)
-   University

## Functional Requirements

1.  User registration/login using university email.
2.  Report lost items.
3.  Report found items.
4.  AI text/image matching.
5.  Search and filter items.
6.  Notifications.
7.  Claim workflow.
8.  Ownership verification.
9.  Admin approval/rejection.
10. QR-based pickup after approval.
11. Analytics dashboard.

## Non-Functional Requirements

-   Responsive UI
-   JWT security
-   Password hashing
-   Scalable REST API
-   Audit logs
-   \<3 sec page response (excluding AI)

## Constraints

-   Free-tier cloud services
-   Browser based
-   Mobile responsive

---

# Detailed Expansion

## 1. Product Overview
Campus Lost & Found AI System is a web-based platform that helps students and university staff report, search, match, verify, and recover lost items using AI-assisted image and text matching.

## 2. Problem Statement
Students frequently lose personal belongings on campus. Traditional notice boards and manual reporting make recovery slow and unreliable. The system centralizes reporting, automates matching, prevents fraudulent claims, and provides a transparent claim workflow.

## 3. Target Users

### Primary Users
- Students
- Faculty
- Campus Staff

### Secondary Users
- Lost & Found Office
- University Administration

## 4. Product Goals
- Increase recovery rate of lost items.
- Reduce manual administrative work.
- Minimize false ownership claims.
- Provide fast AI-assisted matching.
- Maintain secure and transparent records.

## 5. User Roles

### Student/User
- Register/Login
- Report Lost Item
- Report Found Item
- Search Items
- Receive Notifications
- Submit Ownership Proof
- Track Claim Status
- Download Pickup QR

### Admin
- Verify Reports
- Review AI Matches
- Approve/Reject Claims
- Manage Users
- Manage Categories
- View Analytics
- Generate Reports

## 6. Authentication
### Registration
- University Email
- Full Name
- Student ID
- Mobile Number
- Password
- Confirm Password

### Login
- Email
- Password

### Password Recovery
- Email-based OTP/Reset Link

## 7. Detailed Functional Requirements

### FR1 User Authentication
Secure registration and JWT-based login.


### FR2 Lost Item Reporting
Fields:
- Item Name
- Category
- Description
- Location Lost 
- Colour
- Any Special Apperance(optional)
- Brand Name
- Date Lost
- Images.


### FR3 Found Item Reporting
Fields:
- Item Name
- Category
- Location Found
- Date Found
- Images
- Colour
- Any Special Apperance
- Brand Name
- Additional Notes

### FR4 AI Matching Engine
- Image similarity
- NLP text similarity
- Match confidence score
- Suggested matches

### FR5 Search & Filters
- Category
- Date
- Location
- Status
- Keywords

(Additional Info )
- Brand name


### FR6 Notification System
Triggers:
- Match Found
- Claim Approved
- Claim Rejected
- Pickup Reminder

Delivery:
- In-App
- Email

### FR7 Claim Workflow
1. User submits claim.
2. Ownership verification. [Best if have invoice]
3. Admin review.
4. Approval/Rejection.
5. QR generation [Only if the invoice is not provided then only provide QR else communicate to the user directly].
6. Pickup confirmation.

### FR8 Ownership Verification
Verification may include:
- Item-specific questions
- Uploading proof
- Purchase receipt **
- Admin interview (if required) [Only in product category electronic or higher price]

### FR9 QR Pickup
Approved claims generate a unique QR code for secure item collection.

### FR10 Analytics Dashboard
Displays:
- Total Lost Items
- Total Found Items
- Recovery Rate
- Pending Claims
- Monthly Trends
- Category Statistics

## 8. Non-Functional Requirements

### Performance
- API response under 3 seconds (excluding AI processing)
- Support concurrent users

### Security
- JWT Authentication
- Password Hashing
- Role-Based Access Control
- Input Validation
- Audit Logs

### Reliability
- Daily Backup
- Error Logging
- High Availability

### Usability
- Responsive Design
- Simple Navigation
- Accessible UI

### Scalability
- Modular REST API
- Cloud Deployment
- Horizontal Scaling Support

## 9. System Constraints
- Free-tier cloud deployment
- Browser-based application
- Internet connection required

## 10. Assumptions
- Users have valid university email addresses.
- Campus authority manages the Lost & Found office.
- Images uploaded are clear enough for AI matching.

## 11. Student/User Portal
- Authentication (Login, Register)
- Dashboard (Lost & Found Items Feed)
- Report Lost Item (Multi-step Form)
- Report Found Item (Multi-step Form)
- Item Detail Page
- AI Match Suggestions
- Claim Ownership Workflow
- Community Board (24-hour Found Items)
- Suggest Owner (for found items)
- Finder Chat (secure messaging)
- QR Handover (generate QR for pickup)
- QR Scan (verify QR at office)
- Leaderboard (reputation rankings)
- Notifications Center
- Profile & Badges
- Settings
- Help & Support

## 12. Admin Portal
- Admin Dashboard (stats & analytics)
- Claim Management (approve/reject)
- Item Moderation (approve/remove reports)
- User Management (ban/unban/role change)
- Community Post Moderation

## 13. Success Metrics
- Higher recovery rate
- Faster average claim resolution
- Reduced false claims
- High user satisfaction
- Active monthly users

## 14. MVP Scope

Included:
- Authentication
- Lost/Found Reporting
- AI Matching
- Search
- Notifications
- Claim Workflow
- Admin Dashboard
- QR Pickup

Not Included:
- Mobile Application
- Multi-campus federation
- Offline Mode

## 15. Future Enhancements
- Mobile App
- OCR-based receipt verification
- Face/Object detection improvements
- Chatbot support
- Multi-university support
- Predictive analytics

These are actually excellent additions because they solve real-world problems instead of just adding more features. They also make your project much stronger as a final-year major project.

I would add these sections to the SRS.

---

# 7.11 Appreciation & Reward System (NEW)

## Purpose

Encourage honesty and motivate users to submit found items instead of keeping them.

## Features

### Appreciation Badge

After a successful item return, the finder receives an appreciation badge.

Examples:

* Honest Helper
* Trusted Finder
* Campus Hero
* Gold Contributor

---

### Finder Reputation Score

Each successful return increases the user's reputation score.

Displayed on the profile:

* Items Found
* Items Successfully Returned
* Success Rate
* Community Rating

---

### Digital Certificate

The university can issue a downloadable appreciation certificate.

---

### Reward Points (Optional)

The university may reward users with:

* Campus Points
* Cafeteria Coupons
* Library Benefits
* Event Participation Credits

---

### Appreciation Wall

Top contributors are displayed publicly.

Example:

🏆 Top Honest Students

* Rahul Sharma
* Priya Singh
* Aman Verma

---

Priority: High

---

# 7.12 Advanced Smart Search & Filter System (NEW)

The platform provides real-time searching with dynamic filters.

### Basic Filters

* Category
* Item Name
* Color
* Brand
* Date Lost
* Date Found
* Building
* Floor
* Room Number
* Status
* Owner
* Finder

---

### Advanced Filters

* AI Match Score
* Similar Images
* Material
* Model Number
* Serial Number
* Pattern
* Size
* Price Range
* Electronic / Non-Electronic
* Verified Items Only

---

### Smart Search

Supports Natural Language.

Examples:

> Blue JBL Earbuds Lost Yesterday

> Black Wallet Near Library

> White Water Bottle Found in CSE Block

---

### Auto Suggestion

As the user types:

Blue Earbuds

Suggestions appear instantly.

---

### Real-Time Filtering

No page refresh required.

Search results update immediately.

Priority: Critical

---

# 7.13 Real-Time Smart Matching & Alert Engine (NEW)

Whenever a new Lost or Found report is submitted, the system immediately performs AI matching.

Matching Parameters

* Item Name
* Category
* Color
* Brand
* Description
* Image Similarity
* Date
* Time
* Location
* Keywords

---

## Match Confidence Levels

95–100%

Almost Exact Match

80–94%

High Match

60–79%

Possible Match

Below 60%

Weak Match

---

## Instant Notification Logic

Example

### Person A

Reports

Blue JBL Earbuds

Lost:

5:45 PM

Reported:

5:46 PM

---

### Person B

Reports

Found Blue JBL Earbuds

at

6:02 PM

---

Immediately after submission:

The system:

* Runs AI Image Matching
* Runs NLP Text Matching
* Calculates Confidence Score

If score > 80%

Notifications are sent instantly to:

* Person A
* Every other user who lost Blue Earbuds
* Users with similar item characteristics
* Admin Dashboard

This happens in real time without waiting for manual review.

Priority: Critical

---

# 7.14 Finder Communication System (NEW)

After a potential match is found, the claimant and finder can communicate securely through the platform.

## Finder Information

The finder must provide:

* Full Name
* Phone Number
* University Email
* Preferred Contact Method

---

## Communication Options

The claimant can:

* Send Messages
* Voice Call
* Video Call (Future)
* Schedule Meeting

All communication happens through the platform.

Phone numbers remain hidden until both parties agree.

---

## Secure Chat

Supports:

* Text Messages
* Image Sharing
* Item Verification Questions

---

## Verification OTP

Once both users agree that the item belongs to the claimant:

The finder taps:

Generate Verification OTP

The system creates a One-Time Password.

The claimant enters the OTP.

If successful:

Ownership verification is completed.

---

## Admin Visibility

Admins can monitor:

* Chat Status
* Verification Status
* Meeting Status

Admins cannot read private conversations unless flagged for abuse.

Priority: High

---

# 7.15 Three-Person Recovery Workflow (NEW)

## Person 1 (Finder)

### Responsibilities

* Report Found Item
* Upload Images
* Enter Item Details
* Share Contact Details
* Respond to Claim Requests
* Generate Verification OTP
* Hand Over Item

---

## Person 2 (Claimant)

### Responsibilities

* Report Lost Item
* Receive AI Match Notifications
* View Match Confidence
* Contact Finder
* Answer Verification Questions
* Enter OTP
* Collect Item

---

## Person 3 (Administrator)

### Responsibilities

* Monitor All Reports
* Review Suspicious Claims
* Approve High-Value Claims
* Resolve Disputes
* Verify Ownership (if needed)
* Maintain Audit Logs

---

## Complete Recovery Flow

```text
Person A loses an item
          │
          ▼
Reports Lost Item
          │
          ▼
AI stores fingerprints
          │
          ▼
Person B finds item
          │
          ▼
Reports Found Item
          │
          ▼
AI performs matching
          │
          ▼
Match Found
          │
          ▼
Instant Notifications
          │
          ▼
Claimant contacts Finder
          │
          ▼
Chat / Call Verification
          │
          ▼
Finder Generates OTP
          │
          ▼
Claimant Verifies OTP
          │
          ▼
Admin Reviews (only if required)
          │
          ▼
Item Returned
          │
          ▼
Appreciation Badge + Reputation Update
```

---

# FR11 AI-Based Multi-Attribute Matching Engine
Purpose

The system uses Artificial Intelligence to compare multiple attributes of reported lost and found items instead of relying on a single attribute such as color or image. This improves matching accuracy and reduces false-positive matches.

Matching Attributes

The AI compares the following information:

Item Category
Brand Name
Item Color
Description provided by the user
Special Identifying Marks (e.g., scratches, stickers, engravings, initials)
Lost/Found Location
Lost/Found Date & Time
Uploaded Images
Optional Serial Number (for electronic devices)
Optional OCR Text extracted from images (e.g., printed names, labels, model numbers)
Matching Process
A user submits a Lost Item or Found Item report.
The system extracts all available attributes from the report.
AI analyzes uploaded images using computer vision.
Text descriptions are compared using Natural Language Processing (NLP).
Each attribute is assigned a weighted score.
An overall Match Confidence Score is calculated.
Potential matches are ranked from highest to lowest confidence.
Real-time notifications are sent when the confidence score exceeds the configured threshold.
Example Weight Distribution
Attribute	Weight
Image Similarity	40%
Category	20%
Brand	15%
Color	10%
Description Similarity	10%
Location & Time Similarity	5%

Note: The weights are configurable by the administrator and may be adjusted to improve matching accuracy over time.

Match Confidence Levels
Confidence Score	Match Status
90–100%	Very High Match
75–89%	High Match
60–74%	Possible Match
Below 60%	Low Match
Outputs

The system generates:

Match Confidence Score
Ranked list of similar items
Suggested potential owners
Suggested potential finders
Instant notification to relevant users
Benefits
Higher matching accuracy
Reduced false claims
Faster item recovery
Better user experience
Efficient handling of large numbers of reports

I would also add this sentence to your Notification System because it makes the project feel much more "live."

# FR6.1 Intelligent Real-Time Notification Engine

Whenever a new Lost Item or Found Item report is submitted, the system automatically performs AI-based matching against all relevant reports in the database.

If the calculated Match Confidence Score exceeds the predefined threshold:

The user who reported the lost item receives an instant notification.
Users with similar lost item reports are also notified.
The finder receives a notification if multiple potential owners are identified.
The administrator dashboard is updated in real time with the newly detected matches.
Notifications are delivered through in-app alerts, email, and optional push notifications.
Example

Person A

Lost: Blue JBL Earbuds
Location: CSE Block
Time: 5:45 PM
Report Submitted: 5:46 PM

Person B

Found: Blue JBL Earbuds
Location: Library
Time: 6:02 PM

Within a few seconds of Person B submitting the report, the system:

Compares the new report with existing lost item reports.
Calculates the Match Confidence Score.
Detects a 92% match with Person A's report.
Sends an instant notification to Person A.
Notifies other users who have reported similar blue JBL earbuds, if applicable.
Displays the match on the administrator dashboard for monitoring.


# FR-12: 24-Hour Community Found Item Board
Description

The system shall provide a 24-Hour Community Found Item Board where all newly reported found items are publicly displayed to authenticated university users for a maximum duration of 24 hours. The feature aims to maximize community participation in identifying and returning lost items within the critical first 24 hours after discovery.

Functional Requirements
The system shall automatically publish every newly reported found item to the Community Found Item Board.
Each listing shall remain publicly visible for 24 hours from the time of submission.
Every listing shall display a live countdown indicating the remaining visibility time.
Authenticated users shall be able to:
Submit an ownership claim for a listed item.
Suggest the possible owner of a listed item.
Provide additional information that may assist the administrator in identifying the rightful owner.
The system shall notify the administrator whenever a new claim or community suggestion is submitted.
After the 24-hour visibility period expires, the listing shall be automatically removed from the public board.
Expired listings shall be transferred to the administrator's archive for record keeping and future reference.
Only administrators shall have access to archived listings after the public visibility period has ended.
Inputs
Found Item Details
Item Images
Found Location
Date & Time
Community Suggestions
Ownership Claims
Outputs
Public display of found items
Countdown timer
Ownership claim records
Community suggestion records
Administrator notifications
Archived item records
Priority

High

Dependencies
User Authentication Module
Found Item Reporting Module
Notification Module
Administrator Dashboard
Acceptance Criteria
A newly reported item appears on the Community Found Item Board immediately after submission.
The item remains visible for exactly 24 hours.
Users can successfully submit ownership claims and community suggestions during this period.
The administrator receives notifications for every new claim or suggestion.
The item is automatically removed from the public board after 24 hours.
The expired item is successfully moved to the administrator archive without data loss.
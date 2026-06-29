# TDD (Technical Design Documents)

### 1. Technical Implementation

# 1.1 Frontend Implementation

The frontend will be developed as a Single Page Application (SPA) using React.js with TypeScript to provide a responsive, fast, and interactive user interface. Tailwind CSS will be used for styling to ensure a modern design and seamless responsiveness across desktops, tablets, and mobile devices.

The application will communicate with the backend through RESTful APIs using Axios. React Router will manage client-side routing, while Context API or Redux Toolkit will manage global application state such as authentication, notifications, and user profile information.

Major Frontend Modules (Implemented)
 - User Authentication (Login, Register, Admin Login)
 - Student Dashboard
 - Admin Dashboard & Portal (Claims, Items, Users, Community)
 - Lost Item Reporting (Multi-step form)
 - Found Item Reporting (Multi-step form)
 - Item Detail View
 - AI Match Suggestions
 - Community Found Item Board (24-hour)
 - Suggest Owner Flow
 - Finder Chat (real-time)
 - QR Handover & QR Scan
 - Claim Ownership Workflow
 - Leaderboard (Reputation Rankings)
 - Notification Center
 - Profile & Badges
 - Settings
 - Help & Support

Actual Tech Stack Used
 - Framework: React 19 + TypeScript (Vite)
 - Styling: Vanilla CSS with CSS custom properties (design tokens)
 - Icons: Lucide React
 - Routing: React Router v7
 - State: React useState/useEffect (component-level)
 - HTTP: Axios (to be connected to backend)
 - Image Upload: Cloudinary (direct upload from frontend)
 - Real-time: Socket.IO client
 - Build Tool: Vite 8
 - Deployment: Vercel (frontend)

# 1.2 Backend Implementation

The backend will be developed using Node.js with the Express.js framework. It will expose RESTful APIs responsible for authentication, item management, AI matching requests, notifications, claim verification, QR code generation, and administrative operations.

Backend Modules
 - Authentication Module
 - User Management
 - Lost Item Management
 - Found Item Management
 - AI Matching Service
 - Claim Verification
 - Notification Service
 - QR Code Generation
 - Reputation & Badge Management
 - Community Board Management
 - Analytics Module

The backend will validate every request before processing it and return standardized JSON responses.

# 1.3 AI Engine Implementation

The AI Engine is the core component responsible for automatically identifying potential matches between lost and found items.

Whenever a user submits a Lost Item or Found Item report, the backend sends the report to the AI Engine.

The AI Engine extracts multiple attributes from the report:

- Item Category
- Brand
- Color
- Description
- Images
- Location
- Date & Time
- Special Identifying Marks
- Serial Number (if available)

The system then generates an AI Fingerprint, a structured representation of the item's characteristics.
The AI compares this fingerprint against existing reports using Computer Vision and Natural Language Processing techniques

 * Match Score

40% Image Similarity
20% Category
15% Brand
10% Color
10% Description Similarity
5% Location & Time


# 1.4 Database Implementation

The system will use MongoDB Atlas, a NoSQL cloud database, to efficiently store structured and semi-structured data.

Each major entity is stored in its own collection.

Main Collections
Users
Lost Items
Found Items
Claims
Notifications
AI Matches
QR Codes
Reputation
Badges
Community Suggestions
Audit Logs


# 2 . Intended Audience 

This Technical Design Document (TDD) is intended for the following stakeholders:

Developers

Software developers responsible for implementing the Campus Lost & Found AI System. This document provides detailed information about the system architecture, technology stack, database schema, API specifications, AI workflow, and implementation details required during development.

Testers

Quality Assurance (QA) engineers and testers who will verify that the implemented system meets the functional and non-functional requirements specified in the SRS. The document helps testers understand the expected behavior of each module, API, and workflow to design effective test cases.

Project Guide

The project supervisor or faculty guide who will review the technical feasibility, architecture, implementation strategy, and design decisions of the project. The document serves as a reference for evaluating the overall technical quality of the system.

Future Maintainers

Developers or administrators responsible for maintaining, upgrading, or extending the system after deployment. The TDD provides sufficient technical documentation to facilitate debugging, feature enhancement, system optimization, and long-term maintenance without requiring complete redevelopment.




## 3. Recommendated Tech Stack

| Layer                 | Technology                                     Purpose                                                |
| --------------------- | --------------------------------------------- | ------------------------------------------------------ |
| Frontend              | React.js                                      | Build responsive Single Page Application               |
| Language              | TypeScript                                    | Type safety and maintainability                        |
| Styling               | Tailwind CSS                                  | Responsive UI and rapid development                    |
| State Management      | Redux Toolkit (or Context API)                | Manage authentication, notifications, and shared state |
| Routing               | React Router                                  | Client-side navigation                                 |
| HTTP Client           | Axios                                         | REST API communication                                 |
| Backend               | Node.js                                       | Server-side runtime environment                        |
| Framework             | Express.js                                    | REST API development                                   |
| Authentication        | JWT + bcrypt                                  | Secure user authentication and password hashing        |
| Database              | MongoDB Atlas                                 | Store users, items, claims, and notifications          |
| ODM                   | Mongoose                                      | Object modeling and database interaction               |
| AI (Image Matching)   | OpenCV + TensorFlow.js or Python microservice | Image feature extraction and similarity matching       |
| AI (Text Matching)    | Sentence Transformers (MiniLM) or spaCy       | NLP-based semantic similarity of item descriptions     |
| OCR                   | Tesseract OCR                                 | Extract text from receipts, labels, and serial numbers |
| Image Storage         | Cloudinary                                    | Secure image hosting and optimization                  |
| QR Code Generation    | `qrcode` npm package                          | Generate unique pickup QR codes                        |
| Email Service         | Nodemailer + Gmail SMTP (development)/ Brevo SMTP (production)         | Email notifications and OTP delivery                   |
| Real-Time Updates     | Socket.IO                                     | Instant AI match notifications and live updates        |
| Logging               | Winston + Morgan                              | Application and HTTP request logging                   |
| Validation            | Zod or Joi                                    | Server-side input validation                           |
| Security              | Helmet, Express Rate Limit, CORS              | Protect APIs from common web attacks                   |
| Testing               | Jest + Supertest                              | Unit and API testing                                   |
| Version Control       | Git & GitHub                                  | Source code management                                 |
| Frontend Deployment   | Vercel                                        | Host the React application                             |
| Backend Deployment    | Render                                        | Host the Node.js backend                               |
| Database Hosting      | MongoDB Atlas                                 | Managed cloud database                                 |
| Project Documentation | Markdown, Mermaid, Draw.io                    | TDD, SRS, UML, and architecture diagrams               |



# 4. Overall Architecture 

                    Users (Students / Admin)
                              │
                              ▼
                 React.js Frontend Application
                              │
                     HTTPS REST API Requests
                              │
                              ▼
                 Node.js + Express.js Backend
                              │
      ┌───────────────┬───────────────┬───────────────┐
      │               │               │
      ▼               ▼               ▼
 Authentication   AI Matching     Notification
    Service          Engine          Service
      │               │               │
      └───────────────┴───────────────┘
                      │
                      ▼
                MongoDB Atlas Database
                      │
          ┌───────────┴────────────┐
          │                        │
          ▼                        ▼
    Cloudinary Image Storage   SMTP Email Service



# Executive Summary

The **Campus Lost & Found AI System** is designed as a secure, web-based platform to streamline reporting, matching, and recovery of lost items on campus.  It features a React/TypeScript frontend and a RESTful backend (Node.js/Express or similar) with a MongoDB datastore.  Core functionality includes user registration/login (campus email), reporting lost and found items, AI-assisted matching of items (via image and text similarity), notifications, and claim verification workflows.  Performance targets are strict: pages should load in ≤3 seconds (UI ≤1s) and AI inferences in <1s, with accuracy >90%.  Privacy and security are paramount: user data is protected by encryption and access controls to meet educational data regulations (e.g. FERPA/GDPR).  

AI components include multi-modal models (e.g. CLIP for image-text embeddings) and possibly large language models (LLMs) for advanced text understanding or user assistance.  A vector search engine (e.g. Pinecone) will enable fast similarity queries.  The system uses MLOps best practices (e.g. MLflow/Kubeflow pipelines) and monitoring for drift detection.  We compare options in tables below and include a modular architecture diagram.  The rollout plan outlines phased development (prototype→MVP→production), cost estimates, risks (e.g. model drift, privacy breaches) and mitigations.  

 *Figure: Conceptual cloud-based architecture for the Lost & Found AI system (web client, API backend, DB, and AI modules).*  

## Requirements, Constraints, and Stakeholders

We consolidate the provided documentation (SRS, design docs) into key requirements and goals:

- **Stakeholders:** Students, campus staff (Lost & Found office), and university administration.  Primary goals are increasing item recovery rates, reducing manual workload, and securing student data.  (E.g., product goals include “increase recovery rate” and “fast AI matching”.)
- **Functional Requirements:** 
  - **Authentication:** University email login, JWT-based sessions.  
  - **Item Reporting:** Interfaces to submit lost and found items (with descriptions, photos, location).  
  - **AI Matching:** Automated matching of lost vs found items using text (NLP) and image similarity.  
  - **Search & Filter:** Users can query items by keywords, categories, or similarity.  
  - **Notifications:** Alerts (email/SMS/app notifications) when potential matches are found.  
  - **Claim Workflow:** Verified item claiming (possibly via QR code scanning) with admin approval.  
  - **Analytics:** Dashboards for admins showing trends (most-lost items, recovery stats).
- **Non-Functional Requirements:** 
  - **Performance:** Web pages <3s; AI inference <1s; backend CPU <70%, memory ≤2GB.  
  - **Scalability:** Support thousands of users and items (cloud-hosted).  
  - **Security:** JWT authentication, role-based access control, password hashing; audit logs of all actions; data encrypted at rest and in transit.  
  - **Responsiveness:** Browser-based, mobile-friendly UI.  
- **Constraints:** Free-tier or low-cost cloud deployment; reliance on open-source or free tools where possible; campus IT infrastructure compatibility.  (Given free-tier constraints, we prefer managed services with free plans or minimal costs.)

Data types include user profiles, item metadata (descriptions, categories, GPS locations, timestamps), images (potentially sensitive), and communication logs (chat between users).  Privacy-sensitive data (names, IDs, location info) must be handled per FERPA/GDPR: encryption and access controls are required.  For example, **all student PII should be encrypted at rest and in transit**, and sensitive model outputs (e.g. possible owner matches) should only be shown to authorized users after identity verification.

## System Architecture

Our design follows a **modular client-server architecture**. A web or mobile frontend (React/TypeScript) communicates via REST APIs with a backend service (Node.js/Express, or alternatively Spring Boot).  The backend orchestrates business logic, AI processing, and data storage.  Core components include:

- **Frontend (SPA):** React app for reporting and browsing items, responsive design (mobile-friendly).  
- **Backend API:** Node/Express (using Mongoose ODM) exposing endpoints for authentication, item CRUD, matching queries, notifications, etc.  Follows REST conventions.  
- **Database:** MongoDB (Atlas), with collections for Users, Items, Reports, Claims, etc.  Schemas define fields like `userID`, `itemID`, `description`, `imageURL`, `location` (lat/lon), `status`, etc.  (A draft schema is provided in the Database Design doc.)  We use indexed queries on common fields (email, category, geolocation) for efficiency.
- **AI/ML Layer:** A service (could be part of the backend or separate microservice) handling all AI tasks.  For matching, it computes embeddings for item text and images and performs similarity search.  We may use pre-trained foundation models (CLIP for vision-language embeddings, and a text embedding model like SentenceBERT).  The embeddings are stored in a vector DB (see below) to enable nearest-neighbor search.  
- **Vector Search Engine:** A managed vector database (e.g. Pinecone) or self-hosted alternative (FAISS/Weaviate).  This indexes the item embeddings for fast semantic search.  
- **Notification Service:** Integrates with email/SMS APIs (e.g. SendGrid, Twilio) to alert users of matches.  
- **Authentication/Authorization:** JWT tokens with role-based access (student vs admin).
- **Admin Tools:** Interfaces (web UI or API) for administrators to view reports, verify claims, and monitor system health.
- **External Integrations:** Optional use of Google Maps API for geospatial tagging; QR code generation/scanning for pickup verification.

```mermaid
graph LR
  subgraph Client
    UI[React Frontend] 
  end
  subgraph Server
    API[REST API (Node/Express)] 
    DB[(MongoDB)]
    AI[AI Engine (CLIP, LLM, etc.)] 
    VDB[(Vector DB)]
    Auth[(Auth Service)]
    Notif[(Notifications)]
  end
  UI -->|calls| API
  API --> DB
  API --> Auth
  API --> VDB
  API --> Notif
  API --> AI
  Auth --> DB
  AI --> VDB
  AI --> DB
  Notif --> UI

  style UI fill:#eef,stroke:#999,stroke-width:1px
  style API fill:#efe,stroke:#999,stroke-width:1px
  style DB fill:#fee,stroke:#999,stroke-width:1px
  style AI fill:#ffe,stroke:#999,stroke-width:1px
  style VDB fill:#eef,stroke:#999,stroke-width:1px
  style Auth fill:#efe,stroke:#999,stroke-width:1px
  style Notif fill:#fee,stroke:#999,stroke-width:1px
```

*Figure: Modular architecture diagram of the AI-based Lost & Found system (client, backend, database, AI model, vector search, etc.).*  

## Component Specifications

**APIs and Data Schemas.** The API exposes routes such as `/auth/login`, `/items/lost`, `/items/found`, `/items/:id/match`, `/claims`, etc.  Input/Output schemas (JSON) follow the data model: e.g. an **Item** has `{ itemID, userID, title, description, category, imageURL, location, timestamp, status }`.  Models and schema will be documented in OpenAPI (Swagger).  Authentication endpoints use HTTPS with JWT tokens, requiring secure password hashing (bcrypt/argon2).

**Data Models:** Key collections include:
- **Users:** `{ userID, name, email (indexed), role (student/admin), hashedPassword, contact, ... }`.  
- **Items:** `{ itemID, reporterID, type (lost/found), category, description, imageRef, location (lat,lon), time, status (open/claimed), ... }`.  
- **Claims:** `{ claimID, itemID, claimerID, status (pending/approved/denied), adminID, ... }`.  
- **Notifications:** Records of alerts sent.  

**Model Selection and Rationale:**  
- **Image-Text Matching:** We will leverage **CLIP** (Contrastive Language-Image Pre-training) for multi-modal embeddings.  CLIP was trained on 400M image-text pairs and excels at mapping images and captions into a shared vector space.  This enables matching a lost item’s photo with found items’ photos based on content.  Alternative approaches (ResNet-based embeddings or object detectors like YOLO) are possible, but CLIP’s zero-shot, broad generalization makes it ideal for out-of-box similarity search. CLIP’s public availability and strong community support make it cost-effective.  We will fine-tune or calibrate CLIP as needed on any campus-specific item data, but initial use of the pre-trained model reduces training overhead.  
- **Text Embedding/LLM:** For item descriptions, we consider an LLM-based encoder (e.g. Sentence-BERT or GPT-derived embeddings) to capture nuance.  The IBM definition of RAG suggests using LLMs with retrieval for better context.  For example, we may employ an LLM (like a smaller open model, e.g. LLaMA or GPT-NeoX) in a **retrieval-augmented generation (RAG)** framework to answer user queries or generate summaries.  This allows leveraging domain knowledge (e.g. past item database) without retraining the entire model.  
- **Classification/Filters:** A lightweight CNN classifier (trained or fine-tuned on common lost-item categories: “electronics”, “keys”, “ID cards” etc.) can aid filtering and UI displays.  However, for the core match engine, we rely on embeddings.

**Training and Validation Plan:** We will collect an initial dataset of lost/found items from campus records (if available) or public sources.  To bootstrap, we may use synthetic data augmentation (e.g. mix-label images with open datasets).  If fine-tuning CLIP or text models, we will use supervised contrastive learning with item pairs as positive/negative examples.  Validation metrics include top-1 matching accuracy, precision/recall of retrieval.  We aim for >90% accuracy on known test pairs and >80% precision/recall in live usage (per SRS targets).  We will conduct offline evaluation (with held-out item matches) and A/B testing in production.  

**Component Interfaces:**  
- **AI Engine API:** Exposes endpoints like `/match` which takes an `itemID` (lost or found) and returns top-N candidate items.  Internally, it retrieves the item’s embedding, queries the vector DB for nearest neighbors, and returns matches with similarity scores.  
- **Notification API:** Interfaces with email/SMS (e.g. via SendGrid/Twilio SDKs) to send templated alerts on matches or status changes.  
- **Admin API:** Endpoints for admins to list all reports, moderate content, and finalize claims.  Admin actions are also logged.

## Data Flow and Integration

The user journey and data flows are as follows:
1. **Item Reporting:** A user submits a lost/found report (photo + text). The frontend sends this to `/items`. The backend stores the item record in MongoDB and sends the image to object storage (e.g. AWS S3 or similar).
2. **Embedding and Indexing:** Upon saving an item, the backend triggers the AI module to generate an **image embedding** (via CLIP) and a **text embedding** (via LLM or SBERT).  These embeddings (vectors) are inserted into the vector index (Pinecone or FAISS). This happens asynchronously to not block the API. 
3. **Matching:** When a new item is reported, or on user request, the user or system calls `/items/{id}/match`. The AI module retrieves the stored embedding and queries the vector DB for nearest neighbors (semantic similarity).  Matching can incorporate hybrid search: e.g., apply category/location filters first, then vector search for ranked results.  Results are returned via API to the frontend.
4. **Notification:** If a match exceeds a confidence threshold, the backend automatically notifies the relevant users (owner or finder). This uses pre-defined logic (e.g. if a found-item matches a lost-item).
5. **Claim Workflow:** A user claims an item (via `/claims`). The backend marks the item status pending and alerts admins. After admin review (and optional QR code scan), the claim is approved, and the system notifies both parties for pickup.
6. **Data Logging:** All operations (logins, reports, matches, admin actions) are written to audit logs.

Integration points include third-party APIs (maps for geocoding item locations, email/SMS services for notifications).  All data exchanges use HTTPS and OAuth/JWT tokens for security.

## Security and Privacy Controls

We enforce industry-standard security for user data and model use. Key measures:
- **Authentication:** User accounts tied to university emails; use secure password hashing (bcrypt/argon2) and multi-factor auth if possible. Sessions via signed JWTs with short TTL. Token-based auth is described in our docs.
- **Authorization:** Role-based access control: students can only view their own reports and matched items; admins have broader oversight (approve claims, view analytics).
- **Data Encryption:** All sensitive data is encrypted. We follow FERPA/GDPR guidelines: for example, *all student PII and item location data is encrypted at rest and in transit*.  As one FERPA guide notes, “data encryption ensures that data is protected…from the moment it’s created”.  In practice, use TLS for all communication and encryption-at-rest for databases/filestores. Encryption keys are managed securely (customer-managed KMS).
- **Privacy by Design:** Personal details of users are not revealed to others without consent. For instance, owner contact info is only shared after both parties agree to a claim.  The IJERT example highlights a design where “user information is kept confidential until two students have exchanged private messages”, a practice we can emulate to protect privacy.
- **Model Security:** The AI models will be hosted on secure infrastructure. Access to model endpoints is authenticated to prevent abuse. We also mitigate **model hallucination** (incorrect matching) by grounding matches in factual data and thresholds.
- **Audit Logging:** Every transaction (login, report, match, claim) is logged with timestamps. These logs are immutable and monitored.  This supports troubleshooting and compliance reviews.
- **Compliance:** We will perform regular security audits. The Pinecone vector DB, for example, is SOC2/HIPAA compliant, indicating enterprise-grade security for stored embeddings. We similarly choose services (email, storage) with compliance certifications.

By combining these controls, we adhere to a “defense-in-depth” strategy, ensuring the platform is secure and users’ privacy is protected.

## Testing, Evaluation and Metrics

**Unit & Integration Testing:** All components will have automated tests.  API contracts (OpenAPI schemas) are enforced, and the frontend is tested against mock APIs. CI/CD pipelines include unit tests for critical logic (auth, DB queries) and integration tests covering end-to-end flows (report to match to claim).

**Model Evaluation:** We measure AI performance with metrics suited to retrieval:
- **Accuracy:** For matching, we track top-1 and top-5 accuracy on held-out test sets of paired lost/found items. Target >90% top-1 accuracy as per SRS.
- **Precision/Recall:** In production, we log which suggested matches led to successful claims. We compute precision (fraction of matches that were correct) and recall (fraction of true matches found) over time. The SRS calls for >80% precision/recall, so we aim to meet or exceed that.
- **Latency:** Monitor inference time of the ML models (should be <1s) and end-to-end API latency (should be <3s). We will log and alert if these degrade beyond SLA.
- **Deployment Testing:** We will perform load testing (simulating X concurrent users/items) to validate scalability claims (e.g. Node server CPU <70%). Tools like JMeter or k6 may be used.
- **User Acceptance:** Feedback from pilot testers (campus students and staff) will validate usability and match quality. We will maintain an issue backlog for enhancements.

**Monitoring:** We use APM and ML monitoring:
- **System Monitoring:** Tools like Prometheus/Grafana or CloudWatch will track API health, database usage, and container metrics.
- **ML Monitoring:** Using techniques from [22], we detect *concept drift* by comparing statistics of incoming item descriptions and images against training data. We monitor key metrics (embedding cosine distributions, model confidence scores). If drift is detected (e.g. item types evolve), we will retrain or recalibrate models.
- **Alerts:** Automated alerts for critical failures (e.g. API errors, data anomalies) ensure quick response.

## Deployment Options and Cost Tradeoffs

We compare deployment strategies in two tables:

| Deployment Platform               | Key Features                                  | Pros                                    | Cons                                              |
|-----------------------------------|-----------------------------------------------|-----------------------------------------|---------------------------------------------------|
| **Managed Cloud (AWS/GCP/Azure)** | Use services like AWS Elastic Beanstalk, RDS, SageMaker, etc. | Highly scalable, many managed services, high reliability. | Can incur significant cost; complex to configure. Requires cloud expertise. |
| **Serverless (Heroku/Render/AWS Lambda)** | Deploy backend as containers/functions; frontend on Vercel/Netlify. | Very low ops overhead; good for small-scale. | Cold-start latency; limited execution time; vendor lock-in. |
| **Vector DB (Pinecone)**          | Fully managed semantic search engine. | Ultra-fast vector search (20–100ms), easy scaling, built-in security. | Monthly minimum cost (~$50/mo) and usage fees. |
| **Self-Hosted (FAISS/Weaviate)**  | Open-source vector index on own servers.      | No vendor fees; fully customizable.     | Must manage infra (hardware/GPU); scaling and reliability burdens. |
| **On-Premise (Local Campus Servers)** | Deployment on campus datacenter servers.      | Data stays within campus network.       | Upfront hardware cost; limited auto-scaling; maintenance overhead. |

> **Table: Deployment options with trade-offs.**  *Pinecone example: AWS Marketplace lists a $50/month minimum for production.  Self-hosting with FAISS reduces fees but needs GPU servers. Serverless (e.g. AWS Lambda) cuts ops but can suffer latency.*

For a **frontend**, platforms like Vercel or GitHub Pages are practically free for static React apps. Backend can be on a small cloud VM (t2.micro) under free tier, but scaling requires paid instances. Using AWS Free Tier (750 hrs of t2.micro) may cover initial usage, but production will need paid instances.  

**Monitoring/MLOps:** We plan to use MLflow (for experiment tracking and model registry) and optionally Kubeflow for workflow orchestration.  MLflow is free/open-source; Kubeflow adds complexity but is optional. For small-scale, MLflow alone suffices.

## Model Options Comparison

| Model/Technique             | Data Modality | Use Case                         | Pros                                                  | Cons                                    |
|-----------------------------|---------------|----------------------------------|-------------------------------------------------------|-----------------------------------------|
| **CLIP (OpenAI)**           | Image+Text    | Multi-modal matching/search      | Strong image-text embeddings; zero-shot search; no training needed. | Large model; inference requires GPU; fixed capabilities. |
| **ResNet/Vision CNN**       | Image only    | Feature embeddings/classification | Well-known, efficient; smaller variants available.    | Handles only visual features; no text understanding. |
| **YOLO/Object Detection**   | Image only    | Object-level matching            | Fast object detection; helps locate items in photos.  | Only provides object labels; not designed for semantics. |
| **Sentence-BERT (or similar)** | Text only     | Text description embedding       | High-quality sentence embeddings; efficient GPU usage. | No image handling; might miss visual cues. |
| **GPT-4 (or LLM)**         | Text (NLP)   | Conversational/QA interface (RAG) | Powerful understanding/generation; can use RAG for precision. | Expensive; latency; hallucination risk without RAG. |
| **Fuzzy/String Matching**   | Text only     | Legacy match fallback            | Simple; no ML needed.                                 | Very brittle; misses synonyms and image info. |

> **Table: AI model/technique options.**  *CLIP (contrastive vision-language model) is state-of-art for image–text similarity. GPT-4 offers broad language understanding, but RAG (augmenting with data) is needed for accuracy. Simpler approaches like fuzzy text matching are fast but unreliable.*

## Timeline, Budget, and Risks

**Timeline (example):** Over ~6–9 months:
1. **Month 1–2:** Requirements finalization, prototyping UI and basic API; set up dev environment (Git, CI). Ingest sample data.
2. **Month 3–4:** Develop core backend (item reporting, DB schema), simple matching using off-the-shelf embeddings. Iterate based on tests.  
3. **Month 5–6:** Integrate full AI pipeline (CLIP model, vector DB), build retrieval API. Fine-tune models; conduct user testing for matching accuracy.  
4. **Month 7:** Implement notifications, admin dashboard, and security hardening. Prepare documentation.  
5. **Month 8–9:** System testing, performance tuning, and deployment. Rollout pilot, collect feedback and adjust.  

**Budget:** Assuming limited budget (free/low-cost tier):
- **Infrastructure:** Cloud VMs (e.g. AWS t3.medium ~$35/mo) or use free credits. Pinecone min. $50/mo.  
- **Personnel:** Primarily development effort (students/developers).  
- **Total Range:** Potentially a few thousand USD for first-year cloud costs, plus developer time. Using open-source tools (Python, Node.js, MongoDB, CLIP) minimizes licensing fees.  
- **Cost tradeoffs:** Using managed services (Pinecone, AWS) increases recurring costs, whereas self-hosting saves money but requires maintenance.  

**Risks & Mitigations:**
- *Model Drift:* As new items appear, model accuracy may degrade. Mitigate with continuous monitoring (concept drift detection) and scheduled retraining on new data.  
- *Privacy Breach:* Risk of exposing user data. Mitigate via encryption, strict access control, and compliance audits.  
- *Scalability Overrun:* Free-tier limits. Mitigate by designing modularly (can move to higher-tier instances as needed), and optimizing queries (indexes, caching).  
- *Technical Complexity:* Integrating CLIP or LLMs can be challenging. Mitigate by starting with off-the-shelf models and incrementally improving.  

## Implementation Checklist

- [ ] Finalize detailed requirements and use cases (with stakeholders)  
- [ ] Design and document API (OpenAPI spec).  
- [ ] Set up Git repo, CI/CD pipeline, and code organization (per Folder Structure doc).  
- [ ] Develop frontend screens (React), implementing UI/UX designs.  
- [ ] Build backend endpoints, connect to MongoDB, implement authentication.  
- [ ] Integrate AI module: deploy CLIP or selected models, develop embedding/indexing logic.  
- [ ] Choose and configure vector database (Pinecone/FAISS).  
- [ ] Implement matching API and test accuracy with sample data.  
- [ ] Integrate notification service (email/SMS).  
- [ ] Build admin interfaces and dashboards.  
- [ ] Security review: enforce encryption, audit logging, RBAC.  
- [ ] Write tests (unit/integration) for all components.  
- [ ] Deploy to staging, perform load and security testing.  
- [ ] Train staff/admin, and conduct user training for students.  
- [ ] Roll out to production, monitor KPIs (matching rates, latency).  

By following this design and plan – leveraging proven architectures and modern AI techniques (contrastive models, RAG) – the campus can deploy an efficient, secure Lost & Found AI system that meets stakeholders’ goals. 

**Sources:** We drew on academic and industry research for guidance. For example, a recent campus project used text similarity and fuzzy logic for matching, and an AI-powered lost & found system employed NLP+geolocation matching with privacy safeguards.  We also reference CLIP for vision-language embeddings, best practices in retrieval-augmented generation, MLOps frameworks, monitoring of model drift, and data encryption for student privacy.  These primary sources and original papers underlie the technical choices outlined above. 


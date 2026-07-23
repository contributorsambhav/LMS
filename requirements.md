# LumenLMS — System Requirements & Implementation Status

This document defines the functional and non-functional requirements for the LumenLMS platform, mapping the current state of implementation and categorizing each requirement based on its engineering scope: **Code-only**, **Code + DevOps**, or **DevOps-only**.

---

## Scope Categories

*   **Code-only:** Fully implemented within the application codebase (Next.js client, Express server, Mongoose models, local storage).
*   **Code + DevOps:** Requires application-level integration (APIs, environment variables) coupled with infrastructure provisioning, keys, or external service setups.
*   **DevOps-only:** Requires server configuration, cloud resources, domain management, CI/CD pipelines, or deployment infrastructure with no direct application logic changes.

---

## 1. Functional Requirements

### A. Authentication & Onboarding (Platform-Wide)

| Req ID | Requirement | Scope | Status | Implementation Details / MVP Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **FR-1.1** | **Google OAuth (SSO) Sign-In**<br>Users authenticate using Google credentials. | Code + DevOps | **Implemented** | Handled via Google OAuth flow; requires cloud console client credentials. |
| **FR-1.2** | **Role-Based Access Control (RBAC)**<br>Enforce access guards for 4 roles: SuperAdmin, InstituteAdmin, Faculty, Student. | Code-only | **Implemented** | Express authentication middleware (`auth.ts` / `checkApproved`) validates JWT payload. |
| **FR-1.3** | **Hierarchical Institute Setup**<br>Registering InstituteAdmin creates both a Pending User and a Pending Institute. | Code-only | **Implemented** | Institute metadata stored in Mongoose database, defaulting user to "Pending" status. |
| **FR-1.4** | **Pending Onboarding Guard Screens**<br>Locked screens for pending users block access until admin/superadmin approval. | Code-only | **Implemented** | Next.js layout route checks user status and renders locked layout blocking navigation. |
| **FR-1.5** | **SSL/TLS & Secure Cookies**<br>All auth cookies/tokens transmitted over secure HTTPS channels. | DevOps-only | **Non-implemented** | To be configured in production via Nginx/ALB and Let's Encrypt certificates. |

### B. Student Requirements

| Req ID | Requirement | Scope | Status | Implementation Details / MVP Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **FR-2.1** | **Browse & Search Courses**<br>Browse institute courses and search them by Title, Description, or Category. | Code-only | **Partially Implemented (MVP)** | Students can view courses. Global search bar endpoint not yet completed (needs MongoDB `$text` search index). |
| **FR-2.2** | **Enroll in Courses**<br>Submit course enrollment requests. | Code-only | **Implemented** | Enrollment collection tracks user-course associations with status `"Pending"`. |
| **FR-2.3** | **Access & Stream Video Lessons**<br>Stream MP4 video lectures uploaded for the course. | Code-only | **Implemented (Local MVP)** | Video playing supported locally via static uploads directory. Production requires CDN. |
| **FR-2.4** | **Download Course Materials**<br>View and download course notes/documents (PDFs). | Code-only | **Implemented (Local MVP)** | Uploaded files served statically from backend `/uploads` folder. |
| **FR-2.5** | **Take Timed Quizzes**<br>Participate in online MCQs and subjective quizzes. | Code-only | **Implemented** | Frontend Timer and interactive quiz interface implemented in course details page. |
| **FR-2.6** | **Submit Assignments**<br>Upload PDF solutions before deadlines. | Code-only | **Implemented (Local MVP)** | Submissions uploaded to local `/uploads` directory using `multer`. |
| **FR-2.7** | **Track Progress**<br>Track video watch completion percentage and mark complete at 90%+. | Code-only | **Implemented** | `VideoPlayer` component reports progress to `/api/lessons/:id/progress` periodically. |
| **FR-2.8** | **Receive Course Certificates**<br>Generate downloadable certificate of completion upon 100% progress. | Code-only | **Non-implemented** | Deferred to Phase 6. Requires server-side PDF generation (`pdfkit` or `puppeteer`). |

### C. Instructor (Faculty) Requirements

| Req ID | Requirement | Scope | Status | Implementation Details / MVP Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **FR-3.1** | **Create Course Curriculum**<br>Add, edit, delete, and reorder lessons/topics. | Code-only | **Implemented** | Lesson CRUD and ordering logic (`orderNo`) completed in backend and frontend. |
| **FR-3.2** | **Upload Media & Materials**<br>Upload videos and support documents to lessons. | Code-only | **Implemented (Local MVP)** | Managed locally via `multer` file middleware. |
| **FR-3.3** | **Schedule Live Virtual Sessions**<br>Define date/time and host live session links. | Code-only | **Implemented** | DB models session timings. Client utilizes calendar interfaces. |
| **FR-3.4** | **Create Quizzes**<br>Add quizzes with multiple choice options, scoring, and timer limits. | Code-only | **Implemented** | Quiz creation page allows specifying questions, option lists, and points. |
| **FR-3.5** | **Grade Assignments & Quizzes**<br>Review student submissions and provide marks and feedback. | Code-only | **Implemented** | Grading console supports score input, feedback message, and updates submission status. |
| **FR-3.6** | **Monitor Student Roster**<br>View active student list in a course and their respective progress metrics. | Code-only | **Implemented** | Course Roster tab displays students and enrollment metadata. |
| **FR-3.7** | **Course Analytics**<br>Track course metrics (engagement, average scores, completions). | Code-only | **Non-implemented** | Deferred to Phase 5. Charts require aggregation endpoints and frontend graphs. |

### D. Administrative (Institute Admin) Requirements

| Req ID | Requirement | Scope | Status | Implementation Details / MVP Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **FR-4.1** | **Manage Subjects**<br>Define subject categories within the institution. | Code-only | **Implemented** | CRUD endpoints and UI selectors completed. |
| **FR-4.2** | **Manage Faculty Roster**<br>Assign approved faculty members to subjects and courses. | Code-only | **Implemented** | Member controls allow adding/unassigning teachers from course contexts. |
| **FR-4.3** | **Approve Users (Students & Faculty)**<br>Approve or suspend accounts registered under the institute. | Code-only | **Implemented** | Dashboard console displays pending members and processes state changes. |
| **FR-4.4** | **Enrollment Management**<br>Enroll students directly or review pending student self-enrollments. | Code-only | **Implemented** | Roster management views available to override enrollment flow. |
| **FR-4.5** | **View Institute Analytics**<br>Overall summary of courses, students, and billing plans. | Code-only | **Non-implemented** | Dashboard UI holds dummy widgets; awaits backend aggregation hooks. |

### E. SuperAdmin Requirements

| Req ID | Requirement | Scope | Status | Implementation Details / MVP Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **FR-5.1** | **Moderate Institutes**<br>Approve pending registers, active status, or suspend misbehaving institutes. | Code-only | **Implemented** | Verification collections track institute audits; SuperAdmin dashboard handles status toggles. |
| **FR-5.2** | **System Pricing Management**<br>Define, update, and manage billing plans. | Code-only | **Implemented** | Plans collection seeded in MongoDB on application startup. |
| **FR-5.3** | **System-Wide Reports**<br>Generate global usage and subscription audits. | Code-only | **Non-implemented** | Not started. |

### F. Communication & Integrations

| Req ID | Requirement | Scope | Status | Implementation Details / MVP Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **FR-6.1** | **Live Session Zoom Integration**<br>Integrate Zoom SDK / OAuth to launch online lectures. | Code + DevOps | **Partially Implemented (MVP)** | Zoom credentials verification module built. Zoom OAuth setup in developer console required for production. |
| **FR-6.2** | **In-App Real-Time Alerts**<br>Instant toast notification when grades are updated or live sessions start. | Code-only | **Non-implemented** | Needs WebSocket or Server-Sent Events (SSE) backend server architecture. |
| **FR-6.3** | **Email Reminders (SES/Resend)**<br>Automated emails for deadlines, enrollment approvals, or new materials. | Code + DevOps | **Non-implemented** | Requires Nodemailer logic, email template compiler, and DNS SPF/DKIM verification. |

---

## 2. Non-Functional Requirements

### A. Performance & Latency

| Req ID | Requirement | Scope | Status | Implementation Details / MVP Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **NFR-1.1** | **Low-Latency Video Streaming**<br>Ensure videos load within <2 seconds and stream without buffering. | DevOps-only | **Non-implemented** | Serve videos through Amazon CloudFront CDN cached globally rather than local node servers. |
| **NFR-1.2** | **Response Time (<200ms)**<br>Backend REST APIs must resolve standard requests within 200ms. | Code-only | **Partially Implemented** | Monolithic codebase performs fast local queries. Requires indexing and database optimization. |
| **NFR-1.3** | **Aggressive Caching**<br>Cache course pages, details, and schedules to reduce DB load. | Code + DevOps | **Non-implemented** | Plans include a Redis caching middleware layer on course queries. |

### B. Scalability & Event Handling

| Req ID | Requirement | Scope | Status | Implementation Details / MVP Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **NFR-2.1** | **Async Progress Event Processing**<br>Handle high-frequency student watch-position updates without DB locks. | Code + DevOps | **Non-implemented** | To be implemented using Apache Kafka or RabbitMQ queues to ingest watch events asynchronously. |
| **NFR-2.2** | **Database Scale-Out**<br>Support read-heavy workloads (1M+ DAU) on users and courses. | DevOps-only | **Non-implemented** | Set up MongoDB Atlas replica sets with Secondary read replicas for read/write splitting. |
| **NFR-2.3** | **Global CDN Distribution**<br>Distribute files globally (PDFs, templates, and static content). | DevOps-only | **Non-implemented** | CloudFront or Cloudflare CDN implementation. |

### C. Security & Content Protection

| Req ID | Requirement | Scope | Status | Implementation Details / MVP Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **NFR-3.1** | **Video Link Protection**<br>Prevent video files from being shared outside the platform. | Code + DevOps | **Non-implemented** | Use CDN-level Signed URLs with short expiration windows for all media resources. |
| **NFR-3.2** | **Secrets Management**<br>Secure API keys (Zoom, database passwords, JWT secrets, Google OAuth secrets). | Code + DevOps | **Partially Implemented** | Local variables loaded through `.env` file. Production requires AWS Secrets Manager / Vault. |
| **NFR-3.3** | **CORS & Rate Limiting**<br>Prevent unauthorized cross-origin requests and API abuse. | Code + DevOps | **Partially Implemented** | Express `cors` middleware configured. Infrastructure rate-limiting (Nginx / Cloudflare) required. |
| **NFR-3.4** | **Uploaded File Sanitization**<br>Prevent execution of malicious scripts via assignment uploads. | Code + DevOps | **Non-implemented** | Implement size limits in Nginx and run antivirus scanning (e.g. ClamAV) on uploads. |

### D. Availability & Fault Tolerance

| Req ID | Requirement | Scope | Status | Implementation Details / MVP Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **NFR-4.1** | **High Availability (99.9%+)**<br>System remains active and resilient to single instances failing. | DevOps-only | **Non-implemented** | Docker containers orchestrated through AWS ECS or Kubernetes with autoscaling groups. |
| **NFR-4.2** | **Load Balancing**<br>Distribute request traffic evenly across running instances. | DevOps-only | **Non-implemented** | Configure AWS Application Load Balancer or Nginx reverse proxies. |
| **NFR-4.3** | **Backups & Recovery**<br>No loss of grades, records, or course structures in database failures. | DevOps-only | **Non-implemented** | Automated daily MongoDB Atlas snapshots and S3 bucket versioning. |

---

## 3. Implemented vs. Non-Implemented Requirement Matrix

### 1. Implemented (Code-only / Local MVP)
1.  **FR-1.1**: Google OAuth Sign-In
2.  **FR-1.2**: Role-Based Access Control (RBAC)
3.  **FR-1.3**: Hierarchical Institute Setup
4.  **FR-1.4**: Onboarding Guard screens (Lock layouts)
5.  **FR-2.2**: Course enrollment request engine
6.  **FR-2.3**: Video Player streaming (Local uploads MVP)
7.  **FR-2.4**: Notes downloading (Statically served PDFs)
8.  **FR-2.5**: Timed interactive Quiz taking (MCQ + Subjective)
9.  **FR-2.6**: File-based assignment submission (Statically uploaded PDF)
10. **FR-2.7**: Video progress reporting (Heartbeat updates)
11. **FR-3.1**: Curriculum Lesson editing and ordering (`orderNo`)
12. **FR-3.2**: Material uploads to lessons
13. **FR-3.3**: Scheduling live sessions
14. **FR-3.4**: Timelimit Quiz creator console
15. **FR-3.5**: Subjective assignment grading interface
16. **FR-3.6**: Course roster dashboard views
17. **FR-4.1**: Subjects configuration
18. **FR-4.2**: Faculty assigned rosters
19. **FR-4.3**: Student/Faculty registry approvals
20. **FR-5.1**: SuperAdmin Institute validations
21. **FR-5.2**: System Pricing Plan setup

### 2. Partially Implemented / In-Progress
1.  **FR-2.1**: Course Browsing (Implemented) & Global Course Search (Pending)
2.  **FR-6.1**: Zoom Integration (Credentials status API built; OAuth handshake credentials pending)
3.  **NFR-3.2**: Secrets Management (.env config complete; cloud storage keys pending)
4.  **NFR-3.3**: CORS (Express settings completed; Web Application Firewall / Gateways pending)

### 3. Non-Implemented (Future Phases)
1.  **FR-1.5**: Secure SSL/TLS Production configs (**DevOps-only**)
2.  **FR-2.8**: Certificate PDF rendering & distribution (**Code-only**)
3.  **FR-3.7**: Course analytics visualization charts (**Code-only**)
4.  **FR-4.5**: Institute admin operations stats dashboard (**Code-only**)
5.  **FR-5.3**: Global system audits and billing records (**Code-only**)
6.  **FR-6.2**: Real-time push alert messaging (WebSockets / SSE) (**Code-only**)
7.  **FR-6.3**: Email gateway transmission config (SES/Resend) (**Code + DevOps**)
8.  **NFR-1.1**: Low-latency video delivery network CDN (CloudFront) (**DevOps-only**)
9.  **NFR-1.3**: Redis cache configuration (**Code + DevOps**)
10. **NFR-2.1**: Async progress processing using queues (Kafka) (**Code + DevOps**)
11. **NFR-2.2**: Read/write replica DB separation (**DevOps-only**)
12. **NFR-3.1**: Signed URL media security constraints (**Code + DevOps**)
13. **NFR-3.4**: Virus scan configuration for uploads (**Code + DevOps**)
14. **NFR-4.1 to 4.3**: Production infrastructure clustering, load balancers, and snapshots (**DevOps-only**)

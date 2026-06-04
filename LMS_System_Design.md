# LMS (Learning Management System) — System Design

> **Interview Tip:** Clarify scope first — LMS can range from a simple course platform to something like Coursera, Udemy, or Google Classroom.

---

## 1. Requirements

### Functional Requirements

#### Student
- Sign up / login
- Browse courses
- Enroll in courses
- Watch videos
- Download notes / resources
- Submit assignments
- Take quizzes
- Track progress
- Receive certificates

#### Instructor
- Create courses
- Upload videos / documents
- Create quizzes
- Grade assignments
- View analytics

#### Admin
- Manage users
- Moderate content
- Generate reports

---

## 2. Non-Functional Requirements

- High availability (99.9%+)
- Low latency video streaming
- Scalability (millions of users)
- Secure content delivery
- Fault tolerance
- Data consistency for grades / progress

---

## 3. Capacity Estimation

**Assumptions:**
| Metric | Value |
|---|---|
| Registered users | 10M |
| DAU | 1M |
| Concurrent users | 100k |
| Avg video size | 500 MB |
| Total courses | 100k |

**Storage:**

Videos dominate storage.

```
100k courses
× 20 videos/course
× 500 MB

≈ 1 PB
```

> **Conclusion:** Videos must **not** be stored in a DB. Use **object storage**.

---

## 4. High-Level Architecture

```
               +-------------+
               |   Client    |
               +------+------+
                      |
                 Load Balancer
                      |
         +------------+------------+
         |                         |
    API Gateway              Auth Service
         |
 ------------------------------------------------
 |        |         |         |        |         |
User   Course    Quiz     Assignment Progress Notification
Svc     Svc      Svc         Svc        Svc        Svc
 ------------------------------------------------
                |
          Video Service
                |
          Object Storage
                |
              CDN
```

---

## 5. Database Design

### Users
```sql
Users
-----
id
name
email
role
created_at
```

### Courses
```sql
Courses
-------
course_id
title
description
instructor_id
category
created_at
```

### Enrollments
```sql
Enrollments
-----------
user_id
course_id
enrolled_at
```

### Lessons
```sql
Lessons
-------
lesson_id
course_id
video_url
duration
order_no
```

### Progress
```sql
Progress
--------
user_id
lesson_id
completed
last_watched_timestamp
```

### Assignments
```sql
Assignments
-----------
assignment_id
course_id
deadline
```

### Quiz
```sql
Quiz
----
quiz_id
course_id
```

---

## 6. Storage Choices

| Store | What to Store | Reason |
|---|---|---|
| **PostgreSQL / MySQL** | Users, Courses, Enrollment, Grades | Strong consistency, complex joins |
| **Redis** | Session data, hot courses, user progress cache | Low-latency reads |
| **Object Storage** (S3/GCS) | Videos, PDFs, Images, Assignments | Scalable blob storage |

---

## 7. Video Delivery

Direct serving from backend is expensive. Use a CDN pipeline:

```
Video Upload
      |
 Object Storage
      |
    CDN
      |
   Student
```

**Benefits:**
- Low latency
- Reduced backend load
- Global delivery

---

## 8. Course Search

SQL search doesn't scale at millions of courses. Use Elasticsearch:

```
Course Service
      |
 Search Index
(Elasticsearch)
```

**Search by:** Title · Category · Instructor · Tags

**Complexity:** `O(log n)` retrieval

---

## 9. Progress Tracking

Watch events are high-volume — use async processing:

```
Client
  |
Progress API
  |
Kafka
  |
Progress Consumer
  |
Database
```

**Why async?**
- Millions of watch events per day
- Avoid DB overload with synchronous writes

---

## 10. Quiz System

```
Student
   |
Submit Answers
   |
Quiz Service
   |
Auto Grader
   |
Result DB
```

| Type | Grading |
|---|---|
| MCQ | Auto-evaluated |
| Subjective | Instructor review |

---

## 11. Notifications

Use message queues for decoupled delivery:

```
Course Published / Event Triggered
       |
     Kafka
       |
Notification Service
       |
 Email / SMS / Push
```

**Example triggers:**
- Assignment deadline reminder
- Quiz result published
- New course launch

---

## 12. Scaling Bottlenecks

### Course Read Traffic
Most traffic is reads → cache aggressively:

```
Redis Cache
     |
Course Service
```

Cache: course details, popular courses

---

### Database Scaling

Read replicas for read-heavy workloads:

```
        Master
        /    \
 Replica1  Replica2
```

- **Writes** → Master
- **Reads** → Replicas

---

### Microservices

Each service scales independently:

```
Auth Service
User Service
Course Service
Quiz Service
Assignment Service
Progress Service
Notification Service
Search Service
```

---

## 13. APIs

| Action | Method & Endpoint |
|---|---|
| Enroll in course | `POST /courses/{id}/enroll` |
| Get course details | `GET /courses/{id}` |
| Update progress | `POST /progress` |
| Submit quiz | `POST /quiz/{id}/submit` |

---

## 14. Interview-Level Discussion Points

### Security
- JWT Authentication
- Role-based access control (RBAC)
- Signed URLs for video access

### Analytics
- Watch time per video
- Course completion rate
- Student engagement metrics

### Recommendations
- Collaborative filtering (user-user / item-item)
- Course similarity (content-based)

### Certificate Generation
- Generate PDF asynchronously
- Store in object storage
- Trigger on course completion event

---

## Final Architecture Summary

```
Client
   |
Load Balancer
   |
API Gateway
   |
------------------------------------------------
| Auth | User | Course | Quiz | Assignment |
------------------------------------------------
                |
           Kafka Queue
                |
 Progress | Notification | Analytics
                |
 PostgreSQL + Redis + Elasticsearch
                |
        Object Storage
                |
              CDN
```

---

> This design is typically strong enough for an **SDE-2 / L4** system design round and gives plenty of opportunities to discuss **scaling**, **caching**, **event-driven architecture**, and **video delivery**.

## CodeCampus

**CodeCampus** is a gamified Java coding platform that enables students solve coding challenges with automated feedback and code evaluation. It fosters a friendly competitive environment through leaderboards for each course, motivating learners to improve continuously.  

Professors can create public or private courses, design customized activities, and set test cases for each activity to automatically evaluate students' code. This provides a hands-on learning experience while enabling instructors to track progress and assess student performance.  

The backend is built with Spring Boot and exposes REST APIs** for authentication, course management, leaderboards, and code execution. The frontend uses vanilla HTML, CSS, and JavaScript, served via a lightweight Node.js static server.

**✨ Features**

- JWT-based authentication (student & professor roles)
- Course creation with activities and pre-assessments
- Course leaderboards and analytics
- Java code execution via a built-in runner service
- File uploads for activities and user assets
- Decoupled frontend served separately from the backend

**🛠 Tech Stack** <br>
Backend
- **Java 21**
- **Spring Boot 3.2**
- **Spring Security (JWT)**
- **Spring Data JPA**
- **MySQL 8**

Frontend
- **Vanilla HTML / CSS / JavaScript**
- **Node.js** (static asset server)

📁 Repository Structure
```text
CodeCampus-Springboot/
├── backend/
│   └── codecampus-backend/        # Spring Boot REST API, services, security
├── frontend/                      # Static frontend assets
│   ├── scripts/                   # Page-specific JavaScript
│   ├── styles/                    # Shared and page-level CSS
│   └── webpages/                  # HTML entry points
├── server.js                      # Node.js static server (frontend)
├── index.html                     # Default landing page (/)
└── src/main/resources/            # Legacy static/templates (not used)

```
📍 Key REST API Endpoints
| Method | Endpoint | Description |
|--------|---------|------------|
| POST   | `/api/users/signup` | Register a student or professor |
| POST   | `/api/users/login`  | Authenticate and receive JWT |
| GET    | `/api/users/me`     | Get authenticated user profile |
| POST   | `/api/courses/full` | Create a full course (professors) |
| GET    | `/api/courses/public` | List public courses |
| GET    | `/api/courses/{id}/overview` | Course overview |
| GET    | `/api/courses/{courseId}/leaderboard` | Course leaderboard |
| POST   | `/api/run`          | Execute Java code |

Future Improvements
Some potential enhancements for CodeCampus include:

- **Modern frontend stack**: Migrate to Next.js with TypeScript for better scalability, maintainability, and developer experience.  
- **Code sandbox**: Implement a secure, isolated sandbox environment for code evaluation to support more complex challenges safely.  
- **Deployment**: Deploy the platform to a cloud provider for public access and testing.  
- **Email integration**: Use a real Gmail account or email service for account creation, password recovery, and notifications.  
- **Expanded analytics**: Track student performance trends over time for deeper insights.
- **Support for additional programming languages**: Extend the platform beyond Java to allow students to practice Python, C++, or other languages.

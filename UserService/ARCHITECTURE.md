# System Architecture - User Service Integration

## 📐 Overall Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                             Client Application                          │
│                    (Web Browser / Mobile App / Postman)                 │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │ HTTP Requests
                                 │
                    ┌────────────▼────────────┐
                    │                         │
                    │     API Gateway         │
                    │   (Port: 8081)          │
                    │                         │
                    │  - Routes requests      │
                    │  - Validates tokens     │
                    │  - Adds user headers    │
                    │                         │
                    └────────┬────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          │                  │                  │
┌─────────▼─────────┐ ┌─────▼──────────┐ ┌────▼──────────┐
│                   │ │                 │ │               │
│  User Service     │ │ Student Service │ │ Other Services│
│  (Port: 9091)     │ │ (Port: 9095)    │ │               │
│                   │ │                 │ │               │
│  - Authentication │ │ - Student CRUD  │ │ - Restaurant  │
│  - JWT tokens     │ │ - Enrollments   │ │ - Payment     │
│  - User management│ │                 │ │ - Delivery    │
│                   │ │                 │ │               │
└─────────┬─────────┘ └─────────┬───────┘ └───────────────┘
          │                     │
          │                     │
┌─────────▼─────────┐ ┌─────────▼───────┐
│                   │ │                 │
│  MySQL Database   │ │ MySQL Database  │
│  (user_db)        │ │ (student_db)    │
│                   │ │                 │
└───────────────────┘ └─────────────────┘
```

---

## 🔐 Authentication Flow

```
┌────────┐         ┌─────────┐         ┌──────────┐         ┌─────────┐
│ Client │         │   API   │         │   User   │         │ Student │
│        │         │ Gateway │         │ Service  │         │ Service │
└───┬────┘         └────┬────┘         └────┬─────┘         └────┬────┘
    │                   │                   │                    │
    │ 1. Sign In        │                   │                    │
    │──────────────────>│                   │                    │
    │                   │ 2. Forward        │                    │
    │                   │──────────────────>│                    │
    │                   │                   │                    │
    │                   │ 3. Validate &     │                    │
    │                   │    Generate Token │                    │
    │                   │<──────────────────│                    │
    │ 4. Return Token   │                   │                    │
    │<──────────────────│                   │                    │
    │                   │                   │                    │
    │ 5. Add Student    │                   │                    │
    │  (with token)     │                   │                    │
    │──────────────────>│                   │                    │
    │                   │ 6. Validate Token │                    │
    │                   │──────────────────>│                    │
    │                   │ 7. User Info      │                    │
    │                   │<──────────────────│                    │
    │                   │ 8. Forward with   │                    │
    │                   │    User Headers   │                    │
    │                   │────────────────────────────────────────>│
    │                   │ 9. Student Created│                    │
    │                   │<────────────────────────────────────────│
    │ 10. Success       │                   │                    │
    │<──────────────────│                   │                    │
    │                   │                   │                    │
```

---

## 🏗️ User Service Internal Architecture

```
┌────────────────────────────────────────────────────────┐
│                    User Service                        │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │           REST API Layer                         │ │
│  │  (AuthController)                                │ │
│  │                                                  │ │
│  │  - POST /auth/sign-up                           │ │
│  │  - POST /auth/sign-in                           │ │
│  │  - POST /auth/validate-token                    │ │
│  │  - GET  /auth/user/{id}                         │ │
│  │  - GET  /auth/health                            │ │
│  └────────────────┬─────────────────────────────────┘ │
│                   │                                    │
│  ┌────────────────▼─────────────────────────────────┐ │
│  │           Service Layer                          │ │
│  │  (AuthService)                                   │ │
│  │                                                  │ │
│  │  - signUp()                                     │ │
│  │  - signIn()                                     │ │
│  │  - validateToken()                              │ │
│  │  - getUserById()                                │ │
│  └────────┬──────────────────┬──────────────────────┘ │
│           │                  │                         │
│  ┌────────▼────────┐  ┌─────▼──────────────┐          │
│  │  JWT Provider   │  │  Repository Layer  │          │
│  │  (Util)         │  │  (UserRepository)  │          │
│  │                 │  │                    │          │
│  │ - Generate      │  │  - findByEmail()   │          │
│  │ - Validate      │  │  - findByUsername()│          │
│  │ - Extract Claims│  │  - save()          │          │
│  └─────────────────┘  └──────┬─────────────┘          │
│                              │                         │
│  ┌───────────────────────────▼───────────────────────┐ │
│  │           Entity Layer (UserEntity)              │ │
│  │                                                  │ │
│  │  - userId, userName, userEmail                  │ │
│  │  - userPassword (BCrypt), role                  │ │
│  │  - isActive, createdAt, updatedAt               │ │
│  └──────────────────────┬───────────────────────────┘ │
│                         │                             │
└─────────────────────────┼─────────────────────────────┘
                          │
                ┌─────────▼──────────┐
                │  MySQL Database    │
                │  (user_db)         │
                │                    │
                │  Table: users      │
                └────────────────────┘
```

---

## 🔄 JWT Token Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    JWT Token Lifecycle                      │
└─────────────────────────────────────────────────────────────┘

1. USER SIGNS IN
   ┌──────────────┐
   │ Credentials  │
   │ - Email      │
   │ - Password   │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Verify       │──> BCrypt.matches(plainPassword, hashedPassword)
   │ Password     │
   └──────┬───────┘
          │
          ▼
   ┌──────────────────┐
   │ Generate Token   │
   │                  │
   │ Header:          │
   │  alg: HS512      │
   │                  │
   │ Payload:         │
   │  userId: 1       │
   │  userEmail: ...  │
   │  userName: ...   │
   │  role: USER      │
   │  iat: timestamp  │
   │  exp: timestamp  │
   │                  │
   │ Signature:       │
   │  HMACSHA512(...) │
   └──────┬───────────┘
          │
          ▼
   ┌──────────────────┐
   │ Return to Client │
   │ Access Token +   │
   │ Refresh Token    │
   └──────────────────┘

2. CLIENT USES TOKEN
   ┌──────────────────┐
   │ HTTP Request     │
   │ Authorization:   │
   │ Bearer <token>   │
   └──────┬───────────┘
          │
          ▼
   ┌──────────────────┐
   │ API Gateway      │
   │ Intercepts       │
   └──────┬───────────┘
          │
          ▼
   ┌──────────────────┐
   │ Validate Token   │
   │ - Check signature│
   │ - Check expiry   │
   │ - Extract claims │
   └──────┬───────────┘
          │
          ▼
   ┌──────────────────┐
   │ Add User Headers │
   │ X-User-Id        │
   │ X-User-Role      │
   │ X-User-Email     │
   │ X-Username       │
   └──────┬───────────┘
          │
          ▼
   ┌──────────────────┐
   │ Forward to       │
   │ Target Service   │
   └──────────────────┘
```

---

## 🗄️ Database Schema

```sql
┌─────────────────────────────────────────────────────┐
│                   users table                       │
├─────────────────────────────────────────────────────┤
│ Column Name      │ Type          │ Constraints     │
├──────────────────┼───────────────┼─────────────────┤
│ user_id          │ BIGINT        │ PK, AUTO_INC    │
│ user_name        │ VARCHAR(255)  │ NOT NULL, UNIQUE│
│ user_email       │ VARCHAR(255)  │ NOT NULL, UNIQUE│
│ user_password    │ VARCHAR(255)  │ NOT NULL        │
│ role             │ VARCHAR(50)   │ NOT NULL        │
│ is_active        │ BOOLEAN       │ NOT NULL        │
│ created_at       │ TIMESTAMP     │ NOT NULL        │
│ updated_at       │ TIMESTAMP     │                 │
└──────────────────┴───────────────┴─────────────────┘

Indexes:
  - PRIMARY KEY (user_id)
  - UNIQUE INDEX (user_email)
  - UNIQUE INDEX (user_name)
  - INDEX (is_active)
```

---

## 🌐 Network Ports

```
┌─────────────────────┬──────────┬──────────────────────┐
│ Service             │ Port     │ Access               │
├─────────────────────┼──────────┼──────────────────────┤
│ API Gateway         │ 8081     │ Public Entry Point   │
│ User Service        │ 9091     │ Internal/Direct      │
│ Student Service     │ 9095     │ Internal/Direct      │
│ MySQL (User DB)     │ 3306     │ Database             │
│ MySQL (Student DB)  │ 3307*    │ Database             │
└─────────────────────┴──────────┴──────────────────────┘

* Different port if running separate instances
```

---

## 🔒 Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                   Security Layers                       │
└─────────────────────────────────────────────────────────┘

Layer 1: Transport Security
  ├─ HTTPS (Production)
  └─ TLS/SSL Certificates

Layer 2: API Gateway Security
  ├─ Request Validation
  ├─ Rate Limiting
  └─ Token Verification

Layer 3: User Service Security
  ├─ Password Encryption (BCrypt)
  ├─ JWT Token Generation (HS512)
  ├─ Token Validation
  └─ User Active Status Check

Layer 4: Database Security
  ├─ Connection Pooling
  ├─ Prepared Statements (SQL Injection Prevention)
  └─ User Credentials Protection

Layer 5: Application Security
  ├─ Role-Based Access Control (RBAC)
  ├─ Exception Handling
  └─ Logging & Monitoring
```

---

## 📦 Component Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                  User Service Components                     │
│                                                              │
│  ┌────────────────┐                                         │
│  │ AuthController │                                         │
│  │  (REST API)    │                                         │
│  └───────┬────────┘                                         │
│          │ uses                                             │
│  ┌───────▼─────────┐     ┌─────────────────┐              │
│  │  AuthService    │────>│ JwtTokenProvider│              │
│  │  (Business      │     │  (JWT Util)     │              │
│  │   Logic)        │     └─────────────────┘              │
│  └───────┬─────────┘                                       │
│          │ uses                                            │
│  ┌───────▼──────────┐    ┌──────────────────┐             │
│  │ UserRepository   │───>│ PasswordEncoder  │             │
│  │   (Data Access)  │    │   (BCrypt)       │             │
│  └───────┬──────────┘    └──────────────────┘             │
│          │ manages                                         │
│  ┌───────▼─────────┐                                      │
│  │   UserEntity    │                                      │
│  │   (JPA Entity)  │                                      │
│  └─────────────────┘                                      │
│                                                            │
│  Exception Handlers:                                      │
│  ├─ GlobalExceptionHandler                               │
│  ├─ UserNotFoundException                                │
│  ├─ InvalidCredentialsException                          │
│  └─ UserAlreadyExistsException                           │
│                                                            │
│  DTOs:                                                    │
│  ├─ SignUpRequest                                        │
│  ├─ SignInRequest                                        │
│  ├─ SignInResponse                                       │
│  ├─ UserResponse                                         │
│  └─ UserData                                             │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 Request/Response Flow Example

### Example: Adding a Student (Protected Operation)

```
1. CLIENT REQUEST
   POST http://localhost:8081/api-gateway/student-service/students
   Headers: Authorization: Bearer eyJhbGc...
   Body: {"studentName": "Alice", "email": "alice@example.com"}

2. API GATEWAY
   ├─ Receives request
   ├─ Extracts token from Authorization header
   ├─ Checks if endpoint is in open-endpoints list (NO)
   └─ Proceeds to validation

3. TOKEN VALIDATION
   POST http://localhost:9091/user-service/auth/validate-token
   Headers: Authorization: Bearer eyJhbGc...
   
   User Service:
   ├─ Removes "Bearer " prefix
   ├─ Validates JWT signature
   ├─ Checks token expiration
   ├─ Extracts claims (userId, email, username, role)
   └─ Returns UserResponse

4. API GATEWAY ENRICHMENT
   Adds headers to request:
   ├─ X-User-Id: 1
   ├─ X-User-Role: USER
   ├─ X-User-Email: test@example.com
   └─ X-Username: testuser

5. FORWARD TO STUDENT SERVICE
   POST http://localhost:9095/students-service/students
   Headers: 
     Content-Type: application/json
     X-User-Id: 1
     X-User-Role: USER
     X-User-Email: test@example.com
     X-Username: testuser
   Body: {"studentName": "Alice", "email": "alice@example.com"}

6. STUDENT SERVICE
   ├─ Receives request with user context
   ├─ Processes student creation
   ├─ Can access authenticated user info from headers
   └─ Returns response

7. API GATEWAY
   ├─ Receives response from Student Service
   └─ Forwards to client

8. CLIENT
   Receives: {"id": 123, "studentName": "Alice", ...}
```

---

## 📝 Configuration Overview

```
┌─────────────────────────────────────────────────────┐
│              Configuration Hierarchy                │
└─────────────────────────────────────────────────────┘

application.yml (Default)
  ├─ server.port: 9091
  ├─ server.servlet.context-path: /user-service
  ├─ spring.datasource.*
  ├─ spring.jpa.*
  └─ jwt.*

Environment Variables (Override defaults)
  ├─ SERVER_PORT
  ├─ DB_HOST, DB_PORT, DB_NAME
  ├─ DB_USERNAME, DB_PASSWORD
  └─ JWT_SECRET, JWT_EXPIRATION

Docker Compose (Container deployment)
  ├─ All environment variables
  └─ Network configuration

API Gateway Configuration
  ├─ user.service.url: http://localhost:9091/user-service
  ├─ spring.cloud.gateway.routes
  └─ spring.cloud.gateway.open-endpoints
```

---

**Architecture Documentation Version 1.0**  
**Last Updated**: March 5, 2025


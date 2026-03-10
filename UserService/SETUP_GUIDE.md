# User Service - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Database Setup

#### Option A: Using Docker Compose (Recommended)
```bash
cd UserService
docker-compose up -d mysql
```

#### Option B: Manual MySQL Setup
```sql
CREATE DATABASE user_db;
```

### Step 2: Configure Environment Variables

Create a `.env` file or set these environment variables:
```bash
export JWT_SECRET="my-super-secret-jwt-key-at-least-256-bits-long-for-production"
export DB_PASSWORD="12345678"
```

### Step 3: Build and Run

```bash
cd UserService
mvn clean install
mvn spring-boot:run
```

The service will start on `http://localhost:9091`

---

## 📝 Complete Testing Flow

### 1. Start All Services

```bash
# Terminal 1 - User Service
cd UserService
mvn spring-boot:run

# Terminal 2 - API Gateway
cd Api-Gateway
mvn spring-boot:run

# Terminal 3 - Student Service (if needed)
cd StudentService
mvn spring-boot:run
```

### 2. Register a New User

```bash
curl -X POST http://localhost:8081/api-gateway/user-service/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "testuser",
    "userEmail": "test@example.com",
    "userPassword": "Test123!",
    "role": "USER"
  }'
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "statusCode": 201,
  "body": {
    "userId": 1,
    "userEmail": "test@example.com",
    "userName": "testuser",
    "role": "USER"
  }
}
```

### 3. Sign In and Get Access Token

```bash
curl -X POST http://localhost:8081/api-gateway/user-service/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "test@example.com",
    "userPassword": "Test123!"
  }'
```

**Expected Response:**
```json
{
  "message": "User signed in successfully",
  "statusCode": 200,
  "body": {
    "userId": 1,
    "userName": "testuser",
    "userEmail": "test@example.com",
    "role": "USER",
    "accessToken": "eyJhbGciOiJIUzUxMiJ9.eyJ1c2VySWQiOjEsInVzZXJFbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJ1c2VyTmFtZSI6InRlc3R1c2VyIiwicm9sZSI6IlVTRVIiLCJzdWIiOiIxIiwiaWF0IjoxNzA5NjQ3NjAwLCJleHAiOjE3MDk2NTEyMDB9.abc123...",
    "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
  }
}
```

**Important:** Copy the `accessToken` value for the next steps!

### 4. Validate Token (Optional)

```bash
curl -X POST http://localhost:9091/user-service/auth/validate-token \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### 5. Access Protected Endpoint (Student Service Example)

Now use the access token to call protected endpoints through the API Gateway:

```bash
curl -X POST http://localhost:8081/api-gateway/student-service/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "studentName": "Alice Johnson",
    "email": "alice@example.com"
  }'
```

The API Gateway will:
1. ✅ Extract the token
2. ✅ Validate it with User Service
3. ✅ Add user info to headers (X-User-Id, X-User-Role, etc.)
4. ✅ Forward to Student Service

---

## 🔄 Authentication Flow Diagram

```
┌──────────┐          ┌──────────────┐          ┌──────────────┐          ┌──────────────────┐
│  Client  │          │ API Gateway  │          │ User Service │          │ Student Service  │
└────┬─────┘          └──────┬───────┘          └──────┬───────┘          └────────┬─────────┘
     │                       │                         │                           │
     │  1. Sign In           │                         │                           │
     │──────────────────────>│                         │                           │
     │                       │  2. Forward to User Service                         │
     │                       │────────────────────────>│                           │
     │                       │                         │                           │
     │                       │  3. Validate & Generate Token                       │
     │                       │<────────────────────────│                           │
     │  4. Return Token      │                         │                           │
     │<──────────────────────│                         │                           │
     │                       │                         │                           │
     │  5. Add Student (with token)                    │                           │
     │──────────────────────>│                         │                           │
     │                       │  6. Validate Token      │                           │
     │                       │────────────────────────>│                           │
     │                       │  7. User Info           │                           │
     │                       │<────────────────────────│                           │
     │                       │  8. Forward with User Headers                       │
     │                       │───────────────────────────────────────────────────>│
     │                       │  9. Process & Response                              │
     │                       │<───────────────────────────────────────────────────│
     │  10. Success Response │                         │                           │
     │<──────────────────────│                         │                           │
```

---

## 🧪 Testing with Postman

1. Import the collection: `User-Service-API.postman_collection.json`
2. Run "Sign In" request
3. Copy the `accessToken` from response
4. Create a Postman variable: `accessToken` = (paste token)
5. Run "Validate Token" or protected endpoints

---

## 🔍 Verification Checklist

- [ ] MySQL database `user_db` created
- [ ] User Service running on port 9091
- [ ] API Gateway running on port 8081
- [ ] Can sign up a new user
- [ ] Can sign in and receive access token
- [ ] Token validation works
- [ ] Can access protected endpoints with token
- [ ] API Gateway validates tokens before forwarding requests

---

## 🐛 Common Issues & Solutions

### Issue 1: "Connection refused" error
**Solution:** Ensure MySQL is running on port 3306
```bash
# Check if MySQL is running
lsof -i :3306

# Start MySQL with Docker
docker-compose up -d mysql
```

### Issue 2: "Invalid or expired token"
**Solution:** 
- Check if token is expired (1 hour lifetime)
- Ensure JWT secret matches in User Service config
- Sign in again to get a new token

### Issue 3: "Port 9091 already in use"
**Solution:**
```bash
# Find and kill process on port 9091
lsof -ti:9091 | xargs kill -9

# Or change port in application.yml
SERVER_PORT=9092 mvn spring-boot:run
```

### Issue 4: "User already exists"
**Solution:** Use a different email address or delete the existing user from database:
```sql
DELETE FROM users WHERE user_email = 'test@example.com';
```

---

## 📊 Database Schema

The User Service creates this table automatically:

```sql
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL UNIQUE,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    user_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    INDEX idx_email (user_email),
    INDEX idx_username (user_name)
);
```

---

## 🎯 Next Steps

1. ✅ User Service is running
2. ✅ Authentication flow is working
3. 🔜 Integrate with other microservices
4. 🔜 Add refresh token endpoint
5. 🔜 Implement password reset
6. 🔜 Add role-based authorization

---

## 📞 Support

If you encounter issues:
1. Check logs in console
2. Verify all services are running
3. Review the README.md for detailed documentation
4. Check database connectivity

---

**Happy Coding! 🚀**


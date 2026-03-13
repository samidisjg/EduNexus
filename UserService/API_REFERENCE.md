# User Service - API Quick Reference

## 🔗 Base URLs
- **Direct**: `http://localhost:9091/user-service`
- **Via API Gateway**: `http://localhost:8081/api-gateway/user-service`

---

## 🔓 Public Endpoints (No Authentication Required)

### 1. Sign Up
```bash
POST /auth/sign-up

Body:
{
  "userName": "john_doe",
  "userEmail": "john@example.com",
  "userPassword": "SecurePassword123",
  "role": "USER"  // Optional, defaults to "USER"
}

Response (201):
{
  "message": "User registered successfully",
  "statusCode": 201,
  "body": {
    "userId": 1,
    "userEmail": "john@example.com",
    "userName": "john_doe",
    "role": "USER"
  }
}
```

### 2. Sign In
```bash
POST /auth/sign-in

Body:
{
  "userEmail": "john@example.com",
  "userPassword": "SecurePassword123"
}

Response (200):
{
  "message": "User signed in successfully",
  "statusCode": 200,
  "body": {
    "userId": 1,
    "userName": "john_doe",
    "userEmail": "john@example.com",
    "role": "USER",
    "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
    "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
  }
}
```

### 3. Health Check
```bash
GET /auth/health

Response (200):
{
  "status": "UP",
  "service": "User Service",
  "message": "Service is running"
}
```

---

## 🔐 Protected Endpoints (Authentication Required)

### 4. Validate Token
```bash
POST /auth/validate-token

Headers:
Authorization: Bearer <access_token>

Response (200):
{
  "message": "Token is valid",
  "statusCode": 200,
  "body": {
    "userId": 1,
    "userEmail": "john@example.com",
    "userName": "john_doe",
    "role": "USER"
  }
}
```

### 5. Get User By ID
```bash
GET /auth/user/{userId}

Response (200):
{
  "message": "User found",
  "statusCode": 200,
  "body": {
    "userId": 1,
    "userEmail": "john@example.com",
    "userName": "john_doe",
    "role": "USER"
  }
}
```

---

## ⚡ Quick cURL Commands

### Sign Up
```bash
curl -X POST http://localhost:8081/api-gateway/user-service/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"userName":"testuser","userEmail":"test@example.com","userPassword":"Test123!","role":"USER"}'
```

### Sign In
```bash
curl -X POST http://localhost:8081/api-gateway/user-service/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"userEmail":"test@example.com","userPassword":"Test123!"}'
```

### Validate Token
```bash
curl -X POST http://localhost:9091/user-service/auth/validate-token \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Access Protected Endpoint (Example: Add Student)
```bash
curl -X POST http://localhost:8081/api-gateway/student-service/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"studentName":"Alice","email":"alice@example.com"}'
```

---

## 📊 HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful request |
| 201 | Created | User registered successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Invalid credentials or token |
| 404 | Not Found | User not found |
| 409 | Conflict | User already exists |
| 500 | Internal Server Error | Server error |

---

## 🚨 Common Error Responses

### User Already Exists (409)
```json
{
  "statusCode": 409,
  "message": "User already exists with this email",
  "timestamp": "2025-03-05T10:30:00"
}
```

### Invalid Credentials (401)
```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "timestamp": "2025-03-05T10:30:00"
}
```

### User Not Found (404)
```json
{
  "statusCode": 404,
  "message": "User not found with this email",
  "timestamp": "2025-03-05T10:30:00"
}
```

### Invalid Token (401)
```json
{
  "statusCode": 401,
  "message": "Invalid or expired token",
  "timestamp": "2025-03-05T10:30:00"
}
```

---

## 🔑 Token Format

### Authorization Header
```
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJ1c2VySWQiOjEsInVzZXJFbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJ1c2VyTmFtZSI6InRlc3R1c2VyIiwicm9sZSI6IlVTRVIiLCJzdWIiOiIxIiwiaWF0IjoxNzA5NjQ3NjAwLCJleHAiOjE3MDk2NTEyMDB9.abc123...
```

### Token Expiry
- **Access Token**: 1 hour
- **Refresh Token**: 24 hours

---

## 🎯 Typical Workflow

1. **Register** → POST `/auth/sign-up`
2. **Login** → POST `/auth/sign-in` → Get `accessToken`
3. **Use Token** → Add `Authorization: Bearer {token}` to all protected requests
4. **Token Expires** → Sign in again or use refresh token (future feature)

---

## 📱 Postman Collection

Import: `User-Service-API.postman_collection.json`

Variables to set:
- `accessToken` - Copy from sign-in response

---

## 💡 Pro Tips

1. **Save the access token** after sign-in for subsequent requests
2. **Token is valid for 1 hour** - after that, sign in again
3. **Use environment variables** for different environments (dev, staging, prod)
4. **Test via API Gateway** to ensure full integration works
5. **Check logs** for detailed error information

---

## 🔄 Integration with Other Services

When calling protected endpoints on other services (e.g., Student Service):

```bash
# The API Gateway will:
# 1. Validate your token with User Service
# 2. Add these headers to the request:
#    - X-User-Id: 1
#    - X-User-Role: USER
#    - X-User-Email: test@example.com
#    - X-Username: testuser
# 3. Forward to the target service

curl -X POST http://localhost:8081/api-gateway/student-service/students \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"studentName":"Bob","email":"bob@example.com"}'
```

---

**Quick Reference Version 1.0**  
**Last Updated**: March 5, 2025


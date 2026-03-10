# ✅ User Service - Quick Start Checklist

## Pre-requisites Setup

### 1. Database Setup
- [ ] MySQL 8.0+ installed
- [ ] MySQL service is running
- [ ] Create database:
  ```sql
  CREATE DATABASE user_db;
  ```

### 2. Environment Setup
- [ ] Java 17+ installed
- [ ] Maven 3.6+ installed
- [ ] Set environment variables:
  ```bash
  export JWT_SECRET="your-secret-key-at-least-256-bits-long"
  export DB_PASSWORD="12345678"
  ```

---

## Building & Running

### Option A: Maven (Recommended for Development)
- [ ] Navigate to UserService directory
- [ ] Run build:
  ```bash
  mvn clean install
  ```
- [ ] Start service:
  ```bash
  mvn spring-boot:run
  ```
- [ ] Verify: Service runs on port 9091
- [ ] Check logs: "=================== USER SERVICE ==================="

### Option B: Docker Compose (Recommended for Production)
- [ ] Navigate to UserService directory
- [ ] Start services:
  ```bash
  docker-compose up -d
  ```
- [ ] Check status:
  ```bash
  docker-compose ps
  ```
- [ ] View logs:
  ```bash
  docker-compose logs -f user-service
  ```

---

## Testing the Service

### Step 1: Health Check
- [ ] Test health endpoint:
  ```bash
  curl http://localhost:9091/user-service/auth/health
  ```
- [ ] Expected response: `{"status":"UP","service":"User Service","message":"Service is running"}`

### Step 2: Sign Up
- [ ] Create test user:
  ```bash
  curl -X POST http://localhost:9091/user-service/auth/sign-up \
    -H "Content-Type: application/json" \
    -d '{
      "userName": "testuser",
      "userEmail": "test@example.com",
      "userPassword": "Test123!",
      "role": "USER"
    }'
  ```
- [ ] Response status: 201
- [ ] Received userId in response

### Step 3: Sign In
- [ ] Login with credentials:
  ```bash
  curl -X POST http://localhost:9091/user-service/auth/sign-in \
    -H "Content-Type: application/json" \
    -d '{
      "userEmail": "test@example.com",
      "userPassword": "Test123!"
    }'
  ```
- [ ] Response status: 200
- [ ] **Copy the accessToken from response** (you'll need it!)

### Step 4: Validate Token
- [ ] Test token validation:
  ```bash
  curl -X POST http://localhost:9091/user-service/auth/validate-token \
    -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
  ```
- [ ] Response status: 200
- [ ] Received user info in response

---

## API Gateway Integration Testing

### Step 1: Start All Services
- [ ] API Gateway running on port 8081
- [ ] User Service running on port 9091
- [ ] Student Service running on port 9095 (optional)

### Step 2: Sign Up via API Gateway
- [ ] Test through gateway:
  ```bash
  curl -X POST http://localhost:8081/api-gateway/user-service/auth/sign-up \
    -H "Content-Type: application/json" \
    -d '{
      "userName": "gatewaytest",
      "userEmail": "gateway@example.com",
      "userPassword": "Gateway123!",
      "role": "USER"
    }'
  ```
- [ ] Response status: 201

### Step 3: Sign In via API Gateway
- [ ] Login through gateway:
  ```bash
  curl -X POST http://localhost:8081/api-gateway/user-service/auth/sign-in \
    -H "Content-Type: application/json" \
    -d '{
      "userEmail": "gateway@example.com",
      "userPassword": "Gateway123!"
    }'
  ```
- [ ] **Save the accessToken**

### Step 4: Access Protected Endpoint (Student Service)
- [ ] Test authenticated request:
  ```bash
  curl -X POST http://localhost:8081/api-gateway/student-service/students \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
    -d '{
      "studentName": "Alice Johnson",
      "email": "alice@example.com"
    }'
  ```
- [ ] Request successful (student created)
- [ ] No authentication errors

---

## Postman Testing

### Setup
- [ ] Import collection: `User-Service-API.postman_collection.json`
- [ ] Create environment in Postman
- [ ] Add variable: `baseUrl` = `http://localhost:9091`
- [ ] Add variable: `gatewayUrl` = `http://localhost:8081`

### Test Sequence
1. - [ ] Run "Sign Up" request
2. - [ ] Run "Sign In" request
3. - [ ] Copy `accessToken` from response
4. - [ ] Set Postman variable: `accessToken` = (paste token)
5. - [ ] Run "Validate Token" request
6. - [ ] Run "Get User By ID" request
7. - [ ] Run "Student - Add Student (Protected)" request

---

## Verification Checklist

### Service Health
- [ ] User Service accessible on http://localhost:9091
- [ ] Health endpoint returns "UP" status
- [ ] No errors in console logs
- [ ] Database connection successful

### Authentication Features
- [ ] Can register new users
- [ ] Cannot register duplicate email/username
- [ ] Can login with correct credentials
- [ ] Cannot login with wrong credentials
- [ ] Receive JWT token on successful login
- [ ] Token contains expected claims (userId, email, role)

### Token Validation
- [ ] Can validate valid token
- [ ] Invalid token returns 401 error
- [ ] Expired token returns 401 error
- [ ] Token format "Bearer {token}" works

### API Gateway Integration
- [ ] Can access User Service through gateway
- [ ] Open endpoints (sign-up, sign-in) work without token
- [ ] Protected endpoints require valid token
- [ ] Token validation happens before forwarding
- [ ] User headers added to forwarded requests

### Database
- [ ] Users table created automatically
- [ ] User records inserted on sign-up
- [ ] Passwords are hashed (not plain text)
- [ ] Email and username are unique

---

## Common Issues Checklist

### If Service Won't Start
- [ ] Check if port 9091 is available: `lsof -i :9091`
- [ ] Check if MySQL is running: `mysql -u root -p`
- [ ] Verify database exists: `SHOW DATABASES;`
- [ ] Check Java version: `java -version` (should be 17+)
- [ ] Check Maven version: `mvn -version` (should be 3.6+)

### If Database Connection Fails
- [ ] MySQL service is running
- [ ] Database `user_db` exists
- [ ] Credentials are correct in application.yml
- [ ] Port 3306 is accessible
- [ ] Check connection string format

### If Token Validation Fails
- [ ] Token is not expired (check timestamp)
- [ ] JWT_SECRET is set correctly
- [ ] Token format is "Bearer {token}"
- [ ] Token was generated by this service
- [ ] Check console logs for JWT errors

### If API Gateway Can't Connect
- [ ] User Service is running
- [ ] API Gateway configuration has correct URL
- [ ] Port 9091 is accessible from gateway
- [ ] Check API Gateway logs for connection errors

---

## Production Deployment Checklist

### Security
- [ ] Change JWT_SECRET to strong random string (256+ bits)
- [ ] Use environment variables for sensitive data
- [ ] Change default database password
- [ ] Enable HTTPS/TLS
- [ ] Set up firewall rules

### Performance
- [ ] Configure database connection pool
- [ ] Set appropriate JWT expiration time
- [ ] Enable logging (but not sensitive data)
- [ ] Monitor service health endpoint

### Monitoring
- [ ] Set up health check monitoring
- [ ] Configure log aggregation
- [ ] Set up alerts for errors
- [ ] Monitor database performance

---

## Documentation Checklist

- [ ] Read README.md for overview
- [ ] Review SETUP_GUIDE.md for detailed setup
- [ ] Check API_REFERENCE.md for endpoint details
- [ ] Understand ARCHITECTURE.md for system design
- [ ] Review IMPLEMENTATION_SUMMARY.md for project details

---

## Final Verification

### All Green? ✅
If all items above are checked, you have successfully:
- ✅ Set up User Service
- ✅ Tested all authentication features
- ✅ Integrated with API Gateway
- ✅ Verified end-to-end flow
- ✅ Ready for production use!

### Need Help?
Refer to:
- **Setup issues**: [SETUP_GUIDE.md](SETUP_GUIDE.md#-common-issues--solutions)
- **API errors**: [API_REFERENCE.md](API_REFERENCE.md#-common-error-responses)
- **Architecture questions**: [ARCHITECTURE.md](ARCHITECTURE.md)

---

## Quick Command Reference

```bash
# Build
mvn clean install

# Run
mvn spring-boot:run

# Docker
docker-compose up -d

# Test
curl http://localhost:9091/user-service/auth/health

# Stop
docker-compose down
```

---

**Last Updated**: March 5, 2025  
**Version**: 1.0.0

Print this checklist and mark items as you complete them! ✅


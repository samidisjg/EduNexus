# User Service - Authentication & Authorization

## Overview
User Service is a microservice responsible for user authentication and authorization in the API Gateway architecture. It provides JWT-based authentication with sign-up, sign-in, and token validation capabilities.

## Features
- ✅ User Registration (Sign-up)
- ✅ User Authentication (Sign-in)
- ✅ JWT Token Generation
- ✅ JWT Token Validation
- ✅ Password Encryption with BCrypt
- ✅ Role-based Access Control
- ✅ Integration with API Gateway

## Technology Stack
- **Java**: 17
- **Spring Boot**: 4.0.3
- **Spring Data JPA**: For database operations
- **MySQL**: Database
- **JWT (JJWT)**: 0.11.5 for token management
- **BCrypt**: Password hashing
- **Lombok**: Reduce boilerplate code

## Prerequisites
- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- API Gateway running on port 8081

## Database Setup

### 1. Create MySQL Database
```sql
CREATE DATABASE user_db;
```

### 2. Configure Database Connection
Update `src/main/resources/application.yml` with your MySQL credentials:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/user_db
    username: root
    password: your_password
```

Or set environment variables:
```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=user_db
export DB_USERNAME=root
export DB_PASSWORD=your_password
```

## Configuration

### JWT Configuration
Set a strong JWT secret key (minimum 256 bits):
```yaml
jwt:
  secret: your-secret-key-change-this-in-production-at-least-256-bit
  expiration: 3600000  # 1 hour in milliseconds
  refresh-expiration: 86400000  # 24 hours
```

Or use environment variables:
```bash
export JWT_SECRET=your-secret-key-change-this-in-production-at-least-256-bit
export JWT_EXPIRATION=3600000
```

## Build and Run

### 1. Build the project
```bash
cd UserService
mvn clean install
```

### 2. Run the application
```bash
mvn spring-boot:run
```

Or run with custom port:
```bash
SERVER_PORT=9091 mvn spring-boot:run
```

The service will start on `http://localhost:9091`

## API Endpoints

### Base URL
- Direct: `http://localhost:9091/user-service`
- Via API Gateway: `http://localhost:8081/api-gateway/user-service`

### 1. Sign Up (Public)
**POST** `/auth/sign-up`

Request Body:
```json
{
  "userName": "john_doe",
  "userEmail": "john@example.com",
  "userPassword": "SecurePassword123",
  "role": "USER"
}
```

Response:
```json
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

### 2. Sign In (Public)
**POST** `/auth/sign-in`

Request Body:
```json
{
  "userEmail": "john@example.com",
  "userPassword": "SecurePassword123"
}
```

Response:
```json
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

### 3. Validate Token (Protected)
**POST** `/auth/validate-token`

Headers:
```
Authorization: Bearer <access_token>
```

Response:
```json
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

### 4. Get User By ID (Protected)
**GET** `/auth/user/{userId}`

Response:
```json
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

### 5. Health Check
**GET** `/auth/health`

Response:
```json
{
  "status": "UP",
  "service": "User Service",
  "message": "Service is running"
}
```

## Integration with API Gateway

### Flow Example: Adding a Student

1. **User signs in and gets access token**
```bash
curl -X POST http://localhost:8081/api-gateway/user-service/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "john@example.com",
    "userPassword": "SecurePassword123"
  }'
```

2. **Use access token to add student**
```bash
curl -X POST http://localhost:8081/api-gateway/student-service/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "studentName": "Jane Doe",
    "email": "jane@example.com"
  }'
```

### Authentication Flow
1. User calls API Gateway with access token
2. API Gateway validates token by calling User Service `/auth/validate-token`
3. If valid, API Gateway adds user info to headers (X-User-Id, X-User-Role, etc.)
4. Request is forwarded to the target service (e.g., Student Service)
5. Target service processes the request with authenticated user context

## API Gateway Configuration

The API Gateway is already configured for User Service in `application.yml`:

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: http://localhost:9091
          predicates:
            - Path=/api-gateway/user-service/**
          filters:
            - StripPrefix=1

      open-endpoints:
        - /api-gateway/user-service/auth/sign-up
        - /api-gateway/user-service/auth/sign-in
```

## User Roles

Default roles:
- **USER**: Regular user with standard access
- **ADMIN**: Administrator with elevated privileges

You can extend roles by modifying the `role` field in the database.

## Security Features

1. **Password Hashing**: BCrypt with salt
2. **JWT Tokens**: HS512 algorithm
3. **Token Expiration**: 1 hour for access tokens, 24 hours for refresh tokens
4. **Active User Check**: Inactive users cannot sign in
5. **Email & Username Uniqueness**: Enforced at database level

## Error Handling

The service includes comprehensive error handling:
- `UserNotFoundException` (404)
- `InvalidCredentialsException` (401)
- `UserAlreadyExistsException` (409)
- Global exception handler for unexpected errors (500)

## Testing

### Using cURL

**Sign Up:**
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

**Sign In:**
```bash
curl -X POST http://localhost:9091/user-service/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "test@example.com",
    "userPassword": "Test123!"
  }'
```

**Validate Token:**
```bash
curl -X POST http://localhost:9091/user-service/auth/validate-token \
  -H "Authorization: Bearer <your_access_token>"
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure MySQL is running
   - Check database credentials
   - Verify database `user_db` exists

2. **JWT Token Invalid**
   - Check if token is expired
   - Ensure JWT secret matches between services
   - Verify token format: `Bearer <token>`

3. **Port Already in Use**
   - Change port in `application.yml` or set `SERVER_PORT` env variable
   - Kill process using port 9091: `lsof -ti:9091 | xargs kill -9`

## Future Enhancements

- [ ] Refresh token endpoint
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Two-factor authentication (2FA)
- [ ] OAuth2 integration
- [ ] Token blacklist for logout
- [ ] User profile management

## Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

This project is part of SLIIT Y4S2 CTSE Assignment.

---

**Author**: User-Service Team  
**Created**: March 5, 2025  
**Version**: 1.0.0


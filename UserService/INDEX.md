# 📚 User Service - Documentation Index

Welcome to the User Service documentation! This service provides authentication and authorization for the API Gateway architecture.

---

## 🚀 Getting Started

### Quick Links
- **[Setup Guide](SETUP_GUIDE.md)** - 5-minute quick start guide
- **[API Reference](API_REFERENCE.md)** - Quick reference for all endpoints
- **[Postman Collection](ApiCollection/User-Service-API.postman_collection.json)** - Import and test

### First Time Setup
1. Read the [Setup Guide](SETUP_GUIDE.md)
2. Create MySQL database: `CREATE DATABASE user_db;`
3. Configure JWT secret (see [Configuration](#configuration))
4. Run: `mvn spring-boot:run`
5. Test with [Postman Collection](ApiCollection/User-Service-API.postman_collection.json)

---

## 📖 Documentation Files

### 1. **[README.md](README.md)**
Complete documentation covering:
- Overview and features
- Technology stack
- Database setup
- API endpoints
- Integration with API Gateway
- Troubleshooting

### 2. **[SETUP_GUIDE.md](SETUP_GUIDE.md)**
Step-by-step setup instructions:
- Quick setup (5 minutes)
- Complete testing flow
- Authentication flow diagram
- Testing with Postman
- Verification checklist
- Common issues and solutions

### 3. **[API_REFERENCE.md](API_REFERENCE.md)**
Quick API reference:
- All endpoints with examples
- cURL commands
- HTTP status codes
- Error responses
- Token format
- Integration examples

### 4. **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)**
Comprehensive project summary:
- Complete file structure
- Features implemented
- Technologies used
- Configuration details
- Deployment options
- Testing scenarios

### 5. **[ARCHITECTURE.md](ARCHITECTURE.md)**
System architecture documentation:
- Overall architecture diagram
- Authentication flow
- Component diagrams
- Database schema
- Security layers
- Request/response flow

---

## 🎯 Use Cases

### For Developers
- **New to Project**: Start with [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **API Integration**: Check [API_REFERENCE.md](API_REFERENCE.md)
- **Understanding Architecture**: Read [ARCHITECTURE.md](ARCHITECTURE.md)
- **Full Details**: See [README.md](README.md)

### For Testers
- **API Testing**: Import [Postman Collection](ApiCollection/User-Service-API.postman_collection.json)
- **Test Scenarios**: See [SETUP_GUIDE.md](SETUP_GUIDE.md#-complete-testing-flow)
- **Expected Responses**: Check [API_REFERENCE.md](API_REFERENCE.md)

### For DevOps
- **Deployment**: Use [Docker Compose](compose.yaml) or [Dockerfile](Dockerfile)
- **Configuration**: See [.env.example](.env.example)
- **Architecture**: Review [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 🔧 Configuration

### Environment Variables
See [.env.example](.env.example) for all configurable options:
- Database connection
- JWT configuration
- Server settings

### Quick Config
```bash
# Essential variables
export JWT_SECRET="your-256-bit-secret-key"
export DB_PASSWORD="your_database_password"
```

---

## 📦 Project Structure

```
UserService/
├── 📄 README.md                          # Main documentation
├── 📄 SETUP_GUIDE.md                     # Quick start guide
├── 📄 API_REFERENCE.md                   # API quick reference
├── 📄 IMPLEMENTATION_SUMMARY.md          # Project summary
├── 📄 ARCHITECTURE.md                    # Architecture docs
├── 📄 INDEX.md                           # This file
├── 📄 pom.xml                            # Maven config
├── 📄 Dockerfile                         # Docker image
├── 📄 compose.yaml                       # Docker Compose
├── 📄 .env.example                       # Environment template
├── 📄 .gitignore                         # Git ignore
├── 📄 User-Service-API.postman_collection.json  # Postman tests
└── src/
    ├── main/
    │   ├── java/com/sliit/userservice/
    │   │   ├── UserServiceApplication.java       # Main class
    │   │   ├── config/                           # Configuration
    │   │   ├── controller/                       # REST controllers
    │   │   ├── dtos/                             # Data transfer objects
    │   │   ├── entity/                           # Database entities
    │   │   ├── exception/                        # Exception handlers
    │   │   ├── repository/                       # Data repositories
    │   │   ├── service/                          # Business logic
    │   │   └── util/                             # Utilities (JWT)
    │   └── resources/
    │       └── application.yml                   # App config
    └── test/
        └── java/com/sliit/userservice/
            └── UserServiceApplicationTests.java  # Tests
```

---

## 🔐 Authentication Flow

```
1. User signs up    → POST /auth/sign-up
2. User signs in    → POST /auth/sign-in → Receive access token
3. Use token        → Add "Authorization: Bearer {token}" to requests
4. API Gateway      → Validates token with User Service
5. Forward request  → To target service with user context headers
```

Detailed flow: [ARCHITECTURE.md](ARCHITECTURE.md#-authentication-flow)

---

## 📋 API Endpoints Summary

### Public Endpoints
- `POST /auth/sign-up` - Register new user
- `POST /auth/sign-in` - Login and get token
- `GET /auth/health` - Health check

### Protected Endpoints
- `POST /auth/validate-token` - Validate JWT token
- `GET /auth/user/{userId}` - Get user by ID

Full details: [API_REFERENCE.md](API_REFERENCE.md)

---

## 🧪 Testing

### Quick Test
```bash
# 1. Sign up
curl -X POST http://localhost:9091/user-service/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"userName":"test","userEmail":"test@example.com","userPassword":"Test123!","role":"USER"}'

# 2. Sign in
curl -X POST http://localhost:9091/user-service/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"userEmail":"test@example.com","userPassword":"Test123!"}'

# Copy the accessToken from response

# 3. Validate token
curl -X POST http://localhost:9091/user-service/auth/validate-token \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

More examples: [SETUP_GUIDE.md](SETUP_GUIDE.md#-complete-testing-flow)

---

## 🚀 Deployment

### Local Development
```bash
mvn clean install
mvn spring-boot:run
```

### Docker Compose (Recommended)
```bash
docker-compose up -d
```

### Docker Build
```bash
mvn clean package
docker build -t user-service:latest .
docker run -p 9091:9091 user-service:latest
```

Full guide: [README.md](README.md#build-and-run)

---

## 🔍 Troubleshooting

Common issues and solutions:
- **Database connection**: See [SETUP_GUIDE.md](SETUP_GUIDE.md#-common-issues--solutions)
- **Token issues**: Check [API_REFERENCE.md](API_REFERENCE.md#-common-error-responses)
- **Port conflicts**: See [README.md](README.md#troubleshooting)

---

## 📊 Key Features

✅ User registration with email/username validation  
✅ Secure password hashing (BCrypt)  
✅ JWT token generation and validation  
✅ Access tokens (1 hour) + Refresh tokens (24 hours)  
✅ Role-based access control  
✅ API Gateway integration  
✅ Comprehensive error handling  
✅ MySQL database with JPA/Hibernate  
✅ Docker support  
✅ Complete documentation  

---

## 🎓 Learning Resources

### Understanding the Flow
1. Read [ARCHITECTURE.md](ARCHITECTURE.md) for system overview
2. Review [SETUP_GUIDE.md](SETUP_GUIDE.md) for practical examples
3. Test with [Postman Collection](ApiCollection/User-Service-API.postman_collection.json)

### Deep Dive
- JWT Tokens: See [ARCHITECTURE.md](ARCHITECTURE.md#-jwt-token-flow)
- Database: See [ARCHITECTURE.md](ARCHITECTURE.md#%EF%B8%8F-database-schema)
- Security: See [ARCHITECTURE.md](ARCHITECTURE.md#-security-layers)

---

## 🔄 Integration with Other Services

The User Service works seamlessly with:
- **API Gateway**: Token validation and user context
- **Student Service**: Protected endpoints with user info
- **Future Services**: Same pattern applies

Example workflow: [ARCHITECTURE.md](ARCHITECTURE.md#-requestresponse-flow-example)

---

## 📞 Quick Help

| Need | Document |
|------|----------|
| Get started quickly | [SETUP_GUIDE.md](SETUP_GUIDE.md) |
| API endpoint details | [API_REFERENCE.md](API_REFERENCE.md) |
| Complete information | [README.md](README.md) |
| System architecture | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Project overview | [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) |
| Test the API | [User-Service-API.postman_collection.json](ApiCollection/User-Service-API.postman_collection.json) |

---

## ✅ Checklist

Before you start:
- [ ] MySQL installed and running
- [ ] Java 17+ installed
- [ ] Maven 3.6+ installed
- [ ] Created `user_db` database
- [ ] Set JWT_SECRET environment variable
- [ ] Read [SETUP_GUIDE.md](SETUP_GUIDE.md)

After setup:
- [ ] Service runs on port 9091
- [ ] Can sign up a new user
- [ ] Can sign in and get token
- [ ] Token validation works
- [ ] API Gateway integration tested

---

## 🎯 Next Steps

1. ✅ Complete initial setup
2. ✅ Test all endpoints
3. 🔜 Integrate with Student Service
4. 🔜 Add refresh token endpoint
5. 🔜 Implement password reset
6. 🔜 Add user profile management

---

## 📝 Version Information

- **Version**: 1.0.0
- **Last Updated**: March 5, 2025
- **Java Version**: 17
- **Spring Boot Version**: 4.0.3
- **Status**: ✅ Production Ready

---

## 🤝 Contributing

This project is part of SLIIT Y4S2 CTSE Assignment. For contributions:
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

---

## 📄 License

This project is part of SLIIT Y4S2 CTSE Assignment.

---

**Happy Coding! 🚀**

For any issues or questions, please refer to the appropriate documentation file above.


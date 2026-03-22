# Course Service

Spring Boot service for managing course records, seat capacity, course status, faculty assignment, and enrollment-aware availability checks.

## Overview

This service is responsible for:

- creating courses
- listing and fetching courses
- updating course capacity
- updating course status
- calculating course stats
- exposing course availability for internal service-to-service use

It stores course data in MySQL and calls `StudentService` to get the enrolled student count when computing stats and availability.

## Tech Stack

- Java 17
- Spring Boot 3.3.5
- Spring Web
- Spring Data JPA
- Spring Validation
- Spring WebFlux `WebClient`
- MySQL
- Lombok

## Project Structure

```text
CourseService
├── src/main/java/com/example/courseservice
│   ├── client
│   ├── config
│   ├── controller
│   ├── dto
│   ├── enums
│   ├── exception
│   ├── model
│   ├── repository
│   └── service
├── src/main/resources
└── postman/collections
```

## Core Domain

### Course fields

- `courseId`
- `name`
- `capacity`
- `faculty`
- `status`

### Faculty values

- `FOC`
- `FOE`
- `FOM`
- `FOH`
- `FOA`

### Course status values

- `ACTIVE`
- `INACTIVE`

## Runtime Configuration

The service runs with:

- port: `9096`
- context path: `/course-service`

Main config file:

- [`src/main/resources/application.yml`](/Users/pradicksha/Documents/SLIIT/Y4S2/CTSE/Assignment%201/EduNexus/CourseService/src/main/resources/application.yml)

Important properties:

```yaml
server:
  port: 9096
  servlet:
    context-path: /course-service

spring:
  datasource:
    url: jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:course_db}
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:Pr@d!@1227}

internal:
  student:
    base-url: ${STUDENT_URL:http://localhost:9095/students-service}
```

## How The Service Works

### 1. Create Course Flow

Request:

- `POST /course-service/courses`

Input:

```json
{
  "courseId": "CS102",
  "name": "Software Engineering",
  "capacity": 60,
  "faculty": "FOC"
}
```

Flow:

1. controller receives the request
2. request is validated
3. service checks whether `courseId` already exists
4. if duplicate, returns `409 CONFLICT`
5. if new, saves the course with default status `ACTIVE`
6. response is returned as `CourseResponse`

Response:

```json
{
  "courseId": "CS102",
  "name": "Software Engineering",
  "capacity": 60,
  "faculty": "FOC",
  "status": "ACTIVE"
}
```

### 2. List Courses Flow

Request:

- `GET /course-service/courses`

Flow:

1. fetch all course rows from the repository
2. map entities to `CourseResponse`
3. return a JSON array

### 3. Get Single Course Flow

Request:

- `GET /course-service/courses/{courseId}`

Flow:

1. fetch course by id
2. if not found, return `404 NOT FOUND`
3. if found, return mapped `CourseResponse`

### 4. Update Capacity Flow

Request:

- `PATCH /course-service/courses/{courseId}/capacity`

Input:

```json
{
  "capacity": 80
}
```

Flow:

1. find course by id
2. if not found, return `404`
3. update `capacity`
4. save and return updated `CourseResponse`

### 5. Update Status Flow

Request:

- `PATCH /course-service/courses/{courseId}/status?status=INACTIVE`

Flow:

1. find course by id
2. if not found, return `404`
3. update status
4. return updated course

### 6. Course Stats Flow

Request:

- `GET /course-service/courses/{courseId}/stats`

Flow:

1. fetch course from DB
2. if course is missing, return `404`
3. call `StudentService` to get enrolled student count for the course
4. compute:
   - `capacity`
   - `enrolled`
   - `remaining = max(capacity - enrolled, 0)`
   - `status`
5. return `CourseStatsResponse`

Response:

```json
{
  "courseId": "CS102",
  "capacity": 60,
  "enrolled": 12,
  "remaining": 48,
  "status": "ACTIVE"
}
```

### 7. Course Availability Flow

Public route:

- `GET /course-service/courses/{courseId}/availability`

Internal route used by `StudentService`:

- `GET /course-service/internal/courses/{courseId}/availability`

Flow:

1. fetch course
2. if missing, return `404`
3. if status is `INACTIVE`, return unavailable immediately
4. otherwise call the stats logic
5. set:
   - `available = remaining > 0`
   - `remainingSeats = remaining`

Response:

```json
{
  "courseId": "CS102",
  "available": true,
  "remainingSeats": 48
}
```

## Inter-Service Communication

### Course Service -> Student Service

The service calls:

- `GET /students-service/students/internal/students/count?courseId={courseId}`

This happens inside:

- [`StudentClient.java`](/Users/pradicksha/Documents/SLIIT/Y4S2/CTSE/Assignment%201/EduNexus/CourseService/src/main/java/com/example/courseservice/client/StudentClient.java)

Expected student-service response shape:

```json
{
  "courseId": "CS102",
  "enrolledCount": "12"
}
```

### Student Service -> Course Service

`StudentService` checks whether enrollment is allowed by calling:

- `GET /course-service/internal/courses/{courseId}/availability`

That internal endpoint is exposed from:

- [`InternalCourseController.java`](/Users/pradicksha/Documents/SLIIT/Y4S2/CTSE/Assignment%201/EduNexus/CourseService/src/main/java/com/example/courseservice/controller/InternalCourseController.java)

## API Summary

### Public APIs

- `POST /course-service/courses`
- `GET /course-service/courses`
- `GET /course-service/courses/{courseId}`
- `PATCH /course-service/courses/{courseId}/capacity`
- `PATCH /course-service/courses/{courseId}/status?status=ACTIVE|INACTIVE`
- `GET /course-service/courses/{courseId}/stats`
- `GET /course-service/courses/{courseId}/availability`

### Internal APIs

- `GET /course-service/internal/courses/{courseId}/availability`

## Error Handling

Application exceptions are wrapped using:

- [`ApiException.java`](/Users/pradicksha/Documents/SLIIT/Y4S2/CTSE/Assignment%201/EduNexus/CourseService/src/main/java/com/example/courseservice/exception/ApiException.java)
- [`GlobalExceptionHandler.java`](/Users/pradicksha/Documents/SLIIT/Y4S2/CTSE/Assignment%201/EduNexus/CourseService/src/main/java/com/example/courseservice/exception/GlobalExceptionHandler.java)

Standard error shape:

```json
{
  "timestamp": "2026-03-22T00:00:00+05:30",
  "status": 404,
  "error": "Not Found",
  "message": "Course not found: CS102",
  "path": "/course-service/courses/CS102"
}
```

## Local Run

From the `CourseService` directory:

```bash
./mvnw clean spring-boot:run
```

Compile only:

```bash
./mvnw -DskipTests compile
```

## Database Notes

Because `spring.jpa.hibernate.ddl-auto=update` is enabled, Hibernate will create or update the `courses` table automatically.

Make sure your MySQL database exists:

- DB name: `course_db` by default

If you added the `faculty` field after older data already existed, old rows may still have `faculty = null` until updated manually.

## Postman Collection

A Postman collection is already included here:

- [`postman/collections/course-service.postman_collection.json`](/Users/pradicksha/Documents/SLIIT/Y4S2/CTSE/Assignment%201/EduNexus/CourseService/postman/collections/course-service.postman_collection.json)

## Current Functional Notes

- course creation sets status to `ACTIVE` automatically
- there is no delete course endpoint yet
- stats and availability depend on `StudentService` being reachable
- if `StudentService` is unavailable, stats and availability return `503 SERVICE_UNAVAILABLE`

## Suggested Testing Order

1. create a course
2. list courses
3. fetch the course by id
4. update capacity
5. update status
6. call stats
7. call availability
8. test enrollment from `StudentService` against the internal availability route

# Fine Service

`fine-service` is a Spring Boot 3 microservice for the EduNexus University Management System. It belongs to the Library Management Module and handles late-return fine calculation, payment tracking, and internal synchronization with `library-service`.

## Tech Stack

- Java 17
- Spring Boot 3
- Spring Web
- Spring Data JPA
- MySQL
- Lombok
- Spring Validation
- WebClient
- springdoc-openapi / Swagger UI
- Maven

## Features

- Internal fine calculation for overdue returned books
- Fine storage with realistic domain fields
- Fine payment processing with payment history
- Callback to `library-service` after a fine is paid
- Internal API key protection for `/internal/**`
- API Gateway-only access for public `/fines/**` endpoints
- Swagger UI documentation
- Request, auth, and error logging

## Project Structure

```text
fine-service/
|-- src/main/java/com/example/fineservice/
|   |-- controller/
|   |-- service/
|   |-- entity/
|   |-- repository/
|   |-- dto/
|   |   |-- request/
|   |   `-- response/
|   |-- config/
|   |-- exception/
|   `-- FineServiceApplication.java
|-- src/main/resources/
|   `-- application.yml
|-- Dockerfile
|-- pom.xml
`-- README.md
```

## Configuration

Default configuration lives in `src/main/resources/application.yml`.

Important properties:

- `server.port=8084`
- `server.servlet.context-path=/fine-service`
- `spring.datasource.*`
- `library.service.base-url`
- `internal.api.key`
- `gateway.api.key`
- `fine.amount.per-day`

Example environment variables:

```bash
set DB_HOST=localhost
set DB_PORT=3306
set DB_NAME=finedb
set DB_USERNAME=root
set DB_PASSWORD=s2001
set LIBRARY_SERVICE_BASE_URL=http://localhost:8083/library-service
set INTERNAL_API_KEY=my-secret-internal-key
set GATEWAY_API_KEY=my-secret-gateway-key
set FINE_AMOUNT_PER_DAY=100.00
```

## Database Tables

### fines

- `id`
- `fine_id`
- `borrow_id`
- `student_id`
- `days_late`
- `amount`
- `status`
- `created_at`
- `updated_at`
- `paid_at`

### fine_payments

- `id`
- `fine_id`
- `payment_method`
- `amount`
- `reference_note`
- `paid_at`

## Public APIs

These should be accessed through the API Gateway:

- `GET /fines`
- `GET /fines/{fineId}`
- `GET /fines/student/{studentId}`
- `POST /fines/{fineId}/pay`
- `GET /fines/{fineId}/payments`

Gateway route:

- `http://localhost:8081/api-gateway/fine-service`

Examples:

- `GET http://localhost:8081/api-gateway/fine-service/fines`
- `POST http://localhost:8081/api-gateway/fine-service/fines/FINE-AB12CD34/pay`

## Internal APIs

- `POST /internal/fines/calculate`

All `/internal/**` endpoints require:

```http
X-INTERNAL-KEY: my-secret-internal-key
```

## Library Service Integration

When `library-service` returns a book late, it calls:

```http
POST /internal/fines/calculate
```

Request body:

```json
{
  "borrowId": 12,
  "studentId": "IT22104567",
  "daysLate": 3
}
```

Response:

```json
{
  "fineId": "FINE-AB12CD34",
  "amount": 300.00,
  "status": "PENDING"
}
```

When a fine is paid, `fine-service` calls back to `library-service`:

```http
PATCH /internal/library/borrows/{borrowId}/fine-status
```

Headers:

```http
X-INTERNAL-KEY: my-secret-internal-key
```

Request body:

```json
{
  "fineId": "FINE-AB12CD34",
  "status": "PAID"
}
```

## Sample Requests

### Calculate Fine Internally

```bash
curl -X POST http://localhost:8084/fine-service/internal/fines/calculate ^
  -H "Content-Type: application/json" ^
  -H "X-INTERNAL-KEY: my-secret-internal-key" ^
  -d "{\"borrowId\":12,\"studentId\":\"IT22104567\",\"daysLate\":3}"
```

### Pay Fine Through Gateway

```bash
curl -X POST http://localhost:8081/api-gateway/fine-service/fines/FINE-AB12CD34/pay ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" ^
  -d "{\"paymentMethod\":\"ONLINE\",\"amount\":300.00,\"referenceNote\":\"Library counter payment\"}"
```

### View Student Fines Through Gateway

```bash
curl -X GET http://localhost:8081/api-gateway/fine-service/fines/student/IT22104567 ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Swagger UI

Once the service is running:

- Swagger UI: `http://localhost:8084/fine-service/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8084/fine-service/v3/api-docs`

## Run Locally

```bash
cd fine-service
mvn clean spring-boot:run
```

## Build Jar

```bash
mvn clean package -DskipTests
```

## Docker

Build:

```bash
docker build -t fine-service .
```

Run:

```bash
docker run -p 8084:8084 fine-service
```

## Security Notes

- `/internal/**` is protected with `X-INTERNAL-KEY`
- `/fines/**` is expected to come through the API Gateway
- Default keys should be replaced with environment variables before shared deployment
- Swagger should remain enabled for development, but can be restricted for production

# EduNexus

## Environment Configuration

This project now uses one shared env file at the repository root and separate service env files.

- Shared variables: `.env.common`
- Service variables:
  - `Api-Gateway/.env.api-gateway`
  - `UserService/.env.user-service`
  - `StudentService/.env.student-service`
  - `CourseService/.env.course-service`
  - `library-service/.env.library-service`
  - `fine-service/.env.fine-service`

### Notes

- Keep common DB/pool/shared API key values in `.env.common`.
- Keep service-only values (ports, DB names, JWT, dependent service URLs) in each service env file.
- `UserService/compose.yaml` is wired to load both `../.env.common` and `./.env.user-service`.

### Run UserService Stack

```bash
cd UserService
docker compose up --build
```

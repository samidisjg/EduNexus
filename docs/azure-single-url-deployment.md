# EduNexus Azure Single-URL Deployment

This setup keeps the frontend and backend available through one public Azure Container App URL.

## Recommended Public Entry Point

- Public app: `edunexus-web`
- Internal apps:
  - `edunexus-api-gateway`
  - `edunexus-user-service`
  - `edunexus-student-service`
  - `edunexus-course-service`
  - `edunexus-library-service`
  - `edunexus-fine-service`

The `edunexus-web` container serves the React frontend and proxies `/api-gateway/*` to the internal API gateway.

## Frontend Container Build

Build the frontend image from the `frontend` folder. The included `Dockerfile`:

- builds the Vite app
- bakes in `VITE_API_BASE_URL=/api-gateway`
- serves the built app with Nginx
- proxies `/api-gateway/*` to `http://edunexus-api-gateway/api-gateway/*`

If your gateway Container App has a different internal name, update `frontend/nginx.conf`.

## Azure Container Apps Layout

### `edunexus-web`

- Ingress: external
- Target port: `80`
- Image: build from `frontend/Dockerfile`

### `edunexus-api-gateway`

- Ingress: internal
- Target port: `8081`

Set:

- `SERVER_PORT=8081`
- `GATEWAY_API_KEY=<shared gateway key>`
- `USER_SERVICE_URL=http://edunexus-user-service/user-service`
- `USER_SERVICE_ROUTE_URI=http://edunexus-user-service`
- `STUDENT_SERVICE_ROUTE_URI=http://edunexus-student-service`
- `COURSE_SERVICE_ROUTE_URI=http://edunexus-course-service`
- `LIBRARY_SERVICE_ROUTE_URI=http://edunexus-library-service`
- `FINE_SERVICE_ROUTE_URI=http://edunexus-fine-service`

### Backend services

Keep these internal only:

- `edunexus-user-service`
- `edunexus-student-service`
- `edunexus-course-service`
- `edunexus-library-service`
- `edunexus-fine-service`

Set each service's `SERVER_PORT`, database variables, and any shared secrets it needs.

## MySQL

Use one Azure Database for MySQL Flexible Server and create separate databases:

- `user_db`
- `student_db`
- `course_db`
- `library_db`
- `finedb`

Recommended environment variables per service:

- `DB_HOST=<mysql-hostname>`
- `DB_PORT=3306`
- `DB_NAME=<service-database-name>`
- `DB_USERNAME=<mysql-username>`
- `DB_PASSWORD=<mysql-password>`

Additional required variables:

- `UserService`: `JWT_SECRET`, `JWT_EXPIRATION`
- `StudentService`: `INTERNAL_API_KEY`, `COURSE_SERVICE_URL=http://edunexus-course-service/course-service`
- `CourseService`: `INTERNAL_API_KEY`, `STUDENT_URL=http://edunexus-student-service/students-service`
- `library-service`: `FINE_SERVICE_BASE_URL=http://edunexus-fine-service/fine-service`, `INTERNAL_API_KEY`, `GATEWAY_API_KEY`
- `fine-service`: `LIBRARY_SERVICE_BASE_URL=http://edunexus-library-service/library-service`, `INTERNAL_API_KEY`, `GATEWAY_API_KEY`, `FINE_AMOUNT_PER_DAY=100.00`

## Result

After deployment, users only need the `edunexus-web` public URL:

- `/` loads the frontend
- `/api-gateway/*` reaches the backend through the gateway
- login and other actions persist data to MySQL

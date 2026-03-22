# EduNexus DevOps Setup

This repository now includes baseline CI/CD, containerization, and DevSecOps support for:

- `Api-Gateway`
- `library-service`
- `fine-service`

## What Was Added

- Docker support for all three services
- GitHub Actions CI workflow for Maven verify and Docker build checks
- GitHub Actions CD workflow for Azure Container Apps deployment
- GitHub Actions SonarCloud workflow for managed SAST
- Gateway runtime configuration based on environment variables instead of localhost-only URLs

## GitHub Actions Workflows

- `.github/workflows/services-ci.yml`
- `.github/workflows/services-cd.yml`
- `.github/workflows/services-sonarcloud.yml`

## GitHub Secrets

Add these repository secrets before running CD:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `SONAR_TOKEN`

## GitHub Variables

Add these repository variables:

- `AZURE_RESOURCE_GROUP`
- `AZURE_CONTAINER_REGISTRY`
- `AZURE_CONTAINERAPPS_ENV`
- `SONAR_ORGANIZATION`
- `SONAR_API_GATEWAY_PROJECT_KEY`
- `SONAR_LIBRARY_SERVICE_PROJECT_KEY`
- `SONAR_FINE_SERVICE_PROJECT_KEY`

## Azure Resources To Create

Create these resources once in Azure:

1. Resource group
2. Azure Container Registry
3. Azure Container Apps environment
4. Container Apps for:
   - `edunexus-api-gateway`
   - `edunexus-library-service`
   - `edunexus-fine-service`

## Recommended Environment Variables In Azure Container Apps

### Api-Gateway

- `SERVER_PORT=8081`
- `GATEWAY_API_KEY=<shared gateway key>`
- `USER_SERVICE_URL=<public or internal user service URL>`
- `USER_SERVICE_ROUTE_URI=<route target URL>`
- `STUDENT_SERVICE_ROUTE_URI=<route target URL>`
- `COURSE_SERVICE_ROUTE_URI=<route target URL>`
- `LIBRARY_SERVICE_ROUTE_URI=<route target URL>`
- `FINE_SERVICE_ROUTE_URI=<route target URL>`

### library-service

- `SERVER_PORT=8083`
- `DB_HOST=<mysql host>`
- `DB_PORT=3306`
- `DB_NAME=library_db`
- `DB_USERNAME=<db username>`
- `DB_PASSWORD=<db password>`
- `FINE_SERVICE_BASE_URL=<fine service base URL>`
- `INTERNAL_API_KEY=<shared internal key>`
- `GATEWAY_API_KEY=<shared gateway key>`

### fine-service

- `SERVER_PORT=8084`
- `DB_HOST=<mysql host>`
- `DB_PORT=3306`
- `DB_NAME=finedb`
- `DB_USERNAME=<db username>`
- `DB_PASSWORD=<db password>`
- `LIBRARY_SERVICE_BASE_URL=<library service base URL>`
- `INTERNAL_API_KEY=<shared internal key>`
- `GATEWAY_API_KEY=<shared gateway key>`
- `FINE_AMOUNT_PER_DAY=100.00`

## Recommended Deployment Order

1. Create Azure resources
2. Create the three Azure Container Apps
3. Set app secrets and environment variables
4. Grant each app permission to pull from ACR
5. Push to `main` to trigger CI/CD
6. Verify deployed health endpoints

## Security Notes

- Keep ACR private
- Use OIDC-based Azure login in GitHub Actions
- Prefer managed identity for container image pull from ACR
- Store secrets in Azure Container Apps and GitHub Secrets, not in source control
- Keep least-privilege RBAC such as `AcrPull` only where required

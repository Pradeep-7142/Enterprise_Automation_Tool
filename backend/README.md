# FlowDesk API — Enterprise Workflow Automation Backend

Spring Boot 3.3 backend for the FlowDesk React frontend. REST APIs are versioned under `/api/v1` and DTO field names match the frontend mock data (`dept`, `assignee`, `desc`, `lastMsg`, etc.).

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Java 21 |
| Framework | Spring Boot 3.3.5 |
| Security | Spring Security + JWT + Refresh Tokens |
| Persistence | Spring Data JPA + PostgreSQL (H2 for local dev) |
| Migrations | Liquibase |
| Cache | Redis (Docker profile) / Simple (local profile) |
| Files | MinIO (S3-compatible) |
| API Docs | SpringDoc OpenAPI |
| Mapping | MapStruct + Lombok |
| Monitoring | Actuator + Micrometer + Prometheus + Grafana |

## Quick Start

### Local (H2 in-memory, no Docker)

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

- API: http://localhost:8080
- Swagger: http://localhost:8080/api/v1/swagger-ui.html
- H2 Console: http://localhost:8080/h2-console

**Default login:** `alex@acme.com` / `password123`

### Docker (full stack)

```bash
docker compose up --build
```

Services: app `:8080`, PostgreSQL `:5432`, Redis `:6379`, MinIO `:9000`/`:9001`, Prometheus `:9090`, Grafana `:3001`

## API Overview

All responses use `ApiResponse<T>`:

```json
{ "success": true, "data": { ... }, "message": "optional" }
```

Paginated lists use `PageResponse<T>`: `{ items, total, page, limit }`

### Authentication (`/api/v1/auth`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/login` | Login → access + refresh tokens |
| POST | `/signup` | Register |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Revoke refresh token |
| POST | `/forgot-password` | Send reset email |
| POST | `/reset-password` | Reset password |
| POST | `/verify-otp` | Verify OTP |
| GET | `/me` | Current user profile |

### Core Modules

| Module | Base Path |
|--------|-----------|
| Requests | `/api/v1/requests` |
| Approvals | `/api/v1/approvals` |
| Employees | `/api/v1/employees` |
| Departments | `/api/v1/departments` |
| Notifications | `/api/v1/notifications` |
| Messages | `/api/v1/conversations` |
| Files | `/api/v1/files` |
| Audit Logs | `/api/v1/audit-logs` |
| Workflows | `/api/v1/workflows` |
| Dashboard | `/api/v1/dashboard` |
| Analytics | `/api/v1/analytics` |
| Reports | `/api/v1/reports` |
| Tasks | `/api/v1/tasks` |
| Search | `/api/v1/search` |
| Admin | `/api/v1/admin` |

### Request DTO (matches frontend)

```json
{
  "id": "REQ-2401",
  "title": "IT Equipment Procurement",
  "dept": "Engineering",
  "priority": "high",
  "status": "in_review",
  "assignee": "Alice Chen",
  "step": "Manager Approval",
  "created": "2024-01-15",
  "updated": "2024-01-16",
  "category": "Procurement"
}
```

## Architecture

```
Controller → Service → Repository → Database
     ↓           ↓
   DTO  ←── Mapper ←── Entity
```

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│   React UI  │────▶│  FlowDesk API │────▶│ PostgreSQL │
│  (Vite)     │ JWT │  Spring Boot  │     └────────────┘
└─────────────┘     │              │────▶┌────────────┐
                    │              │     │   Redis    │
                    │              │────▶└────────────┘
                    │              │────▶┌────────────┐
                    └──────────────┘     │   MinIO    │
                           │             └────────────┘
                           ▼
                    ┌──────────────┐
                    │  WebSocket   │
                    │ Notifications│
                    └──────────────┘
```

## Database ER (simplified)

```
Organization ──┬── Department ── User ── UserSkill
               │                    │
               │                    ├── RefreshToken / OtpToken
               │                    │
               └── WorkflowTemplate ── WorkflowNode / WorkflowEdge
                                        │
WorkflowRequest ──┬── RequestComment    │
                  ├── RequestAttachment │
                  ├── ApprovalStep      │
                  └── (assignee User)   │
                                        │
Notification / AuditLog / FileMetadata / Report
Conversation ── Message ── ConversationParticipant
```

## Project Structure

```
src/main/java/com/flowdesk/
├── config/          # App config, CORS, Redis, MinIO, OpenAPI, DataSeeder
├── security/        # JWT filter, SecurityConfig, UserDetailsService
├── controller/      # REST controllers (/api/v1)
├── service/         # Business logic interfaces
├── service/impl/    # Service implementations
├── repository/      # Spring Data JPA
├── entity/          # JPA entities (UUID PKs, audit fields)
├── dto/request/     # Request DTOs
├── dto/response/    # Response DTOs (frontend-aligned)
├── mapper/          # MapStruct mappers
├── exception/       # Global exception handler
├── constant/        # Enums
├── util/            # DateTime, Security helpers
├── scheduler/       # Token cleanup, reminders
└── websocket/       # Real-time notifications
```

## Seed Data

On startup (`flowdesk.seed-data=true`), the app seeds data matching the frontend mocks:

- 12 workflow requests (`REQ-2401` … `REQ-2412`)
- 12+ employees across 8 departments
- Notifications, audit logs, files, conversations, workflow template

## Testing

```bash
mvn test
```

Includes `AuthControllerTest` and `RequestServiceTest`.

## Frontend Integration

Point the React app to `http://localhost:8080/api/v1`. Example login:

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@acme.com","password":"password123"}'
```

Use the returned `accessToken` as `Authorization: Bearer <token>` for protected endpoints.

CORS is pre-configured for `http://localhost:5173` and `http://localhost:3000`.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_PROFILES_ACTIVE` | `local` | `local` or `docker` |
| `JWT_SECRET` | dev secret | Min 256-bit secret in production |
| `CORS_ORIGINS` | localhost:5173 | Comma-separated origins |
| `DB_HOST` | postgres | PostgreSQL host (docker) |
| `REDIS_HOST` | redis | Redis host (docker) |
| `MINIO_ENDPOINT` | http://localhost:9000 | MinIO endpoint |
| `SEED_DATA` | `true` | Seed demo data on startup |

## Roles

`SUPER_ADMIN`, `ORG_ADMIN`, `DEPARTMENT_HEAD`, `MANAGER`, `EMPLOYEE`, `FINANCE`, `HR`, `IT`, `AUDITOR`, `VIEWER`, `SUPPORT`

Default user `alex@acme.com` has `ORG_ADMIN` role.

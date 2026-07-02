# Enterprise Workflow Automation (FlowDesk)

Monorepo for the FlowDesk enterprise workflow automation platform.

## Structure

- `Enterprise Workflow Automation UI/frontend` — React + Vite UI
- `Enterprise Workflow Automation UI/backend` — Spring Boot API

## Quick start

### Backend (local, H2)

```bash
cd "Enterprise Workflow Automation UI/backend"
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### Frontend

```bash
cd "Enterprise Workflow Automation UI/frontend"
cp .env.example .env.development   # if needed
npm install
npm run dev
```

### Full stack (Docker)

```bash
cd "Enterprise Workflow Automation UI/backend"
docker compose up --build
```

See `backend/README.md` and `frontend/README.md` for details.

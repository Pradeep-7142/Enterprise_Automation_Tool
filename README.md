# Enterprise Workflow Automation (FlowDesk)

FlowDesk is an **Enterprise Workflow Automation Platform** designed to digitalize, streamline, and manage internal business processes, requests, and approvals within an organization. 

### Why FlowDesk? (Motive)
In many organizations, internal requests (like IT procurement, budget approvals, or employee onboarding) get lost in email threads or manual paperwork, causing delays and confusion. FlowDesk solves this by providing a centralized system for all internal operations.

### What It Does
FlowDesk acts as an internal portal where:
- **Employees** can submit structured requests (e.g., equipment procurement, time off).
- **Managers & Departments** can review and approve them based on a defined chain of command.
- **Teams** can collaborate in real-time, leave comments, and attach files to specific requests.
- **Stakeholders** receive instant notifications and can view analytics to identify process bottlenecks.

---

## Project Structure

This repository is a monorepo containing:
- `frontend/` — React + Vite User Interface
- `backend/` — Java Spring Boot REST API

---

## Quick Start

### Option 1: Full Stack via Docker (Recommended)
This runs the entire full stack (Frontend, Backend, PostgreSQL, Redis, MinIO, Prometheus, Grafana) inside containers from the root directory:

```bash
docker compose up --build
```
*Note: Depending on your system configuration, you might need to run this with `sudo docker compose up --build` or add your user to the `docker` group.*

### Option 2: Backend Only via Docker (Run Frontend Locally)
If you prefer running just the backend and databases in Docker while developing the frontend with hot-reloading:

```bash
cd backend
docker compose up --build
```
And in a separate terminal:
```bash
cd frontend
npm install
npm run dev
```

### Option 3: Local Development (Without Docker)

**Terminal 1 — Start the Backend:**
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

**Terminal 2 — Start the Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Accessing the Application
- **Frontend UI:** http://localhost:5173
- **Backend API:** http://localhost:8080 
- **Default Login:** `alex@acme.com` / `password123`

---

See `backend/README.md` and `frontend/README.md` for more detailed technical documentation.

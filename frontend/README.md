# FlowDesk Frontend

React + Vite enterprise workflow UI connected to the Spring Boot backend API.

## Run (with backend)

**Terminal 1 — Backend:**
```bash
cd "../backend"
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

**Terminal 2 — Frontend:**
```bash
npm install
npm run dev
```

Open http://localhost:5173 and sign in with **`alex@acme.com` / `password123`**.

## API Integration

- Base URL: `/api/v1` (proxied to `http://localhost:8080` in dev via `vite.config.ts`)
- JWT stored in `localStorage` (`fd_access_token`, `fd_refresh_token`)
- Service layer: `src/services/api.js`, `src/services/flowdeskApi.js`
- Data fetching: `src/hooks/useFetch.js`

## Project Structure

```
src/app/
  App.tsx              # Router shell
  context/AppContext.jsx
  components/shared.jsx
  layouts/MainLayout.jsx
  pages/               # API-connected pages
  pages/auth/          # Login, forgot/reset password
```

## Build

```bash
npm run build
```

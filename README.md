# Mock-Site Flow State

Single-page React (Vite) front end with an Express.js back end.

## Structure

```
client/   React app (Vite)
server/   Express API
```

## Scripts

- `npm install` — install all dependencies (npm workspaces)
- `npm run dev` — run the client (http://localhost:5173) and server (http://localhost:5001) together; `/api` requests are proxied to Express
- `npm run build` — build the React app to `client/dist`
- `npm start` — same as `npm run dev`: starts the local staging site at http://localhost:5173

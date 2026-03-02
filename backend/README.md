# Backend

## Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **nodemon** - Development auto-reload

## Folder Structure

```
backend/
├── src/
│   ├── controller/     # Route controllers
│   ├── model/          # Database models
│   ├── routes/         # API routes
│   └── server.js       # Entry point
├── .gitignore
├── eslint.config.js
├── package.json
├── package-lock.json
└── README.md
```

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start development server:
   ```
   npm run dev
   ```

Server runs on `http://localhost:5000`

### Roles & permissions
- **user** (default) – can create issues and edit only their own reports; cannot delete.
- **moderator** – may update an issue's `status` and perform soft‑deletes (sets `deleted: true`); cannot permanently remove or change other fields.
- **admin** – full access: read/update/delete any issue, including hard delete.

A new `status` field on issues tracks progress (`open`, `in_progress`, `closed`). Soft‑deleted issues are filtered out for regular users.

### Useful seed script
`npm run seed` populates the database with three users (user/moderator/admin) and a handful of dummy issues.

## API endpoints (overview)
- `POST /issues` – create report (any authenticated user)
- `GET /issues` – list; public endpoint, soft‑deleted issues are hidden
- `PUT /issues/:id` – update; restrictions per role
- `PATCH /issues/:id/soft-delete` – soft delete (moderator/admin)
- `DELETE /issues/:id` – hard delete (admin only)


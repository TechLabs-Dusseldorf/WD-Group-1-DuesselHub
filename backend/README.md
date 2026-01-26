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

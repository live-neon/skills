# Large Documentation Fixture

This file intentionally exceeds 300 lines to test hub-subworkflow split suggestions.

## Overview

This documentation covers multiple topics that would benefit from being split into
a hub document with sub-documents.

---

## Section 1: Getting Started

### Prerequisites

Before you begin, ensure you have the following:

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control
- A code editor (VS Code recommended)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/example/project.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   ```

4. Run setup script:
   ```bash
   npm run setup
   ```

### Verification

Verify your installation:

```bash
npm test
npm run build
```

---

## Section 2: Architecture

### High-Level Overview

The system consists of three main components:

1. **Frontend** - React-based user interface
2. **Backend** - Node.js API server
3. **Database** - PostgreSQL data store

### Component Diagram

```
┌─────────┐     ┌─────────┐     ┌──────────┐
│ Frontend│────▶│ Backend │────▶│ Database │
└─────────┘     └─────────┘     └──────────┘
```

### Data Flow

1. User interacts with frontend
2. Frontend sends API request
3. Backend processes request
4. Database query executed
5. Response returned to frontend

### Design Principles

- Separation of concerns
- Single responsibility
- Dependency injection
- Interface-based design

---

## Section 3: API Reference

### Authentication

#### POST /auth/login

Request:
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

Response:
```json
{
  "token": "jwt-token-here",
  "user": { "id": 1, "email": "user@example.com" }
}
```

#### POST /auth/logout

Requires: Authorization header

Response:
```json
{ "success": true }
```

### Users

#### GET /users

List all users.

Response:
```json
{
  "users": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ]
}
```

#### GET /users/:id

Get user by ID.

Response:
```json
{ "id": 1, "name": "Alice", "email": "alice@example.com" }
```

#### POST /users

Create new user.

Request:
```json
{ "name": "Carol", "email": "carol@example.com" }
```

#### PUT /users/:id

Update user.

#### DELETE /users/:id

Delete user.

---

## Section 4: Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| DATABASE_URL | Database connection string | - |
| JWT_SECRET | Secret for JWT signing | - |
| LOG_LEVEL | Logging verbosity | info |
| NODE_ENV | Environment | development |

### Database Configuration

```yaml
database:
  host: localhost
  port: 5432
  name: myapp
  pool:
    min: 2
    max: 10
```

### Logging Configuration

```yaml
logging:
  level: info
  format: json
  outputs:
    - console
    - file
```

---

## Section 5: Deployment

### Docker

Build and run with Docker:

```bash
docker build -t myapp .
docker run -p 3000:3000 myapp
```

### Docker Compose

```yaml
version: '3'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://db:5432/myapp
  db:
    image: postgres:14
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

### Kubernetes

Deploy to Kubernetes:

```bash
kubectl apply -f k8s/
```

### CI/CD

GitHub Actions workflow:

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm test
```

---

## Section 6: Testing

### Unit Tests

Run unit tests:

```bash
npm run test:unit
```

### Integration Tests

Run integration tests:

```bash
npm run test:integration
```

### E2E Tests

Run end-to-end tests:

```bash
npm run test:e2e
```

### Coverage

Generate coverage report:

```bash
npm run test:coverage
```

---

## Section 7: Troubleshooting

### Common Issues

**Issue: Connection refused**

Solution: Check database is running.

**Issue: JWT expired**

Solution: Request new token via /auth/login.

**Issue: Permission denied**

Solution: Check user roles and permissions.

### Debugging

Enable debug mode:

```bash
DEBUG=app:* npm start
```

### Logs

View logs:

```bash
tail -f logs/app.log
```

---

## Section 8: Contributing

### Code Style

Follow the project's ESLint configuration.

### Pull Requests

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests
5. Submit PR

### Code Review

All PRs require review before merge.

---

## Section 9: Changelog

### v2.0.0

- Breaking: New API structure
- Feature: WebSocket support
- Fix: Memory leak in connection pool

### v1.5.0

- Feature: User roles
- Feature: Audit logging
- Fix: Date parsing

### v1.0.0

- Initial release

---

## Section 10: License

MIT License

Copyright (c) 2026 Example Corp

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files.

---

*This fixture intentionally exceeds 300 lines to test hub-subworkflow.*

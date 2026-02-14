# Skills Test Environment

Docker configurations for testing ALL Live Neon skills.

## Quick Start

```bash
cd docker
cp .env.example .env  # Configure API keys

# Start OpenClaw with skills
docker compose up -d

# Run tests
docker compose --profile test up

# With real LLM (Ollama)
docker compose --profile ollama up -d
docker exec skills-test-ollama ollama pull llama3
USE_REAL_LLM=true docker compose --profile test up
```

## Services

| Service | Port | Purpose |
|---------|------|---------|
| OpenClaw | 3000 | Web UI |
| OpenClaw | 8080 | API |
| Ollama | 11434 | Local LLM |

## Mounted Skills

- `/skills/pbd/` - PBD methodology skills
- `/skills/agentic/` - Agentic memory skills

## Test Types

```bash
# All tests
npm test

# Specific category
npm test -- --grep "pbd"
npm test -- --grep "agentic"

# Real LLM
USE_REAL_LLM=true npm test
```

## Adding Tests

1. Add test file to `tests/e2e/`
2. Add fixtures to `tests/fixtures/`
3. Run: `npm test`

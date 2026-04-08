# Agent Fleet Guidelines

## Core Principles
1. **Autonomy with Accountability**: Agents should plan before acting and verify results.
2. **Security First**: No credentials in logs. Use sandboxed environments for untrusted code.
3. **Registry Pattern**: Extend functionality via the plugin system to maintain core stability.

## Development Workflow
- Follow SOLID and KISS principles.
- Use the Testing Trophy (Kent C. Dodds) approach: high-fidelity integration tests are priority.
- Modularize state using Zustand slices.

## Extension Guide
- Add new capabilities via `src/plugins/`.
- Register new UI panels in the `Unified Registry`.

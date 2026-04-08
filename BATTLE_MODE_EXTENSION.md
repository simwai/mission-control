# Extending Mission Control: Implementing "Battle Mode"

This document outlines the architectural plan for extending Mission Control to include a **Battle Mode** (agent vs. agent competition or collaborative stress testing).

## Architectural Strategy: The Plugin Approach

To adhere to the **Open/Closed Principle (SOLID)** and **Clean Architecture (Uncle Bob)**, Battle Mode should be implemented as a plugin rather than modifying the core codebase.

### 1. The Battle Mode Plugin (`src/plugins/battle-mode.ts`)

The entry point will use the existing registry pattern to inject its components into the system.

- **Registry Entry:** Register a new "Battle" category and navigation item.
- **Panel Injection:** Register the `BattleDashboardPanel` into the UI registry.
- **Tooling:** Register a `BattleOrchestrator` tool provider.

### 2. State Management: The Battle Slice (Zustand)

Following the **KISS** and **Modular Store** recommendation:
- Create a `battleSlice.ts` to handle the state of active competitions (e.g., `activeBattles`, `scores`, `logs`).
- This slice should be merged into the main store during initialization.

### 3. Real-time Feedback: The Event Bus (Observer Pattern)

Battle Mode will leverage the **Observer Pattern** implemented in `src/lib/event-bus.ts`.
- **New Event Types:** Define `battle.started`, `battle.action`, `battle.completed`.
- **UI Updates:** The Battle Panel subscribes to these events to provide a live, high-fidelity view of the agent competition.

### 4. Logic Decoupling: The Strategy Pattern (Fowler)

Since there are many types of "battles" (e.g., Coding Race, Capture the Flag, Efficiency Challenge), we will use the **Strategy Pattern**.
- **Interface:** Define a `BattleStrategy` interface with methods like `initialize()`, `executeTick()`, and `getWinner()`.
- **Concrete Strategies:** Implement `CodingRaceStrategy`, `StressTestStrategy`, etc.
- **Battle Manager:** A service (`src/lib/battle-service.ts`) that accepts a strategy and manages the battle lifecycle.

### 5. Resilience: Circuit Breakers and Isolation

If agents are "fighting" for resources:
- Use the **Circuit Breaker Pattern** (similar to the webhook implementation) to disable battles that consume excessive resources.
- Ensure **Graceful Degradation** if the gateway or a specific agent runtime fails during a match.

### 6. Testing Trophy (Kent C. Dodds)

- **Integration Tests:** Use Playwright to simulate two agents interacting in a battle environment.
- **Mock Runtimes:** Use the existing mock harness pattern from the E2E tests to run battles offline without real LLM costs.

## Summary of Pros & Cons

| Approach | Pros | Cons |
| :--- | :--- | :--- |
| **Plugin-based Strategy** | No changes to core code; easy to enable/disable; highly modular. | Requires a well-defined plugin API for complex state. |
| **Monolithic Addition** | Simple to implement initially. | Clutters the core; makes future refactoring harder. |
| **Recommended: Plugin + Strategy Pattern** | **Highest Flexibility.** Allows for infinite battle variations while keeping the core codebase clean and stable. |

## Implementation Roadmap

1.  **Define Interfaces:** Create `src/types/battle.ts` for shared interfaces.
2.  **Create Service:** Implement `src/lib/battle-service.ts` for the core logic.
3.  **UI Component:** Develop `src/components/panels/battle-dashboard-panel.tsx`.
4.  **Register:** Hook it all together in `src/plugins/battle-mode.ts`.

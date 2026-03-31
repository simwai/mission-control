# Extending Mission Control: Implementing the "Jules" Cloned Workflow

This document outlines how to implement a **Jules-like autonomous coding workflow** in Mission Control, replicating the advanced agentic behavior of Google Labs' "Jules" (formerly known as Project IDX / specialized AI developer).

## The "Jules" Persona: Core Capabilities

A "Jules" clone requires more than a standard developer agent. It needs:
1. **Repository Context Awareness:** Deep understanding of the entire codebase (not just file-by-file).
2. **Autonomous Tool Selection:** High-confidence use of git, shell, and build tools.
3. **Multi-Step Reasoning:** Ability to plan, implement, verify, and fix regressions autonomously.
4. **Interactive Collaboration:** Proactive communication with the user for clarifications.

## Implementation Roadmap

### 1. New Agent Template (`src/lib/agent-templates.ts`)

Add a `jules-clone` template that combines the best of the `orchestrator` and `developer` templates.

```typescript
{
  type: 'jules-clone',
  label: 'Jules (AI Developer)',
  description: 'Autonomous coding agent with deep repository context, advanced git access, and multi-step reasoning.',
  emoji: '🧪',
  modelTier: 'sonnet', // Optimized for Sonnet's speed/quality balance
  config: {
    // ... specialized config with full tool access and repo-mapping memory sources
  }
}
```

### 2. Specialized System Prompt ("The Soul")

Create a new `soul` for Jules that emphasizes:
- **Planning First:** Always output a plan before execution.
- **Verification Loop:** Run tests after every change.
- **Git Hygiene:** Use descriptive commit messages and manage branches properly.
- **Resourcefulness:** If a tool fails, look for an alternative (e.g., search for docs).

### 3. Workflow Integration (`src/app/api/workflows/route.ts`)

Implement a **Jules Workflow Template** that automates the "Jules behavior":
1. **Analyze:** Use repo-mapping tools to understand the task scope.
2. **Plan:** Present a plan to the user via the `eventBus`.
3. **Execute:** Run through the plan using a specialized `jules-clone` agent.
4. **Verify:** Run the project's test suite autonomously.
5. **Report:** Provide a detailed summary of changes and test results.

### 4. UI Enhancements (`src/components/panels/chat-page-panel.tsx`)

- **Jules Mode Toggle:** A UI switch to enable "High Autonomy" for a chat session.
- **Live Plan View:** A dedicated UI section to see the agent's current plan and progress (Observer Pattern).
- **Tool Use Transparency:** Visual indicators for when Jules is reading files, running shell commands, or managing git.

## Architectural Alignment (Fowler/Martin/Dodds)

- **KISS:** Reuse the existing `AgentTemplate` system; don't build a new "Jules-only" engine.
- **SOLID:** Implement the Jules-specific logic as a **Strategy** within the Workflow engine.
- **Testing Trophy:** Ensure the "Verification Loop" in the workflow uses the project's actual test runners (Vitest/Playwright).

## Pros & Cons

| Feature | Pros | Cons |
| :--- | :--- | :--- |
| **High Autonomy** | Drastically reduces manual task management. | Risk of "hallucinating" destructive shell commands if not sandboxed correctly. |
| **Deep Repo Context** | More accurate and relevant code suggestions. | Higher initial token cost for repo-mapping. |
| **Verification Loop** | Ensures code quality and prevents regressions. | Slower execution time due to test runs. |

**Recommended Path:** Implement Jules as a **Pro-tier Plugin**. This allows users to opt-in to the higher autonomy and costs associated with the deep context mapping while keeping the core Mission Control lightweight.

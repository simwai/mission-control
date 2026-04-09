# Mission Control Plugin System

Mission Control features a highly modular, "Discord-style" plugin architecture that allows developers to extend the dashboard's functionality without modifying the core codebase.

## Core Concepts

### 1. Plugin Interface
Every plugin must implement the `MissionControlPlugin` interface defined in `src/lib/plugins/types.ts`.

```typescript
export interface MissionControlPlugin {
  readonly metadata: {
    id: string;
    name: string;
    version: string;
    description?: string;
    author?: string;
  };

  // Lifecycle Hooks
  onServerInit?: () => void | Promise<void>;
  onClientInit?: () => void | Promise<void>;

  // Extension Points
  panels?: Record<string, ComponentType>;
  navItems?: PluginNavItem[];
  events?: Record<string, (data: any) => void>;
}
```

### 2. Plugin Discovery
Plugins are stored in `src/plugins/` and registered in `src/lib/plugins/scanner.ts`. The system automatically:
- Registers UI panels in the `Unified Registry`.
- Injects navigation items into the `NavRail`.
- Initializes client-side state via `onClientInit`.

## How to Create a Plugin

1.  **Create your component**: Define your dashboard panel in a new file (e.g., `src/plugins/my-plugin/panel.tsx`).
2.  **Define the plugin**: Create an index file that exports your plugin object.
3.  **Lazy Loading**: Use `React.lazy` for panels to ensure optimal performance.
4.  **State Management**: Use `useMissionControl.getState().registerPluginState()` to inject plugin-specific state into the global store.

## Example: Jules AI Plugin
The included `JulesPlugin` (`src/plugins/jules-clone.ts`) demonstrates:
- Dynamic navigation registration.
- Specialized agent template registration.
- Lazy-loaded dashboard UI.
- Custom state injection.

## Benefits of the New System
- **Decoupling**: Core logic is isolated from extensions.
- **Maintainability**: Clear boundaries between different features.
- **Performance**: Suspense-based lazy loading for all external panels.
- **Scalability**: Easily add dozens of new features without bloating the main bundle.

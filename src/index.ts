/**
 * Mission Control Entry Point
 *
 * This is the primary API surface for external consumption.
 * It provides access to the state store and domain entities.
 */

export * from './store';
export { AgentService } from './lib/services/agent-service';
export { pluginRegistry } from './lib/plugins';

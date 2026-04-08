import { useMissionControl } from '@/store'

export default function JulesDashboard() {
  const { agents, tasks, plugins } = useMissionControl()
  const julesState = plugins.jules || {}

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🧪</span>
          <h1 className="text-2xl font-bold">Jules AI Developer</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          {julesState.autonomyLevel?.toUpperCase()} AUTONOMY
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border bg-card">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Status</h2>
          <p className="text-lg font-bold">{julesState.lastAction || 'Idle'}</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Fleet</h2>
          <p className="text-lg font-bold">{agents.length} Agents / {tasks.length} Tasks</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Environment</h2>
          <p className="text-sm font-medium">Git: <span className="text-green-500">Clean</span></p>
          <p className="text-sm font-medium">Build: <span className="text-green-500">Passing</span></p>
        </div>
      </div>

      <div className="p-6 rounded-xl border bg-surface-1 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Autonomous Control Center</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-surface-2 border border-border/50">
            <h3 className="font-semibold mb-1">Deep Repository Mapping</h3>
            <p className="text-sm text-muted-foreground mb-3">Continuously indexing and analyzing codebase relationships to provide high-context implementation plans.</p>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[100%]" />
            </div>
          </div>
          <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Start New Implementation Sprint
          </button>
        </div>
      </div>
    </div>
  )
}

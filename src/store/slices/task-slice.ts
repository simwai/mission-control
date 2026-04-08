import { StateCreator } from 'zustand'
import { Task, Comment, StandupReport } from '@/types/entities'

export interface TaskSlice {
  // Mission Control Phase 2 - Tasks
  tasks: Task[]
  selectedTask: Task | null
  setTasks: (tasks: Task[]) => void
  setSelectedTask: (task: Task | null) => void
  addTask: (task: Task) => void
  updateTask: (taskId: number, updates: Partial<Task>) => void
  deleteTask: (taskId: number) => void

  // Mission Control Phase 2 - Comments
  taskComments: Record<number, Comment[]>
  setTaskComments: (taskId: number, comments: Comment[]) => void
  addTaskComment: (taskId: number, comment: Comment) => void

  // Mission Control Phase 2 - Standup
  standupReports: StandupReport[]
  currentStandupReport: StandupReport | null
  setStandupReports: (reports: StandupReport[]) => void
  setCurrentStandupReport: (report: StandupReport | null) => void
}

export const createTaskSlice: StateCreator<TaskSlice> = (set) => ({
  // Mission Control Phase 2 - Tasks
  tasks: [],
  selectedTask: null,
  setTasks: (tasks) => set({ tasks }),
  setSelectedTask: (task) => set({ selectedTask: task }),
  addTask: (task) =>
    set((state) => ({
      tasks: [task, ...state.tasks]
    })),
  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
      selectedTask: state.selectedTask?.id === taskId
        ? { ...state.selectedTask, ...updates }
        : state.selectedTask
    })),
  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
      selectedTask: state.selectedTask?.id === taskId ? null : state.selectedTask
    })),

  // Mission Control Phase 2 - Comments
  taskComments: {},
  setTaskComments: (taskId, comments) =>
    set((state) => ({
      taskComments: { ...state.taskComments, [taskId]: comments }
    })),
  addTaskComment: (taskId, comment) =>
    set((state) => ({
      taskComments: {
        ...state.taskComments,
        [taskId]: [comment, ...(state.taskComments[taskId] || [])]
      }
    })),

  // Mission Control Phase 2 - Standup
  standupReports: [],
  currentStandupReport: null,
  setStandupReports: (reports) => set({ standupReports: reports }),
  setCurrentStandupReport: (report) => set({ currentStandupReport: report }),
})

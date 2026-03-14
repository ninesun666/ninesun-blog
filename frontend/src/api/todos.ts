import api from './client'
import type { Todo, TodoStats } from '../types'

export interface TodoCreateRequest {
  title: string
  description?: string
  todoDate: string
  timeSlot?: number  // 时间阶段（小时），默认1
}

export interface TodoUpdateRequest {
  title?: string
  description?: string
  todoDate?: string
  timeSlot?: number
}

export const todosApi = {
  getTodosByDate: async (date: string): Promise<Todo[]> => {
    const response = await api.get<Todo[]>('/todos', { params: { date } })
    return response.data
  },

  getTodosByDateRange: async (startDate: string, endDate: string): Promise<Todo[]> => {
    const response = await api.get<Todo[]>('/todos', { params: { startDate, endDate } })
    return response.data
  },

  getStats: async (year: number, month: number): Promise<Record<string, TodoStats>> => {
    const response = await api.get<Record<string, TodoStats>>('/todos/stats', { params: { year, month } })
    return response.data
  },

  getTodo: async (id: number): Promise<Todo> => {
    const response = await api.get<Todo>(`/todos/${id}`)
    return response.data
  },

  createTodo: async (data: TodoCreateRequest): Promise<Todo> => {
    const response = await api.post<Todo>('/todos', data)
    return response.data
  },

  updateTodo: async (id: number, data: TodoUpdateRequest): Promise<Todo> => {
    const response = await api.put<Todo>(`/todos/${id}`, data)
    return response.data
  },

  toggleComplete: async (id: number): Promise<Todo> => {
    const response = await api.patch<Todo>(`/todos/${id}/complete`)
    return response.data
  },

  deleteTodo: async (id: number): Promise<void> => {
    await api.delete(`/todos/${id}`)
  }
}

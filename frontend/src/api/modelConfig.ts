import api from './client'

export interface ModelProvider {
  id: number
  provider: string
  name: string
  description?: string
  enabled: boolean
  priority: number
  config: Record<string, any>
  models: Array<{
    name: string
    display_name: string
    max_tokens?: number
    dimensions?: number
    voices?: string[]
  }>
  createdAt: string
  updatedAt: string
}

export interface ModelConfig {
  id: number
  providerId: number
  providerName?: string
  modelName: string
  displayName: string
  type: 'chat' | 'embedding' | 'tts' | 'stt'
  enabled: boolean
  isDefault: boolean
  parameters: Record<string, any>
  createdAt: string
  updatedAt: string
}

export const modelConfigApi = {
  // 提供商管理
  getProviders: () => api.get<ModelProvider[]>('/admin/models/providers'),
  getEnabledProviders: () => api.get<ModelProvider[]>('/admin/models/providers/enabled'),
  getProvider: (id: number) => api.get<ModelProvider>(`/admin/models/providers/${id}`),
  updateProvider: (id: number, data: Partial<ModelProvider>) => 
    api.put<ModelProvider>(`/admin/models/providers/${id}`, data),
  updateProviderConfig: (id: number, config: Record<string, any>) => 
    api.put<ModelProvider>(`/admin/models/providers/${id}/config`, config),
  toggleProvider: (id: number, enabled: boolean) => 
    api.post(`/admin/models/providers/${id}/toggle?enabled=${enabled}`),
  
  // 模型配置管理
  getConfigsByProvider: (providerId: number) => 
    api.get<ModelConfig[]>(`/admin/models/providers/${providerId}/configs`),
  getConfigsByType: (type: string) => 
    api.get<ModelConfig[]>(`/admin/models/configs/type/${type}`),
  getDefaultConfig: (type: string) => 
    api.get<ModelConfig>(`/admin/models/configs/default/${type}`),
  createConfig: (providerId: number, data: Partial<ModelConfig>) => 
    api.post<ModelConfig>(`/admin/models/providers/${providerId}/configs`, data),
  updateConfig: (configId: number, data: Partial<ModelConfig>) => 
    api.put<ModelConfig>(`/admin/models/configs/${configId}`, data),
  deleteConfig: (configId: number) => api.delete(`/admin/models/configs/${configId}`),
  setDefaultConfig: (configId: number) => 
    api.post(`/admin/models/configs/${configId}/set-default`),
  
  // 当前配置
  getActiveChatConfig: () => api.get('/admin/models/active/chat'),
  getActiveEmbeddingConfig: () => api.get('/admin/models/active/embedding'),

  // 测试模型
  testConfig: (configId: number) => api.post(`/admin/models/configs/${configId}/test`),
}

import { useState } from 'react'
import {
  Box, Heading, Text, Table, Badge, VStack, Spinner, Button, Dialog, Field, Input, Stack, Switch, Separator, Grid
} from '@chakra-ui/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { modelConfigApi, type ModelProvider, type ModelConfig } from '../../api/modelConfig'
import { FiEdit2, FiPlus } from 'react-icons/fi'

export default function AdminModels() {
  const queryClient = useQueryClient()
  const [editingProvider, setEditingProvider] = useState<ModelProvider | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [configuringProvider, setConfiguringProvider] = useState<ModelProvider | null>(null)

  const { data: providers, isLoading } = useQuery({
    queryKey: ['model-providers'],
    queryFn: () => modelConfigApi.getProviders().then((r: any) => r.data),
  })

  const { data: configs, refetch: refetchConfigs } = useQuery({
    queryKey: ['model-configs', configuringProvider?.id],
    queryFn: () => modelConfigApi.getConfigsByProvider(configuringProvider!.id).then((r: any) => r.data),
    enabled: !!configuringProvider && isConfigOpen,
  })

  const updateProviderMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ModelProvider> }) =>
      modelConfigApi.updateProvider(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model-providers'] })
      setIsEditOpen(false)
    },
  })

  const toggleProviderMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      modelConfigApi.toggleProvider(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model-providers'] })
    },
  })

  const handleEdit = (provider: ModelProvider) => {
    setEditingProvider(provider)
    setIsEditOpen(true)
  }

  const handleConfig = (provider: ModelProvider) => {
    setConfiguringProvider(provider)
    setIsConfigOpen(true)
    refetchConfigs()
  }

  if (isLoading) {
    return (
      <Box p={6} display="flex" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    )
  }

  return (
    <Box p={6}>
      <Heading mb={2}>模型配置</Heading>
      <Text color="gray.500" mb={6}>配置大模型 API 和参数，支持 OpenAI、Azure、Anthropic、Gemini、Ollama 等</Text>

      <ProviderList
        providers={providers}
        onEdit={handleEdit}
        onConfig={handleConfig}
        onToggle={(provider) => toggleProviderMutation.mutate({ id: provider.id, enabled: !provider.enabled })}
      />

      {/* 编辑提供商对话框 */}
      <EditProviderDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        provider={editingProvider}
        onSave={(data) => editingProvider && updateProviderMutation.mutate({ id: editingProvider.id, data })}
      />

      {/* 配置模型对话框 */}
      <ConfigModelsDialog
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        provider={configuringProvider}
        configs={configs || []}
      />
    </Box>
  )
}

// 提供商列表
function ProviderList({
  providers,
  onEdit,
  onConfig,
  onToggle
}: {
  providers?: ModelProvider[]
  onEdit: (p: ModelProvider) => void
  onConfig: (p: ModelProvider) => void
  onToggle: (p: ModelProvider) => void
}) {
  return (
    <Box>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>提供商</Table.ColumnHeader>
            <Table.ColumnHeader>类型</Table.ColumnHeader>
            <Table.ColumnHeader>状态</Table.ColumnHeader>
            <Table.ColumnHeader>优先级</Table.ColumnHeader>
            <Table.ColumnHeader>操作</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {providers?.map(provider => (
            <Table.Row
              key={provider.id}
              cursor="pointer"
              _hover={{ bg: 'gray.50' }}
            >
              <Table.Cell onClick={() => onEdit(provider)}>
                <VStack align="start" gap={0}>
                  <Text fontWeight="bold">{provider.name}</Text>
                  <Text fontSize="xs" color="gray.500">{provider.provider}</Text>
                </VStack>
              </Table.Cell>
              <Table.Cell onClick={() => onEdit(provider)}>
                <Badge>{provider.models?.length || 0} 个模型</Badge>
              </Table.Cell>
              <Table.Cell>
                <Switch.Root
                  checked={provider.enabled}
                  onCheckedChange={() => onToggle(provider)}
                >
                  <Switch.HiddenInput />
                  <Switch.Control />
                  <Switch.Label>
                    <Badge colorPalette={provider.enabled ? 'green' : 'gray'}>
                      {provider.enabled ? '启用' : '禁用'}
                    </Badge>
                  </Switch.Label>
                </Switch.Root>
              </Table.Cell>
              <Table.Cell onClick={() => onEdit(provider)}>{provider.priority}</Table.Cell>
              <Table.Cell>
                <Stack direction="row" gap={2}>
                  <Button size="sm" variant="ghost" onClick={() => onEdit(provider)}>
                    <FiEdit2 />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onConfig(provider)}>
                    配置模型
                  </Button>
                </Stack>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  )
}

// 编辑提供商对话框
function EditProviderDialog({
  isOpen,
  onClose,
  provider,
  onSave
}: {
  isOpen: boolean
  onClose: () => void
  provider: ModelProvider | null
  onSave: (data: Partial<ModelProvider>) => void
}) {
  const [formData, setFormData] = useState<Partial<ModelProvider>>({})
  const [configData, setConfigData] = useState<Record<string, any>>({})

  // 重置表单数据当 provider 改变时
  if (isOpen && provider && formData.id !== provider.id) {
    setFormData({
      id: provider.id,
      name: provider.name,
      description: provider.description,
      priority: provider.priority,
    })
    setConfigData(provider.config || {})
  }

  const handleSave = () => {
    onSave({
      ...formData,
      config: configData
    })
  }

  const updateConfigField = (field: string, value: string) => {
    setConfigData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="600px">
          <Dialog.Header>
            <Dialog.Title>编辑提供商 - {provider?.name}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Stack gap={4}>
              <Field.Root>
                <Field.Label>名称</Field.Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>描述</Field.Label>
                <Input
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>优先级</Field.Label>
                <Input
                  type="number"
                  value={formData.priority || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                />
              </Field.Root>

              <Separator />

              <Heading size="sm">API 配置</Heading>

              {provider?.provider === 'openai' && (
                <>
                  <Field.Root>
                    <Field.Label>API Key</Field.Label>
                    <Input
                      type="password"
                      placeholder="sk-..."
                      value={configData.api_key || ''}
                      onChange={(e) => updateConfigField('api_key', e.target.value)}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Base URL</Field.Label>
                    <Input
                      placeholder="https://api.openai.com/v1"
                      value={configData.base_url || ''}
                      onChange={(e) => updateConfigField('base_url', e.target.value)}
                    />
                  </Field.Root>
                </>
              )}

              {provider?.provider === 'azure' && (
                <>
                  <Field.Root>
                    <Field.Label>Endpoint</Field.Label>
                    <Input
                      placeholder="https://xxx.openai.azure.com"
                      value={configData.endpoint || ''}
                      onChange={(e) => updateConfigField('endpoint', e.target.value)}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>API Key</Field.Label>
                    <Input
                      type="password"
                      value={configData.api_key || ''}
                      onChange={(e) => updateConfigField('api_key', e.target.value)}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>API Version</Field.Label>
                    <Input
                      placeholder="2024-02-01"
                      value={configData.api_version || ''}
                      onChange={(e) => updateConfigField('api_version', e.target.value)}
                    />
                  </Field.Root>
                </>
              )}

              {provider?.provider === 'anthropic' && (
                <>
                  <Field.Root>
                    <Field.Label>API Key</Field.Label>
                    <Input
                      type="password"
                      value={configData.api_key || ''}
                      onChange={(e) => updateConfigField('api_key', e.target.value)}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Base URL</Field.Label>
                    <Input
                      placeholder="https://api.anthropic.com"
                      value={configData.base_url || ''}
                      onChange={(e) => updateConfigField('base_url', e.target.value)}
                    />
                  </Field.Root>
                </>
              )}

              {provider?.provider === 'gemini' && (
                <>
                  <Field.Root>
                    <Field.Label>API Key</Field.Label>
                    <Input
                      type="password"
                      value={configData.api_key || ''}
                      onChange={(e) => updateConfigField('api_key', e.target.value)}
                    />
                  </Field.Root>
                </>
              )}

              {provider?.provider === 'ollama' && (
                <>
                  <Field.Root>
                    <Field.Label>Base URL</Field.Label>
                    <Input
                      placeholder="http://localhost:11434"
                      value={configData.base_url || ''}
                      onChange={(e) => updateConfigField('base_url', e.target.value)}
                    />
                  </Field.Root>
                </>
              )}

              {provider?.provider === 'siliconflow' && (
                <>
                  <Field.Root>
                    <Field.Label>API Key</Field.Label>
                    <Input
                      type="password"
                      value={configData.api_key || ''}
                      onChange={(e) => updateConfigField('api_key', e.target.value)}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Base URL</Field.Label>
                    <Input
                      placeholder="https://api.siliconflow.cn/v1"
                      value={configData.base_url || ''}
                      onChange={(e) => updateConfigField('base_url', e.target.value)}
                    />
                  </Field.Root>
                </>
              )}
            </Stack>
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="ghost" onClick={onClose}>取消</Button>
            <Button colorPalette="blue" onClick={handleSave}>保存</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

// 配置模型对话框
function ConfigModelsDialog({
  isOpen,
  onClose,
  provider,
  configs
}: {
  isOpen: boolean
  onClose: () => void
  provider: ModelProvider | null
  configs: ModelConfig[]
}) {
  const queryClient = useQueryClient()
  const [newConfig, setNewConfig] = useState<Partial<ModelConfig>>({
    type: 'chat',
    enabled: true,
    parameters: { temperature: 0.7, max_tokens: 2000 }
  })

  const createConfigMutation = useMutation({
    mutationFn: (data: Partial<ModelConfig>) =>
      modelConfigApi.createConfig(provider!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model-configs', provider?.id] })
      queryClient.invalidateQueries({ queryKey: ['model-providers'] })
      setNewConfig({
        type: 'chat',
        enabled: true,
        parameters: { temperature: 0.7, max_tokens: 2000 }
      })
    },
  })

  const setDefaultMutation = useMutation({
    mutationFn: (configId: number) => modelConfigApi.setDefaultConfig(configId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model-configs', provider?.id] })
    },
  })

  const deleteConfigMutation = useMutation({
    mutationFn: (configId: number) => modelConfigApi.deleteConfig(configId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model-configs', provider?.id] })
      queryClient.invalidateQueries({ queryKey: ['model-providers'] })
    },
  })

  const handleCreate = () => {
    if (provider && newConfig.modelName && newConfig.displayName) {
      createConfigMutation.mutate(newConfig)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="700px">
          <Dialog.Header>
            <Dialog.Title>配置模型 - {provider?.name}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Stack gap={6}>
              {/* 当前模型列表 */}
              <Box>
                <Heading size="sm" mb={3}>已配置模型</Heading>
                <Table.Root size="sm">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>模型名称</Table.ColumnHeader>
                      <Table.ColumnHeader>类型</Table.ColumnHeader>
                      <Table.ColumnHeader>默认</Table.ColumnHeader>
                      <Table.ColumnHeader>状态</Table.ColumnHeader>
                      <Table.ColumnHeader>操作</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {configs.map(config => (
                      <Table.Row key={config.id}>
                        <Table.Cell>
                          <VStack align="start" gap={0}>
                            <Text fontWeight="medium">{config.displayName}</Text>
                            <Text fontSize="xs" color="gray.500">{config.modelName}</Text>
                          </VStack>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge colorPalette={config.type === 'chat' ? 'blue' : 'green'}>
                            {config.type === 'chat' ? '对话' : config.type === 'embedding' ? '嵌入' : config.type}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          {config.isDefault ? (
                            <Badge colorPalette="yellow">默认</Badge>
                          ) : (
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => setDefaultMutation.mutate(config.id)}
                            >
                              设为默认
                            </Button>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge colorPalette={config.enabled ? 'green' : 'gray'}>
                            {config.enabled ? '启用' : '禁用'}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Button
                            size="xs"
                            colorPalette="red"
                            variant="ghost"
                            onClick={() => deleteConfigMutation.mutate(config.id)}
                          >
                            删除
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>

              <Separator />

              {/* 添加新模型 */}
              <Box>
                <Heading size="sm" mb={3}>添加模型</Heading>
                <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                  <Field.Root>
                    <Field.Label>模型 ID</Field.Label>
                    <Input
                      placeholder="gpt-4o-mini"
                      value={newConfig.modelName || ''}
                      onChange={(e) => setNewConfig(prev => ({ ...prev, modelName: e.target.value }))}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>显示名称</Field.Label>
                    <Input
                      placeholder="GPT-4o Mini"
                      value={newConfig.displayName || ''}
                      onChange={(e) => setNewConfig(prev => ({ ...prev, displayName: e.target.value }))}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>类型</Field.Label>
                    <select
                      value={newConfig.type}
                      onChange={(e) => setNewConfig(prev => ({ ...prev, type: e.target.value as any }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--chakra-colors-border)',
                        background: 'var(--chakra-colors-bg)'
                      }}
                    >
                      <option value="chat">对话模型</option>
                      <option value="embedding">嵌入模型</option>
                      <option value="tts">语音合成</option>
                      <option value="stt">语音识别</option>
                    </select>
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Temperature</Field.Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={newConfig.parameters?.temperature || 0.7}
                      onChange={(e) => setNewConfig(prev => ({
                        ...prev,
                        parameters: { ...prev.parameters, temperature: parseFloat(e.target.value) }
                      }))}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Max Tokens</Field.Label>
                    <Input
                      type="number"
                      value={newConfig.parameters?.max_tokens || 2000}
                      onChange={(e) => setNewConfig(prev => ({
                        ...prev,
                        parameters: { ...prev.parameters, max_tokens: parseInt(e.target.value) }
                      }))}
                    />
                  </Field.Root>
                </Grid>
                <Button mt={3} size="sm" onClick={handleCreate} loading={createConfigMutation.isPending}>
                  <FiPlus /> 添加模型
                </Button>
              </Box>
            </Stack>
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="ghost" onClick={onClose}>关闭</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}
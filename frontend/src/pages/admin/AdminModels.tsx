import {
  Box, Heading, Text,
  Table, Badge, VStack,
  Spinner
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { modelConfigApi, type ModelProvider } from '../../api/modelConfig'

export default function AdminModels() {
  const { data: providers, isLoading } = useQuery({
    queryKey: ['model-providers'],
    queryFn: () => modelConfigApi.getProviders().then((r: any) => r.data),
  })
  
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
      
      <ProviderList providers={providers} />
    </Box>
  )
}

// 提供商列表
function ProviderList({ providers }: { providers?: ModelProvider[] }) {
  return (
    <Box>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>提供商</Table.ColumnHeader>
            <Table.ColumnHeader>类型</Table.ColumnHeader>
            <Table.ColumnHeader>状态</Table.ColumnHeader>
            <Table.ColumnHeader>优先级</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {providers?.map(provider => (
            <Table.Row key={provider.id}>
              <Table.Cell>
                <VStack align="start" gap={0}>
                  <Text fontWeight="bold">{provider.name}</Text>
                  <Text fontSize="xs" color="gray.500">{provider.provider}</Text>
                </VStack>
              </Table.Cell>
              <Table.Cell>
                <Badge>{provider.models?.length || 0} 个模型</Badge>
              </Table.Cell>
              <Table.Cell>
                <Badge colorPalette={provider.enabled ? 'green' : 'gray'}>
                  {provider.enabled ? '启用' : '禁用'}
                </Badge>
              </Table.Cell>
              <Table.Cell>{provider.priority}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  )
}



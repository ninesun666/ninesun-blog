import { useState } from 'react'
import {
  Box,
  Flex,
  Text,
  Button,
  Input,
  VStack,
  HStack,
  Icon,
  Badge,
  useDisclosure,
  Dialog,
  Portal,
  Field,
  Wrap,
  WrapItem,
  CloseButton,
} from '@chakra-ui/react'
import { FiPlus, FiEdit2, FiTrash2, FiTag } from 'react-icons/fi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/client'
import type { Tag } from '../../types'

interface TagFormData {
  name: string
  slug: string
}

const defaultFormData: TagFormData = {
  name: '',
  slug: '',
}

export default function AdminTags() {
  const queryClient = useQueryClient()
  const { open, onOpen, onClose } = useDisclosure()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<TagFormData>(defaultFormData)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const deleteDialog = useDisclosure()

  // 获取标签列表
  const { data: tags, isLoading } = useQuery({
    queryKey: ['admin-tags'],
    queryFn: async () => {
      const { data } = await api.get<Tag[]>('/tags')
      return data
    },
  })

  // 创建标签
  const createMutation = useMutation({
    mutationFn: async (data: TagFormData) => {
      const { data: result } = await api.post('/tags', data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] })
      handleClose()
    },
  })

  // 更新标签
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TagFormData }) => {
      const { data: result } = await api.put(`/tags/${id}`, data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] })
      handleClose()
    },
  })

  // 删除标签
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/tags/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] })
      setDeleteId(null)
      deleteDialog.onClose()
    },
  })

  const handleOpen = (tag?: Tag) => {
    if (tag) {
      setEditingId(tag.id)
      setFormData({
        name: tag.name,
        slug: tag.slug,
      })
    } else {
      setEditingId(null)
      setFormData(defaultFormData)
    }
    onOpen()
  }

  const handleClose = () => {
    setEditingId(null)
    setFormData(defaultFormData)
    onClose()
  }

  const handleSubmit = () => {
    if (!formData.name.trim()) return

    // 自动生成 slug
    const submitData = {
      ...formData,
      slug: formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, '-'),
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: submitData })
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId)
    }
  }

  // 标签颜色
  const tagColors = ['blue', 'green', 'purple', 'cyan', 'orange', 'pink', 'teal', 'red']

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold">
            标签管理
          </Text>
          <Text color="gray.500" fontSize="sm">
            管理文章标签，便于内容标记和检索
          </Text>
        </Box>
        <Button colorScheme="purple" onClick={() => handleOpen()}>
          <Icon as={FiPlus} mr={2} />
          新建标签
        </Button>
      </Flex>

      {/* 标签列表 */}
      {isLoading ? (
        <Text color="gray.500">加载中...</Text>
      ) : tags && tags.length > 0 ? (
        <Box bg="white" p={6} borderRadius="lg" border="1px" borderColor="gray.200">
          <Wrap gap={3}>
            {tags.map((tag, index) => (
              <WrapItem key={tag.id}>
                <HStack
                  bg={`${tagColors[index % tagColors.length]}.50`}
                  border="1px"
                  borderColor={`${tagColors[index % tagColors.length]}.200`}
                  borderRadius="full"
                  px={3}
                  py={1}
                  _hover={{ shadow: 'sm' }}
                  transition="all 0.2s"
                >
                  <Icon as={FiTag} color={`${tagColors[index % tagColors.length]}.500`} boxSize={4} />
                  <Text fontWeight="medium" fontSize="sm">{tag.name}</Text>
                  <Badge colorScheme={tagColors[index % tagColors.length]} fontSize="xs">
                    {tag.articleCount}
                  </Badge>
                  <HStack gap={1}>
                    <Button
                      size="xs"
                      variant="ghost"
                      minW="auto"
                      p={1}
                      onClick={() => handleOpen(tag)}
                    >
                      <Icon as={FiEdit2} boxSize={3} />
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      minW="auto"
                      p={1}
                      colorPalette="red"
                      onClick={() => {
                        setDeleteId(tag.id)
                        deleteDialog.onOpen()
                      }}
                    >
                      <Icon as={FiTrash2} boxSize={3} />
                    </Button>
                  </HStack>
                </HStack>
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      ) : (
        <Box textAlign="center" py={12} bg="white" borderRadius="lg">
          <Icon as={FiTag} boxSize={12} color="gray.300" mb={4} />
          <Text color="gray.500">暂无标签</Text>
          <Button mt={4} colorScheme="purple" onClick={() => handleOpen()}>
            创建第一个标签
          </Button>
        </Box>
      )}

      {/* 统计信息 */}
      {tags && tags.length > 0 && (
        <Box mt={4} p={4} bg="gray.50" borderRadius="lg">
          <HStack gap={6}>
            <Text color="gray.600" fontSize="sm">
              共 <Text as="span" fontWeight="bold">{tags.length}</Text> 个标签
            </Text>
            <Text color="gray.600" fontSize="sm">
              总计关联 <Text as="span" fontWeight="bold">{tags.reduce((sum, t) => sum + t.articleCount, 0)}</Text> 篇文章
            </Text>
          </HStack>
        </Box>
      )}

      {/* 创建/编辑对话框 */}
      <Dialog.Root open={open} onOpenChange={(e) => !e.open && handleClose()}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{editingId ? '编辑标签' : '新建标签'}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <VStack gap={4}>
                  <Field.Root>
                    <Field.Label>标签名称 *</Field.Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="输入标签名称"
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Slug</Field.Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="url-friendly-name（留空自动生成）"
                    />
                    <Field.HelperText>用于 URL，留空将根据名称自动生成</Field.HelperText>
                  </Field.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" onClick={handleClose}>
                  取消
                </Button>
                <Button
                  colorPalette="purple"
                  onClick={handleSubmit}
                  loading={createMutation.isPending || updateMutation.isPending}
                  disabled={!formData.name.trim()}
                >
                  {editingId ? '保存' : '创建'}
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" position="absolute" top={3} right={3} />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* 删除确认对话框 */}
      <Dialog.Root open={deleteDialog.open} onOpenChange={(e) => !e.open && deleteDialog.onClose()}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>确认删除</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text>确定要删除这个标签吗？此操作不可恢复。</Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" onClick={deleteDialog.onClose}>
                  取消
                </Button>
                <Button
                  colorPalette="red"
                  onClick={handleDelete}
                  loading={deleteMutation.isPending}
                >
                  删除
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  )
}

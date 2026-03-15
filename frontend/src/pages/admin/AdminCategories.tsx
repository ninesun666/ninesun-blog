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
  Textarea,
  CloseButton,
} from '@chakra-ui/react'
import { FiPlus, FiEdit2, FiTrash2, FiFolder } from 'react-icons/fi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/client'
import type { Category } from '../../types'

interface CategoryFormData {
  name: string
  slug: string
  description: string
}

const defaultFormData: CategoryFormData = {
  name: '',
  slug: '',
  description: '',
}

export default function AdminCategories() {
  const queryClient = useQueryClient()
  const { open, onOpen, onClose } = useDisclosure()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>(defaultFormData)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const deleteDialog = useDisclosure()

  // 获取分类列表
  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data } = await api.get<Category[]>('/categories')
      return data
    },
  })

  // 创建分类
  const createMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const { data: result } = await api.post('/categories', data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      handleClose()
    },
  })

  // 更新分类
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CategoryFormData }) => {
      const { data: result } = await api.put(`/categories/${id}`, data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      handleClose()
    },
  })

  // 删除分类
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/categories/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      setDeleteId(null)
      deleteDialog.onClose()
    },
  })

  const handleOpen = (category?: Category) => {
    if (category) {
      setEditingId(category.id)
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
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

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold">
            分类管理
          </Text>
          <Text color="gray.500" fontSize="sm">
            管理文章分类，便于组织和检索内容
          </Text>
        </Box>
        <Button colorScheme="blue" onClick={() => handleOpen()}>
          <Icon as={FiPlus} mr={2} />
          新建分类
        </Button>
      </Flex>

      {/* 分类列表 */}
      {isLoading ? (
        <Text color="gray.500">加载中...</Text>
      ) : categories && categories.length > 0 ? (
        <VStack gap={3} align="stretch">
          {categories.map((category) => (
            <Box
              key={category.id}
              bg="white"
              p={4}
              borderRadius="lg"
              border="1px"
              borderColor="gray.200"
              _hover={{ shadow: 'sm' }}
              transition="all 0.2s"
            >
              <Flex justify="space-between" align="center">
                <HStack gap={3}>
                  <Icon as={FiFolder} color="blue.500" boxSize={5} />
                  <Box>
                    <HStack gap={2}>
                      <Text fontWeight="medium">{category.name}</Text>
                      <Badge colorScheme="gray" fontSize="xs">
                        {category.slug}
                      </Badge>
                    </HStack>
                    {category.description && (
                      <Text color="gray.500" fontSize="sm" mt={1}>
                        {category.description}
                      </Text>
                    )}
                  </Box>
                </HStack>
                <HStack gap={2}>
                  <Badge colorScheme="blue">
                    {category.articleCount} 篇文章
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpen(category)}
                  >
                    <Icon as={FiEdit2} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorPalette="red"
                    onClick={() => {
                      setDeleteId(category.id)
                      deleteDialog.onOpen()
                    }}
                  >
                    <Icon as={FiTrash2} />
                  </Button>
                </HStack>
              </Flex>
            </Box>
          ))}
        </VStack>
      ) : (
        <Box textAlign="center" py={12} bg="white" borderRadius="lg">
          <Icon as={FiFolder} boxSize={12} color="gray.300" mb={4} />
          <Text color="gray.500">暂无分类</Text>
          <Button mt={4} colorScheme="blue" onClick={() => handleOpen()}>
            创建第一个分类
          </Button>
        </Box>
      )}

      {/* 创建/编辑对话框 */}
      <Dialog.Root open={open} onOpenChange={(e) => !e.open && handleClose()}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{editingId ? '编辑分类' : '新建分类'}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <VStack gap={4}>
                  <Field.Root>
                    <Field.Label>分类名称 *</Field.Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="输入分类名称"
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
                  <Field.Root>
                    <Field.Label>描述</Field.Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="分类描述（可选）"
                      rows={3}
                    />
                  </Field.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" onClick={handleClose}>
                  取消
                </Button>
                <Button
                  colorPalette="blue"
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
                <Text>确定要删除这个分类吗？此操作不可恢复。</Text>
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

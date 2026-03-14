import { useState, useEffect } from 'react'
import {
  Box, Heading, VStack, Text, HStack, Icon, Spinner, Center, Flex,
  Button, Input, Textarea, CloseButton, Dialog, Portal, Menu, Badge, NativeSelect
} from '@chakra-ui/react'
import { FiCheckCircle, FiCircle, FiPlus, FiTrash2, FiEdit2, FiMoreVertical, FiCalendar, FiList, FiClock } from 'react-icons/fi'
import TodoCalendar from '../../components/TodoCalendar'
import { todosApi } from '../../api/todos'
import type { Todo, TodoStats } from '../../types'

// 时间阶段选项
const TIME_SLOT_OPTIONS = [
  { value: 0.5, label: '30分钟' },
  { value: 1, label: '1小时' },
  { value: 1.5, label: '1.5小时' },
  { value: 2, label: '2小时' },
  { value: 3, label: '3小时' },
  { value: 4, label: '4小时' },
  { value: 6, label: '半天' },
  { value: 8, label: '全天' },
]

const AdminTodos = () => {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return today.toISOString().split('T')[0]
  })
  const [stats, setStats] = useState<Record<string, TodoStats>>({})
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  
  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null)
  
  // Form states
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formDate, setFormDate] = useState(today.toISOString().split('T')[0])
  const [formTimeSlot, setFormTimeSlot] = useState(1)  // 时间阶段（小时）
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadStats()
  }, [year, month])

  useEffect(() => {
    loadTodos()
  }, [selectedDate])

  const loadStats = async () => {
    try {
      const data = await todosApi.getStats(year, month)
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const loadTodos = async () => {
    setLoading(true)
    try {
      const data = await todosApi.getTodosByDate(selectedDate)
      setTodos(data)
    } catch (error) {
      console.error('Failed to load todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setFormDate(date)
  }

  const handleMonthChange = (newYear: number, newMonth: number) => {
    setYear(newYear)
    setMonth(newMonth)
  }

  const openCreateDialog = () => {
    setFormTitle('')
    setFormDescription('')
    setFormDate(selectedDate)
    setFormTimeSlot(1)  // 默认1小时
    setIsCreateOpen(true)
  }

  const openEditDialog = (todo: Todo) => {
    setEditingTodo(todo)
    setFormTitle(todo.title)
    setFormDescription(todo.description || '')
    setFormDate(todo.todoDate)
    setFormTimeSlot(todo.timeSlot || 1)
    setIsEditOpen(true)
  }

  const openDeleteDialog = (todo: Todo) => {
    setDeletingTodo(todo)
    setIsDeleteOpen(true)
  }

  const handleCreate = async () => {
    if (!formTitle.trim()) return
    setSaving(true)
    try {
      await todosApi.createTodo({
        title: formTitle,
        description: formDescription || undefined,
        todoDate: formDate,
        timeSlot: formTimeSlot
      })
      setIsCreateOpen(false)
      loadTodos()
      loadStats()
    } catch (error) {
      console.error('Failed to create todo:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!editingTodo || !formTitle.trim()) return
    setSaving(true)
    try {
      await todosApi.updateTodo(editingTodo.id, {
        title: formTitle,
        description: formDescription || undefined,
        todoDate: formDate,
        timeSlot: formTimeSlot
      })
      setIsEditOpen(false)
      setEditingTodo(null)
      loadTodos()
      loadStats()
    } catch (error) {
      console.error('Failed to update todo:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingTodo) return
    setSaving(true)
    try {
      await todosApi.deleteTodo(deletingTodo.id)
      setIsDeleteOpen(false)
      setDeletingTodo(null)
      loadTodos()
      loadStats()
    } catch (error) {
      console.error('Failed to delete todo:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleComplete = async (todo: Todo) => {
    try {
      await todosApi.toggleComplete(todo.id)
      loadTodos()
      loadStats()
    } catch (error) {
      console.error('Failed to toggle complete:', error)
    }
  }

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <HStack gap={3}>
          <Icon as={FiCalendar} color="brand.500" boxSize={5} />
          <Heading size="lg" fontWeight="700">每日待办管理</Heading>
        </HStack>
        <Button colorPalette="purple" onClick={openCreateDialog}>
          <FiPlus />
          添加待办
        </Button>
      </Flex>

      <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>
        {/* Calendar */}
        <Box flex={{ lg: '0 0 380px' }}>
          <TodoCalendar
            year={year}
            month={month}
            selectedDate={selectedDate}
            stats={stats}
            onDateSelect={handleDateSelect}
            onMonthChange={handleMonthChange}
          />
        </Box>

        {/* Todo List */}
        <Box flex="1">
          <Box 
            bg="white" 
            borderRadius="xl" 
            border="1px solid" 
            borderColor="gray.100" 
            p={5}
            minH="400px"
          >
            <HStack gap={3} mb={4}>
              <Icon as={FiList} color="brand.500" boxSize={5} />
              <Heading size="md" fontWeight="600">
                {formatDateDisplay(selectedDate)}
              </Heading>
            </HStack>

            {loading ? (
              <Center py={12}>
                <Spinner size="lg" color="brand.500" />
              </Center>
            ) : todos.length === 0 ? (
              <Center py={12}>
                <VStack gap={3}>
                  <Icon as={FiCircle} boxSize={12} color="gray.300" />
                  <Text color="gray.400">当日暂无待办事项</Text>
                  <Button variant="outline" size="sm" onClick={openCreateDialog}>
                    添加第一个待办
                  </Button>
                </VStack>
              </Center>
            ) : (
              <VStack align="stretch" gap={3}>
                {todos.map((todo) => (
                  <Box
                    key={todo.id}
                    p={4}
                    borderRadius="lg"
                    bg={todo.completed ? 'green.50' : 'gray.50'}
                    border="1px solid"
                    borderColor={todo.completed ? 'green.100' : 'gray.100'}
                    _hover={{ borderColor: 'purple.200' }}
                    transition="all 0.2s"
                  >
                    <HStack gap={3} align="flex-start">
                      <Icon
                        as={todo.completed ? FiCheckCircle : FiCircle}
                        color={todo.completed ? 'green.500' : 'gray.400'}
                        boxSize={5}
                        mt={0.5}
                        cursor="pointer"
                        onClick={() => handleToggleComplete(todo)}
                        _hover={{ color: todo.completed ? 'green.600' : 'purple.500' }}
                      />
                      <VStack align="stretch" gap={1} flex="1">
                        <HStack justify="space-between">
                          <HStack gap={2}>
                            <Text
                              fontWeight="600"
                              color={todo.completed ? 'gray.500' : 'gray.800'}
                              textDecoration={todo.completed ? 'line-through' : 'none'}
                              textDecorationColor="green.400"
                              textDecorationThickness="2px"
                            >
                              {todo.title}
                            </Text>
                            {todo.timeSlot && (
                              <Badge 
                                size="sm" 
                                colorPalette={todo.completed ? 'green' : 'purple'}
                                variant="subtle"
                              >
                                <HStack gap={1}>
                                  <Icon as={FiClock} boxSize={3} />
                                  {TIME_SLOT_OPTIONS.find(o => o.value === todo.timeSlot)?.label || `${todo.timeSlot}小时`}
                                </HStack>
                              </Badge>
                            )}
                          </HStack>
                          <Menu.Root>
                            <Menu.Trigger asChild>
                              <Button variant="ghost" size="sm" p={1}>
                                <FiMoreVertical />
                              </Button>
                            </Menu.Trigger>
                            <Portal>
                              <Menu.Positioner>
                                <Menu.Content>
                                  <Menu.Item value="edit" onClick={() => openEditDialog(todo)}>
                                    <FiEdit2 />
                                    编辑
                                  </Menu.Item>
                                  <Menu.Item 
                                    value="delete" 
                                    color="red.500"
                                    onClick={() => openDeleteDialog(todo)}
                                  >
                                    <FiTrash2 />
                                    删除
                                  </Menu.Item>
                                </Menu.Content>
                              </Menu.Positioner>
                            </Portal>
                          </Menu.Root>
                        </HStack>
                        {todo.description && (
                          <Text
                            fontSize="sm"
                            color="gray.500"
                            textDecoration={todo.completed ? 'line-through' : 'none'}
                            textDecorationColor="green.400"
                          >
                            {todo.description}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        </Box>
      </Flex>

      {/* Create Dialog */}
      <Dialog.Root open={isCreateOpen} onOpenChange={(e: { open: boolean }) => setIsCreateOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>添加待办</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <VStack gap={4}>
                  <Box w="full">
                    <Text fontSize="sm" fontWeight="500" mb={2}>标题</Text>
                    <Input
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="输入待办标题"
                    />
                  </Box>
                  <Box w="full">
                    <Text fontSize="sm" fontWeight="500" mb={2}>描述（可选）</Text>
                    <Textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="输入详细描述"
                      rows={3}
                    />
                  </Box>
                  <HStack w="full" gap={4}>
                    <Box flex="1">
                      <Text fontSize="sm" fontWeight="500" mb={2}>日期</Text>
                      <Input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                      />
                    </Box>
                    <Box flex="1">
                      <Text fontSize="sm" fontWeight="500" mb={2}>时间阶段</Text>
                      <NativeSelect.Root>
                        <NativeSelect.Field 
                          value={formTimeSlot} 
                          onChange={(e) => setFormTimeSlot(Number(e.target.value))}
                        >
                          {TIME_SLOT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                    </Box>
                  </HStack>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>取消</Button>
                <Button colorPalette="purple" onClick={handleCreate} loading={saving}>
                  创建
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" position="absolute" top={3} right={3} />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Edit Dialog */}
      <Dialog.Root open={isEditOpen} onOpenChange={(e: { open: boolean }) => setIsEditOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>编辑待办</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <VStack gap={4}>
                  <Box w="full">
                    <Text fontSize="sm" fontWeight="500" mb={2}>标题</Text>
                    <Input
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="输入待办标题"
                    />
                  </Box>
                  <Box w="full">
                    <Text fontSize="sm" fontWeight="500" mb={2}>描述（可选）</Text>
                    <Textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="输入详细描述"
                      rows={3}
                    />
                  </Box>
                  <HStack w="full" gap={4}>
                    <Box flex="1">
                      <Text fontSize="sm" fontWeight="500" mb={2}>日期</Text>
                      <Input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                      />
                    </Box>
                    <Box flex="1">
                      <Text fontSize="sm" fontWeight="500" mb={2}>时间阶段</Text>
                      <NativeSelect.Root>
                        <NativeSelect.Field 
                          value={formTimeSlot} 
                          onChange={(e) => setFormTimeSlot(Number(e.target.value))}
                        >
                          {TIME_SLOT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                    </Box>
                  </HStack>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>取消</Button>
                <Button colorPalette="purple" onClick={handleEdit} loading={saving}>
                  保存
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" position="absolute" top={3} right={3} />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Delete Confirmation */}
      <Dialog.Root open={isDeleteOpen} onOpenChange={(e: { open: boolean }) => setIsDeleteOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>确认删除</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                确定要删除待办「{deletingTodo?.title}」吗？此操作无法撤销。
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>取消</Button>
                <Button colorPalette="red" onClick={handleDelete} loading={saving}>
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

export default AdminTodos

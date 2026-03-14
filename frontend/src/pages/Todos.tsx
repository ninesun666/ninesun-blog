import { useState, useEffect } from 'react'
import { Box, Heading, VStack, Text, HStack, Icon, Spinner, Center, Badge, Flex, Container, Button } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { FiCheckCircle, FiCircle, FiCalendar, FiList, FiSettings } from 'react-icons/fi'
import TodoCalendar from '../components/TodoCalendar'
import { todosApi } from '../api/todos'
import { useAuthStore } from '../stores'
import type { Todo, TodoStats } from '../types'
import { SEO } from '../components/SEO'

const Todos = () => {
  const today = new Date()
  const { user, isAuthenticated } = useAuthStore()
  const isAdmin = isAuthenticated && user?.role === 'ADMIN'
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return today.toISOString().split('T')[0]
  })
  const [stats, setStats] = useState<Record<string, TodoStats>>({})
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

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
  }

  const handleMonthChange = (newYear: number, newMonth: number) => {
    setYear(newYear)
    setMonth(newMonth)
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
      <SEO 
        title="每日待办"
        description="查看每日待办事项"
      />
      
      <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={8}>
        <Flex justify="space-between" align="center" mb={8}>
          <HStack gap={3}>
            <Icon as={FiCalendar} color="brand.600" boxSize={6} />
            <Heading size="xl" fontWeight="700" color="gray.800">每日待办</Heading>
          </HStack>
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              colorPalette="purple"
              asChild
            >
              <Link to="/admin/todos">
                <FiSettings />
                管理待办
              </Link>
            </Button>
          )}
        </Flex>

        <Flex gap={8} direction={{ base: 'column', lg: 'row' }}>
          {/* Calendar */}
          <Box flex={{ lg: '0 0 400px' }}>
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
              borderRadius="2xl" 
              border="1px solid" 
              borderColor="gray.100" 
              p={6}
              minH="400px"
            >
              <HStack gap={3} mb={6}>
                <Icon as={FiList} color="brand.500" boxSize={5} />
                <Heading size="lg" fontWeight="700" color="gray.800">
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
                    <Text color="gray.400" fontSize="lg">当日暂无待办事项</Text>
                  </VStack>
                </Center>
              ) : (
                <VStack align="stretch" gap={4}>
                  {todos.map((todo) => (
                    <Box
                      key={todo.id}
                      p={4}
                      borderRadius="xl"
                      bg={todo.completed ? 'green.50' : 'gray.50'}
                      border="1px solid"
                      borderColor={todo.completed ? 'green.100' : 'gray.100'}
                      transition="all 0.2s"
                    >
                      <HStack gap={4} align="flex-start">
                        <Icon
                          as={todo.completed ? FiCheckCircle : FiCircle}
                          color={todo.completed ? 'green.500' : 'gray.400'}
                          boxSize={6}
                          mt={0.5}
                        />
                        <VStack align="stretch" gap={1} flex="1">
                          <HStack justify="space-between">
                            <Text
                              fontWeight="600"
                              color={todo.completed ? 'gray.500' : 'gray.800'}
                              textDecoration={todo.completed ? 'line-through' : 'none'}
                              fontSize="md"
                            >
                              {todo.title}
                            </Text>
                            {todo.completed && (
                              <Badge colorPalette="green" variant="subtle" fontSize="xs">
                                已完成
                              </Badge>
                            )}
                          </HStack>
                          {todo.description && (
                            <Text
                              fontSize="sm"
                              color="gray.500"
                              textDecoration={todo.completed ? 'line-through' : 'none'}
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
      </Container>
    </Box>
  )
}

export default Todos

import { Box, Grid, Text, HStack, IconButton, VStack, Badge, Flex } from '@chakra-ui/react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import type { TodoStats } from '../types'

interface TodoCalendarProps {
  year: number
  month: number
  selectedDate: string
  stats: Record<string, TodoStats>
  onDateSelect: (date: string) => void
  onMonthChange: (year: number, month: number) => void
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

const TodoCalendar = ({ year, month, selectedDate, stats, onDateSelect, onMonthChange }: TodoCalendarProps) => {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const startDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const prevMonth = () => {
    if (month === 1) {
      onMonthChange(year - 1, 12)
    } else {
      onMonthChange(year, month - 1)
    }
  }

  const nextMonth = () => {
    if (month === 12) {
      onMonthChange(year + 1, 1)
    } else {
      onMonthChange(year, month + 1)
    }
  }

  const formatDateString = (day: number) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const isSelected = (day: number) => {
    return formatDateString(day) === selectedDate
  }

  const isToday = (day: number) => {
    const today = new Date()
    return today.getFullYear() === year && today.getMonth() === month - 1 && today.getDate() === day
  }

  const getStats = (day: number): TodoStats | undefined => {
    return stats[formatDateString(day)]
  }

  const days = []
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  return (
    <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100" p={6}>
      {/* Header */}
      <HStack justify="space-between" mb={6}>
        <Text fontSize="xl" fontWeight="700" color="gray.800">
          {year}年{month}月
        </Text>
        <HStack gap={2}>
          <IconButton
            aria-label="上个月"
            variant="ghost"
            size="sm"
            onClick={prevMonth}
          >
            <FiChevronLeft />
          </IconButton>
          <IconButton
            aria-label="下个月"
            variant="ghost"
            size="sm"
            onClick={nextMonth}
          >
            <FiChevronRight />
          </IconButton>
        </HStack>
      </HStack>

      {/* Weekday Headers */}
      <Grid templateColumns="repeat(7, 1fr)" gap={2} mb={2}>
        {WEEKDAYS.map((day, i) => (
          <Box key={day} textAlign="center">
            <Text 
              fontSize="sm" 
              fontWeight="600" 
              color={i === 0 || i === 6 ? 'purple.500' : 'gray.500'}
            >
              {day}
            </Text>
          </Box>
        ))}
      </Grid>

      {/* Calendar Days */}
      <Grid templateColumns="repeat(7, 1fr)" gap={2}>
        {days.map((day, index) => (
          <Box
            key={index}
            minH="70px"
            p={2}
            borderRadius="lg"
            cursor={day ? 'pointer' : 'default'}
            onClick={() => day && onDateSelect(formatDateString(day))}
            bg={day && isSelected(day) ? 'purple.500' : 'transparent'}
            border={day && isToday(day) ? '2px solid' : 'none'}
            borderColor={day && isToday(day) ? 'purple.400' : 'transparent'}
            _hover={day && !isSelected(day) ? { bg: 'purple.50' } : {}}
            transition="all 0.2s"
          >
            {day && (
              <VStack gap={1} align="stretch">
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  textAlign="center"
                  color={isSelected(day) ? 'white' : isToday(day) ? 'purple.600' : 'gray.700'}
                >
                  {day}
                </Text>
                {getStats(day) && (
                  <Flex gap={1} justify="center" wrap="wrap">
                    <Badge
                      size="sm"
                      colorPalette={isSelected(day) ? 'purple' : 'gray'}
                      variant={isSelected(day) ? 'subtle' : 'solid'}
                      fontSize="xs"
                      px={1.5}
                      borderRadius="full"
                    >
                      {getStats(day)!.total}
                    </Badge>
                    {getStats(day)!.completed > 0 && (
                      <Badge
                        size="sm"
                        colorPalette="green"
                        variant="subtle"
                        fontSize="xs"
                        px={1.5}
                        borderRadius="full"
                      >
                        ✓{getStats(day)!.completed}
                      </Badge>
                    )}
                  </Flex>
                )}
              </VStack>
            )}
          </Box>
        ))}
      </Grid>
    </Box>
  )
}

export default TodoCalendar

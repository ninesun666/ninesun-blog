import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  IconButton,
  Input,
  Spinner,
  Card,
  Link,
  Presence,
  useBreakpointValue,
} from '@chakra-ui/react'
import { FiMessageCircle, FiX, FiSend, FiSmartphone } from 'react-icons/fi'
import { useColorModeValue } from './ui/color-mode'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{ id: number; title: string; slug: string }>
  error?: boolean
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const headerBg = useColorModeValue('purple.500', 'purple.600')
  const userBg = useColorModeValue('purple.500', 'purple.600')
  const assistantBg = useColorModeValue('gray.100', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')
  const inputBg = useColorModeValue('gray.50', 'gray.700')

  // Responsive sizing
  const chatWidth = useBreakpointValue({ base: 'calc(100vw - 32px)', md: '380px' })
  const chatHeight = useBreakpointValue({ base: '60vh', md: '500px' })

  // Scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: '你好！我是 Ninesun Blog 的 AI 助手。有什么我可以帮助你的吗？我可以回答关于博客内容的问题。',
        },
      ])
    }
  }, [isOpen, messages.length])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages
            .filter((m) => m.id !== 'welcome')
            .map((m) => `${m.role}: ${m.content}`)
            .join('\n'),
        }),
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          sources: data.sources,
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.error || '抱歉，处理请求时出现问题。',
          error: true,
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '网络连接失败，请稍后重试。',
        error: true,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Box position="fixed" bottom={6} right={6} zIndex={1000}>
      {/* Chat Button */}
      <IconButton
        aria-label="打开AI助手"
        size="lg"
        borderRadius="full"
        colorPalette="purple"
        boxShadow="lg"
        onClick={() => setIsOpen(!isOpen)}
        _hover={{ transform: 'scale(1.1)' }}
        transition="all 0.2s"
      >
        {isOpen ? <FiX /> : <FiMessageCircle />}
      </IconButton>

      {/* Chat Window */}
      <Presence present={isOpen}>
        <Card.Root
          position="absolute"
          bottom="70px"
          right={0}
          w={chatWidth}
          h={chatHeight}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="2xl"
          bg={bgColor}
          border="1px"
          borderColor={borderColor}
          animation="fadeIn 0.2s ease-out"
          style={{ display: isOpen ? 'block' : 'none' }}
        >
          {/* Header */}
          <Box bg={headerBg} px={4} py={3} color="white">
            <HStack gap={2}>
              <FiSmartphone size={20} />
              <Text fontWeight="bold" fontSize="md">
                AI 助手
              </Text>
            </HStack>
            <Text fontSize="xs" opacity={0.8} mt={1}>
              基于博客内容的智能问答
            </Text>
          </Box>

          {/* Messages */}
          <VStack
            flex={1}
            overflowY="auto"
            p={4}
            gap={3}
            align="stretch"
            bg={useColorModeValue('gray.50', 'gray.900')}
            h="calc(100% - 130px)"
          >
            {messages.map((msg) => (
              <Box
                key={msg.id}
                alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                maxW="85%"
              >
                <Box
                  bg={msg.role === 'user' ? userBg : assistantBg}
                  color={msg.role === 'user' ? 'white' : textColor}
                  px={4}
                  py={3}
                  borderRadius="lg"
                  borderBottomRightRadius={msg.role === 'user' ? 'sm' : 'lg'}
                  borderBottomLeftRadius={msg.role === 'user' ? 'lg' : 'sm'}
                  fontSize="sm"
                  whiteSpace="pre-wrap"
                  wordBreak="break-word"
                >
                  {msg.content}
                </Box>
                {msg.sources && msg.sources.length > 0 && (
                  <HStack gap={1} mt={1} wrap="wrap">
                    <Text fontSize="xs" color={mutedColor}>
                      参考：
                    </Text>
                    {msg.sources.map((s) => (
                      <Link
                        key={s.id}
                        href={`/article/${s.slug}`}
                        fontSize="xs"
                        color="purple.500"
                        _hover={{ textDecoration: 'underline' }}
                        target="_blank"
                      >
                        {s.title}
                      </Link>
                    ))}
                  </HStack>
                )}
              </Box>
            ))}

            {isLoading && (
              <HStack gap={2} alignSelf="flex-start">
                <Box
                  bg={assistantBg}
                  px={4}
                  py={3}
                  borderRadius="lg"
                  borderBottomLeftRadius="sm"
                >
                  <Spinner size="xs" />
                </Box>
              </HStack>
            )}

            <div ref={messagesEndRef} />
          </VStack>

          {/* Input */}
          <Flex p={3} gap={2} borderTop="1px" borderColor={borderColor}>
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入问题..."
              size="sm"
              bg={inputBg}
              borderRadius="lg"
              disabled={isLoading}
            />
            <IconButton
              aria-label="发送"
              size="sm"
              colorPalette="purple"
              onClick={sendMessage}
              loading={isLoading}
              disabled={!input.trim()}
              borderRadius="lg"
            >
              <FiSend />
            </IconButton>
          </Flex>
        </Card.Root>
      </Presence>
    </Box>
  )
}

export default AIChat
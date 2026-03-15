import { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Text,
  Input,
  Textarea,
  Button,
  VStack,
  HStack,
  Spinner,
  Center,
} from '@chakra-ui/react'
import { commentApi } from '../api'
import type { Comment } from '../types'
import { useAuthStore } from '../stores'
import { toast } from '../utils/notify'

interface CommentSectionProps {
  articleId: number
}

const CommentSection = ({ articleId }: CommentSectionProps) => {
  const { isAuthenticated, user } = useAuthStore()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [newComment, setNewComment] = useState('')
  const [guestNickname, setGuestNickname] = useState('')
  const [guestEmail, setGuestEmail] = useState('')

  useEffect(() => {
    loadComments()
  }, [articleId])

  const loadComments = async () => {
    try {
      const data = await commentApi.getByArticle(articleId)
      setComments(data)
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    if (!isAuthenticated && (!guestNickname.trim() || !guestEmail.trim())) {
      toast.warning('请填写昵称和邮箱')
      return
    }

    setSubmitting(true)
    try {
      await commentApi.create({
        articleId,
        content: newComment,
        nickname: isAuthenticated ? undefined : guestNickname,
        email: isAuthenticated ? undefined : guestEmail,
      })
      setNewComment('')
      setGuestNickname('')
      setGuestEmail('')
      toast.success('评论已提交，等待审核')
    } catch (error: any) {
      toast.error(error.response?.data?.message || '评论失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="lg" />
      </Center>
    )
  }

  return (
    <Box mt={10}>
      <Heading size="lg" mb={6}>
        评论 ({comments.length})
      </Heading>

      {/* Comment form */}
      <VStack gap={4} mb={8} p={4} bg="gray.50" borderRadius="md">
        {!isAuthenticated && (
          <HStack w="full" gap={4}>
            <Box flex={1}>
              <Text mb={1} fontSize="sm" fontWeight="medium">昵称 *</Text>
              <Input
                value={guestNickname}
                onChange={(e) => setGuestNickname(e.target.value)}
                placeholder="您的昵称"
                size="sm"
                bg="white"
              />
            </Box>
            <Box flex={1}>
              <Text mb={1} fontSize="sm" fontWeight="medium">邮箱 *</Text>
              <Input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="your@email.com"
                size="sm"
                bg="white"
              />
            </Box>
          </HStack>
        )}
        {isAuthenticated && (
          <Text fontSize="sm" color="gray.600">
            以 <strong>{user?.nickname || user?.username}</strong> 身份评论
          </Text>
        )}
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="写下你的评论..."
          rows={3}
          bg="white"
        />
        <HStack justify="flex-end" w="full">
          <Text fontSize="xs" color="gray.500">
            评论需要审核后才会显示
          </Text>
          <Button
            colorPalette="brand"
            size="sm"
            onClick={handleSubmit}
            loading={submitting}
            disabled={!newComment.trim()}
          >
            提交评论
          </Button>
        </HStack>
      </VStack>

      {/* Comments list */}
      <VStack gap={4} align="stretch">
        {comments.length === 0 ? (
          <Text color="gray.500" textAlign="center" py={4}>
            暂无评论，来说点什么吧~
          </Text>
        ) : (
          comments.map((comment) => (
            <Box key={comment.id} p={4} bg="gray.50" borderRadius="md">
              <HStack justify="space-between" mb={2}>
                <HStack>
                  <Text fontWeight="medium">
                    {comment.nickname || '匿名用户'}
                  </Text>
                  {comment.userId && (
                    <Text fontSize="xs" color="brand.500">
                      已登录
                    </Text>
                  )}
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </Text>
              </HStack>
              <Text color="gray.700" whiteSpace="pre-wrap">
                {comment.content}
              </Text>
            </Box>
          ))
        )}
      </VStack>
    </Box>
  )
}

export default CommentSection

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box, Table, Badge, Button, HStack,
  Card, Heading, Text, Flex, IconButton,
  Checkbox, Spinner, Center, Alert
} from '@chakra-ui/react'
import { FiCheck, FiX, FiTrash2, FiRefreshCw } from 'react-icons/fi'
import { getAllComments, approveComment, rejectComment, deleteComment, batchApproveComments, batchRejectComments } from '../../api/admin'
import type { Comment } from '../../types'

const statusColors: Record<string, string> = {
  PENDING: 'yellow',
  APPROVED: 'green',
  REJECTED: 'red',
}

const statusLabels: Record<string, string> = {
  PENDING: '待审核',
  APPROVED: '已通过',
  REJECTED: '已拒绝',
}

export default function AdminComments() {
  const [status, setStatus] = useState<string>('PENDING')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const queryClient = useQueryClient()

  const { data: allComments, isLoading, refetch } = useQuery({
    queryKey: ['admin-comments'],
    queryFn: getAllComments,
  })

  const comments = status 
    ? allComments?.filter(c => c.status === status) 
    : allComments

  const approveMutation = useMutation({
    mutationFn: approveComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: rejectComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] })
    },
  })

  const batchApproveMutation = useMutation({
    mutationFn: batchApproveComments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] })
      setSelectedIds([])
    },
  })

  const batchRejectMutation = useMutation({
    mutationFn: batchRejectComments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] })
      setSelectedIds([])
    },
  })

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (!comments) return
    if (selectedIds.length === comments.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(comments.map(c => c.id))
    }
  }

  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="2xl">评论审核</Heading>
        <HStack>
          <Button
            variant="outline"
            onClick={() => refetch()}
          >
            <FiRefreshCw /> 刷新
          </Button>
        </HStack>
      </Flex>

      {/* Filter */}
      <Card.Root mb={6}>
        <Card.Body>
          <Flex gap={4} align="center">
            <Box w="200px">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}
              >
                <option value="">全部状态</option>
                <option value="PENDING">待审核</option>
                <option value="APPROVED">已通过</option>
                <option value="REJECTED">已拒绝</option>
              </select>
            </Box>
            {selectedIds.length > 0 && (
              <HStack gap={2}>
                <Text fontSize="sm" color="gray.500">
                  已选择 {selectedIds.length} 条
                </Text>
                <Button
                  size="sm"
                  colorPalette="green"
                  onClick={() => batchApproveMutation.mutate(selectedIds)}
                >
                  <FiCheck /> 批量通过
                </Button>
                <Button
                  size="sm"
                  colorPalette="red"
                  onClick={() => batchRejectMutation.mutate(selectedIds)}
                >
                  <FiX /> 批量拒绝
                </Button>
              </HStack>
            )}
          </Flex>
        </Card.Body>
      </Card.Root>

      {/* Pending Alert */}
      {status === 'PENDING' && comments && comments.length > 0 && (
        <Alert.Root status="warning" mb={4}>
          <Alert.Indicator />
          <Alert.Content>
            有 {comments.length} 条评论等待审核
          </Alert.Content>
        </Alert.Root>
      )}

      {/* Table */}
      <Card.Root>
        <Card.Body overflowX="auto">
          {comments?.length === 0 ? (
            <Center py={10}>
              <Text color="gray.500">暂无评论</Text>
            </Center>
          ) : (
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>
                    <Checkbox.Root
                      checked={selectedIds.length === comments?.length}
                      onCheckedChange={toggleSelectAll}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                    </Checkbox.Root>
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>内容</Table.ColumnHeader>
                  <Table.ColumnHeader>用户</Table.ColumnHeader>
                  <Table.ColumnHeader>IP</Table.ColumnHeader>
                  <Table.ColumnHeader>状态</Table.ColumnHeader>
                  <Table.ColumnHeader>时间</Table.ColumnHeader>
                  <Table.ColumnHeader>操作</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {comments?.map((comment: Comment) => (
                  <Table.Row key={comment.id}>
                    <Table.Cell>
                      <Checkbox.Root
                        checked={selectedIds.includes(comment.id)}
                        onCheckedChange={() => toggleSelect(comment.id)}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                      </Checkbox.Root>
                    </Table.Cell>
                    <Table.Cell maxW="400px">
                      <Text truncate>{comment.content}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontWeight="medium">
                        {comment.user?.nickname || comment.nickname || '游客'}
                      </Text>
                      {comment.email && (
                        <Text fontSize="xs" color="gray.500">{comment.email}</Text>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize="sm" color="gray.500">{comment.ip}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={statusColors[comment.status]}>
                        {statusLabels[comment.status]}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize="sm" color="gray.500">
                        {new Date(comment.createdAt).toLocaleString('zh-CN')}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <HStack gap={2}>
                        {comment.status === 'PENDING' && (
                          <>
                            <IconButton
                              aria-label="Approve"
                              size="sm"
                              colorPalette="green"
                              variant="ghost"
                              onClick={() => approveMutation.mutate(comment.id)}
                            >
                              <FiCheck />
                            </IconButton>
                            <IconButton
                              aria-label="Reject"
                              size="sm"
                              colorPalette="red"
                              variant="ghost"
                              onClick={() => rejectMutation.mutate(comment.id)}
                            >
                              <FiX />
                            </IconButton>
                          </>
                        )}
                        <IconButton
                          aria-label="Delete"
                          size="sm"
                          colorPalette="red"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('确定要删除这条评论吗？')) {
                              deleteMutation.mutate(comment.id)
                            }
                          }}
                        >
                          <FiTrash2 />
                        </IconButton>
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          )}
        </Card.Body>
      </Card.Root>
    </Box>
  )
}
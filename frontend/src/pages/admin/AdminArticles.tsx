import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box, Table, Badge, Button, HStack,
  Card, Heading, Text, Input, 
  Flex, IconButton, Spinner, Center
} from '@chakra-ui/react'
import { FiEdit, FiTrash2, FiEye, FiPlus } from 'react-icons/fi'
import { getAllArticles } from '../../api/admin'
import type { Article } from '../../types'

const statusColors: Record<string, string> = {
  PUBLISHED: 'green',
  DRAFT: 'yellow',
}

const statusLabels: Record<string, string> = {
  PUBLISHED: '已发布',
  DRAFT: '草稿',
}

export default function AdminArticles() {
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<string>('')
  const [search, setSearch] = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-articles', page, status],
    queryFn: () => getAllArticles(page, 10, status || undefined),
  })

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这篇文章吗？')) {
      // TODO: 调用删除 API
      console.log('Delete article:', id)
      refetch()
    }
  }

  const filteredArticles = data?.content.filter(article =>
    article.title.toLowerCase().includes(search.toLowerCase())
  )

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
        <Heading size="2xl">文章管理</Heading>
        <Button
          asChild
          colorPalette="blue"
        >
          <Link to="/admin/articles/new">
            <FiPlus /> 新建文章
          </Link>
        </Button>
      </Flex>

      {/* Filters */}
      <Card.Root mb={6}>
        <Card.Body>
          <Flex gap={4} wrap="wrap">
            <Input
              placeholder="搜索文章..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              maxW="300px"
            />
            <Box w="200px">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}
              >
                <option value="">全部状态</option>
                <option value="PUBLISHED">已发布</option>
                <option value="DRAFT">草稿</option>
              </select>
            </Box>
          </Flex>
        </Card.Body>
      </Card.Root>

      {/* Table */}
      <Card.Root>
        <Card.Body overflowX="auto">
          {filteredArticles?.length === 0 ? (
            <Center py={10}>
              <Text color="gray.500">暂无文章</Text>
            </Center>
          ) : (
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>标题</Table.ColumnHeader>
                  <Table.ColumnHeader>分类</Table.ColumnHeader>
                  <Table.ColumnHeader>状态</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">浏览</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">点赞</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">评论</Table.ColumnHeader>
                  <Table.ColumnHeader>创建时间</Table.ColumnHeader>
                  <Table.ColumnHeader>操作</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredArticles?.map((article: Article) => (
                  <Table.Row key={article.id}>
                    <Table.Cell>
                      <Text fontWeight="medium" maxW="300px" truncate>
                        {article.title}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text color="gray.500">{article.category?.name || '-'}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={statusColors[article.status]}>
                        {statusLabels[article.status]}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell textAlign="end">{article.viewCount}</Table.Cell>
                    <Table.Cell textAlign="end">{article.likeCount}</Table.Cell>
                    <Table.Cell textAlign="end">{article.commentCount}</Table.Cell>
                    <Table.Cell>
                      <Text fontSize="sm" color="gray.500">
                        {new Date(article.createdAt).toLocaleDateString('zh-CN')}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <HStack gap={2}>
                        <IconButton
                          asChild
                          aria-label="View"
                          size="sm"
                          variant="ghost"
                        >
                          <Link to={`/article/${article.slug}`}>
                            <FiEye />
                          </Link>
                        </IconButton>
                        <IconButton
                          asChild
                          aria-label="Edit"
                          size="sm"
                          variant="ghost"
                          colorPalette="blue"
                        >
                          <Link to={`/admin/articles/edit/${article.id}`}>
                            <FiEdit />
                          </Link>
                        </IconButton>
                        <IconButton
                          aria-label="Delete"
                          size="sm"
                          variant="ghost"
                          colorPalette="red"
                          onClick={() => handleDelete(article.id)}
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

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <Flex justify="center" mt={4} gap={2}>
              <Button
                size="sm"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 0}
              >
                上一页
              </Button>
              <Text alignSelf="center" fontSize="sm">
                第 {page + 1} / {data.totalPages} 页
              </Text>
              <Button
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= data.totalPages - 1}
              >
                下一页
              </Button>
            </Flex>
          )}
        </Card.Body>
      </Card.Root>
    </Box>
  )
}
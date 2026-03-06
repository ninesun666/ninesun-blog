import { useQuery } from '@tanstack/react-query'
import { Box, SimpleGrid, Card, Heading, Text, Flex, Icon, Spinner, Center, HStack, Badge, VStack, Separator, Progress } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { getDetailedStats, type DetailedStats } from '../../api/admin'
import { FiFileText, FiMessageSquare, FiUsers, FiEye, FiHeart, FiTag, FiFolder, FiAlertCircle, FiTrendingUp, FiClock } from 'react-icons/fi'

interface StatCardProps {
  label: string
  value: number
  icon: React.ElementType
  color: string
  helpText?: string
}

function StatCard({ label, value, icon, color, helpText }: StatCardProps) {
  return (
    <Card.Root>
      <Card.Body>
        <Flex justify="space-between" align="center">
          <Box>
            <Text color="gray.500" fontSize="sm">{label}</Text>
            <Text fontSize="2xl" fontWeight="bold">{value.toLocaleString()}</Text>
            {helpText && <Text fontSize="xs" color="gray.400">{helpText}</Text>}
          </Box>
          <Box
            p={3}
            borderRadius="lg"
            bg={`${color}.100`}
          >
            <Icon as={icon} boxSize={6} color={`${color}.500`} />
          </Box>
        </Flex>
      </Card.Body>
    </Card.Root>
  )
}

interface ArticleListItemProps {
  article: {
    id: number
    title: string
    slug: string
    viewCount?: number
    likeCount?: number
    commentCount?: number
    status?: string
    createdAt?: string
  }
  showStats?: boolean
}

function ArticleListItem({ article, showStats = true }: ArticleListItemProps) {
  return (
    <Flex justify="space-between" align="center" py={2} _hover={{ bg: 'gray.50' }} px={2} borderRadius="md">
      <Box flex={1} minW={0}>
        <Link to={`/admin/articles/edit/${article.id}`}>
          <Text fontWeight="medium" truncate _hover={{ color: 'brand.500' }}>
            {article.title}
          </Text>
        </Link>
      </Box>
      {showStats && (
        <HStack gap={4} color="gray.500" fontSize="sm">
          <HStack gap={1}>
            <Icon as={FiEye} />
            <Text>{article.viewCount?.toLocaleString() || 0}</Text>
          </HStack>
          <HStack gap={1}>
            <Icon as={FiHeart} />
            <Text>{article.likeCount || 0}</Text>
          </HStack>
          <HStack gap={1}>
            <Icon as={FiMessageSquare} />
            <Text>{article.commentCount || 0}</Text>
          </HStack>
        </HStack>
      )}
    </Flex>
  )
}

interface CategoryTagStatsProps {
  items: { id: number; name: string; slug: string; articleCount: number }[]
  type: 'category' | 'tag'
  maxItems?: number
}

function CategoryTagStats({ items, type, maxItems = 5 }: CategoryTagStatsProps) {
  const displayItems = items.slice(0, maxItems)
  const maxCount = Math.max(...items.map(i => i.articleCount), 1)
  
  return (
    <VStack align="stretch" gap={2}>
      {displayItems.map((item) => (
        <Box key={item.id}>
          <Flex justify="space-between" mb={1}>
            <Link to={`/${type}/${item.slug}`}>
              <Text fontSize="sm" _hover={{ color: 'brand.500' }}>{item.name}</Text>
            </Link>
            <Text fontSize="sm" color="gray.500">{item.articleCount} 篇</Text>
          </Flex>
          <Progress.Root size="sm" value={(item.articleCount / maxCount) * 100}>
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </Box>
      ))}
      {items.length > maxItems && (
        <Text fontSize="sm" color="gray.400">还有 {items.length - maxItems} 个{type === 'category' ? '分类' : '标签'}...</Text>
      )}
    </VStack>
  )
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DetailedStats>({
    queryKey: ['admin-stats-detailed'],
    queryFn: getDetailedStats,
  })

  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner size="xl" />
      </Center>
    )
  }

  if (!stats) {
    return <Text>无法加载统计数据</Text>
  }

  return (
    <Box>
      <Heading size="2xl" mb={6}>仪表盘</Heading>

      {/* 主要统计 */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} mb={8}>
        <StatCard
          label="文章总数"
          value={stats.totalArticles}
          icon={FiFileText}
          color="blue"
          helpText={`${stats.publishedArticles} 已发布, ${stats.draftArticles} 草稿`}
        />
        <StatCard
          label="评论总数"
          value={stats.totalComments}
          icon={FiMessageSquare}
          color="green"
          helpText={`${stats.pendingComments} 待审核`}
        />
        <StatCard
          label="用户总数"
          value={stats.totalUsers}
          icon={FiUsers}
          color="purple"
          helpText={`${stats.adminCount} 管理员`}
        />
        <StatCard
          label="总浏览量"
          value={stats.totalViews}
          icon={FiEye}
          color="orange"
        />
      </SimpleGrid>

      {/* 次要统计 */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} mb={8}>
        <StatCard
          label="分类数"
          value={stats.totalCategories}
          icon={FiFolder}
          color="teal"
        />
        <StatCard
          label="标签数"
          value={stats.totalTags}
          icon={FiTag}
          color="cyan"
        />
        <StatCard
          label="点赞数"
          value={stats.totalLikes}
          icon={FiHeart}
          color="pink"
        />
        <StatCard
          label="待审核评论"
          value={stats.pendingComments}
          icon={FiAlertCircle}
          color="red"
        />
      </SimpleGrid>

      {/* 详细统计卡片 */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} mb={8}>
        {/* 热门文章 */}
        <Card.Root>
          <Card.Body>
            <Flex align="center" gap={2} mb={4}>
              <Icon as={FiTrendingUp} color="orange.500" />
              <Heading size="lg">热门文章</Heading>
            </Flex>
            <VStack align="stretch" gap={2}>
              {stats.popularArticles.length > 0 ? (
                stats.popularArticles.map((article, index) => (
                  <Box key={article.id}>
                    <ArticleListItem article={article} />
                    {index < stats.popularArticles.length - 1 && <Separator />}
                  </Box>
                ))
              ) : (
                <Text color="gray.500" textAlign="center" py={4}>暂无文章</Text>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* 最近文章 */}
        <Card.Root>
          <Card.Body>
            <Flex align="center" gap={2} mb={4}>
              <Icon as={FiClock} color="blue.500" />
              <Heading size="lg">最近文章</Heading>
            </Flex>
            <VStack align="stretch" gap={2}>
              {stats.recentArticles.length > 0 ? (
                stats.recentArticles.map((article, index) => (
                  <Box key={article.id}>
                    <Flex justify="space-between" align="center" py={2} _hover={{ bg: 'gray.50' }} px={2} borderRadius="md">
                      <Box flex={1} minW={0}>
                        <Link to={`/admin/articles/edit/${article.id}`}>
                          <Text fontWeight="medium" truncate _hover={{ color: 'brand.500' }}>
                            {article.title}
                          </Text>
                        </Link>
                      </Box>
                      <HStack gap={2}>
                        <Badge colorPalette={article.status === 'PUBLISHED' ? 'green' : 'yellow'}>
                          {article.status === 'PUBLISHED' ? '已发布' : '草稿'}
                        </Badge>
                        <Text fontSize="sm" color="gray.500">
                          {new Date(article.createdAt).toLocaleDateString('zh-CN')}
                        </Text>
                      </HStack>
                    </Flex>
                    {index < stats.recentArticles.length - 1 && <Separator />}
                  </Box>
                ))
              ) : (
                <Text color="gray.500" textAlign="center" py={4}>暂无文章</Text>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      {/* 分类和标签统计 */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
        {/* 分类统计 */}
        <Card.Root>
          <Card.Body>
            <Flex align="center" gap={2} mb={4}>
              <Icon as={FiFolder} color="teal.500" />
              <Heading size="lg">分类统计</Heading>
            </Flex>
            {stats.categoryStats.length > 0 ? (
              <CategoryTagStats items={stats.categoryStats} type="category" />
            ) : (
              <Text color="gray.500" textAlign="center" py={4}>暂无分类</Text>
            )}
          </Card.Body>
        </Card.Root>

        {/* 标签统计 */}
        <Card.Root>
          <Card.Body>
            <Flex align="center" gap={2} mb={4}>
              <Icon as={FiTag} color="cyan.500" />
              <Heading size="lg">标签统计</Heading>
            </Flex>
            {stats.tagStats.length > 0 ? (
              <CategoryTagStats items={stats.tagStats} type="tag" />
            ) : (
              <Text color="gray.500" textAlign="center" py={4}>暂无标签</Text>
            )}
          </Card.Body>
        </Card.Root>
      </SimpleGrid>
    </Box>
  )
}

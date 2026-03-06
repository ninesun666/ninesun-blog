import { Box, Heading, Text, SimpleGrid, Card, Badge, HStack, Spinner, Center } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { useArticles } from '../api/hooks'
import { SEO, generateBreadcrumbJsonLd } from '../components/SEO'

const ArticleList = () => {
  const { data, isLoading, error } = useArticles()

  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner size="xl" color="brand.500" />
      </Center>
    )
  }

  if (error) {
    return (
      <Center py={10}>
        <Text color="red.500">加载失败，请稍后重试</Text>
      </Center>
    )
  }

  const articles = data?.content || []

  if (articles.length === 0) {
    return (
      <Center py={10}>
        <Text color="gray.500">暂无文章</Text>
      </Center>
    )
  }

  const siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:8999'

  return (
    <Box>
      <SEO
        title="全部文章"
        description="浏览 Ninesun Blog 的所有技术文章"
        canonicalUrl={`${siteUrl}/articles`}
        jsonLd={generateBreadcrumbJsonLd([
          { name: '首页', url: siteUrl },
          { name: '文章列表', url: `${siteUrl}/articles` }
        ])}
      />
      <Heading size="xl" mb={6}>全部文章</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
        {articles.map((article: any) => (
          <Card.Root key={article.id} asChild>
            <Link to={`/article/${article.slug}`}>
              <Card.Body>
                <Heading size="lg" mb={2}>{article.title}</Heading>
                {article.summary && (
                  <Text color="gray.600" fontSize="sm" mb={3} lineClamp={2}>{article.summary}</Text>
                )}
                <HStack justify="space-between">
                  {article.category && (
                    <Badge colorPalette="purple">{article.category.name}</Badge>
                  )}
                  {article.tags && article.tags.length > 0 && (
                    <HStack gap={1}>
                      {article.tags.slice(0, 3).map((tag: any) => (
                        <Badge key={tag.id} variant="outline">{tag.name}</Badge>
                      ))}
                    </HStack>
                  )}
                </HStack>
              </Card.Body>
            </Link>
          </Card.Root>
        ))}
      </SimpleGrid>
    </Box>
  )
}

export default ArticleList
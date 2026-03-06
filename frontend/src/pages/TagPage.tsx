import { Box, Heading, Text, SimpleGrid, Card, Badge, HStack, Spinner, Center } from '@chakra-ui/react'
import { Link, useParams } from 'react-router-dom'
import { useArticlesByTag, useTags } from '../api/hooks'
import { SEO, generateBreadcrumbJsonLd } from '../components/SEO'

const TagPage = () => {
  const { slug } = useParams()
  const { data, isLoading, error } = useArticlesByTag(slug || '')
  const { data: tags } = useTags()

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
        <Text color="red.500">加载失败</Text>
      </Center>
    )
  }

  const articles = data?.content || []
  const siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:8999'
  const tag = tags?.find((t: any) => t.slug === slug)
  const tagName = tag?.name || slug || '未知标签'

  return (
    <Box>
      <SEO
        title={`标签: ${tagName}`}
        description={`${tagName}标签下的所有文章 - Ninesun Blog`}
        canonicalUrl={slug ? `${siteUrl}/tag/${slug}` : undefined}
        jsonLd={generateBreadcrumbJsonLd([
          { name: '首页', url: siteUrl },
          { name: tagName, url: `${siteUrl}/tag/${slug || ''}` }
        ])}
      />
      <Heading size="xl" mb={6}>标签: {tagName}</Heading>
      {articles.length === 0 ? (
        <Center py={10}>
          <Text color="gray.500">该标签下暂无文章</Text>
        </Center>
      ) : (
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
                  </HStack>
                </Card.Body>
              </Link>
            </Card.Root>
          ))}
        </SimpleGrid>
      )}
    </Box>
  )
}

export default TagPage
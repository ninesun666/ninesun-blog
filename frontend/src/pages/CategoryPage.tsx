import { Box, Heading, Text, SimpleGrid, Card, Badge, HStack, Spinner, Center } from '@chakra-ui/react'
import { Link, useParams } from 'react-router-dom'
import { useArticlesByCategory, useCategories } from '../api/hooks'
import { SEO, generateBreadcrumbJsonLd } from '../components/SEO'

const CategoryPage = () => {
  const { slug } = useParams()
  const { data, isLoading, error } = useArticlesByCategory(slug || '')
  const { data: categories } = useCategories()

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
  const category = categories?.find((c: any) => c.slug === slug)
  const categoryName = category?.name || slug || '未知分类'

  return (
    <Box>
      <SEO
        title={`分类: ${categoryName}`}
        description={`${categoryName}分类下的所有文章 - Ninesun Blog`}
        canonicalUrl={slug ? `${siteUrl}/category/${slug}` : undefined}
        jsonLd={generateBreadcrumbJsonLd([
          { name: '首页', url: siteUrl },
          { name: categoryName, url: `${siteUrl}/category/${slug || ''}` }
        ])}
      />
      <Heading size="xl" mb={6}>分类: {categoryName}</Heading>
      {articles.length === 0 ? (
        <Center py={10}>
          <Text color="gray.500">该分类下暂无文章</Text>
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
                  <HStack gap={1}>
                    {article.tags?.slice(0, 3).map((tag: any) => (
                      <Badge key={tag.id} variant="outline">{tag.name}</Badge>
                    ))}
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

export default CategoryPage
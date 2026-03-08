import { Box, Heading, Text, Badge, HStack, VStack, Separator, Spinner, Center } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useArticle } from '../api/hooks'
import { articleApi } from '../api'
import ReactMarkdown from 'react-markdown'
import LikeButton from '../components/LikeButton'
import CommentSection from '../components/CommentSection'
import { SEO, generateArticleJsonLd } from '../components/SEO'

const ArticleDetail = () => {
  const { slug } = useParams()
  const { data: article, isLoading, error } = useArticle(slug || '')

  // 文章加载完成后增加浏览次数
  useEffect(() => {
    if (article?.id) {
      articleApi.incrementViewCount(article.id).catch(() => {
        // 忽略错误，不影响用户体验
      })
    }
  }, [article?.id])

  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner size="xl" color="brand.500" />
      </Center>
    )
  }

  if (error || !article) {
    return (
      <Center py={10}>
        <Text color="red.500">文章不存在</Text>
      </Center>
    )
  }

  const siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:8999'
  const canonicalUrl = `${siteUrl}/article/${article.slug}`

  return (
    <Box maxW="800px" mx="auto">
      <SEO
        title={article.title}
        description={article.summary || article.content?.slice(0, 160)}
        keywords={article.tags?.map((t: any) => t.name) || []}
        canonicalUrl={canonicalUrl}
        ogType="article"
        ogTitle={article.title}
        ogDescription={article.summary || article.content?.slice(0, 160)}
        ogImage={article.coverImage}
        articlePublishedTime={article.createdAt}
        articleModifiedTime={article.updatedAt}
        articleSection={article.category?.name}
        articleTags={article.tags?.map((t: any) => t.name)}
        jsonLd={generateArticleJsonLd(article)}
      />
      <VStack gap={4} align="start" mb={6}>
        <Heading size="3xl">{article.title}</Heading>
        <HStack gap={4} color="gray.500" fontSize="sm">
          <Text>{new Date(article.createdAt).toLocaleDateString('zh-CN')}</Text>
          <Text>阅读 {article.viewCount}</Text>
        </HStack>
        <HStack gap={2}>
          {article.category && (
            <Badge colorPalette="purple">{article.category.name}</Badge>
          )}
          {article.tags?.map((tag: any) => (
            <Badge key={tag.id} variant="outline">{tag.name}</Badge>
          ))}
        </HStack>
      </VStack>

      <Separator mb={6} />

      <Box className="markdown-body" lineHeight="tall">
        <ReactMarkdown>{article.content}</ReactMarkdown>
      </Box>

      <Separator my={8} />

      {/* Like Button */}
      <Box mb={6}>
        <LikeButton articleId={article.id} />
      </Box>

      {/* Comments */}
      <CommentSection articleId={article.id} />
    </Box>
  )
}

export default ArticleDetail
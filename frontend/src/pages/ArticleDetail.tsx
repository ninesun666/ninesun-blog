import { Box, Heading, Text, Badge, HStack, VStack, Separator, Spinner, Center, Button, Flex, Container, useBreakpointValue, Icon, Card } from '@chakra-ui/react'
import { useParams, Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { FiEdit2, FiMenu, FiX, FiPaperclip, FiDownload, FiLock } from 'react-icons/fi'
import { useArticle } from '../api/hooks'
import { articleApi, attachmentApi } from '../api'
import { useAuthStore } from '../stores'
import type { Attachment } from '../types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import hljs from 'highlight.js'
import LikeButton from '../components/LikeButton'
import CommentSection from '../components/CommentSection'
import ArticleSidebar from '../components/ArticleSidebar'
import { SEO, generateArticleJsonLd } from '../components/SEO'

const ArticleDetail = () => {
  const { slug } = useParams()
  const { data: article, isLoading, error } = useArticle(slug || '')
  const codeRef = useRef<HTMLDivElement>(null)
  const { user, isAuthenticated } = useAuthStore()
  const isAdmin = isAuthenticated && user?.role === 'ADMIN'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  
  const isMobile = useBreakpointValue({ base: true, lg: false })

  // 文章加载完成后增加浏览次数
  useEffect(() => {
    if (article?.id) {
      articleApi.incrementViewCount(article.id).catch(() => {})
      // 加载附件
      loadAttachments(article.id)
    }
  }, [article?.id])

  const loadAttachments = async (articleId: number) => {
    try {
      const data = await attachmentApi.getByArticle(articleId)
      setAttachments(data)
    } catch (error) {
      console.error('Failed to load attachments:', error)
    }
  }

  const handleDownload = (attachment: Attachment) => {
    if (!isAuthenticated) {
      alert('请先登录后再下载附件')
      return
    }
    // 直接打开下载链接
    window.open(attachmentApi.getDownloadUrl(attachment.id), '_blank')
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // 代码高亮
  useEffect(() => {
    if (article?.content && codeRef.current) {
      codeRef.current.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement)
      })
    }
  }, [article?.content])

  // 切换文章时关闭移动端侧边栏
  useEffect(() => {
    setSidebarOpen(false)
  }, [slug])

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

  const ArticleContent = () => (
    <Box>
      <VStack gap={4} align="start" mb={6}>
        <Flex justify="space-between" w="full" align="flex-start">
          <HStack gap={3}>
            {isMobile && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                p={1}
              >
                {sidebarOpen ? <FiX /> : <FiMenu />}
              </Button>
            )}
            <Heading size="2xl">{article.title}</Heading>
          </HStack>
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              colorPalette="purple"
              asChild
            >
              <Link to={`/admin/articles/edit/${article.id}`}>
                <FiEdit2 />
                编辑
              </Link>
            </Button>
          )}
        </Flex>
        <HStack gap={4} color="fg.muted" fontSize="sm">
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

      <Box ref={codeRef} className="markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {article.content}
        </ReactMarkdown>
      </Box>

      {/* 附件列表 */}
      {attachments.length > 0 && (
        <Box mt={8}>
          <Heading size="md" mb={4}>
            <Icon as={FiPaperclip} mr={2} />
            附件下载
          </Heading>
          <Card.Root>
            <Card.Body p={4}>
              <VStack align="stretch" gap={3}>
                {attachments.map((att) => (
                  <Flex
                    key={att.id}
                    align="center"
                    justify="space-between"
                    p={3}
                    bg="gray.50"
                    _dark={{ bg: 'gray.700' }}
                    borderRadius="lg"
                  >
                    <HStack gap={3}>
                      <Icon as={FiPaperclip} color="brand.500" />
                      <Box>
                        <Text fontWeight="medium">{att.filename}</Text>
                        <HStack gap={2} fontSize="sm" color="gray.500">
                          <Text>{formatFileSize(att.fileSize)}</Text>
                          <Text>·</Text>
                          <Text>下载 {att.downloadCount} 次</Text>
                        </HStack>
                      </Box>
                    </HStack>
                    <Button
                      size="sm"
                      colorPalette="brand"
                      onClick={() => handleDownload(att)}
                    >
                      {isAuthenticated ? (
                        <>
                          <Icon as={FiDownload} mr={1} />
                          下载
                        </>
                      ) : (
                        <>
                          <Icon as={FiLock} mr={1} />
                          登录下载
                        </>
                      )}
                    </Button>
                  </Flex>
                ))}
              </VStack>
            </Card.Body>
          </Card.Root>
        </Box>
      )}

      <Separator my={8} />

      <Box mb={6}>
        <LikeButton articleId={article.id} />
      </Box>

      <CommentSection articleId={article.id} />
    </Box>
  )

  return (
    <Box position="relative">
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
      
      <Flex gap={0} minH="calc(100vh - 200px)">
        {/* 左侧边栏 - 桌面端 */}
        {!isMobile && (
          <Box
            w="280px"
            minW="280px"
            borderRight="1px solid"
            borderColor="gray.100"
            bg="gray.50"
            position="sticky"
            top="80px"
            h="calc(100vh - 80px)"
          >
            <ArticleSidebar />
          </Box>
        )}
        
        {/* 左侧边栏 - 移动端 */}
        {isMobile && sidebarOpen && (
          <Box
            position="fixed"
            top="0"
            left="0"
            w="280px"
            h="100vh"
            bg="white"
            zIndex={1000}
            boxShadow="lg"
          >
            <ArticleSidebar />
          </Box>
        )}
        
        {/* 移动端遮罩 */}
        {isMobile && sidebarOpen && (
          <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="blackAlpha.500"
            zIndex={999}
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* 右侧内容区 */}
        <Box flex="1" overflow="hidden">
          <Container maxW="800px" px={{ base: 4, md: 6 }} py={6}>
            <ArticleContent />
          </Container>
        </Box>
      </Flex>
    </Box>
  )
}

export default ArticleDetail

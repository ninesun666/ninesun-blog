import { Box, Heading, Text, SimpleGrid, Card, Badge, HStack, Spinner, Center, VStack, Icon, Flex, Container, Link as ChakraLink } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { FiClock, FiArrowRight, FiBookOpen, FiTag, FiFolder } from 'react-icons/fi'
import { useArticles, useCategories, useTags } from '../api/hooks'
import { SEO, generateWebsiteJsonLd } from '../components/SEO'

const Home = () => {
  const { data: articlesData, isLoading: articlesLoading } = useArticles(0, 6)
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: tags, isLoading: tagsLoading } = useTags()

  const articles = articlesData?.content || []
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Box>
      <SEO 
        title="首页"
        description="Ninesun Blog - 分享技术，记录成长"
        jsonLd={generateWebsiteJsonLd()}
      />
      
      {/* Hero Section */}
      <Box 
        textAlign="center" 
        py={{ base: 12, md: 20 }}
        px={4}
        mb={12}
        position="relative"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="linear-gradient(135deg, rgba(124, 58, 237, 0.03) 0%, rgba(168, 85, 247, 0.05) 50%, rgba(192, 38, 211, 0.03) 100%)"
          borderRadius="3xl"
          zIndex={-1}
        />
        <VStack gap={4}>
          <Heading 
            size={{ base: "3xl", md: "4xl" }} 
            className="gradient-text"
            fontWeight="800"
            letterSpacing="-0.02em"
          >
            欢迎来到 Ninesun Blog
          </Heading>
          <Text 
            color="gray.500" 
            fontSize={{ base: "lg", md: "xl" }}
            maxW="600px"
            fontWeight="500"
          >
            分享技术，记录成长
          </Text>
        </VStack>
      </Box>

      {/* Latest Articles */}
      <Container maxW={{ base: "100%", md: "container.xl", "2xl": "1600px" }} px={{ base: 4, md: 6 }}>
        <Flex align="center" justify="space-between" mb={8}>
          <HStack gap={3}>
            <Icon as={FiBookOpen} color="brand.600" boxSize={6} />
            <Heading size="xl" fontWeight="700" color="gray.800">最新文章</Heading>
          </HStack>
          <ChakraLink 
            asChild
            color="brand.600" 
            fontWeight="600"
            fontSize="sm"
            _hover={{ color: 'brand.700' }}
          >
            <Link to="/articles">
              <HStack>
                <Text>查看全部</Text>
                <Icon as={FiArrowRight} />
              </HStack>
            </Link>
          </ChakraLink>
        </Flex>
        
        {articlesLoading ? (
          <Center py={20}>
            <Spinner size="xl" color="brand.500" />
          </Center>
        ) : articles.length === 0 ? (
          <Center py={20}>
            <VStack gap={3}>
              <Icon as={FiBookOpen} boxSize={12} color="gray.300" />
              <Text color="gray.400" fontSize="lg">暂无文章</Text>
            </VStack>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, "2xl": 4 }} gap={6}>
            {articles.map((article: any, index: number) => (
              <Card.Root 
                key={article.id} 
                asChild
                className="card-hover"
                bg="white"
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.100"
                overflow="hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link to={`/article/${article.slug}`}>
                  <Card.Body p={6}>
                    <VStack align="stretch" gap={4}>
                      {/* Category & Date */}
                      <Flex justify="space-between" align="center">
                        {article.category && (
                          <Badge 
                            colorPalette="purple"
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="600"
                            textTransform="none"
                          >
                            {article.category.name}
                          </Badge>
                        )}
                        {article.createdAt && (
                          <HStack gap={1} color="gray.400" fontSize="xs">
                            <Icon as={FiClock} boxSize={3} />
                            <Text>{formatDate(article.createdAt)}</Text>
                          </HStack>
                        )}
                      </Flex>
                      
                      {/* Title */}
                      <Heading 
                        size="lg" 
                        fontWeight="700" 
                        color="gray.800"
                        lineClamp={2}
                        _groupHover={{ color: 'brand.600' }}
                        transition="color 0.2s"
                      >
                        {article.title}
                      </Heading>
                      
                      {/* Summary */}
                      {article.summary && (
                        <Text 
                          color="gray.500" 
                          fontSize="sm" 
                          lineClamp={2}
                          lineHeight="1.7"
                        >
                          {article.summary}
                        </Text>
                      )}
                      
                      {/* Tags */}
                      {article.tags && article.tags.length > 0 && (
                        <HStack gap={2} flexWrap="wrap">
                          {article.tags.slice(0, 3).map((tag: any) => (
                            <Badge 
                              key={tag.id} 
                              variant="outline"
                              colorScheme="purple"
                              fontSize="xs"
                              fontWeight="500"
                              borderRadius="md"
                            >
                              #{tag.name}
                            </Badge>
                          ))}
                        </HStack>
                      )}
                    </VStack>
                  </Card.Body>
                </Link>
              </Card.Root>
            ))}
          </SimpleGrid>
        )}

        {/* Categories & Tags Section */}
        <SimpleGrid columns={{ base: 1, md: 2, "2xl": 2 }} gap={8} mt={16}>
          {/* Categories */}
          <Box 
            bg="white" 
            p={8} 
            borderRadius="2xl" 
            border="1px solid"
            borderColor="gray.100"
          >
            <HStack gap={3} mb={6}>
              <Icon as={FiFolder} color="brand.500" boxSize={5} />
              <Heading size="lg" fontWeight="700" color="gray.800">分类</Heading>
            </HStack>
            {categoriesLoading ? (
              <Center py={6}>
                <Spinner size="sm" color="brand.500" />
              </Center>
            ) : categories && categories.length > 0 ? (
              <Flex gap={3} wrap="wrap">
                {categories.map((category: any) => (
                  <Badge 
                    key={category.id} 
                    asChild
                    px={4}
                    py={2}
                    borderRadius="lg"
                    bg="purple.50"
                    color="purple.700"
                    fontWeight="600"
                    fontSize="sm"
                    _hover={{ bg: 'purple.100' }}
                    transition="all 0.2s"
                  >
                    <Link to={`/category/${category.slug}`}>{category.name}</Link>
                  </Badge>
                ))}
              </Flex>
            ) : (
              <Text color="gray.400">暂无分类</Text>
            )}
          </Box>

          {/* Tags */}
          <Box 
            bg="white" 
            p={8} 
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.100"
          >
            <HStack gap={3} mb={6}>
              <Icon as={FiTag} color="brand.500" boxSize={5} />
              <Heading size="lg" fontWeight="700" color="gray.800">标签</Heading>
            </HStack>
            {tagsLoading ? (
              <Center py={6}>
                <Spinner size="sm" color="brand.500" />
              </Center>
            ) : tags && tags.length > 0 ? (
              <Flex gap={2} wrap="wrap">
                {tags.map((tag: any) => (
                  <Badge 
                    key={tag.id} 
                    asChild
                    px={3}
                    py={1.5}
                    borderRadius="md"
                    variant="outline"
                    colorScheme="purple"
                    fontWeight="500"
                    fontSize="sm"
                    _hover={{ bg: 'purple.50' }}
                    transition="all 0.2s"
                  >
                    <Link to={`/tag/${tag.slug}`}>#{tag.name}</Link>
                  </Badge>
                ))}
              </Flex>
            ) : (
              <Text color="gray.400">暂无标签</Text>
            )}
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  )
}

export default Home
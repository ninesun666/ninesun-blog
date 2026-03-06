import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Heading,
  Button,
  Input,
  Textarea,
  VStack,
  HStack,
  Spinner,
  Center,
  Text,
} from '@chakra-ui/react'
import { NativeSelectField, NativeSelectRoot } from '@chakra-ui/react/native-select'
import MarkdownEditor from '../components/MarkdownEditor'
import { articleApi, categoryApi, tagApi } from '../api'

// Simple form field wrapper
const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Box>
    <Text fontWeight="medium" mb={2}>{label}</Text>
    {children}
  </Box>
)

interface Category {
  id: number
  name: string
  slug: string
}

interface Tag {
  id: number
  name: string
  slug: string
}

// Simple toast replacement for Chakra v3
const showToast = (title: string, status: 'success' | 'error' | 'warning' = 'success') => {
  console.log(`[${status.toUpperCase()}] ${title}`)
  alert(title)
}

const ArticleEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    categoryId: '',
    tagIds: [] as number[],
    status: 'DRAFT',
    allowComment: true,
  })

  useEffect(() => {
    loadCategoriesAndTags()
    if (isEdit) {
      loadArticle()
    }
  }, [id])

  const loadCategoriesAndTags = async () => {
    try {
      const [catData, tagData] = await Promise.all([
        categoryApi.getAll(),
        tagApi.getAll(),
      ])
      setCategories(catData)
      setTags(tagData)
    } catch (error) {
      console.error('Failed to load categories/tags:', error)
    }
  }

  const loadArticle = async () => {
    try {
      const article = await articleApi.getArticleById(Number(id))
      setFormData({
        title: article.title,
        slug: article.slug,
        summary: article.summary || '',
        content: article.content,
        categoryId: article.category?.id?.toString() || '',
        tagIds: article.tags?.map((t: any) => t.id) || [],
        status: article.status,
        allowComment: article.allowComment ?? true,
      })
    } catch (error) {
      showToast('加载失败：无法加载文章', 'error')
      navigate('/admin/articles')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!formData.title.trim()) {
      showToast('请输入标题', 'warning')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...formData,
        status,
        categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
        tagIds: formData.tagIds,
      }

      if (isEdit) {
        await articleApi.update(Number(id), payload)
        showToast('文章已更新', 'success')
      } else {
        const newArticle = await articleApi.create(payload)
        showToast('文章已创建', 'success')
        navigate(`/admin/articles/edit/${newArticle.id}`)
        return
      }
    } catch (error) {
      showToast('保存失败，请稍后重试', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleTagChange = (tagId: number) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }))
  }

  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
    <Box maxW="1200px" mx="auto">
      <Heading size="xl" mb={6}>
        {isEdit ? '编辑文章' : '新建文章'}
      </Heading>

      <VStack gap={6} align="stretch">
        <FormField label="标题">
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="输入文章标题"
            size="lg"
          />
        </FormField>

        <FormField label="Slug (URL 路径)">
          <Input
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="article-url-slug"
          />
        </FormField>

        <FormField label="摘要">
          <Textarea
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            placeholder="文章摘要（可选）"
            rows={2}
          />
        </FormField>

        <HStack gap={4} align="start">
          <Box flex={1}>
            <FormField label="分类">
              <NativeSelectRoot>
                <NativeSelectField
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  placeholder="选择分类"
                >
                  <option value="">选择分类</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
            </FormField>
          </Box>

          <Box flex={1}>
            <FormField label="标签">
              <Box>
                {tags.map((tag) => (
                  <Button
                    key={tag.id}
                    size="sm"
                    mr={2}
                    mb={2}
                    variant={formData.tagIds.includes(tag.id) ? 'solid' : 'outline'}
                    colorPalette={formData.tagIds.includes(tag.id) ? 'brand' : 'gray'}
                    onClick={() => handleTagChange(tag.id)}
                  >
                    {tag.name}
                  </Button>
                ))}
              </Box>
            </FormField>
          </Box>
        </HStack>

        <FormField label="内容 (Markdown)">
          <MarkdownEditor
            value={formData.content}
            onChange={(value) => setFormData({ ...formData, content: value })}
            height={500}
          />
        </FormField>

        <HStack justify="flex-end" gap={4}>
          <Button variant="outline" onClick={() => navigate(-1)}>
            取消
          </Button>
          <Button
            variant="outline"
            colorPalette="blue"
            onClick={() => handleSubmit('DRAFT')}
            loading={saving}
          >
            保存草稿
          </Button>
          <Button
            colorPalette="green"
            onClick={() => handleSubmit('PUBLISHED')}
            loading={saving}
          >
            发布
          </Button>
        </HStack>
      </VStack>
    </Box>
  )
}

export default ArticleEditor

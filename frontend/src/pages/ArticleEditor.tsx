import { useState, useEffect, useRef } from 'react'
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
  Icon,
  Card,
  Flex,
  Checkbox,
} from '@chakra-ui/react'
import { NativeSelectField, NativeSelectRoot } from '@chakra-ui/react/native-select'
import { FiPaperclip, FiTrash2 } from 'react-icons/fi'
import MarkdownEditor from '../components/MarkdownEditor'
import { articleApi, categoryApi, tagApi, attachmentApi } from '../api'
import { getTwitterAccount, syncArticleToTwitter, getSiteSettings } from '../api/admin'
import type { Attachment, TwitterAccount, SiteSettings } from '../types'
import { toast } from '../utils/notify'
import { useConfirm } from '../components/ConfirmDialog'

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

const ArticleEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const { confirm, ConfirmDialog } = useConfirm()

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

  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Twitter 同步相关状态
  const [twitterAccount, setTwitterAccount] = useState<TwitterAccount | null>(null)
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null)
  const [syncToTwitter, setSyncToTwitter] = useState(false)
  const [customTweetText, setCustomTweetText] = useState('')

  useEffect(() => {
    loadCategoriesAndTags()
    loadTwitterAndSettings()
    if (isEdit) {
      loadArticle()
    }
  }, [id])

  const loadTwitterAndSettings = async () => {
    try {
      const [account, settings] = await Promise.all([
        getTwitterAccount().catch(() => ({ connected: false })),
        getSiteSettings(),
      ])
      setTwitterAccount(account)
      setSiteSettings(settings)
      // 如果已连接 Twitter 且开启自动同步，默认勾选
      if (account.connected && settings.autoSyncToTwitter) {
        setSyncToTwitter(true)
      }
    } catch (error) {
      console.error('Failed to load Twitter/settings:', error)
    }
  }

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
      // 加载附件
      loadAttachments()
    } catch (error) {
      toast.error('加载失败：无法加载文章')
      navigate('/admin/articles')
    } finally {
      setLoading(false)
    }
  }

  const loadAttachments = async () => {
    if (!id) return
    try {
      const data = await attachmentApi.getByArticle(Number(id))
      setAttachments(data)
    } catch (error) {
      console.error('Failed to load attachments:', error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !id) return

    setUploading(true)
    try {
      const newAttachment = await attachmentApi.upload(Number(id), file)
      setAttachments(prev => [...prev, newAttachment])
      toast.success('附件上传成功')
    } catch (error) {
      toast.error('上传失败')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteAttachment = async (attachmentId: number) => {
    const confirmed = await confirm('确定删除此附件？', '删除附件')
    if (!confirmed) return
    
    try {
      await attachmentApi.delete(attachmentId)
      setAttachments(prev => prev.filter(a => a.id !== attachmentId))
      toast.success('附件已删除')
    } catch (error) {
      toast.error('删除失败')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleSubmit = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!formData.title.trim()) {
      toast.warning('请输入标题')
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

      let articleId = id ? Number(id) : null

      if (isEdit) {
        await articleApi.update(Number(id), payload)
        toast.success('文章已更新')
      } else {
        const newArticle = await articleApi.create(payload)
        articleId = newArticle.id
        toast.success('文章已创建')
      }

      // 如果发布且勾选同步到 Twitter
      if (status === 'PUBLISHED' && syncToTwitter && articleId) {
        try {
          const result = await syncArticleToTwitter(articleId, customTweetText || undefined)
          if (result.success) {
            toast.success('已同步到 X 平台')
          } else {
            toast.warning(`同步失败: ${result.errorMessage}`)
          }
        } catch (error) {
          console.error('Twitter sync failed:', error)
          toast.warning('同步到 X 平台失败')
        }
      }

      if (!isEdit && articleId) {
        navigate(`/admin/articles/edit/${articleId}`)
        return
      }
    } catch (error) {
      toast.error('保存失败，请稍后重试')
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

        {/* 附件上传区域 - 仅编辑模式显示 */}
        {isEdit && (
          <FormField label="附件">
            <VStack align="stretch" gap={3}>
              <HStack>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  accept=".pdf,.zip,.rar,.7z,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv,.jpg,.jpeg,.png,.gif,.webp,.svg"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  loading={uploading}
                >
                  <Icon as={FiPaperclip} mr={2} />
                  上传附件
                </Button>
                <Text fontSize="sm" color="gray.500">
                  支持 pdf, zip, doc, xls, ppt, txt 等格式，最大 20MB
                </Text>
              </HStack>

              {/* 附件列表 */}
              {attachments.length > 0 && (
                <Card.Root>
                  <Card.Body p={3}>
                    <VStack align="stretch" gap={2}>
                      {attachments.map((att) => (
                        <Flex key={att.id} align="center" justify="space-between" p={2} bg="gray.50" _dark={{ bg: 'gray.700' }} borderRadius="md">
                          <HStack gap={2}>
                            <Icon as={FiPaperclip} />
                            <Box>
                              <Text fontSize="sm" fontWeight="medium">{att.filename}</Text>
                              <Text fontSize="xs" color="gray.500">
                                {formatFileSize(att.fileSize)} · 下载 {att.downloadCount} 次
                              </Text>
                            </Box>
                          </HStack>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorPalette="red"
                            onClick={() => handleDeleteAttachment(att.id)}
                          >
                            <Icon as={FiTrash2} />
                          </Button>
                        </Flex>
                      ))}
                    </VStack>
                  </Card.Body>
                </Card.Root>
              )}
            </VStack>
          </FormField>
        )}

        {/* Twitter 同步选项 */}
        {twitterAccount?.connected && (
          <Card.Root>
            <Card.Body p={4}>
              <VStack align="stretch" gap={3}>
                <HStack>
                  <Checkbox
                    checked={syncToTwitter}
                    onCheckedChange={(e: { checked: boolean }) => setSyncToTwitter(e.checked)}
                  >
                    同步到 X (Twitter)
                  </Checkbox>
                  {siteSettings?.autoSyncToTwitter && (
                    <Text fontSize="xs" color="gray.500">(已启用自动同步)</Text>
                  )}
                </HStack>
                {syncToTwitter && (
                  <Box>
                    <Text fontSize="sm" mb={1} color="gray.500">自定义推文内容（留空使用默认模板）</Text>
                    <Textarea
                      value={customTweetText}
                      onChange={(e) => setCustomTweetText(e.target.value)}
                      placeholder={siteSettings?.twitterSyncFormat || '📝 新文章: {title} {url}'}
                      rows={2}
                    />
                    <Text fontSize="xs" color="gray.400" mt={1}>
                      可用变量: {'{title}'}, {'{url}'}, {'{summary}'} · 最多 280 字符
                    </Text>
                  </Box>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>
        )}

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
      
      <ConfirmDialog />
    </Box>
  )
}

export default ArticleEditor

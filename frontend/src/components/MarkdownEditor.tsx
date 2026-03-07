import { Box, Text, HStack, Icon, Progress } from '@chakra-ui/react'
import MDEditor from '@uiw/react-md-editor'
import { FiImage } from 'react-icons/fi'
import api from '../api/client'
import { useState, useRef, useCallback, useEffect } from 'react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  height?: number
  preview?: 'edit' | 'live' | 'preview'
}

const MarkdownEditor = ({
  value,
  onChange,
  height = 400,
  preview = 'live'
}: MarkdownEditorProps) => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    setUploadProgress(0)

    try {
      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(progress)
          }
        },
      })

      setUploadProgress(100)
      return response.data.url
    } finally {
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
      }, 500)
    }
  }

  const insertImageMarkdown = useCallback((url: string, filename: string) => {
    const imageMarkdown = `![${filename}](${url})`
    onChange(value + '\n' + imageMarkdown + '\n')
  }, [value, onChange])

  const processImageFile = async (file: File) => {
    try {
      const url = await handleImageUpload(file)
      insertImageMarkdown(url, file.name.replace(/\.[^/.]+$/, ''))
    } catch (err) {
      console.error('图片上传失败:', err)
      alert('图片上传失败，请重试')
    }
  }

  const handlePaste = useCallback((e: Event) => {
    const clipboardEvent = e as ClipboardEvent
    const items = clipboardEvent.clipboardData?.items
    if (!items) return

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) {
          processImageFile(file)
        }
        break
      }
    }
  }, [insertImageMarkdown])

  const handleDrop = useCallback((e: Event) => {
    const dragEvent = e as DragEvent
    const files = dragEvent.dataTransfer?.files
    if (!files || files.length === 0) return

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        e.preventDefault()
        processImageFile(file)
        break
      }
    }
  }, [insertImageMarkdown])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      processImageFile(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 绑定事件
  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('paste', handlePaste)
      container.addEventListener('drop', handleDrop)
      return () => {
        container.removeEventListener('paste', handlePaste)
        container.removeEventListener('drop', handleDrop)
      }
    }
  }, [handlePaste, handleDrop])

  return (
    <Box data-color-mode="light" ref={containerRef}>
      {/* 上传进度提示 */}
      {uploading && (
        <Box mb={2} p={3} bg="purple.50" borderRadius="md">
          <HStack mb={2}>
            <Icon as={FiImage} color="purple.500" />
            <Text fontSize="sm" color="purple.600">正在上传图片... {uploadProgress}%</Text>
          </HStack>
          <Progress.Root value={uploadProgress} size="sm" colorPalette="purple">
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </Box>
      )}

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        height={height}
        preview={preview}
        visibleDragbar={false}
      />

      {/* 操作提示 */}
      <Text fontSize="xs" color="gray.500" mt={2}>
        💡 支持直接粘贴图片、拖拽图片上传
      </Text>
    </Box>
  )
}

export default MarkdownEditor

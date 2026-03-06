import { Box } from '@chakra-ui/react'
import MDEditor from '@uiw/react-md-editor'
import api from '../api/client'

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
  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data.url
  }

  return (
    <Box data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        height={height}
        preview={preview}
        visibleDragbar={false}
        onPaste={async (e) => {
          const items = e.clipboardData?.items
          if (!items) return
          
          for (const item of items) {
            if (item.type.startsWith('image/')) {
              e.preventDefault()
              const file = item.getAsFile()
              if (file) {
                try {
                  const url = await handleImageUpload(file)
                  const imageMarkdown = `![${file.name}](${url})`
                  onChange(value + imageMarkdown)
                } catch (err) {
                  console.error('图片上传失败:', err)
                }
              }
              break
            }
          }
        }}
        onDrop={async (e) => {
          const files = e.dataTransfer?.files
          if (!files || files.length === 0) return
          
          for (const file of files) {
            if (file.type.startsWith('image/')) {
              e.preventDefault()
              try {
                const url = await handleImageUpload(file)
                const imageMarkdown = `![${file.name}](${url})`
                onChange(value + '\n' + imageMarkdown + '\n')
              } catch (err) {
                console.error('图片上传失败:', err)
              }
              break
            }
          }
        }}
      />
    </Box>
  )
}

export default MarkdownEditor

import { useEffect, useState, useRef } from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'

interface TocItem {
  id: string
  text: string
  level: number
}

interface ArticleTOCProps {
  content: string
  contentRef: React.RefObject<HTMLDivElement | null>
}

const ArticleTOC = ({ content, contentRef }: ArticleTOCProps) => {
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  // 解析 Markdown 标题
  useEffect(() => {
    const lines = content.split('\n')
    const items: TocItem[] = []
    
    lines.forEach((line) => {
      const h1Match = line.match(/^# (.+)/)
      const h2Match = line.match(/^## (.+)/)
      const h3Match = line.match(/^### (.+)/)
      const h4Match = line.match(/^#### (.+)/)
      
      if (h1Match) {
        const text = h1Match[1].trim()
        items.push({ id: slugify(text), text, level: 1 })
      } else if (h2Match) {
        const text = h2Match[1].trim()
        items.push({ id: slugify(text), text, level: 2 })
      } else if (h3Match) {
        const text = h3Match[1].trim()
        items.push({ id: slugify(text), text, level: 3 })
      } else if (h4Match) {
        const text = h4Match[1].trim()
        items.push({ id: slugify(text), text, level: 4 })
      }
    })
    
    setTocItems(items)
  }, [content])

  // 为渲染出的标题元素添加 id 以支持锚点
  useEffect(() => {
    if (!contentRef.current || tocItems.length === 0) return
    
    const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4')
    headings.forEach((heading) => {
      const text = heading.textContent?.trim() || ''
      const id = slugify(text)
      if (!heading.id) {
        heading.id = id
      }
    })
  }, [tocItems, contentRef])

  // IntersectionObserver 监听当前可见标题
  useEffect(() => {
    if (!contentRef.current || tocItems.length === 0) return

    observerRef.current?.disconnect()

    const options = {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0,
    }

    observerRef.current = new IntersectionObserver((entries) => {
      // 找到第一个可见的标题
      const visible = entries.filter(e => e.isIntersecting)
      if (visible.length > 0) {
        setActiveId(visible[0].target.id)
      }
    }, options)

    const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4')
    headings.forEach((heading) => {
      observerRef.current!.observe(heading)
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [tocItems, contentRef])

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const offset = 96
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
      setActiveId(id)
    }
  }

  if (tocItems.length === 0) return null

  return (
    <Box
      position="sticky"
      top="96px"
      w="220px"
      minW="220px"
      maxH="calc(100vh - 120px)"
      overflowY="auto"
      css={{
        '&::-webkit-scrollbar': { width: '3px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: 'var(--color-border-muted)', borderRadius: '2px' },
      }}
    >
      {/* "On this page" 标题 */}
      <Box mb={3} display="flex" alignItems="center" gap={2}>
        {/* 三横线图标 */}
        <Box display="flex" flexDirection="column" gap="3px">
          <Box w="14px" h="2px" bg="var(--color-fg-muted)" borderRadius="1px" />
          <Box w="10px" h="2px" bg="var(--color-fg-muted)" borderRadius="1px" />
          <Box w="12px" h="2px" bg="var(--color-fg-muted)" borderRadius="1px" />
        </Box>
        <Text
          fontSize="12px"
          fontWeight="600"
          color="var(--color-fg-muted)"
          letterSpacing="0.08em"
          textTransform="uppercase"
        >
          On this page
        </Text>
      </Box>

      <VStack align="stretch" gap={0}>
        {tocItems.map((item, index) => {
          const isActive = activeId === item.id
          const indent = (item.level - 1) * 10

          return (
            <Box
              key={`${item.id}-${index}`}
              pl={`${8 + indent}px`}
              pr={2}
              py="5px"
              cursor="pointer"
              onClick={() => scrollToHeading(item.id)}
              position="relative"
              transition="all 0.15s ease"
              _hover={{}}
            >
              {/* 左侧高亮条 */}
              {isActive && (
                <Box
                  position="absolute"
                  left={0}
                  top={0}
                  bottom={0}
                  w="2px"
                  bg="var(--color-brand-600)"
                  borderRadius="0 2px 2px 0"
                />
              )}
              <Text
                fontSize={item.level === 1 ? '13px' : '12px'}
                fontWeight={isActive ? '600' : item.level <= 2 ? '500' : '400'}
                color={
                  isActive
                    ? 'var(--color-brand-600)'
                    : item.level === 1
                    ? 'var(--color-fg-default)'
                    : 'var(--color-fg-muted)'
                }
                lineHeight="1.5"
                transition="color 0.15s ease"
                lineClamp={2}
                _hover={{
                  color: isActive ? 'var(--color-brand-600)' : 'var(--color-fg-default)',
                }}
              >
                {item.text}
              </Text>
            </Box>
          )
        })}
      </VStack>
    </Box>
  )
}

// 将标题文本转换为 slug id
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default ArticleTOC

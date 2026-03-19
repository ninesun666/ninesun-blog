/**
 * Bilibili 视频工具函数
 * 支持的输入格式：
 *   - BV 号：BV1xxxxx
 *   - AV 号：av123456
 *   - 完整链接：https://www.bilibili.com/video/BV1xxxxx
 *   - 短链接：https://b23.tv/xxxxx（需要解析，暂不支持）
 */

export interface BilibiliVideoInfo {
  type: 'bv' | 'av'
  id: string
  page?: number
}

/**
 * 从各种格式中解析 B 站视频 ID
 */
export function parseBilibiliId(input: string): BilibiliVideoInfo | null {
  const trimmed = input.trim()

  // 匹配完整链接：https://www.bilibili.com/video/BV1xxxxx 或带 ?p=N
  const urlBvMatch = trimmed.match(/bilibili\.com\/video\/(BV[\w]+)/i)
  if (urlBvMatch) {
    const pageMatch = trimmed.match(/[?&]p=(\d+)/)
    return {
      type: 'bv',
      id: urlBvMatch[1],
      page: pageMatch ? parseInt(pageMatch[1]) : 1,
    }
  }

  // 匹配完整链接中的 av 号
  const urlAvMatch = trimmed.match(/bilibili\.com\/video\/av(\d+)/i)
  if (urlAvMatch) {
    return { type: 'av', id: urlAvMatch[1], page: 1 }
  }

  // 直接是 BV 号
  const bvMatch = trimmed.match(/^(BV[\w]+)$/i)
  if (bvMatch) {
    return { type: 'bv', id: bvMatch[1], page: 1 }
  }

  // 直接是 av 号
  const avMatch = trimmed.match(/^av(\d+)$/i)
  if (avMatch) {
    return { type: 'av', id: avMatch[1], page: 1 }
  }

  return null
}

/**
 * 生成 Bilibili 嵌入播放器 URL
 */
export function getBilibiliEmbedUrl(info: BilibiliVideoInfo): string {
  const page = info.page || 1
  if (info.type === 'bv') {
    return `https://player.bilibili.com/player.html?bvid=${info.id}&page=${page}&high_quality=1&danmaku=0`
  } else {
    return `https://player.bilibili.com/player.html?aid=${info.id}&page=${page}&high_quality=1&danmaku=0`
  }
}

/**
 * 生成 Markdown 中的 Bilibili 嵌入代码

 * 使用自定义语法：::bilibili[BV1xxxxx]
 * 渲染时会被转换为 iframe
 */
export function generateBilibiliMarkdown(input: string): string | null {
  const info = parseBilibiliId(input)
  if (!info) return null

  const id = info.type === 'bv' ? info.id : `av${info.id}`
  const page = info.page && info.page > 1 ? `?p=${info.page}` : ''
  return `\n::bilibili[${id}${page}]\n`
}

/**
 * 预处理 Markdown 内容，将 ::bilibili[BVxxx] 转换为 iframe HTML
 * 在传给 ReactMarkdown 之前调用
 */
export function preprocessBilibiliEmbeds(markdown: string): string {
  return markdown.replace(
    /::bilibili\[([^\]]+)\]/g,
    (_, rawId) => {
      // 解析 ID 和分 P
      const pageMatch = rawId.match(/\?p=(\d+)$/)
      const page = pageMatch ? parseInt(pageMatch[1]) : 1
      const id = rawId.replace(/\?p=\d+$/, '').trim()

      let embedUrl: string
      if (id.toUpperCase().startsWith('BV')) {
        embedUrl = `https://player.bilibili.com/player.html?bvid=${id}&page=${page}&high_quality=1&danmaku=0`
      } else {
        const avId = id.replace(/^av/i, '')
        embedUrl = `https://player.bilibili.com/player.html?aid=${avId}&page=${page}&high_quality=1&danmaku=0`
      }

      return `<div class="bilibili-embed-wrapper"><iframe src="${embedUrl}" scrolling="no" frameborder="0" allowfullscreen="true" sandbox="allow-top-navigation allow-same-origin allow-forms allow-scripts allow-popups"></iframe></div>`
    }
  )
}

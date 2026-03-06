import { useState, useEffect } from 'react'
import { Button, HStack, Text, Spinner } from '@chakra-ui/react'
import { likeApi, type LikeDTO } from '../api'

interface LikeButtonProps {
  articleId: number
}

const LikeButton = ({ articleId }: LikeButtonProps) => {
  const [likeInfo, setLikeInfo] = useState<LikeDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    loadLikeInfo()
  }, [articleId])

  const loadLikeInfo = async () => {
    try {
      const data = await likeApi.getInfo(articleId)
      setLikeInfo(data)
    } catch (error) {
      console.error('Failed to load like info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async () => {
    setToggling(true)
    try {
      const data = await likeApi.toggle(articleId)
      setLikeInfo(data)
    } catch (error: any) {
      console.error('Failed to toggle like:', error)
      alert(error.response?.data?.message || '操作失败')
    } finally {
      setToggling(false)
    }
  }

  if (loading) {
    return <Spinner size="sm" />
  }

  return (
    <HStack gap={2}>
      <Button
        size="sm"
        variant={likeInfo?.liked ? 'solid' : 'outline'}
        colorPalette={likeInfo?.liked ? 'red' : 'gray'}
        onClick={handleToggle}
        loading={toggling}
      >
        {likeInfo?.liked ? '❤️' : '🤍'} {likeInfo?.liked ? '已赞' : '点赞'}
      </Button>
      <Text fontSize="sm" color="gray.600">
        {likeInfo?.count || 0} 人觉得有用
      </Text>
    </HStack>
  )
}

export default LikeButton

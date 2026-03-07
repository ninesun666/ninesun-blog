import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box, Card, Heading, Input,
  Textarea, Button, SimpleGrid, Switch, Flex, Spinner, Center, Text, VStack, Separator
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { getSiteSettings, updateSiteSettings, changePassword } from '../../api/admin'
import { useAuthStore } from '../../stores'
import type { SiteSettings } from '../../types'

const defaultSettings: SiteSettings = {
  siteName: '',
  siteDescription: '',
  siteKeywords: '',
  footerText: '',
  socialGithub: '',
  socialTwitter: '',
  socialEmail: '',
  allowGuestComment: true,
  requireCommentApproval: true,
}

export default function AdminSettings() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  
  // 修改密码状态
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: getSiteSettings,
  })

  useEffect(() => {
    if (data) {
      setSettings(data)
    }
  }, [data])

  const updateMutation = useMutation({
    mutationFn: updateSiteSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] })
    },
  })

  const passwordMutation = useMutation({
    mutationFn: () => changePassword(passwordForm.currentPassword, passwordForm.newPassword),
    onSuccess: () => {
      setPasswordSuccess('密码修改成功')
      setPasswordError('')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    },
    onError: (err: any) => {
      setPasswordError(err.response?.data?.message || '密码修改失败')
      setPasswordSuccess('')
    },
  })

  const handleSave = () => {
    updateMutation.mutate(settings)
  }

  const handleChange = (field: keyof SiteSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleChangePassword = () => {
    setPasswordError('')
    setPasswordSuccess('')

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError('请填写所有密码字段')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('新密码至少需要6个字符')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('两次输入的新密码不一致')
      return
    }

    passwordMutation.mutate()
  }

  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
    <Box>
      <Heading size="2xl" mb={6}>站点设置</Heading>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
        {/* 基本信息 */}
        <Card.Root>
          <Card.Body>
            <Heading size="lg" mb={4}>基本信息</Heading>
            <Box mb={4}>
              <Text fontSize="sm" mb={1} color="gray.500">站点名称</Text>
              <Input
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                placeholder="NineSun Blog"
              />
            </Box>
            <Box mb={4}>
              <Text fontSize="sm" mb={1} color="gray.500">站点描述</Text>
              <Textarea
                value={settings.siteDescription}
                onChange={(e) => handleChange('siteDescription', e.target.value)}
                placeholder="技术博客，分享编程与生活"
                rows={3}
              />
            </Box>
            <Box mb={4}>
              <Text fontSize="sm" mb={1} color="gray.500">SEO 关键词</Text>
              <Input
                value={settings.siteKeywords}
                onChange={(e) => handleChange('siteKeywords', e.target.value)}
                placeholder="技术, 编程, 博客"
              />
            </Box>
            <Box>
              <Text fontSize="sm" mb={1} color="gray.500">页脚文字</Text>
              <Textarea
                value={settings.footerText}
                onChange={(e) => handleChange('footerText', e.target.value)}
                placeholder="© 2026 NineSun Blog. All rights reserved."
                rows={2}
              />
            </Box>
          </Card.Body>
        </Card.Root>

        {/* 社交链接 */}
        <Card.Root>
          <Card.Body>
            <Heading size="lg" mb={4}>社交链接</Heading>
            <Box mb={4}>
              <Text fontSize="sm" mb={1} color="gray.500">GitHub</Text>
              <Input
                value={settings.socialGithub}
                onChange={(e) => handleChange('socialGithub', e.target.value)}
                placeholder="https://github.com/username"
              />
            </Box>
            <Box mb={4}>
              <Text fontSize="sm" mb={1} color="gray.500">Twitter</Text>
              <Input
                value={settings.socialTwitter}
                onChange={(e) => handleChange('socialTwitter', e.target.value)}
                placeholder="https://twitter.com/username"
              />
            </Box>
            <Box>
              <Text fontSize="sm" mb={1} color="gray.500">邮箱</Text>
              <Input
                value={settings.socialEmail}
                onChange={(e) => handleChange('socialEmail', e.target.value)}
                placeholder="admin@example.com"
              />
            </Box>
          </Card.Body>
        </Card.Root>

        {/* 功能设置 */}
        <Card.Root gridColumn={{ lg: 'span 2' }}>
          <Card.Body>
            <Heading size="lg" mb={4}>功能设置</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
              <Flex align="center" gap={3}>
                <Switch.Root
                  checked={settings.allowGuestComment}
                  onCheckedChange={(e: { checked: boolean }) => handleChange('allowGuestComment', e.checked)}
                >
                  <Switch.HiddenInput />
                  <Switch.Control />
                  <Switch.Label>允许游客评论</Switch.Label>
                </Switch.Root>
              </Flex>
              <Flex align="center" gap={3}>
                <Switch.Root
                  checked={settings.requireCommentApproval}
                  onCheckedChange={(e: { checked: boolean }) => handleChange('requireCommentApproval', e.checked)}
                >
                  <Switch.HiddenInput />
                  <Switch.Control />
                  <Switch.Label>评论需要审核</Switch.Label>
                </Switch.Root>
              </Flex>
            </SimpleGrid>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      <Flex justify="flex-end" mt={6}>
        <Button
          colorPalette="blue"
          onClick={handleSave}
          loading={updateMutation.isPending}
        >
          保存设置
        </Button>
      </Flex>

      {/* 修改密码 */}
      <Separator my={8} />
      
      <Card.Root maxW="md">
        <Card.Body>
          <Heading size="lg" mb={4}>修改密码</Heading>
          <Text fontSize="sm" color="gray.500" mb={4}>
            当前用户: {user?.username}
          </Text>
          <VStack gap={4}>
            <Box w="full">
              <Text fontSize="sm" mb={1} color="gray.500">当前密码</Text>
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="输入当前密码"
              />
            </Box>
            <Box w="full">
              <Text fontSize="sm" mb={1} color="gray.500">新密码</Text>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="至少6个字符"
              />
            </Box>
            <Box w="full">
              <Text fontSize="sm" mb={1} color="gray.500">确认新密码</Text>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="再次输入新密码"
              />
            </Box>
            {passwordError && (
              <Text color="red.500" fontSize="sm">{passwordError}</Text>
            )}
            {passwordSuccess && (
              <Text color="green.500" fontSize="sm">{passwordSuccess}</Text>
            )}
            <Button
              w="full"
              colorPalette="purple"
              onClick={handleChangePassword}
              loading={passwordMutation.isPending}
            >
              修改密码
            </Button>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  )
}
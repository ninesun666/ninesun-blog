import { useState, useEffect } from 'react'
import { useNavigate, Link as RouterLink, useSearchParams } from 'react-router-dom'
import {
  Box,
  Card,
  Heading,
  Input,
  Button,
  Text,
  VStack,
  HStack,
  Tabs,
  Separator,
} from '@chakra-ui/react'
import { authApi, type LoginRequest, type RegisterRequest } from '../api'
import { useAuthStore } from '../stores'
import api from '../api/client'

const Login = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setAuth } = useAuthStore()

  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [loginForm, setLoginForm] = useState<LoginRequest>({
    username: '',
    password: '',
  })

  const [registerForm, setRegisterForm] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    nickname: '',
  })

  // Handle GitHub OAuth callback
  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      handleGithubCallback(code)
    }
  }, [searchParams])

  const handleGithubCallback = async (code: string) => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get(`/oauth/github/callback?code=${code}`)
      setAuth(
        {
          id: response.data.id,
          username: response.data.username,
          email: response.data.email,
          nickname: response.data.nickname,
          avatar: response.data.avatar,
          role: response.data.role as 'USER' | 'ADMIN',
          createdAt: new Date().toISOString(),
        },
        response.data.token
      )
      navigate('/')
    } catch (err: any) {
      setError('GitHub 登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleGithubLogin = async () => {
    try {
      const response = await api.get('/oauth/github')
      window.location.href = response.data.url
    } catch (err) {
      setError('无法获取 GitHub 登录链接')
    }
  }

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      setError('请输入用户名和密码')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await authApi.login(loginForm)
      setAuth(
        {
          id: response.id,
          username: response.username,
          email: response.email,
          nickname: response.nickname,
          avatar: response.avatar,
          role: response.role as 'USER' | 'ADMIN',
          createdAt: new Date().toISOString(),
        },
        response.token
      )
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || '登录失败，请检查用户名和密码')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      setError('请填写所有必填字段')
      return
    }

    if (registerForm.password.length < 6) {
      setError('密码至少需要6个字符')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await authApi.register(registerForm)
      setAuth(
        {
          id: response.id,
          username: response.username,
          email: response.email,
          nickname: response.nickname,
          avatar: response.avatar,
          role: response.role as 'USER' | 'ADMIN',
          createdAt: new Date().toISOString(),
        },
        response.token
      )
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || '注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box maxW="md" mx="auto" mt={16}>
      <Card.Root>
        <Card.Body>
          <VStack gap={6}>
            <Heading size="xl" textAlign="center">
              Ninesun Blog
            </Heading>

            <Tabs.Root value={tab} onValueChange={(e) => setTab(e.value as 'login' | 'register')} w="full">
              <Tabs.List>
                <Tabs.Trigger value="login" w="50%">
                  登录
                </Tabs.Trigger>
                <Tabs.Trigger value="register" w="50%">
                  注册
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="login">
                <VStack gap={4} mt={4}>
                  <Box w="full">
                    <Text mb={2} fontWeight="medium">用户名 / 邮箱</Text>
                    <Input
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      placeholder="输入用户名或邮箱"
                    />
                  </Box>
                  <Box w="full">
                    <Text mb={2} fontWeight="medium">密码</Text>
                    <Input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="输入密码"
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                  </Box>
                  <Button
                    w="full"
                    colorPalette="brand"
                    onClick={handleLogin}
                    loading={loading}
                  >
                    登录
                  </Button>
                </VStack>
              </Tabs.Content>

              <Tabs.Content value="register">
                <VStack gap={4} mt={4}>
                  <Box w="full">
                    <Text mb={2} fontWeight="medium">用户名 *</Text>
                    <Input
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      placeholder="3-50个字符"
                    />
                  </Box>
                  <Box w="full">
                    <Text mb={2} fontWeight="medium">邮箱 *</Text>
                    <Input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </Box>
                  <Box w="full">
                    <Text mb={2} fontWeight="medium">密码 *</Text>
                    <Input
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      placeholder="至少6个字符"
                    />
                  </Box>
                  <Box w="full">
                    <Text mb={2} fontWeight="medium">昵称</Text>
                    <Input
                      value={registerForm.nickname}
                      onChange={(e) => setRegisterForm({ ...registerForm, nickname: e.target.value })}
                      placeholder="可选"
                    />
                  </Box>
                  <Button
                    w="full"
                    colorPalette="green"
                    onClick={handleRegister}
                    loading={loading}
                  >
                    注册
                  </Button>
                </VStack>
              </Tabs.Content>
            </Tabs.Root>

            {error && (
              <Text color="red.500" fontSize="sm">
                {error}
              </Text>
            )}

            <Separator />

            <VStack gap={3} w="full">
              <Text fontSize="sm" color="gray.500">第三方登录</Text>
              <Button
                w="full"
                variant="outline"
                onClick={handleGithubLogin}
                loading={loading}
              >
                <svg height="20" width="20" viewBox="0 0 16 16" version="1.1" style={{ marginRight: '8px' }}>
                  <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
                使用 GitHub 登录
              </Button>
            </VStack>

            <HStack justify="center" w="full">
              <Button variant="ghost" asChild>
                <RouterLink to="/">返回首页</RouterLink>
              </Button>
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  )
}

export default Login

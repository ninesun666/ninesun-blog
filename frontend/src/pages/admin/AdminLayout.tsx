import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Box, Flex, VStack, HStack, Text, Button, Container, Icon, Avatar } from '@chakra-ui/react'
import { useAuthStore } from '../../stores'
import { FiHome, FiFileText, FiMessageSquare, FiUsers, FiSettings, FiLogOut, FiBarChart2, FiFolder, FiTag } from 'react-icons/fi'

const navItems = [
  { to: '/admin', label: '仪表盘', icon: FiBarChart2, end: true },
  { to: '/admin/articles', label: '文章管理', icon: FiFileText },
  { to: '/admin/categories', label: '分类管理', icon: FiFolder },
  { to: '/admin/tags', label: '标签管理', icon: FiTag },
  { to: '/admin/comments', label: '评论审核', icon: FiMessageSquare },
  { to: '/admin/users', label: '用户管理', icon: FiUsers },
  { to: '/admin/settings', label: '站点设置', icon: FiSettings },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Flex minH="100vh">
      {/* Sidebar */}
      <Box
        w="240px"
        bg="gray.800"
        color="white"
        py={6}
        position="fixed"
        h="100vh"
        overflowY="auto"
      >
        <VStack align="stretch" gap={1}>
          {/* Logo */}
          <Box px={6} py={4} mb={4}>
            <Text fontSize="xl" fontWeight="bold">
              Admin Panel
            </Text>
            <Text fontSize="xs" color="gray.400" mt={1}>
              ninesun-blog-v2
            </Text>
          </Box>

          {/* Nav Items */}
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {({ isActive }) => (
                <Flex
                  align="center"
                  gap={3}
                  px={6}
                  py={3}
                  bg={isActive ? 'blue.500' : 'transparent'}
                  color={isActive ? 'white' : 'gray.300'}
                  _hover={{ bg: isActive ? 'blue.500' : 'gray.700' }}
                  transition="all 0.2s"
                  cursor="pointer"
                >
                  <Icon as={item.icon} />
                  <Text>{item.label}</Text>
                </Flex>
              )}
            </NavLink>
          ))}

          {/* Divider */}
          <Box px={6} py={4}>
            <Box borderTop="1px" borderColor="gray.600" />
          </Box>

          {/* Back to site */}
          <NavLink to="/">
            <Flex
              align="center"
              gap={3}
              px={6}
              py={3}
              color="gray.300"
              _hover={{ bg: 'gray.700' }}
              transition="all 0.2s"
              cursor="pointer"
            >
              <Icon as={FiHome} />
              <Text>返回前台</Text>
            </Flex>
          </NavLink>
        </VStack>
      </Box>

      {/* Main Content */}
      <Box ml="240px" flex={1} bg="gray.50">
        {/* Header */}
        <Box
          bg="white"
          px={6}
          py={4}
          borderBottom="1px"
          borderColor="gray.200"
          position="sticky"
          top={0}
          zIndex={10}
        >
          <Flex justify="space-between" align="center">
            <HStack gap={3}>
              <Avatar.Root size="sm">
                <Avatar.Fallback name={user?.nickname || user?.username} />
              </Avatar.Root>
              <Text fontWeight="medium">欢迎, {user?.nickname || user?.username}</Text>
            </HStack>
            <HStack gap={4}>
              <Text fontSize="sm" color="gray.500">
                {user?.role}
              </Text>
              <Button size="sm" variant="outline" onClick={handleLogout}>
                <Icon as={FiLogOut} mr={2} />
                退出登录
              </Button>
            </HStack>
          </Flex>
        </Box>

        {/* Page Content */}
        <Container maxW="container.xl" py={6}>
          <Outlet />
        </Container>
      </Box>
    </Flex>
  )
}
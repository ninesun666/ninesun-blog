import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Box, Flex, Heading, Link as ChakraLink, Container, HStack, Button, Text, Icon, MenuRoot, MenuTrigger, MenuContent, MenuItem, VStack, IconButton } from '@chakra-ui/react'
import { FiUser, FiLogOut, FiEdit3, FiHome, FiBookOpen, FiFolder, FiTag, FiMenu, FiX } from 'react-icons/fi'
import { useAuthStore } from '../stores'

const Layout = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  const handleNavClick = (path: string) => {
    navigate(path)
    setMobileMenuOpen(false)
  }

  const navItems = [
    { to: '/', label: '首页', icon: FiHome },
    { to: '/articles', label: '文章', icon: FiBookOpen },
    { to: '/category/all', label: '分类', icon: FiFolder },
    { to: '/tag/all', label: '标签', icon: FiTag },
  ]

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      {/* Header */}
      <Box 
        as="header" 
        bg="white"
        position="sticky" 
        top={0} 
        zIndex={100}
        boxShadow="0 1px 3px rgba(0, 0, 0, 0.08)"
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
          <Flex justify="space-between" align="center" py={4}>
            {/* Logo */}
            <HStack gap={3}>
              <Box
                w={10}
                h={10}
                borderRadius="xl"
                bg="linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontWeight="800"
                fontSize="lg"
                boxShadow="0 4px 12px rgba(124, 58, 237, 0.3)"
              >
                N
              </Box>
              <Heading 
                size="lg" 
                fontWeight="800"
                className="gradient-text"
                cursor="pointer"
                onClick={() => navigate('/')}
              >
                Ninesun Blog
              </Heading>
            </HStack>

            {/* Desktop Navigation */}
            <HStack gap={1} display={{ base: 'none', md: 'flex' }}>
              {navItems.map((item) => (
                <ChakraLink
                  key={item.to}
                  asChild
                  px={4}
                  py={2}
                  borderRadius="lg"
                  fontWeight="600"
                  fontSize="sm"
                  color="gray.600"
                  _hover={{ 
                    bg: 'purple.50', 
                    color: 'brand.600' 
                  }}
                  transition="all 0.2s"
                >
                  <Link to={item.to}>
                    <HStack gap={2}>
                      <Icon as={item.icon} boxSize={4} />
                      <Text>{item.label}</Text>
                    </HStack>
                  </Link>
                </ChakraLink>
              ))}
            </HStack>

            {/* Desktop Auth Section */}
            <HStack gap={3} display={{ base: 'none', md: 'flex' }}>
              {isAuthenticated ? (
                <>
                  {user?.role === 'ADMIN' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="purple"
                      fontWeight="600"
                      asChild
                    >
                      <Link to="/admin/articles/new">
                        <HStack gap={2}>
                          <Icon as={FiEdit3} />
                          <Text>写文章</Text>
                        </HStack>
                      </Link>
                    </Button>
                  )}
                  <MenuRoot>
                    <MenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="purple"
                        fontWeight="600"
                      >
                        <HStack gap={2}>
                          <Icon as={FiUser} />
                          <Text>{user?.nickname || user?.username}</Text>
                        </HStack>
                      </Button>
                    </MenuTrigger>
                    <MenuContent>
                      {user?.role === 'ADMIN' && (
                        <MenuItem asChild value="write">
                          <Link to="/admin/articles/new">
                            <HStack gap={2}>
                              <Icon as={FiEdit3} />
                              <Text>写文章</Text>
                            </HStack>
                          </Link>
                        </MenuItem>
                      )}
                      <MenuItem value="logout" onClick={handleLogout}>
                        <HStack gap={2}>
                          <Icon as={FiLogOut} />
                          <Text>退出登录</Text>
                        </HStack>
                      </MenuItem>
                    </MenuContent>
                  </MenuRoot>
                </>
              ) : (
                <Button 
                  size="sm" 
                  colorPalette="brand"
                  fontWeight="600"
                  borderRadius="lg"
                  asChild
                >
                  <Link to="/login">
                    <HStack gap={2}>
                      <Icon as={FiUser} />
                      <Text>登录</Text>
                    </HStack>
                  </Link>
                </Button>
              )}
            </HStack>

            {/* Mobile Menu Button */}
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              aria-label="菜单"
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Icon as={mobileMenuOpen ? FiX : FiMenu} boxSize={5} />
            </IconButton>
          </Flex>

          {/* Mobile Menu - Collapsible */}
          {mobileMenuOpen && (
            <Box py={4} borderTop="1px solid" borderColor="gray.100">
              <VStack align="stretch" gap={1}>
                {/* Navigation Links */}
                {navItems.map((item) => (
                  <Box
                    key={item.to}
                    as="button"
                    onClick={() => handleNavClick(item.to)}
                    w="100%"
                    textAlign="left"
                    px={4}
                    py={3}
                    borderRadius="lg"
                    fontWeight="600"
                    fontSize="md"
                    color="gray.700"
                    bg="transparent"
                    _hover={{ 
                      bg: 'purple.50', 
                      color: 'brand.600' 
                    }}
                    transition="all 0.2s"
                    cursor="pointer"
                  >
                    <HStack gap={3}>
                      <Icon as={item.icon} boxSize={5} />
                      <Text>{item.label}</Text>
                    </HStack>
                  </Box>
                ))}

                {/* Divider */}
                <Box h="1px" bg="gray.200" my={2} />

                {/* Auth Section */}
                {isAuthenticated ? (
                  <>
                    <Box px={4} py={2}>
                      <Text color="gray.500" fontSize="sm">当前用户</Text>
                      <Text fontWeight="600" color="gray.800">
                        {user?.nickname || user?.username}
                      </Text>
                    </Box>
                    {user?.role === 'ADMIN' && (
                      <Box
                        as="button"
                        onClick={() => handleNavClick('/admin/articles/new')}
                        w="100%"
                        textAlign="left"
                        px={4}
                        py={3}
                        borderRadius="lg"
                        fontWeight="600"
                        fontSize="md"
                        color="gray.700"
                        bg="transparent"
                        _hover={{ 
                          bg: 'purple.50', 
                          color: 'brand.600' 
                        }}
                        transition="all 0.2s"
                        cursor="pointer"
                      >
                        <HStack gap={3}>
                          <Icon as={FiEdit3} boxSize={5} />
                          <Text>写文章</Text>
                        </HStack>
                      </Box>
                    )}
                    <Box
                      as="button"
                      onClick={handleLogout}
                      w="100%"
                      textAlign="left"
                      px={4}
                      py={3}
                      borderRadius="lg"
                      fontWeight="600"
                      fontSize="md"
                      color="red.600"
                      bg="transparent"
                      _hover={{ bg: 'red.50' }}
                      transition="all 0.2s"
                      cursor="pointer"
                    >
                      <HStack gap={3}>
                        <Icon as={FiLogOut} boxSize={5} />
                        <Text>退出登录</Text>
                      </HStack>
                    </Box>
                  </>
                ) : (
                  <Button 
                    size="lg" 
                    colorPalette="brand"
                    fontWeight="600"
                    borderRadius="lg"
                    asChild
                    w="100%"
                    mt={2}
                  >
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <HStack gap={2}>
                        <Icon as={FiUser} />
                        <Text>登录</Text>
                      </HStack>
                    </Link>
                  </Button>
                )}
              </VStack>
            </Box>
          )}
        </Container>
      </Box>

      {/* Main Content */}
      <Box as="main" flex={1} py={8}>
        <Outlet />
      </Box>

      {/* Footer */}
      <Box 
        as="footer" 
        bg="gray.900"
        py={8}
        mt="auto"
      >
        <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
          <Flex 
            direction={{ base: 'column', md: 'row' }}
            justify="space-between" 
            align="center"
            gap={4}
          >
            <HStack gap={3}>
              <Box
                w={8}
                h={8}
                borderRadius="lg"
                bg="linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontWeight="800"
                fontSize="sm"
              >
                N
              </Box>
              <Text color="gray.400" fontWeight="500">
                Ninesun Blog
              </Text>
            </HStack>
            <Text color="gray.500" fontSize="sm">
              © {new Date().getFullYear()} All rights reserved. Made with ❤️
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  )
}

export default Layout

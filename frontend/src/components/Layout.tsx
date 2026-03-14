import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Box, Flex, Heading, Link as ChakraLink, Container, HStack, Button, Text, Icon, MenuRoot, MenuTrigger, MenuContent, MenuItem, VStack, IconButton } from '@chakra-ui/react'
import { FiUser, FiLogOut, FiEdit3, FiHome, FiBookOpen, FiFolder, FiTag, FiMenu, FiX, FiMoon, FiSun, FiGithub, FiMail, FiCalendar } from 'react-icons/fi'
import { useAuthStore } from '../stores'
import { useColorMode, useColorModeValue } from '../components/ui/color-mode'
import AIChat from './AIChat'
import { getPublicSiteSettings } from '../api/admin'
import type { SiteSettings } from '../types'

const Layout = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { colorMode, toggleColorMode } = useColorMode()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null)
  
  // 获取站点设置
  useEffect(() => {
    getPublicSiteSettings()
      .then(setSiteSettings)
      .catch(console.error)
  }, [])

  // 使用语义化颜色
  const bgColor = useColorModeValue('white', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const hoverBg = useColorModeValue('purple.50', 'purple.900')
  const hoverColor = useColorModeValue('brand.600', 'purple.300')
  const menuBg = useColorModeValue('white', 'gray.800')
  const menuBorderColor = useColorModeValue('gray.100', 'gray.700')
  const mobileTextColor = useColorModeValue('gray.700', 'gray.200')
  const mobileSubTextColor = useColorModeValue('gray.500', 'gray.400')
  const dividerColor = useColorModeValue('gray.200', 'gray.600')
  const pageBg = useColorModeValue('gray.50', 'gray.950')

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
    { to: '/todos', label: '待办', icon: FiCalendar },
    { to: '/category/all', label: '分类', icon: FiFolder },
    { to: '/tag/all', label: '标签', icon: FiTag },
  ]

  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg={pageBg}>
      {/* Header */}
      <Box 
        as="header" 
        bg={bgColor}
        position="sticky" 
        top={0} 
        zIndex={100}
        boxShadow="0 1px 3px rgba(0, 0, 0, 0.08)"
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        <Container maxW={{ base: "100%", md: "container.xl", "2xl": "1600px" }} px={{ base: 4, md: 6 }}>
          <Flex justify="space-between" align="center" py={4} gap={8}>
            {/* Logo */}
            <HStack gap={3} flexShrink={0}>
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

            {/* Desktop Right Section: Navigation + Actions */}
            <HStack gap={2} display={{ base: 'none', md: 'flex' }}>
              {/* Navigation */}
              {navItems.map((item) => (
                <ChakraLink
                  key={item.to}
                  asChild
                  px={4}
                  py={2}
                  borderRadius="lg"
                  fontWeight="600"
                  fontSize="sm"
                  color={textColor}
                  _hover={{ 
                    bg: hoverBg, 
                    color: hoverColor
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
              
              {/* Divider */}
              <Box w="1px" h={6} bg={borderColor} mx={2} />
              
              {/* Theme Toggle */}
              <IconButton
                aria-label={colorMode === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
                variant="ghost"
                size="sm"
                onClick={toggleColorMode}
                borderRadius="lg"
              >
                <Icon as={colorMode === 'light' ? FiMoon : FiSun} boxSize={4} />
              </IconButton>

              {/* Auth Section */}
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
                  px={5}
                  colorPalette="brand"
                  fontWeight="600"
                  borderRadius="full"
                  boxShadow="0 2px 8px rgba(124, 58, 237, 0.25)"
                  _hover={{
                    boxShadow: "0 4px 12px rgba(124, 58, 237, 0.35)",
                    transform: "translateY(-1px)"
                  }}
                  transition="all 0.2s"
                  asChild
                >
                  <Link to="/login">登录</Link>
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
            <Box py={4} borderTop="1px solid" borderColor={menuBorderColor} bg={menuBg}>
              <VStack align="stretch" gap={1}>
                {/* Theme Toggle */}
                <Box
                  as="button"
                  onClick={toggleColorMode}
                  w="100%"
                  textAlign="left"
                  px={4}
                  py={3}
                  borderRadius="lg"
                  fontWeight="600"
                  fontSize="md"
                  color={mobileTextColor}
                  bg="transparent"
                  _hover={{ 
                    bg: hoverBg, 
                    color: hoverColor
                  }}
                  transition="all 0.2s"
                  cursor="pointer"
                >
                  <HStack gap={3}>
                    <Icon as={colorMode === 'light' ? FiMoon : FiSun} boxSize={5} />
                    <Text>{colorMode === 'light' ? '暗色模式' : '亮色模式'}</Text>
                  </HStack>
                </Box>

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
                    color={mobileTextColor}
                    bg="transparent"
                    _hover={{ 
                      bg: hoverBg, 
                      color: hoverColor
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
                <Box h="1px" bg={dividerColor} my={2} />

                {/* Auth Section */}
                {isAuthenticated ? (
                  <>
                    <Box px={4} py={2}>
                      <Text color={mobileSubTextColor} fontSize="sm">当前用户</Text>
                      <Text fontWeight="600" color={mobileTextColor}>
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
                        color={mobileTextColor}
                        bg="transparent"
                        _hover={{ 
                          bg: hoverBg, 
                          color: hoverColor
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
                      color="red.500"
                      bg="transparent"
                      _hover={{ bg: useColorModeValue('red.50', 'red.900') }}
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
                    borderRadius="full"
                    boxShadow="0 2px 8px rgba(124, 58, 237, 0.25)"
                    _hover={{
                      boxShadow: "0 4px 12px rgba(124, 58, 237, 0.35)"
                    }}
                    asChild
                    w="100%"
                    mt={2}
                  >
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      登录
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
        bg={useColorModeValue('gray.900', 'gray.950')}
        py={8}
        mt="auto"
      >
        <Container maxW={{ base: "100%", md: "container.xl", "2xl": "1600px" }} px={{ base: 4, md: 6 }}>
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
                {siteSettings?.siteName || 'Ninesun Blog'}
              </Text>
            </HStack>
            
            {/* 社交链接 */}
            <HStack gap={4}>
              {siteSettings?.socialGithub && (
                <ChakraLink
                  href={siteSettings.socialGithub}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="gray.400"
                  _hover={{ color: 'purple.400' }}
                  transition="color 0.2s"
                >
                  <Icon as={FiGithub} boxSize={5} />
                </ChakraLink>
              )}
              {siteSettings?.socialEmail && (
                <ChakraLink
                  href={`mailto:${siteSettings.socialEmail}`}
                  color="gray.400"
                  _hover={{ color: 'purple.400' }}
                  transition="color 0.2s"
                >
                  <Icon as={FiMail} boxSize={5} />
                </ChakraLink>
              )}
            </HStack>
            
            <Text color="gray.500" fontSize="sm">
              {siteSettings?.footerText || `© ${new Date().getFullYear()} All rights reserved. Made with ❤️`}
            </Text>
          </Flex>
        </Container>
      </Box>

      {/* AI Chat Assistant */}
      <AIChat />
    </Box>
  )
}

export default Layout

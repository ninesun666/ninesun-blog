import { Box, Container, Grid, Heading, Stack, Text, Flex } from '@chakra-ui/react';

// Brand Colors
const brandColors = [
  { name: '50', value: '#faf5ff' },
  { name: '100', value: '#f3e8ff' },
  { name: '200', value: '#e9d5ff' },
  { name: '300', value: '#d8b4fe' },
  { name: '400', value: '#c084fc' },
  { name: '500', value: '#a855f7' },
  { name: '600', value: '#9333ea' },
  { name: '700', value: '#7c3aed' },
  { name: '800', value: '#6b21a8' },
  { name: '900', value: '#581c87' },
  { name: '950', value: '#3b0764' },
];

// Semantic Colors - Light
const semanticLightColors = [
  { name: 'bg-default', value: '#f8fafc', label: 'Background Default' },
  { name: 'bg-subtle', value: '#ffffff', label: 'Background Subtle' },
  { name: 'bg-muted', value: '#f1f5f9', label: 'Background Muted' },
  { name: 'fg-default', value: '#1a1a2e', label: 'Foreground Default' },
  { name: 'fg-muted', value: '#6b7280', label: 'Foreground Muted' },
  { name: 'border-default', value: '#e5e7eb', label: 'Border Default' },
];

// Semantic Colors - Dark
const semanticDarkColors = [
  { name: 'bg-default', value: '#0f0f1a', label: 'Background Default' },
  { name: 'bg-subtle', value: '#1a1a2e', label: 'Background Subtle' },
  { name: 'bg-muted', value: '#12121f', label: 'Background Muted' },
  { name: 'fg-default', value: '#e5e7eb', label: 'Foreground Default' },
  { name: 'fg-muted', value: '#9ca3af', label: 'Foreground Muted' },
  { name: 'border-default', value: '#2d2d44', label: 'Border Default' },
];

// Functional Colors
const functionalColors = [
  { name: 'Success', value: '#10b981', desc: '成功状态' },
  { name: 'Warning', value: '#f59e0b', desc: '警告状态' },
  { name: 'Error', value: '#ef4444', desc: '错误状态' },
  { name: 'Info', value: '#3b82f6', desc: '信息状态' },
];

// Font Sizes
const fontSizes = [
  { name: 'xs', size: '12px', label: '小号文字' },
  { name: 'sm', size: '13px', label: '默认辅助' },
  { name: 'md', size: '14px', label: '默认正文' },
  { name: 'lg', size: '16px', label: '大正文' },
  { name: 'xl', size: '18px', label: '小标题' },
  { name: '2xl', size: '20px', label: '标题' },
  { name: '3xl', size: '24px', label: '大标题' },
  { name: '4xl', size: '32px', label: '页面标题' },
];

// Spacing
const spacing = [
  { name: 'space-1', value: '4px', desc: '4px' },
  { name: 'space-2', value: '8px', desc: '8px' },
  { name: 'space-3', value: '12px', desc: '12px' },
  { name: 'space-4', value: '16px', desc: '16px' },
  { name: 'space-5', value: '20px', desc: '20px' },
  { name: 'space-6', value: '24px', desc: '24px' },
  { name: 'space-8', value: '32px', desc: '32px' },
];

// Border Radius
const borderRadius = [
  { name: 'xs', value: '4px', desc: '4px - Scrollbar' },
  { name: 'sm', value: '6px', desc: '6px - Badge' },
  { name: 'md', value: '8px', desc: '8px - 小按钮' },
  { name: 'lg', value: '10px', desc: '10px - 输入框' },
  { name: 'xl', value: '12px', desc: '12px - 按钮' },
  { name: '2xl', value: '16px', desc: '16px - 卡片/弹窗' },
];

// Shadows
const shadows = [
  { name: 'card', value: '0 2px 12px rgba(0,0,0,0.08)', desc: '卡片默认' },
  { name: 'card-hover', value: '0 8px 24px rgba(0,0,0,0.12)', desc: '卡片悬停' },
  { name: 'dialog', value: '0 8px 32px rgba(0,0,0,0.16)', desc: '弹窗' },
  { name: 'menu', value: '0 4px 16px rgba(0,0,0,0.12)', desc: '下拉菜单' },
];

// Helper to check if color is dark
const isDarkColor = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
};

const ColorSwatch = ({ name, value, label }: { name: string; value: string; label?: string }) => (
  <Box>
    <Box
      bg={value}
      w="full"
      h="80px"
      borderRadius="12px"
      border="1px solid"
      borderColor={value === '#ffffff' ? '#e5e7eb' : 'transparent'}
      mb={2}
      display="flex"
      alignItems="flex-end"
      p={2}
    >
      <Text
        fontSize="xs"
        fontFamily="mono"
        color={isDarkColor(value) ? 'white' : 'black'}
        fontWeight="medium"
      >
        {value}
      </Text>
    </Box>
    <Text fontSize="sm" fontWeight="semibold">
      {name}
    </Text>
    {label && (
      <Text fontSize="xs" color="gray.500">
        {label}
      </Text>
    )}
  </Box>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box mb={12}>
    <Heading as="h2" size="lg" mb={6} pb={2} borderBottom="2px" borderColor="brand.500">
      {title}
    </Heading>
    {children}
  </Box>
);

export default function DesignTokens() {
  return (
    <Container maxW="1200px" py={12}>
      <Stack gap={8}>
        {/* Header */}
        <Box textAlign="center" mb={8}>
          <Heading as="h1" size="2xl" mb={4} bgGradient="linear(to-r, brand.600, brand.400)" bgClip="text">
            Design Tokens
          </Heading>
          <Text fontSize="lg" color="gray.600">
            NineSun Blog 设计令牌系统 - v1.0.0
          </Text>
          <Text fontSize="sm" color="gray.500" mt={2}>
            基于 iOS Human Interface Guidelines + Brand Purple Theme
          </Text>
        </Box>

        {/* Brand Colors */}
        <Section title="🎨 Brand Colors - 品牌紫色系">
          <Grid templateColumns="repeat(auto-fill, minmax(100px, 1fr))" gap={4}>
            {brandColors.map((color) => (
              <ColorSwatch key={color.name} name={color.name} value={color.value} />
            ))}
          </Grid>
        </Section>

        {/* Functional Colors */}
        <Section title="⚡ Functional Colors - 功能色">
          <Grid templateColumns="repeat(4, 1fr)" gap={4}>
            {functionalColors.map((color) => (
              <Box key={color.name}>
                <Box
                  bg={color.value}
                  w="full"
                  h="100px"
                  borderRadius="16px"
                  mb={2}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text color="white" fontWeight="bold" fontSize="lg">
                    {color.name}
                  </Text>
                </Box>
                <Text fontSize="sm" fontWeight="semibold">
                  {color.name}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {color.value} - {color.desc}
                </Text>
              </Box>
            ))}
          </Grid>
        </Section>

        {/* Semantic Colors - Light Mode */}
        <Section title="☀️ Semantic Colors - Light Mode">
          <Grid templateColumns="repeat(3, 1fr)" gap={4}>
            {semanticLightColors.map((color) => (
              <ColorSwatch key={color.name} name={color.name} value={color.value} label={color.label} />
            ))}
          </Grid>
        </Section>

        {/* Semantic Colors - Dark Mode */}
        <Section title="🌙 Semantic Colors - Dark Mode">
          <Grid templateColumns="repeat(3, 1fr)" gap={4}>
            {semanticDarkColors.map((color) => (
              <ColorSwatch key={color.name} name={color.name} value={color.value} label={color.label} />
            ))}
          </Grid>
        </Section>

        {/* Typography */}
        <Section title="📝 Typography - 字体系统">
          <Stack gap={6}>
            <Box>
              <Text fontSize="sm" color="gray.500" mb={2}>
                Font Family
              </Text>
              <Box p={4} bg="gray.50" borderRadius="12px">
                <Text fontSize="md" fontFamily="heading">
                  Inter / -apple-system / sans-serif
                </Text>
              </Box>
            </Box>
            
            <Box>
              <Text fontSize="sm" color="gray.500" mb={4}>
                Font Sizes
              </Text>
              <Stack gap={4}>
                {fontSizes.map((font) => (
                  <Flex key={font.name} align="center" gap={4}>
                    <Text w="60px" fontSize="sm" color="gray.500" fontFamily="mono">
                      {font.name}
                    </Text>
                    <Text style={{ fontSize: font.size }}>
                      {font.label} ({font.size})
                    </Text>
                  </Flex>
                ))}
              </Stack>
            </Box>

            <Box>
              <Text fontSize="sm" color="gray.500" mb={4}>
                Font Weights
              </Text>
              <Flex gap={8} wrap="wrap">
                {[400, 500, 600, 700, 800].map((weight) => (
                  <Text key={weight} fontWeight={weight} fontSize="lg">
                    Weight {weight}
                  </Text>
                ))}
              </Flex>
            </Box>
          </Stack>
        </Section>

        {/* Spacing */}
        <Section title="📐 Spacing - 间距系统">
          <Stack gap={4}>
            {spacing.map((space) => (
              <Flex key={space.name} align="center" gap={4}>
                <Text w="100px" fontSize="sm" fontFamily="mono">
                  {space.name}
                </Text>
                <Box
                  h="40px"
                  bg="brand.500"
                  borderRadius="8px"
                  style={{ width: space.value }}
                />
                <Text fontSize="sm" color="gray.500">
                  {space.desc}
                </Text>
              </Flex>
            ))}
          </Stack>
        </Section>

        {/* Border Radius */}
        <Section title="⭕ Border Radius - 圆角系统">
          <Flex gap={6} wrap="wrap" align="flex-end">
            {borderRadius.map((radius) => (
              <Box key={radius.name} textAlign="center">
                <Box
                  w="80px"
                  h="80px"
                  bg="brand.500"
                  style={{ borderRadius: radius.value }}
                  mb={2}
                />
                <Text fontSize="sm" fontWeight="semibold">
                  {radius.name}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {radius.desc}
                </Text>
              </Box>
            ))}
          </Flex>
        </Section>

        {/* Shadows */}
        <Section title="🌑 Shadows - 阴影系统">
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            {shadows.map((shadow) => (
              <Box key={shadow.name}>
                <Box
                  h="100px"
                  bg="white"
                  borderRadius="16px"
                  style={{ boxShadow: shadow.value }}
                  mb={3}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="sm" color="gray.400">
                    Shadow Preview
                  </Text>
                </Box>
                <Text fontSize="sm" fontWeight="semibold">
                  {shadow.name}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {shadow.desc}
                </Text>
                <Text fontSize="xs" fontFamily="mono" color="gray.400" mt={1}>
                  {shadow.value}
                </Text>
              </Box>
            ))}
          </Grid>
        </Section>

        {/* Component Examples */}
        <Section title="🧩 Component Examples - 组件示例">
          <Grid templateColumns="repeat(2, 1fr)" gap={8}>
            {/* Buttons */}
            <Box p={6} bg="gray.50" borderRadius="16px">
              <Text fontSize="sm" fontWeight="semibold" mb={4} color="gray.500">
                Buttons
              </Text>
              <Flex gap={3} wrap="wrap">
                <Box
                  as="button"
                  px={6}
                  py={3}
                  bg="brand.700"
                  color="white"
                  borderRadius="12px"
                  fontWeight="semibold"
                  _hover={{ bg: 'brand.800' }}
                  transition="all 0.2s"
                >
                  Primary
                </Box>
                <Box
                  as="button"
                  px={6}
                  py={3}
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="12px"
                  fontWeight="semibold"
                  _hover={{ bg: 'gray.50' }}
                  transition="all 0.2s"
                >
                  Secondary
                </Box>
                <Box
                  as="button"
                  px={4}
                  py={2}
                  bg="brand.700"
                  color="white"
                  borderRadius="8px"
                  fontSize="13px"
                  fontWeight="semibold"
                >
                  Small
                </Box>
              </Flex>
            </Box>

            {/* Cards */}
            <Box p={6} bg="gray.50" borderRadius="16px">
              <Text fontSize="sm" fontWeight="semibold" mb={4} color="gray.500">
                Cards
              </Text>
              <Box
                bg="white"
                p={5}
                borderRadius="16px"
                boxShadow="0 2px 12px rgba(0,0,0,0.08)"
                _hover={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)', transform: 'translateY(-4px)' }}
                transition="all 0.3s"
              >
                <Text fontWeight="semibold" mb={2}>
                  Card Title
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Card content with shadow and hover effect
                </Text>
              </Box>
            </Box>

            {/* Badges */}
            <Box p={6} bg="gray.50" borderRadius="16px">
              <Text fontSize="sm" fontWeight="semibold" mb={4} color="gray.500">
                Badges
              </Text>
              <Flex gap={2} wrap="wrap">
                {[
                  { bg: 'brand.100', color: 'brand.800', label: 'Primary' },
                  { bg: 'green.100', color: 'green.800', label: 'Success' },
                  { bg: 'yellow.100', color: 'yellow.800', label: 'Warning' },
                  { bg: 'red.100', color: 'red.800', label: 'Error' },
                ].map((badge) => (
                  <Box
                    key={badge.label}
                    px={3}
                    py={1}
                    bg={badge.bg}
                    color={badge.color}
                    borderRadius="6px"
                    fontSize="12px"
                    fontWeight="semibold"
                  >
                    {badge.label}
                  </Box>
                ))}
              </Flex>
            </Box>

            {/* Inputs */}
            <Box p={6} bg="gray.50" borderRadius="16px">
              <Text fontSize="sm" fontWeight="semibold" mb={4} color="gray.500">
                Inputs
              </Text>
              <Stack gap={3}>
                <Box
                  as="input"
                  w="full"
                  px={4}
                  py={3}
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="10px"
                  {...{ placeholder: 'Default input' }}
                  _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.1)' }}
                  outline="none"
                  transition="all 0.2s"
                />
                <Box
                  as="input"
                  w="full"
                  px={4}
                  py={3}
                  border="2px solid"
                  borderColor="brand.500"
                  borderRadius="10px"
                  {...{ placeholder: 'Focused input' }}
                  outline="none"
                />
              </Stack>
            </Box>
          </Grid>
        </Section>

        {/* Footer */}
        <Box textAlign="center" pt={8} borderTop="1px" borderColor="gray.200">
          <Text fontSize="sm" color="gray.500">
            NineSun Blog Design System v1.0.0 | Last updated: 2026-03-19
          </Text>
        </Box>
      </Stack>
    </Container>
  );
}

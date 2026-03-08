import { useQuery } from '@tanstack/react-query'
import { Box, SimpleGrid, Card, Heading, Text, Flex, Icon, Spinner, Center, VStack, HStack, Badge, Table } from '@chakra-ui/react'
import { useColorModeValue } from '../../components/ui/color-mode'
import { FiEye, FiUsers, FiGlobe, FiTrendingUp, FiMapPin, FiClock, FiCalendar } from 'react-icons/fi'
import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { getVisitStats, getVisitCountries, getVisitMapData, getRecentVisits } from '../../api/admin'

// 访问统计卡片
function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  const iconBg = useColorModeValue(`${color}.100`, `${color}.900`)
  const iconColor = useColorModeValue(`${color}.500`, `${color}.300`)
  const labelColor = useColorModeValue('gray.500', 'gray.400')

  return (
    <Card.Root borderRadius="xl" shadow="card">
      <Card.Body p={5}>
        <Flex justify="space-between" align="center">
          <Box>
            <Text color={labelColor} fontSize="sm" mb={1}>{label}</Text>
            <Text fontSize="2xl" fontWeight="bold">{value.toLocaleString()}</Text>
          </Box>
          <Box p={3} borderRadius="xl" bg={iconBg}>
            <Icon as={icon} boxSize={6} color={iconColor} />
          </Box>
        </Flex>
      </Card.Body>
    </Card.Root>
  )
}

// 世界地图组件
function WorldMap({ data }: { data: any[] }) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [chart, setChart] = useState<echarts.ECharts | null>(null)

  useEffect(() => {
    if (chartRef.current && !chart) {
      const instance = echarts.init(chartRef.current)
      setChart(instance)
    }
    return () => {
      chart?.dispose()
    }
  }, [])

  useEffect(() => {
    if (chart && data.length > 0) {
      // 加载世界地图
      fetch('https://cdn.jsdelivr.net/npm/echarts@5/map/json/world.json')
        .then(res => res.json())
        .then(mapJson => {
          echarts.registerMap('world', mapJson)
          
          chart.setOption({
            backgroundColor: 'transparent',
            tooltip: {
              trigger: 'item',
              formatter: (params: any) => {
                if (params.data) {
                  return `${params.data.name}<br/>访问量: ${params.data.value.toLocaleString()}`
                }
                return params.name
              }
            },
            visualMap: {
              min: 0,
              max: Math.max(...data.map(d => d.value), 100),
              left: 'left',
              top: 'bottom',
              text: ['高', '低'],
              calculable: true,
              inRange: {
                color: ['#e0e7ff', '#818cf8', '#4f46e5', '#3730a3']
              }
            },
            series: [{
              name: '访问量',
              type: 'map',
              map: 'world',
              roam: true,
              scaleLimit: { min: 1, max: 8 },
              itemStyle: {
                areaColor: '#f1f5f9',
                borderColor: '#cbd5e1'
              },
              emphasis: {
                itemStyle: {
                  areaColor: '#c7d2fe'
                }
              },
              data: data.map((d: any) => ({
                name: d.name,
                value: d.value,
                countryCode: d.countryCode
              }))
            }]
          })
        })
    }
  }, [chart, data])

  // 响应式调整
  useEffect(() => {
    const handleResize = () => chart?.resize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [chart])

  return <Box ref={chartRef} h="500px" w="100%" />
}

// 最近访问表格
function RecentVisitsTable({ visits }: { visits: any[] }) {
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.400')

  if (visits.length === 0) {
    return <Text color={textColor} textAlign="center" py={4}>暂无访问记录</Text>
  }

  return (
    <Box overflowX="auto">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>IP地址</Table.ColumnHeader>
            <Table.ColumnHeader>位置</Table.ColumnHeader>
            <Table.ColumnHeader>路径</Table.ColumnHeader>
            <Table.ColumnHeader>时间</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {visits.slice(0, 20).map((visit, index) => (
            <Table.Row key={index} _hover={{ bg: hoverBg }}>
              <Table.Cell fontFamily="mono" fontSize="sm">{visit.ipAddress}</Table.Cell>
              <Table.Cell>
                <HStack gap={1}>
                  <Icon as={FiMapPin} boxSize={3} />
                  <Text fontSize="sm">{visit.country} {visit.city !== '-' ? visit.city : ''}</Text>
                </HStack>
              </Table.Cell>
              <Table.Cell fontSize="sm" truncate maxW="200px">{visit.path}</Table.Cell>
              <Table.Cell fontSize="sm" color={textColor}>
                {new Date(visit.createdAt).toLocaleString('zh-CN')}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  )
}

// 国家排行
function CountryRanking({ countries }: { countries: any[] }) {
  const textColor = useColorModeValue('gray.500', 'gray.400')
  const barBg = useColorModeValue('purple.100', 'purple.900')
  const barColor = useColorModeValue('purple.500', 'purple.300')

  const maxCount = Math.max(...countries.map(c => c.count), 1)

  return (
    <VStack align="stretch" gap={2}>
      {countries.slice(0, 10).map((country, index) => (
        <Box key={country.countryCode}>
          <Flex justify="space-between" mb={1}>
            <HStack gap={2}>
              <Badge colorPalette="purple" variant="outline">{index + 1}</Badge>
              <Text fontSize="sm" fontWeight="medium">{country.country}</Text>
            </HStack>
            <Text fontSize="sm" color={textColor}>{country.count.toLocaleString()}</Text>
          </Flex>
          <Box h="6px" bg={barBg} borderRadius="full" overflow="hidden">
            <Box h="100%" w={`${(country.count / maxCount) * 100}%`} bg={barColor} borderRadius="full" />
          </Box>
        </Box>
      ))}
    </VStack>
  )
}

export default function AdminVisits() {
  const textColor = useColorModeValue('gray.500', 'gray.400')

  // 获取统计数据
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['visit-stats'],
    queryFn: getVisitStats
  })

  // 获取地图数据
  const { data: mapData = [] } = useQuery({
    queryKey: ['visit-map'],
    queryFn: getVisitMapData
  })

  // 获取国家统计
  const { data: countries = [] } = useQuery({
    queryKey: ['visit-countries'],
    queryFn: getVisitCountries
  })

  // 获取最近访问
  const { data: recentVisits = [] } = useQuery({
    queryKey: ['visit-recent'],
    queryFn: getRecentVisits
  })

  if (statsLoading) {
    return (
      <Center py={10}>
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
    <Box>
      <Heading size="2xl" mb={6}>访问统计</Heading>

      {/* 统计卡片 */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 6 }} gap={4} mb={8}>
        <StatCard label="总访问量" value={stats?.totalVisits || 0} icon={FiEye} color="blue" />
        <StatCard label="今日访问" value={stats?.todayVisits || 0} icon={FiTrendingUp} color="green" />
        <StatCard label="本周访问" value={stats?.weekVisits || 0} icon={FiClock} color="orange" />
        <StatCard label="本月访问" value={stats?.monthVisits || 0} icon={FiCalendar} color="pink" />
        <StatCard label="独立访客" value={stats?.uniqueVisitors || 0} icon={FiUsers} color="purple" />
        <StatCard label="今日独立访客" value={stats?.todayUniqueVisitors || 0} icon={FiGlobe} color="cyan" />
      </SimpleGrid>

      {/* 世界地图 + 国家排行 */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6} mb={8}>
        <Card.Root borderRadius="xl" shadow="card" gridColumn={{ lg: 'span 2' }}>
          <Card.Body p={5}>
            <Heading size="lg" mb={4}>访问分布</Heading>
            <WorldMap data={mapData} />
          </Card.Body>
        </Card.Root>
        
        <Card.Root borderRadius="xl" shadow="card">
          <Card.Body p={5}>
            <Heading size="lg" mb={4}>国家/地区排行</Heading>
            {countries.length > 0 ? (
              <CountryRanking countries={countries} />
            ) : (
              <Text color={textColor} textAlign="center" py={4}>暂无数据</Text>
            )}
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      {/* 最近访问 */}
      <Card.Root borderRadius="xl" shadow="card">
        <Card.Body p={5}>
          <Heading size="lg" mb={4}>最近访问</Heading>
          <RecentVisitsTable visits={recentVisits} />
        </Card.Body>
      </Card.Root>
    </Box>
  )
}

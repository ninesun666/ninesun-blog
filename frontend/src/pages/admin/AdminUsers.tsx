import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box, Table, Badge, Button, HStack,
  Card, Heading, Text, IconButton,
  Spinner, Center, Dialog
} from '@chakra-ui/react'
import { useState } from 'react'
import { FiTrash2, FiShield } from 'react-icons/fi'
import { getAllUsers, updateUserRole, deleteUser } from '../../api/admin'
import type { User } from '../../types'

export default function AdminUsers() {
  const queryClient = useQueryClient()
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: getAllUsers,
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: 'USER' | 'ADMIN' }) =>
      updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setDeleteOpen(false)
      setUserToDelete(null)
    },
  })

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setDeleteOpen(true)
  }

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id)
    }
  }

  const handleRoleChange = (userId: number, newRole: 'USER' | 'ADMIN') => {
    updateRoleMutation.mutate({ id: userId, role: newRole })
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
      <Heading size="2xl" mb={6}>用户管理</Heading>

      {/* Stats */}
      <HStack gap={4} mb={6}>
        <Card.Root w="200px">
          <Card.Body py={4}>
            <Text color="gray.500" fontSize="sm">总用户数</Text>
            <Text fontSize="2xl" fontWeight="bold">{users?.length || 0}</Text>
          </Card.Body>
        </Card.Root>
        <Card.Root w="200px">
          <Card.Body py={4}>
            <Text color="gray.500" fontSize="sm">管理员数</Text>
            <Text fontSize="2xl" fontWeight="bold" color="red.500">
              {users?.filter(u => u.role === 'ADMIN').length || 0}
            </Text>
          </Card.Body>
        </Card.Root>
      </HStack>

      {/* Table */}
      <Card.Root>
        <Card.Body overflowX="auto">
          {users?.length === 0 ? (
            <Center py={10}>
              <Text color="gray.500">暂无用户</Text>
            </Center>
          ) : (
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>用户名</Table.ColumnHeader>
                  <Table.ColumnHeader>昵称</Table.ColumnHeader>
                  <Table.ColumnHeader>邮箱</Table.ColumnHeader>
                  <Table.ColumnHeader>角色</Table.ColumnHeader>
                  <Table.ColumnHeader>状态</Table.ColumnHeader>
                  <Table.ColumnHeader>注册时间</Table.ColumnHeader>
                  <Table.ColumnHeader>操作</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {users?.map((user: User) => (
                  <Table.Row key={user.id}>
                    <Table.Cell>
                      <HStack>
                        <Text fontWeight="medium">{user.username}</Text>
                        {user.role === 'ADMIN' && (
                          <FiShield color="red" />
                        )}
                      </HStack>
                    </Table.Cell>
                    <Table.Cell>{user.nickname || '-'}</Table.Cell>
                    <Table.Cell>{user.email}</Table.Cell>
                    <Table.Cell>
                      <Box w="120px">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as 'USER' | 'ADMIN')}
                          style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                        >
                          <option value="USER">用户</option>
                          <option value="ADMIN">管理员</option>
                        </select>
                      </Box>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={user.enabled !== false ? 'green' : 'gray'}>
                        {user.enabled !== false ? '正常' : '禁用'}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize="sm" color="gray.500">
                        {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <HStack gap={2}>
                        <IconButton
                          aria-label="Delete"
                          size="sm"
                          colorPalette="red"
                          variant="ghost"
                          onClick={() => handleDeleteClick(user)}
                          disabled={user.role === 'ADMIN'}
                        >
                          <FiTrash2 />
                        </IconButton>
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          )}
        </Card.Body>
      </Card.Root>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={deleteOpen} onOpenChange={(e) => setDeleteOpen(e.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>删除用户</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              确定要删除用户 <strong>{userToDelete?.username}</strong> 吗？此操作不可撤销。
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                取消
              </Button>
              <Button
                colorPalette="red"
                onClick={handleConfirmDelete}
                loading={deleteMutation.isPending}
              >
                删除
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  )
}
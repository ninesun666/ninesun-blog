import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import Layout from './components/Layout'
import Home from './pages/Home'
import ArticleList from './pages/ArticleList'
import ArticleDetail from './pages/ArticleDetail'
import CategoryPage from './pages/CategoryPage'
import TagPage from './pages/TagPage'
import ArticleEditor from './pages/ArticleEditor'
import Login from './pages/Login'
import {
  AdminLayout,
  AdminDashboard,
  AdminArticles,
  AdminCategories,
  AdminTags,
  AdminComments,
  AdminUsers,
  AdminSettings
} from './pages/admin'
import { useAuthStore } from './stores'

// 管理员路由保护组件
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <Box minH="100vh">
      <Routes>
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="articles" element={<AdminArticles />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="tags" element={<AdminTags />} />
          <Route path="comments" element={<AdminComments />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Frontend Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="articles" element={<ArticleList />} />
          <Route path="article/:slug" element={<ArticleDetail />} />
          <Route path="category/:slug" element={<CategoryPage />} />
          <Route path="tag/:slug" element={<TagPage />} />
          <Route path="login" element={<Login />} />
        </Route>

        {/* Article Editor (standalone) */}
        <Route
          path="/admin/articles/new"
          element={
            <AdminRoute>
              <ArticleEditor />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/articles/edit/:id"
          element={
            <AdminRoute>
              <ArticleEditor />
            </AdminRoute>
          }
        />
      </Routes>
    </Box>
  )
}

export default App

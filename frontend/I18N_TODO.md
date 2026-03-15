# i18n 国际化待办事项

## 已完成

- [x] 安装 i18n 依赖 (react-i18next, i18next-browser-languagedetector)
- [x] 创建 i18n 配置文件 `src/i18n/index.ts`
- [x] 创建翻译文件 `src/i18n/locales/zh.json` 和 `en.json`
- [x] 在 `main.tsx` 初始化 i18n
- [x] 创建 `LanguageSwitcher.tsx` 语言切换组件
- [x] 替换 `Layout.tsx` 导航文本

## 待替换页面

### 前台页面

- [ ] `src/pages/Home.tsx` - 首页
  - Hero 区域文本
  - 最新文章标题
  - 分类/标签区域
  
- [ ] `src/pages/Login.tsx` - 登录注册页
  - Tab 标签
  - 表单标签
  - 错误提示
  
- [ ] `src/pages/ArticleDetail.tsx` - 文章详情
  - 附件下载区域
  
- [ ] `src/pages/ArticleEditor.tsx` - 文章编辑
  - 表单标签
  - 按钮文本
  - Toast 提示
  
- [ ] `src/pages/Todos.tsx` - 待办页面
  - 标题和按钮
  - 时间槽选项
  
- [ ] `src/pages/CategoryPage.tsx` - 分类页面
- [ ] `src/pages/TagPage.tsx` - 标签页面

### 组件

- [ ] `src/components/CommentSection.tsx` - 评论组件
- [ ] `src/components/AIChat.tsx` - AI 聊天组件
- [ ] `src/components/LikeButton.tsx` - 点赞按钮
- [ ] `src/components/TodoCalendar.tsx` - 日历组件
- [ ] `src/components/ConfirmDialog.tsx` - 确认对话框
- [ ] `src/components/ArticleSidebar.tsx` - 文章侧边栏

### 管理后台

- [ ] `src/pages/admin/AdminLayout.tsx` - 后台布局
- [ ] `src/pages/admin/AdminDashboard.tsx` - 仪表盘
- [ ] `src/pages/admin/AdminArticles.tsx` - 文章管理
- [ ] `src/pages/admin/AdminCategories.tsx` - 分类管理
- [ ] `src/pages/admin/AdminTags.tsx` - 标签管理
- [ ] `src/pages/admin/AdminComments.tsx` - 评论管理
- [ ] `src/pages/admin/AdminUsers.tsx` - 用户管理
- [ ] `src/pages/admin/AdminSettings.tsx` - 站点设置
- [ ] `src/pages/admin/AdminVisits.tsx` - 访问统计
- [ ] `src/pages/admin/AdminTodos.tsx` - 待办管理

## 日期格式化

需要处理动态日期格式化：

```tsx
// 当前
new Date(date).toLocaleDateString('zh-CN')

// 改为
new Date(date).toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US')
```

## 使用方式

```tsx
import { useTranslation } from 'react-i18next'

const MyComponent = () => {
  const { t, i18n } = useTranslation()
  
  return (
    <>
      <Text>{t('nav.home')}</Text>
      <Text>{t('home.welcome')}</Text>
      <Text>{new Date().toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US')}</Text>
    </>
  )
}
```

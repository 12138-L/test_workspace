# TeamFlow Manager - 架构设计文档

---

## 🏛️ 真实项目架构

### 1.1 当前架构分层图

```
┌─────────────────────────────────────────────────────────────────────┐
│                        视图层 (Vue 3 + Naive UI)                     │
│                                                                     │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┬────────┐  │
│  │ Login    │ Dashboard│ Projects │  Tasks   │   Team   │ Calendar│  │
│  │   登录页  │  仪表板   │  项目管理  │  任务管理  │  团队管理  │  日历页   │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┴────────┘  │
│  ┌──────────┐                                                        │
│  │ Settings │                                                        │
│  │  设置页   │                                                        │
│  └──────────┘                                                        │
├─────────────────────────────────────────────────────────────────────┤
│                        路由层 (Vue Router 4)                         │
│                                                                     │
│               - 导航守卫（认证检查）                                 │
│               - 懒加载（待优化）                                      │
│               - 页面过渡动画                                         │
├─────────────────────────────────────────────────────────────────────┤
│                        状态层 (Pinia Stores)                        │
│                                                                     │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐     │
│  │    user      │     app      │    tasks     │   projects   │     │
│  │  用户状态    │  应用配置    │  任务状态    │  项目状态    │     │
│  └──────────────┴──────────────┴──────────────┴──────────────┘     │
│                              │                                       │
│                    ┌─────────▼──────────┐                            │
│                    │ pinia-plugin-      │  - 白名单持久化            │
│                    │ persistedstate     │  - localStorage 存储       │
│                    └────────────────────┘                            │
├─────────────────────────────────────────────────────────────────────┤
│                        工具层 (Utils)                               │
│                                                                     │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐     │
│  │   naive.ts   │   格式化工具  │   常量定义   │   类型定义   │     │
│  │  消息提示封装 │              │              │              │     │
│  └──────────────┴──────────────┴──────────────┴──────────────┘     │
├─────────────────────────────────────────────────────────────────────┤
│                        样式层 (Tailwind CSS)                        │
│                                                                     │
│                      - Naive UI 主题定制                            │
│                      - 原子化工具类                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 核心技术栈

### 2.1 前端框架与构建

| 技术 | 选型 | 版本 | 说明 |
|------|------|------|------|
| **核心框架** | Vue 3 | 3.4.x | Composition API + `<script setup>` |
| **构建工具** | Vite | 5.x | 极速开发体验 |
| **类型系统** | TypeScript | 5.x | 完整类型覆盖 |
| **语言特性** | unplugin-auto-import | 0.17.x | Vue/refs 等自动导入 |

### 2.2 UI 组件库

> **⚠️ 注意：与设计文档不同，实际使用 Naive UI**

| 技术 | 选型 | 说明 |
|------|------|------|
| **UI 框架** | Naive UI | 2.38.x | Vue 3 生态，主题一致性好 |
| **自动导入** | unplugin-vue-components | 0.25.x | NaiveUiResolver 按需解析 |
| **样式系统** | Tailwind CSS | 3.x | 原子化样式与组件结合 |

### 2.3 状态管理与路由

| 技术 | 选型 | 说明 |
|------|------|------|
| **状态管理** | Pinia | 2.x | Vue 3 官方推荐 |
| **持久化** | pinia-plugin-persistedstate | 3.x | localStorage 同步 |
| **路由** | Vue Router | 4.x | 路径导航与守卫 |

### 2.4 工具与质量保证

| 技术 | 选型 | 说明 |
|------|------|------|
| **代码规范** | ESLint + Prettier | Standard 规范 |
| **Git Hooks** | simple-git-hooks | 提交前检查 |
| **工具库** | @vueuse/core | 10.x | 常用组合式工具 |

---

## 📁 真实目录结构

```
src/
├── layouts/              # 布局组件
│   └── Layout.vue        # 主布局：顶部导航 + 侧边栏 + 内容区
│
├── router/
│   └── index.ts          # 路由配置与导航守卫
│
├── stores/               # Pinia 状态模块
│   ├── index.ts          # Store 统一导出
│   ├── user.ts           # 用户认证与信息（全量持久化）
│   ├── app.ts            # 应用配置（侧边栏等）
│   ├── tasks.ts          # 任务状态管理
│   └── projects.ts       # 项目状态管理
│
├── views/                # 页面级组件
│   ├── Login.vue         # 登录页面
│   ├── Dashboard.vue     # 数据看板
│   ├── Projects.vue      # 项目管理
│   ├── Tasks.vue         # 任务管理
│   ├── Team.vue          # 团队管理
│   ├── Calendar.vue      # 日历页面
│   └── Settings.vue      # 系统设置
│
├── types/
│   └── index.ts          # TypeScript 类型定义
│
├── utils/
│   └── naive.ts          # Naive UI 消息/对话框封装
│
├── styles/
│   └── tailwind.css      # Tailwind 基础样式
│
├── App.vue               # 根组件
└── main.ts               # 应用入口
```

---

## 🧠 Store 设计与状态流转

### 3.1 现有 Store 分析

#### ✅ userStore - 用户认证模块
**持久化：全量持久化到 localStorage**

```typescript
state: {
  token: string               // 模拟令牌
  userInfo: UserInfo | null   // 用户信息
  isAuthenticated: boolean    // 认证状态
}

getters:
  ├─ username   → 显示名称
  ├─ avatar     → 头像 URL
  └─ userRole   → 用户角色

actions:
  ├─ login()    → 异步登录（模拟 800ms 延迟）
  ├─ logout()   → 退出清理状态
  └─ refreshUserInfo() → 刷新用户信息
```

**设计优点：**
- 登录时序控制完善
- 状态清理彻底
- 与路由联动良好

---

#### ✅ appStore - 应用配置模块
**持久化：全量持久化**

```typescript
state: {
  sidebarCollapsed: boolean   // 侧边栏折叠状态
}

getters:
  └─ sidebarWidth → 动态计算宽度

actions:
  ├─ toggleSidebar()      → 切换折叠
  └─ setSidebarCollapsed()
```

**优化建议：** 可扩展主题配置、语言切换等全局设置

---

#### ✅ tasksStore - 任务管理模块
**持久化：仅 `list` 字段持久化**

```typescript
state: {
  list: Task[]
  loading: boolean
  searchKeyword: string
  statusFilter: string | null
}

getters:
  ├─ filteredTasks  → 搜索+筛选组合
  ├─ pendingTasks   → 各状态分类统计
  ├─ inProgressTasks
  ├─ completedTasks
  ├─ overdueTasks
  └─ stats          → 汇总统计对象

actions:
  ├─ setSearchKeyword()
  ├─ setStatusFilter()
  ├─ fetchTasks()
  ├─ addTask()
  ├─ updateTask()
  └─ deleteTask()
```

**问题点：**
- ❌ Mock 数据与业务代码混合
- ❌ 筛选逻辑在 getter 中执行，每次访问都重新计算
- ❌ 没有分页/虚拟滚动优化

---

#### ✅ projectsStore - 项目管理模块
**持久化：默认无持久化（当前 list 硬编码在文件中）**

```typescript
state: {
  list: Project[]
  loading: boolean
  currentProject: Project | null
}

getters:
  ├─ activeProjects
  ├─ completedProjects
  ├─ totalCount
  └─ getProjectById() → 函数式 getter

actions:
  ├─ fetchProjects()  → 模拟异步加载
  ├─ addProject()
  ├─ updateProject()
  ├─ deleteProject()
  └─ setCurrentProject()
```

---

### 3.2 状态持久化策略

| Store | 持久化范围 | 存储位置 | 说明 |
|-------|-----------|---------|------|
| `user` | ✅ 全量 | localStorage | 登录状态必须保留 |
| `app` | ✅ 全量 | localStorage | 用户偏好 |
| `tasks` | ✅ `list` 字段 | localStorage | 任务数据 |
| `projects` | ❌ 无 | - | 当前 Mock 数据不持久化 |

> **⚠️ 风险提示：** localStorage 只有约 5MB 存储空间，超过 1000 条记录建议迁移到 IndexedDB

---

## 🎯 布局系统设计

### 4.1 主布局结构

```
Layout.vue
├── NLayoutHeader (64px)
│   ├── 左侧：折叠按钮 + Logo
│   └── 右侧：通知 + 用户下拉菜单
│
├── NLayout (has-sider)
│   ├── NLayoutSider
│   │   └── NMenu (6 个主菜单项)
│   │
│   └── NLayoutContent
│       └── router-view + fade-transform 过渡
```

### 4.2 响应式断点

| 断点 | 侧边栏行为 | 内容区布局 |
|------|-----------|-----------|
| > 1200px | 默认展开 | 多列网格 |
| 768px - 1200px | 默认展开 | 减少列数 |
| < 768px | 默认折叠 | 单列布局 |

---

## 🚀 架构优化路线图

### 5.1 数据层演进

```
当前：localStorage
    ↓ （1000 条数据临界值）
下一步：Dexie.js + IndexedDB
    ↓ （支持 Blob 存储）
未来：支持可选云端同步
```

### 5.2 分层演进

```
当前：Store → View
    ↓
下一步：Repository → Service → Store → View
    ↓
未来：+ Web Worker 并发层
```

---

## ⚠️ 技术债务清单

| 优先级 | 问题 | 影响范围 | 建议修复时间 |
|--------|------|---------|-------------|
| 🔴 高 | Mock 数据硬编码在 Store 中 | tasks/projects | 立即 |
| 🔴 高 | 缺少统一错误处理机制 | 所有异步操作 | 立即 |
| 🔴 高 | 路由未启用懒加载 | 首屏性能 | 本周 |
| 🟡 中 | 表格无虚拟滚动 | > 100 行数据 | 本月 |
| 🟡 中 | 缺少 composables 复用逻辑 | 代码重复率 | 本月 |
| 🟢 低 | 过渡动画 CSS 未定义 | 用户体验 | 按需 |

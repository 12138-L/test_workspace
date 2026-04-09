<template>
  <div class="layout-container">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-left">
        <div class="logo">
          <el-icon class="logo-icon"><Menu /></el-icon>
          <span class="logo-text">TeamFlowManager</span>
        </div>
      </div>

      <div class="header-center">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ route.meta?.title || '未知页面' }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="header-right">
        <el-dropdown>
          <span class="user-info">
            <el-avatar :size="32" :src="userStore.avatar" />
            <span class="username">{{ userStore.username }}</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>个人中心</el-dropdown-item>
              <el-dropdown-item>系统设置</el-dropdown-item>
              <el-dropdown-item divided @click="userStore.logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 主体区域 -->
    <div class="main-container">
      <!-- 侧边栏 -->
      <aside class="sidebar">
        <el-menu
          :default-active="route.path"
          class="sidebar-menu"
          router
          :collapse="appStore.sidebarCollapsed"
        >
          <el-menu-item index="/dashboard">
            <el-icon><DataAnalysis /></el-icon>
            <span>仪表板</span>
          </el-menu-item>

          <el-menu-item index="/team">
            <el-icon><User /></el-icon>
            <span>团队管理</span>
          </el-menu-item>

          <el-menu-item index="/projects">
            <el-icon><Document /></el-icon>
            <span>项目管理</span>
          </el-menu-item>

          <el-menu-item index="/tasks">
            <el-icon><List /></el-icon>
            <span>任务管理</span>
          </el-menu-item>

          <el-menu-item index="/calendar">
            <el-icon><Calendar /></el-icon>
            <span>日历</span>
          </el-menu-item>

          <el-menu-item index="/settings">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>

        <div class="sidebar-toggle" @click="toggleSidebar">
          <el-icon :size="20">
            <DArrowLeft v-if="!appStore.sidebarCollapsed" />
            <DArrowRight v-else />
          </el-icon>
        </div>
      </aside>

      <!-- 内容区域 -->
      <main class="content">
        <div class="content-wrapper">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import {
  Menu,
  ArrowDown,
  DataAnalysis,
  User,
  Document,
  List,
  Calendar,
  Setting,
  DArrowLeft,
  DArrowRight
} from '@element-plus/icons-vue'
import { useAppStore, useUserStore } from '@/stores'

const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()

const toggleSidebar = () => {
  appStore.toggleSidebar()
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
}

.logo-icon {
  margin-right: 8px;
  font-size: 24px;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  margin: 0 8px;
  font-size: 14px;
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 240px;
  background: #001529;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  position: relative;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-menu {
  flex: 1;
  border: none;
  background: transparent;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 240px;
}

.sidebar-toggle {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #002140;
  color: #fff;
  cursor: pointer;
  border-top: 1px solid #001529;
}

.sidebar-toggle:hover {
  background: #001529;
}

.content {
  flex: 1;
  background: #f0f2f5;
  overflow: auto;
}

.content-wrapper {
  padding: 20px;
  min-height: 100%;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item) {
  color: #bfcbd9;
}

:deep(.el-menu-item:hover) {
  background: #001529;
  color: #fff;
}

:deep(.el-menu-item.is-active) {
  background: #409eff;
  color: #fff;
}

:deep(.el-sub-menu__title) {
  color: #bfcbd9;
}

:deep(.el-sub-menu__title:hover) {
  background: #001529;
  color: #fff;
}
</style>

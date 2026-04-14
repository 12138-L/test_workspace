<template>
  <n-layout class="app-layout">
    <n-layout-header bordered class="layout-header">
      <div class="header-left">
        <n-button quaternary circle @click="toggleSidebar" class="collapse-btn">
          <span v-if="appStore.sidebarCollapsed" v-html="Icons.menu" class="icon-btn"></span>
          <span v-else v-html="Icons.close" class="icon-btn"></span>
        </n-button>
        <h1 class="app-title">TeamFlow Manager</h1>
      </div>

      <div class="header-right">
        <n-space align="center">
          <n-badge :value="5" type="info" dot>
            <n-button quaternary circle class="icon-btn-wrapper">
              <span v-html="Icons.bell" class="icon-btn"></span>
            </n-button>
          </n-badge>

          <n-dropdown trigger="click" :options="dropdownOptions" @select="handleDropdownSelect">
            <div class="user-info">
              <n-avatar round :src="userStore.avatar" size="small" />
              <span class="username">{{ userStore.username }}</span>
              <span
                v-html="Icons.chevronDown"
                class="icon-btn"
                style="width: 16px; height: 16px"
              ></span>
            </div>
          </n-dropdown>
        </n-space>
      </div>
    </n-layout-header>

    <n-layout has-sider>
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="200"
        :collapsed="appStore.sidebarCollapsed"
        class="layout-sider"
        show-trigger="bar"
      >
        <n-menu
          :value="activeMenu"
          :collapsed="appStore.sidebarCollapsed"
          :collapsed-width="64"
          :options="menuOptions"
        />
      </n-layout-sider>

      <n-layout-content class="layout-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import type { DropdownOption } from 'naive-ui'
import { useRouter, onBeforeRouteUpdate } from 'vue-router'
import { useAppStore, useUserStore } from '@/stores'
import { generateMenuOptions } from '@/config/menu'
import { Icons } from '@/config/icons'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const activeMenu = ref(router.currentRoute.value.path)

function handleMenuClick(path: string) {
  activeMenu.value = path
  router.push(path)
}

const menuOptions = generateMenuOptions(handleMenuClick)

onBeforeRouteUpdate(to => {
  activeMenu.value = to.path
})

const dropdownOptions: DropdownOption[] = [
  {
    label: '个人中心',
    key: 'profile'
  },
  {
    label: '系统设置',
    key: 'settings'
  },
  {
    type: 'divider',
    key: 'd1'
  },
  {
    label: '退出登录',
    key: 'logout'
  }
]

function toggleSidebar() {
  appStore.toggleSidebar()
}

function handleDropdownSelect(key: string) {
  if (key === 'logout') {
    userStore.logout()
  } else if (key === 'settings') {
    router.push('/settings')
  }
}
</script>

<style scoped>
.app-layout {
  height: 100vh;
}

.layout-header {
  height: 64px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-title {
  font-size: 18px;
  font-weight: 600;
  color: #333647;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f5f7fa;
}

.username {
  font-size: 14px;
  font-weight: 500;
}

.layout-sider {
  height: calc(100vh - 64px);
  overflow-y: auto;
  overflow-x: hidden;
}

.layout-sider .n-menu-item-content {
  cursor: pointer;
}

.layout-content {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 64px);
  overflow-y: auto;
}

.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>

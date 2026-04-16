<template>
  <!-- 登录页面主容器 - 全屏居中布局 -->
  <div class="login-container">
    <!-- 背景层 - 抽离的可复用组件 -->
    <LoginBackground />

    <!-- 登录卡片 - NaiveUI的Card组件 -->
    <n-card class="login-form-card" bordered>
      <!-- 头部Logo区域 -->
      <div class="login-header">
        <div class="logo-icon">
          <span v-html="Icons.team"></span>
        </div>
        <h1 class="logo-text">TeamFlow Manager</h1>
        <p class="logo-desc">高效团队管理 · 本地优先 · 数据安全</p>
      </div>

      <!-- 登录表单组件 - 抽离的交互组件 -->
      <LoginFormComponent
        ref="loginFormRef"
        v-model="loginForm"
        :loading="loading"
        @submit="handleLogin"
      />

      <!-- 底部快捷操作区 -->
      <div class="login-footer">
        <p>输入任意用户名密码即可体验</p>
        <n-button text type="primary" size="small" @click="quickLogin" :disabled="loading">
          一键快速登录
        </n-button>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
/**
 * Login - 登录页面容器组件
 *
 * 【架构升级 - Composable 模式】
 * 业务逻辑进一步抽离到 useLogin composable:
 *
 * Login.vue (视图层)
 *     ↓  只负责: 组件组装 + 布局 + 子组件通信
 * useLogin.ts (业务层)
 *     ↓  负责: 流程控制 + 状态管理 + Store集成
 * usePasswordStrength.ts (领域逻辑)
 *     ↓  负责: 纯算法 + 可复用
 * storage.ts (基础设施)
 *        负责: 数据持久化 + 安全编码
 */

import { message } from '@/utils/naive'
import { useUserStore } from '@/stores/user'
import { Icons } from '@/config/icons'
import LoginBackground from '@/components/login/LoginBackground.vue'
import LoginFormComponent from '@/components/login/LoginForm.vue'
import { useLogin } from '@/composables/useLogin'

const userStore = useUserStore()

/**
 * 业务逻辑全部委托给 useLogin composable
 * 这里只需要组装和连接
 */
const { loginFormRef, loading, loginForm, handleLogin, quickLogin } = useLogin(userStore, message)

/**
 * 【重要】修复类型一致性
 * 将 useLogin 返回的泛型引用 转换为 具体的组件实例类型
 * 这样父组件调用 validate() 时获得完整类型安全
 */
defineExpose({
  loginFormRef: loginFormRef as Ref<{ validate: () => Promise<void> } | null>
})
</script>

<style scoped>
/**
 * 登录页面容器
 * Flex实现完美居中，渐变色背景动画
 */
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #63e2b7 0%, #70c0e8 50%, #8080f2 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  position: relative;
  overflow: hidden;
}

/**
 * 渐变背景流动动画
 * 400%背景尺寸 + 关键帧位移 = 丝滑流动感
 */
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/**
 * 登录卡片样式
 * backdrop-filter 毛玻璃效果是现代UI的点睛之笔
 */
.login-form-card {
  width: 400px;
  z-index: 10;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.login-form-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.2);
}

/**
 * Logo头部区域
 */
.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.logo-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 20px auto;
  background: linear-gradient(135deg, #70c0e8 0%, #8080f2 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 8px 24px rgba(112, 192, 232, 0.4);
}

.logo-icon span {
  display: flex;
  width: 36px;
  height: 36px;
}

.logo-text {
  font-size: 24px;
  font-weight: 600;
  color: #333647;
  margin: 0 0 8px 0;
}

.logo-desc {
  font-size: 14px;
  color: #8c9aa8;
  margin: 0;
}

/**
 * 底部区域
 */
.login-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.login-footer p {
  color: #8c9aa8;
  font-size: 13px;
  margin: 0 0 8px 0;
}

/**
 * 错落入场动画
 * 卡片 -> 头部 -> 表单 -> 底部
 * 0.1秒延迟创造呼吸感
 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-form-card {
  animation: fadeInUp 0.6s ease-out;
}

.login-header {
  animation: fadeInUp 0.6s ease-out 0.1s both;
}

.login-footer {
  animation: fadeInUp 0.6s ease-out 0.3s both;
}

/**
 * 移动端响应式适配
 * 宽度自适应，缩小内边距和Logo尺寸
 */
@media (max-width: 480px) {
  .login-form-card {
    width: 92vw;
    margin: 0 16px;
  }

  .login-header {
    margin-bottom: 24px;
  }

  .logo-icon {
    width: 60px;
    height: 60px;
  }

  .logo-text {
    font-size: 20px;
  }
}
</style>

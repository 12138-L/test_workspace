<template>
  <div class="login-container">
    <div class="login-background">
      <div class="background-bubble"></div>
      <div class="background-bubble"></div>
      <div class="background-bubble"></div>
      <div class="background-bubble"></div>
    </div>

    <n-card class="login-form" bordered>
      <div class="login-header">
        <div class="logo-icon">
          <span v-html="Icons.team"></span>
        </div>
        <h1 class="logo-text">TeamFlow Manager</h1>
        <p class="logo-desc">高效团队管理 · 本地优先 · 数据安全</p>
      </div>

      <n-form ref="loginFormRef" :model="loginForm" :rules="loginRules" size="large" class="login-form-inner">
        <n-form-item path="username">
          <n-input
            v-model:value="loginForm.username"
            placeholder="用户名"
            clearable
            :disabled="loading"
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <span v-html="Icons.user" class="input-icon"></span>
            </template>
          </n-input>
        </n-form-item>

        <n-form-item path="password">
          <n-input
            v-model:value="loginForm.password"
            type="password"
            placeholder="密码"
            show-password-on="click"
            :disabled="loading"
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <span v-html="Icons.lock" class="input-icon"></span>
            </template>
          </n-input>
        </n-form-item>

        <div class="login-options">
          <n-checkbox v-model:checked="loginForm.remember" :disabled="loading">
            记住密码
          </n-checkbox>
          <n-text class="forgot-password" type="primary"> 忘记密码? </n-text>
        </div>

        <n-form-item>
          <n-button type="primary" block size="large" :loading="loading" @click="handleLogin">
            {{ loading ? '正在登录...' : '登 录' }}
          </n-button>
        </n-form-item>
      </n-form>

      <div class="login-footer">
        <p>输入任意用户名密码即可体验</p>
        <n-button text type="primary" size="small" @click="quickLogin"> 一键快速登录 </n-button>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import { message } from '@/utils/naive'
import type { LoginForm } from '@/types'
import { useUserStore } from '@/stores'
import { Icons } from '@/config/icons'

const userStore = useUserStore()
const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive<LoginForm>({
  username: '',
  password: '',
  remember: false
})

const loginRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 3, message: '密码长度至少3位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value || loading.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true

    await userStore.login(loginForm)
  } catch (error) {
    if (error && typeof error === 'object' && 'errors' in error) {
      message.warning('请填写完整的登录信息')
    }
  } finally {
    loading.value = false
  }
}

const quickLogin = () => {
  loginForm.username = 'admin'
  loginForm.password = '123456'
  handleLogin()
}
</script>

<style scoped>
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

.login-background {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.background-bubble {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.background-bubble:nth-child(1) {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.background-bubble:nth-child(2) {
  width: 200px;
  height: 200px;
  bottom: -50px;
  right: -50px;
  animation-delay: 2s;
}

.background-bubble:nth-child(3) {
  width: 150px;
  height: 150px;
  top: 50%;
  right: 10%;
  animation-delay: 4s;
}

.background-bubble:nth-child(4) {
  width: 100px;
  height: 100px;
  bottom: 30%;
  left: 15%;
  animation-delay: 1s;
}

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

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

.login-form {
  width: 400px;
  z-index: 10;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

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

.input-icon {
  display: flex;
  width: 18px;
  height: 18px;
  color: #8c9aa8;
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

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.forgot-password {
  cursor: pointer;
  transition: opacity 0.2s;
}

.forgot-password:hover {
  opacity: 0.8;
}

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
</style>

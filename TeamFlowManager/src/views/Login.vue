<template>
  <div class="login-container">
    <div class="login-form">
      <div class="login-header">
        <el-icon class="logo-icon"><Menu /></el-icon>
        <h1 class="logo-text">TeamFlowManager</h1>
        <p class="login-description">团队工作流管理系统</p>
      </div>

      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" size="large">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
          <el-link type="primary" class="forgot-password" underline="never">忘记密码?</el-link>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p>还没有账号? <el-link type="primary" underline="never">立即注册</el-link></p>
      </div>
    </div>

    <div class="login-background">
      <div class="background-bubble"></div>
      <div class="background-bubble"></div>
      <div class="background-bubble"></div>
      <div class="background-bubble"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { Menu, User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { LoginForm } from '@/types'
import { useUserStore } from '@/stores'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive<LoginForm>({
  username: '',
  password: '',
  remember: false
})

const loginRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true
    await userStore.login(loginForm)

    localStorage.setItem(
      'user-store',
      JSON.stringify({
        state: {
          isAuthenticated: true,
          token: userStore.token,
          userInfo: userStore.userInfo
        },
        version: 1
      })
    )

    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (_error) {
    // 表单验证失败静默处理
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  overflow: hidden;
}

@keyframes gradientShift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.login-form {
  width: 420px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 50px 45px;
  border-radius: 20px;
  z-index: 10;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-icon {
  font-size: 52px;
  color: #667eea;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.logo-text {
  font-size: 30px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 10px 0;
  letter-spacing: 0.5px;
}

.login-description {
  color: #909399;
  margin: 0;
  font-size: 15px;
}

:deep(.el-form-item) {
  margin-bottom: 28px;
}

:deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.25);
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #667eea;
  border-color: #667eea;
}

:deep(.el-checkbox__input.is-focus .el-checkbox__inner) {
  border-color: #667eea;
}

:deep(.el-button--primary) {
  border-radius: 12px;
  padding: 22px 20px;
  font-weight: 600;
  font-size: 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

:deep(.el-button--primary.is-loading) {
  transform: none;
}

.forgot-password {
  float: right;
}

:deep(.el-link) {
  transition: all 0.2s ease;
}

:deep(.el-link:hover) {
  transform: translateY(-1px);
}

.login-footer {
  text-align: center;
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid #ebeef5;
  color: #909399;
  font-size: 14px;
}

.login-footer p {
  margin: 0;
}

.login-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.background-bubble {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: bubbleFloat 20s infinite;
}

.background-bubble:nth-child(1) {
  width: 80px;
  height: 80px;
  left: 10%;
  animation-delay: 0s;
}

.background-bubble:nth-child(2) {
  width: 120px;
  height: 120px;
  right: 15%;
  animation-delay: -5s;
}

.background-bubble:nth-child(3) {
  width: 60px;
  height: 60px;
  left: 20%;
  bottom: 20%;
  animation-delay: -10s;
}

.background-bubble:nth-child(4) {
  width: 100px;
  height: 100px;
  right: 25%;
  bottom: 15%;
  animation-delay: -15s;
}

@keyframes bubbleFloat {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-100px) scale(1.2);
    opacity: 0.6;
  }
}

@media (max-width: 480px) {
  .login-form {
    width: 90%;
    padding: 35px 25px;
    margin: 20px;
  }

  .logo-text {
    font-size: 24px;
  }
}
</style>

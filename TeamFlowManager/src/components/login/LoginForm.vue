<template>
  <!-- 登录表单容器 - 使用NaiveUI的n-form组件 -->
  <n-form
    ref="loginFormRef"
    :model="modelValue"
    :rules="loginRules"
    size="large"
    class="login-form-inner"
  >
    <!-- 用户名输入框 - 自动聚焦提升体验 -->
    <n-form-item path="username">
      <n-input
        ref="usernameInputRef"
        v-model:value="modelValue.username"
        placeholder="用户名"
        clearable
        :disabled="loading"
        :autofocus="true"
        @keyup.enter="handleSubmit"
      >
        <template #prefix>
          <span v-html="Icons.user" class="input-icon"></span>
        </template>
      </n-input>
    </n-form-item>

    <!-- 密码输入框 + 实时强度检测 + CapsLock提示 -->
    <n-form-item path="password">
      <n-input
        v-model:value="modelValue.password"
        type="password"
        placeholder="密码"
        show-password-on="click"
        :disabled="loading"
        @keyup.enter="handleSubmit"
        @keyup="checkCapsLock"
        @keydown="checkCapsLock"
        class="password-input"
      >
        <template #prefix>
          <span v-html="Icons.lock" class="input-icon"></span>
        </template>
      </n-input>

      <!-- Caps Lock 大写锁定提示 -->
      <div v-if="capsLockEnabled" class="capslock-warning">
        <span class="capslock-icon">⇪</span>
        <span class="capslock-text">大写锁定已开启</span>
      </div>

      <!-- 密码强度指示器 - 三段式进度条实现 -->
      <div v-if="passwordStrength.level > 0" class="password-strength">
        <div class="strength-bar">
          <span
            v-for="i in 3"
            :key="i"
            class="strength-segment"
            :style="{
              background: i <= passwordStrength.level ? passwordStrength.color : '#e5e6eb'
            }"
          ></span>
        </div>
        <span class="strength-text" :style="{ color: passwordStrength.color }">
          密码强度: {{ passwordStrength.text }}
        </span>
      </div>
    </n-form-item>

    <!-- 登录选项栏 -->
    <div class="login-options">
      <n-checkbox
        v-model:checked="modelValue.remember"
        :disabled="loading"
        @update:checked="handleRememberChange"
      >
        记住密码
      </n-checkbox>
      <n-text class="forgot-password" type="primary"> 忘记密码? </n-text>
    </div>

    <!-- 登录提交按钮 -->
    <n-form-item>
      <n-button type="primary" block size="large" :loading="loading" @click="handleSubmit">
        {{ loading ? '正在登录...' : '登 录' }}
      </n-button>
    </n-form-item>
  </n-form>
</template>

<script setup lang="ts">
/**
 * LoginForm - 登录表单组件
 *
 * 【Vue3.4+ 最佳实践】
 * 使用 Vue3.4 新增的 defineModel 宏简化双向绑定
 * 使用 defineExpose 暴露验证方法给父组件
 *
 * 【新增功能】
 * ✅ Caps Lock 大写锁定实时检测
 * ✅ 用户名输入框自动聚焦
 * ✅ 记住密码状态变更即时持久化
 * ✅ 密码强度算法升级（支持大小写、数字、符号检测）
 */

import type { FormRules, FormInst } from 'naive-ui'
import type { LoginForm } from '@/types'
import { Icons } from '@/config/icons'
import { ref } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { usePasswordStrength } from '@/composables/usePasswordStrength'
import { saveCredentials, clearCredentials } from '@/utils/storage'

/**
 * Vue3.4+ defineModel 宏 - 大幅简化v-model实现
 * 替代了之前computed的get/set样板代码
 */
const modelValue = defineModel<LoginForm>({ required: true })

const props = defineProps<{
  /** 加载状态 */
  loading: boolean
}>()

const emit = defineEmits<{
  (_e: 'submit'): void
}>()

/**
 * 表单与DOM引用
 * 添加完整TypeScript类型注解
 */
const loginFormRef = ref<FormInst | null>(null)
const capsLockEnabled = ref(false)

/**
 * 密码强度检测 - 使用抽离的composable
 * 逻辑复用：登录/注册/修改密码都可以用同一个算法
 *
 * 【防踩坑设计】usePasswordStrength 内部自动处理响应式
 * 直接传 getter 函数，永远不会有响应式丢失的 BUG！
 */
const { passwordStrength } = usePasswordStrength(() => modelValue.value.password)

/**
 * Caps Lock 大写锁定检测
 * 减少用户因误触Caps Lock导致的密码错误
 */
function checkCapsLock(event: KeyboardEvent) {
  if (event.getModifierState) {
    capsLockEnabled.value = event.getModifierState('CapsLock')
  }
}

/**
 * 防抖：用户输入时延迟保存记住的账号密码
 * 避免用户每输入一个字符就写一次localStorage
 * 500ms防抖兼顾体验与性能
 */
watchDebounced(
  () => [modelValue.value.username, modelValue.value.password, modelValue.value.remember],
  () => {
    if (modelValue.value.remember) {
      saveCredentials({
        username: modelValue.value.username,
        password: modelValue.value.password,
        remember: true
      })
    }
  },
  { debounce: 500, maxWait: 2000 }
)

/**
 * 修复：记住密码状态变更时即时更新localStorage
 *
 * 【修复前的BUG】
 * 勾选记住密码 -> 修改账号密码 -> 取消勾选
 * 旧密码会永远留在localStorage中
 *
 * 【修复后】
 * 取消勾选时立即清除localStorage，勾选时立即保存
 */
function handleRememberChange(checked: boolean) {
  if (!checked) {
    clearCredentials()
  }
}

/**
 * 提交登录
 * loading状态下阻止重复提交（包括键盘回车）
 */
function handleSubmit() {
  if (!props.loading) {
    emit('submit')
  }
}

/**
 * 表单验证规则
 * trigger: ['blur', 'input'] 实现即时验证
 */
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: ['blur', 'input'] },
    { min: 2, message: '用户名至少2位', trigger: ['blur', 'input'] }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: ['blur', 'input'] },
    { min: 3, message: '密码长度至少3位', trigger: ['blur', 'input'] }
  ]
}

/**
 * 暴露给父组件的API
 * TypeScript 类型安全的暴露
 */
defineExpose({
  validate: () => loginFormRef.value?.validate()
})
</script>

<style scoped>
.input-icon {
  display: flex;
  width: 18px;
  height: 18px;
  color: #8c9aa8;
}

/**
 * Caps Lock 提示样式
 */
.capslock-warning {
  display: flex;
  align-items: center;
  margin-top: 8px;
  gap: 6px;
  color: #e6a23c;
  font-size: 12px;
}

.capslock-icon {
  font-size: 14px;
  font-weight: bold;
}

/**
 * 密码强度指示器
 */
.password-strength {
  display: flex;
  align-items: center;
  margin-top: 8px;
  gap: 8px;
}

.strength-bar {
  display: flex;
  gap: 4px;
  flex: 1;
}

.strength-segment {
  height: 4px;
  flex: 1;
  border-radius: 2px;
  transition: background 0.3s ease;
}

.strength-text {
  font-size: 12px;
  font-weight: 500;
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

/**
 * 微交互动画
 */
:deep(.n-input) {
  transition: all 0.3s ease;
}

:deep(.n-input:hover) {
  transform: translateY(-1px);
}

:deep(.n-input--focused) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(112, 192, 232, 0.25);
}

:deep(.n-button) {
  transition: all 0.3s ease !important;
}

:deep(.n-button--type-primary:not(.n-button--disabled):hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(32, 128, 240, 0.35);
}

:deep(.n-button--type-primary:not(.n-button--disabled):active) {
  transform: translateY(0);
}

:deep(.n-checkbox .n-checkbox-box) {
  transition: all 0.2s ease;
}

:deep(.n-checkbox:hover .n-checkbox-box) {
  transform: scale(1.05);
}

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

.login-form-inner {
  animation: fadeInUp 0.6s ease-out 0.2s both;
}
</style>

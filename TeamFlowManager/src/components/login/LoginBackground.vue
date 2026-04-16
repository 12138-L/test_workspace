<template>
  <!-- 登录页面动态背景层 - 纯视觉装饰组件 -->
  <div class="login-background">
    <!-- 浮动气泡 - 使用CSS动画创建层次感 -->
    <div class="background-bubble"></div>
    <div class="background-bubble"></div>
    <div class="background-bubble"></div>
    <div class="background-bubble"></div>
  </div>
</template>

<script setup lang="ts">
/**
 * LoginBackground - 登录页面背景组件
 *
 * 【设计理念】
 * 这是一个纯视觉、无状态、无副作用的展示型组件
 * 遵循"单一职责原则"，只负责渲染背景动画效果
 *
 * 【可复用性】
 * ✅ 高度可复用 - 可放置在任何全屏页面中
 * ✅ 无外部依赖 - 不需要传入任何props
 * ✅ 无副作用 - 不修改全局状态，不发请求
 *
 * 【适用场景】
 * - 登录页、注册页、忘记密码页
 * - 404错误页、系统维护页
 * - 欢迎页、引导页等全屏展示页面
 *
 * @example
 * <div class="full-screen-container">
 *   <LoginBackground />
 *   <YourContentHere />
 * </div>
 */
</script>

<style scoped>
/**
 * 背景容器样式
 * pointer-events: none 确保不会阻挡用户点击
 */
.login-background {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

/**
 * 气泡基础样式
 * 使用半透明白色创建毛玻璃背景效果
 */
.background-bubble {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

/**
 * 气泡定位 - 错落有致的布局
 * 使用不同的animation-delay创造错开的浮动节奏
 */
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

/**
 * 浮动动画
 * 上下移动 + 轻微旋转 = 自然漂浮效果
 */
@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

/**
 * 移动端响应式适配
 * 缩小气泡尺寸，避免在小屏幕上过于突兀
 */
@media (max-width: 480px) {
  .background-bubble:nth-child(1) {
    width: 200px;
    height: 200px;
  }

  .background-bubble:nth-child(2) {
    width: 150px;
    height: 150px;
  }
}
</style>

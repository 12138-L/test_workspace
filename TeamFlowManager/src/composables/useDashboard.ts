import { computed, ref } from 'vue'
import { useAsync } from '@/utils/async'

/**
 * useDashboard - 仪表盘业务逻辑可组合函数
 *
 * 【设计理念】
 * 按照 Login 模块的架构标准实现：
 * 1. 关注点分离 - 业务逻辑与UI渲染彻底分离
 * 2. 可测试性 - 业务逻辑可以独立单元测试
 * 3. 性能优化 - 防抖刷新、自动重试机制
 * 4. 防错设计 - loading/error 状态统一管理
 *
 * @param stores Store 集合
 * @param message 消息提示工具
 * @returns 仪表盘相关状态和方法
 */
export function useDashboard(
  stores: {
    projects: { fetchProjects: () => Promise<void>; list: unknown[] }
    tasks: { fetchTasks: () => Promise<void>; list: unknown[]; stats: Record<string, number> }
    team: { fetchTeam: () => Promise<void>; stats: Record<string, number> }
    user: { username: string }
  },
  message: { info: (_msg: string) => void }
) {
  /**
   * 当前日期格式化
   * 示例：4月15日 周二
   */
  const currentDate = computed(() => {
    const now = new Date()
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return `${now.getMonth() + 1}月${now.getDate()}日 ${weekDays[now.getDay()]}`
  })

  /**
   * 智能问候语
   * 根据时间自动切换：早上好 / 下午好 / 晚上好
   */
  const greeting = computed(() => {
    const hour = new Date().getHours()
    if (hour < 12) return '早上好'
    if (hour < 18) return '下午好'
    return '晚上好'
  })

  /**
   * 数据加载状态管理
   * 包含：自动重试、错误处理、防抖刷新
   */
  const refreshing = ref(false)

  const { loading, execute: fetchData } = useAsync(
    async () => {
      await Promise.all([
        stores.projects.fetchProjects(),
        stores.tasks.fetchTasks(),
        stores.team.fetchTeam()
      ])
    },
    {
      errorMessage: '加载数据失败',
      /**
       * 失败自动重试 2 次
       * useAsync 内置重试机制，递归调用更安全
       */
      maxRetries: 2,
      retryDelay: 1000
    }
  )

  /**
   * 手动刷新 - 带防抖和冷却时间
   * 防止用户连续点击刷新按钮
   */
  async function handleRefresh() {
    if (refreshing.value) return

    refreshing.value = true
    message.info('正在刷新数据...')

    try {
      await fetchData()
    } finally {
      /**
       * 强制 1 秒冷却时间
       * 避免快速重复提交导致的重复请求
       */
      setTimeout(() => {
        refreshing.value = false
      }, 1000)
    }
  }

  return {
    currentDate,
    greeting,
    loading,
    refreshing,
    fetchData,
    handleRefresh
  }
}

/**
 * 通用工具函数 - 抽离到 Dashboard 层复用
 */
export function getStatusType(status: string) {
  const statusMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
    进行中: 'info',
    已完成: 'success',
    待处理: 'warning',
    已逾期: 'error'
  }
  return statusMap[status] || 'info'
}

export function getProgressColor(progress: number) {
  if (progress >= 80) return '#67c23a'
  if (progress >= 50) return '#e6a23c'
  return '#f56c6c'
}

import jsPDF from 'jspdf'
import 'jspdf-autotable'

export function exportToCSV(reportData, filename) {
  const headers = ['任务名称', '类型', '优先级', '截止日期', '状态', '进度']
  const typeNames = {
    work: '工作',
    study: '学习',
    life: '生活',
    health: '健康',
    finance: '财务'
  }
  const priorityNames = {
    high: '高',
    medium: '中',
    low: '低'
  }
  const statusNames = {
    pending: '待处理',
    in_progress: '进行中',
    completed: '已完成'
  }
  
  const rows = reportData.tasks.map(task => [
    task.title,
    typeNames[task.type] || task.type,
    priorityNames[task.priority] || task.priority,
    task.dueDate,
    statusNames[task.status] || task.status,
    `${task.progress}%`
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportToPDF(reportData, filename) {
  const doc = new jsPDF()
  
  doc.setFontSize(18)
  doc.text('任务报表', 14, 22)
  
  doc.setFontSize(11)
  doc.text(`时间范围: ${reportData.startDate} 至 ${reportData.endDate}`, 14, 32)
  
  doc.setFontSize(14)
  doc.text('统计概览', 14, 45)
  
  doc.setFontSize(11)
  const summaryData = [
    ['总任务数', reportData.totalTasks.toString()],
    ['已完成', reportData.completedTasks.toString()],
    ['完成率', `${reportData.completionRate}%`],
    ['延期任务', reportData.overdueTasks.toString()]
  ]
  
  doc.autoTable({
    startY: 50,
    head: [['指标', '数值']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] },
    margin: { left: 14 }
  })
  
  const typeNames = {
    work: '工作',
    study: '学习',
    life: '生活',
    health: '健康',
    finance: '财务'
  }
  const priorityNames = {
    high: '高',
    medium: '中',
    low: '低'
  }
  const statusNames = {
    pending: '待处理',
    in_progress: '进行中',
    completed: '已完成'
  }
  
  doc.setFontSize(14)
  doc.text('任务类型分布', 14, doc.lastAutoTable.finalY + 15)
  
  const typeData = Object.entries(reportData.typeDistribution).map(([type, count]) => [
    typeNames[type] || type,
    count.toString(),
    `${Math.round((count / reportData.totalTasks) * 100)}%`
  ])
  
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [['类型', '数量', '占比']],
    body: typeData,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] },
    margin: { left: 14 }
  })
  
  doc.setFontSize(14)
  doc.text('任务详情', 14, doc.lastAutoTable.finalY + 15)
  
  const taskData = reportData.tasks.map(task => [
    task.title,
    typeNames[task.type] || task.type,
    priorityNames[task.priority] || task.priority,
    task.dueDate,
    statusNames[task.status] || task.status,
    `${task.progress}%`
  ])
  
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [['任务名称', '类型', '优先级', '截止日期', '状态', '进度']],
    body: taskData,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 20 },
      2: { cellWidth: 20 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 },
      5: { cellWidth: 20 }
    },
    margin: { left: 14 }
  })
  
  doc.save(`${filename}.pdf`)
}

import jsPDF from 'jspdf'
import 'jspdf-autotable'

export function exportToCSV(reportData, filename) {
  try {
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
    
    return true
  } catch (error) {
    console.error('Failed to export CSV:', error)
    return false
  }
}

export function exportToPDF(reportData, filename) {
  try {
    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.text('Task Report', 14, 22)
    
    doc.setFontSize(11)
    doc.text(`Period: ${reportData.startDate} to ${reportData.endDate}`, 14, 32)
    
    doc.setFontSize(14)
    doc.text('Summary', 14, 45)
    
    doc.setFontSize(11)
    const summaryData = [
      ['Total Tasks', reportData.totalTasks.toString()],
      ['Completed', reportData.completedTasks.toString()],
      ['Completion Rate', `${reportData.completionRate}%`],
      ['Overdue Tasks', reportData.overdueTasks.toString()]
    ]
    
    doc.autoTable({
      startY: 50,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      margin: { left: 14 }
    })
    
    const typeNames = {
      work: 'Work',
      study: 'Study',
      life: 'Life',
      health: 'Health',
      finance: 'Finance'
    }
    const priorityNames = {
      high: 'High',
      medium: 'Medium',
      low: 'Low'
    }
    const statusNames = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed'
    }
    
    doc.setFontSize(14)
    doc.text('Task Type Distribution', 14, doc.lastAutoTable.finalY + 15)
    
    const typeData = Object.entries(reportData.typeDistribution).map(([type, count]) => [
      typeNames[type] || type,
      count.toString(),
      `${Math.round((count / reportData.totalTasks) * 100)}%`
    ])
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Type', 'Count', 'Percentage']],
      body: typeData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      margin: { left: 14 }
    })
    
    doc.setFontSize(14)
    doc.text('Task Details', 14, doc.lastAutoTable.finalY + 15)
    
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
      head: [['Task Name', 'Type', 'Priority', 'Due Date', 'Status', 'Progress']],
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
    
    return true
  } catch (error) {
    console.error('Failed to export PDF:', error)
    return false
  }
}

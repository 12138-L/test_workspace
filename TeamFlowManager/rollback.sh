#!/bin/bash
# TeamFlowManager 一键回滚脚本

set -e

CONFIG_SERVER=$1

if [ -z "$CONFIG_SERVER" ]; then
    echo "❌ 参数错误"
    echo "用法: $0 <服务器IP>"
    exit 1
fi

echo "⏪ 查找最近的备份..."
LATEST=$(ssh root@$CONFIG_SERVER "ls -td /var/www/teamflow-backup-* | head -1")

if [ -z "$LATEST" ]; then
    echo "❌ 没有找到备份文件"
    exit 1
fi

echo "找到备份: $LATEST"
echo "正在回滚..."

ssh root@$CONFIG_SERVER "rm -rf /var/www/teamflow && cp -r $LATEST /var/www/teamflow"

echo ""
echo "✅ 回滚完成！"
echo "已恢复到: $LATEST"

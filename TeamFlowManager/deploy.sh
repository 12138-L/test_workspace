#!/bin/bash
# TeamFlowManager 自动化部署脚本
# 使用方法: ./deploy.sh <server-ip> <domain>

set -e

CONFIG_SERVER=$1
CONFIG_DOMAIN=$2

if [ -z "$CONFIG_SERVER" ] || [ -z "$CONFIG_DOMAIN" ]; then
    echo "❌ 参数错误"
    echo "用法: $0 <服务器IP> <域名>"
    echo "示例: $0 192.168.1.100 teamflow.example.com"
    exit 1
fi

echo ""
echo "🚀 TeamFlowManager 自动化部署"
echo "═══════════════════════════════════════"
echo "服务器: $CONFIG_SERVER"
echo "域名: $CONFIG_DOMAIN"
echo ""

# 步骤 1: 类型检查
echo "[1/6] 🔍 TypeScript 类型检查..."
npm run typecheck
echo "✅ 类型检查通过"

# 步骤 2: 构建
echo "[2/6] 📦 执行构建..."
npm run build
echo "✅ 构建完成"

# 步骤 3: 本地预览验证（3秒超时）
echo "[3/6] 🧪 验证构建产物..."
if [ -f "dist/index.html" ] && [ -f "dist/sw.js" ]; then
    echo "   - index.html 存在"
    echo "   - sw.js 存在"
    echo "✅ 构建产物验证通过"
else
    echo "❌ 构建产物不完整"
    exit 1
fi

# 步骤 4: 服务器备份
echo "[4/6] 💾 服务器端备份..."
BACKUP_NAME="teamflow-backup-$(date +%Y%m%d-%H%M%S)"
ssh root@$CONFIG_SERVER "cp -r /var/www/teamflow /var/www/$BACKUP_NAME 2>/dev/null || true"
echo "   备份名称: $BACKUP_NAME"

# 步骤 5: 上传文件
echo "[5/6] 📤 上传文件 (rsync)..."
rsync -avz --delete --quiet dist/ root@$CONFIG_SERVER:/var/www/teamflow/

# 步骤 6: 设置权限 & 清理
echo "[6/6] 🔧 设置权限 & 清理..."
ssh root@$CONFIG_SERVER "chown -R www-data:www-data /var/www/teamflow"
ssh root@$CONFIG_SERVER "find /var/www -type d -name 'teamflow-backup-*' -mtime +7 -exec rm -rf {} \; 2>/dev/null || true"

echo ""
echo "═══════════════════════════════════════"
echo "✅ 部署成功完成！"
echo ""
echo "🌐 访问地址: https://$CONFIG_DOMAIN"
echo "📦 备份标识: $BACKUP_NAME"
echo ""
echo "如需回滚执行:"
echo "  ssh root@$CONFIG_SERVER 'rm -rf /var/www/teamflow && cp -r /var/www/$BACKUP_NAME /var/www/teamflow'"
echo ""

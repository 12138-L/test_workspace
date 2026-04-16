# TeamFlowManager Nginx 部署手册（方案B）

> 版本: v1.0
> 更新日期: 2026-04-14
> 适用环境: Ubuntu 20.04+/CentOS 7+

---

## 目录

1. [前置准备](#1-前置准备)
2. [本地构建流程](#2-本地构建流程)
3. [服务器环境配置](#3-服务器环境配置)
4. [Nginx 详细配置](#4-nginx-详细配置)
5. [部署上传](#5-部署上传)
6. [HTTPS 配置](#6-https-配置必选)
7. [验证与测试](#7-验证与测试)
8. [自动化部署脚本](#8-自动化部署脚本)
9. [运维与监控](#9-运维与监控)
10. [常见问题排查](#10-常见问题排查)

---

## 1. 前置准备

### 📋 服务器要求

| 配置 | 最低要求 | 推荐配置 |
|------|---------|---------|
| CPU | 1 核 | 2 核 |
| 内存 | 1 GB | 2 GB |
| 硬盘 | 10 GB | 40 GB SSD |
| 系统 | Ubuntu 20.04+ / CentOS 7+ | Ubuntu 22.04 LTS |
| 网络 | 公网 IP | 带宽 1Mbps+ |

### 🔑 准备工作

- [ ] 服务器 SSH 登录权限
- [ ] 域名解析到服务器 IP
- [ ] 防火墙开放 80/443 端口
- [ ] 本地安装 Git/Node.js 18+

---

## 2. 本地构建流程

### Step 1: 代码拉取与依赖

```bash
# 克隆代码
git clone <your-repo-url>
cd TeamFlowManager

# 安装依赖（确保与构建环境一致）
npm ci
```

### Step 2: 类型检查与构建

```bash
# 运行类型检查（必须通过）
npm run typecheck

# 运行 lint 检查
npm run lint

# 执行构建
npm run build
```

### ✅ 构建产物验证

构建成功后检查 `dist` 目录：

```
dist/
├── index.html              # 300-400 bytes
├── sw.js                   # PWA Service Worker
├── workbox-*.js            # ~50KB
└── assets/
    ├── index-*.js          # ~550KB
    └── index-*.css         # ~100KB
```

### Step 3: 本地预览验证

```bash
npm run preview
```

访问 http://localhost:4173 确认：
- [ ] 所有页面可正常访问
- [ ] 控制台无报错
- [ ] 数据增删改查正常
- [ ] PWA 可安装提示出现

---

## 3. 服务器环境配置

### 3.1 系统更新

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 3.2 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y
```

### 3.3 启动并设置开机自启

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3.4 验证 Nginx

```bash
sudo systemctl status nginx
```

**预期输出：**
```
● nginx.service - A high performance web server and a reverse proxy server
     Active: active (running)
```

访问服务器公网 IP，应看到 Nginx 默认欢迎页。

### 3.5 防火墙配置

```bash
# Ubuntu ufw
sudo ufw allow 'Nginx Full'
sudo ufw reload

# CentOS firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## 4. Nginx 详细配置

### 4.1 创建站点目录

```bash
sudo mkdir -p /var/www/teamflow
sudo chown -R www-data:www-data /var/www/teamflow
sudo chmod -R 755 /var/www/teamflow
```

### 4.2 创建 Nginx 配置文件

创建 `/etc/nginx/sites-available/teamflow`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/teamflow;
    index index.html;
    charset utf-8;

    # 1. SPA 路由支持 - 解决刷新 404 问题
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 2. 静态资源永久缓存（带 hash 资源）
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
        
        # Gzip 压缩
        gzip on;
        gzip_types text/css application/javascript image/svg+xml;
    }

    # 3. PWA Service Worker 特殊配置（关键！）
    location ~* (sw|workbox-.*)\.js$ {
        # 绝对不要缓存 Service Worker
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate";
        add_header Service-Worker-Allowed "/";
        
        # 禁用 gzip，避免 SW 更新问题
        gzip off;
    }

    # 4. index.html 不缓存（每次重新验证）
    location = /index.html {
        expires -1;
        add_header Cache-Control "no-cache, public, must-revalidate, proxy-revalidate";
    }

    # 5. 安全头配置
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 6. 隐藏 Nginx 版本
    server_tokens off;

    # 7. 日志配置
    access_log /var/log/nginx/teamflow.access.log;
    error_log /var/log/nginx/teamflow.error.log;
}
```

### 4.3 启用站点配置

```bash
# Ubuntu/Debian
sudo ln -sf /etc/nginx/sites-available/teamflow /etc/nginx/sites-enabled/

# CentOS - 直接放到 conf.d
# sudo cp teamflow.conf /etc/nginx/conf.d/
```

### 4.4 删除默认站点

```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

### 4.5 验证配置语法

```bash
sudo nginx -t
```

✅ **成功输出：**
```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

❌ 如果报错，根据提示修正配置，不要继续！

### 4.6 重载 Nginx

```bash
sudo systemctl reload nginx
```

---

## 5. 部署上传

### 方法一：SCP 直接上传（简单）

```bash
# 在本地机器执行
scp -r dist/* root@your-server-ip:/var/www/teamflow/

# 设置正确权限（服务器上执行）
sudo chown -R www-data:www-data /var/www/teamflow
sudo chmod -R 755 /var/www/teamflow
```

### 方法二：rsync 增量上传（推荐，大项目用）

```bash
# 本地执行，只上传变更文件
rsync -avz --delete dist/ root@your-server-ip:/var/www/teamflow/
```

### 方法三：服务器构建

```bash
# 服务器上拉代码构建
cd /opt
git clone <your-repo-url>
cd TeamFlowManager
npm ci
npm run build
sudo cp -r dist/* /var/www/teamflow/
```

---

## 6. HTTPS 配置（必选）

> PWA 功能必须在 HTTPS 环境下才能正常工作

### 6.1 安装 Certbot

```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx -y

# CentOS
sudo yum install certbot python3-certbot-nginx -y
```

### 6.2 自动申请并配置证书

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 6.3 按向导回答

```
Enter email address (used for urgent renewal and security notices)
> 输入你的邮箱

同意服务条款: A
是否分享邮箱: N
是否重定向: 2 (Redirect - 推荐)
```

### 6.4 验证自动续期

Let's Encrypt 证书有效期 90 天，Certbot 会自动续期：

```bash
sudo certbot renew --dry-run
```

✅ 输出 "Congratulations, all renewals succeeded." 即正常。

### 6.5 验证 HTTPS

访问 https://your-domain.com
- [ ] 地址栏显示小锁标志
- [ ] HTTP 自动跳转到 HTTPS

---

## 7. 验证与测试

### ✅ 部署验收检查清单

| 测试项 | 预期结果 | 验证方法 |
|--------|---------|---------|
| **首页访问** | 正常打开 | 浏览器访问域名 |
| **路由刷新** | 不 404 | 在 /projects 页面按 F5 |
| **HTTPS** | 小锁标志 | 浏览器地址栏 |
| **控制台** | 无报错 | F12 → Console |
| **数据操作** | 正常 | 新建项目保存刷新不丢失 |
| **PWA SW** | 已激活 | DevTools → Application → Service Workers |
| **缓存策略** | 正确 | DevTools → Network → 查看各文件 Cache-Control |

### 🔍 Cache-Control 验证标准

| 文件 | Cache-Control |
|------|--------------|
| index.html | `no-cache` |
| sw.js | `no-store` |
| assets/* | `public, immutable` |

---

## 8. 自动化部署脚本

### 8.1 创建本地部署脚本

在项目根目录创建 `deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 开始部署 TeamFlowManager..."

# 1. 构建
echo "1/5 构建中..."
npm run typecheck
npm run build

# 2. 备份
echo "2/5 服务器备份中..."
ssh root@your-server "cp -r /var/www/teamflow /var/www/teamflow-backup-$(date +%Y%m%d-%H%M)"

# 3. 上传
echo "3/5 上传文件中..."
rsync -avz --delete dist/ root@your-server:/var/www/teamflow/

# 4. 设置权限
echo "4/5 设置权限..."
ssh root@your-server "chown -R www-data:www-data /var/www/teamflow"

# 5. 清理旧备份（保留7天）
echo "5/5 清理旧备份..."
ssh root@your-server "find /var/www -type d -name 'teamflow-backup-*' -mtime +7 -exec rm -rf {} \;"

echo ""
echo "✅ 部署完成！"
echo "🌐 访问: https://your-domain.com"
```

### 8.2 使用方法

```bash
chmod +x deploy.sh
./deploy.sh
```

### 8.3 回滚脚本 `rollback.sh`

```bash
#!/bin/bash
echo "⏪ 正在回滚到上一个版本..."
LATEST=$(ssh root@your-server "ls -td /var/www/teamflow-backup-* | head -1")
echo "找到备份: $LATEST"

ssh root@your-server "rm -rf /var/www/teamflow && cp -r $LATEST /var/www/teamflow"
echo "✅ 回滚完成"
```

---

## 9. 运维与监控

### 9.1 日志查看

```bash
# 访问日志
sudo tail -f /var/log/nginx/teamflow.access.log

# 错误日志（排障用）
sudo tail -f /var/log/nginx/teamflow.error.log

# Nginx 全局状态
sudo nginx -V
sudo systemctl status nginx
```

### 9.2 常用运维命令

```bash
# 修改配置后重载（不中断服务）
sudo systemctl reload nginx

# 重启 Nginx
sudo systemctl restart nginx

# 查看连接数
sudo netstat -anp | grep :443 | wc -l
```

### 9.3 定期清理

```bash
# 清理 Nginx 日志（每月一次）
sudo truncate -s 0 /var/log/nginx/teamflow.access.log
sudo truncate -s 0 /var/log/nginx/teamflow.error.log

# 清理旧备份
sudo find /var/www -type d -name 'teamflow-backup-*' -mtime +7 -delete
```

---

## 10. 常见问题排查

### ❌ 问题 1：刷新页面 404 Not Found

**症状**：首页正常，子路由刷新 404

**原因**：缺少 SPA fallback 配置

**解决**：确保 location / 有这一行：
```nginx
try_files $uri $uri/ /index.html;
```

---

### ❌ 问题 2：应用永远不更新

**症状**：发版后用户看不到新功能

**原因**：sw.js 被浏览器强缓存了

**检查**：DevTools → Network → 查看 sw.js 响应头

**解决**：必须正确配置：
```nginx
location ~* (sw|workbox-.*)\.js$ {
    expires -1;
    add_header Cache-Control "no-store";
}
```

---

### ❌ 问题 3：PWA 无法安装

**症状**：没有安装提示，SW 注册失败

**可能原因**：
1. 不是 HTTPS 环境
2. Service Worker 路径不对
3. manifest.json 缺失

**检查**：DevTools → Application → Manifest

---

### ❌ 问题 4：换设备数据没了

**正常现象**：IndexedDB 是浏览器本地存储，每个浏览器/设备独立
- 解决：做数据导出/导入功能

---

### ❌ 问题 5：502 Bad Gateway

**原因**：Nginx 配置错误
- 运行 `sudo nginx -t` 检查语法

---

## 🎯 部署完成标准

- [x] HTTP 自动跳转 HTTPS
- [x] 所有路由刷新不 404
- [x] PWA Service Worker 激活
- [x] 控制台 0 报错
- [x] 数据读写正常
- [x] Cache-Control 策略正确

---

## 📞 紧急回滚步骤

如果部署出问题：

1. 立即执行：`./rollback.sh`
2. 验证：访问网站确认恢复
3. 本地排查问题后重新部署

---

> 💡 **提示**：首次部署建议在非高峰时段进行，部署后多浏览器验证。建立部署前备份习惯。

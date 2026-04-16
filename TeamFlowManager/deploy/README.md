# 部署文件目录说明

```
TeamFlowManager/
├── docs/
│   └── DEPLOY_NGINX.md          # 完整部署手册
│
├── deploy.sh                    # 一键部署脚本
├── rollback.sh                  # 一键回滚脚本
│
└── deploy/
    └── nginx.conf               # Nginx 配置模板
```

---

## 🚀 快速开始

### 第一步: 服务器初始化

参照 `docs/DEPLOY_NGINX.md` 完成服务器配置：
1. 安装 Nginx
2. 创建站点目录
3. 复制并修改 `deploy/nginx.conf`
4. 配置 HTTPS

### 第二步: 执行部署

```bash
# 给脚本加执行权限
chmod +x deploy.sh

# 执行部署
./deploy.sh <服务器IP> <你的域名>
```

### 第三步: 回滚（如需要）

```bash
chmod +x rollback.sh
./rollback.sh <服务器IP>
```

---

## 📋 文件说明

| 文件 | 说明 |
|------|------|
| `docs/DEPLOY_NGINX.md` | 最详细的部署手册，步步到位，**先看这个** |
| `deploy.sh` | 自动化部署脚本，包含类型检查 → 构建→ 备份→ 上传→ 清理 |
| `rollback.sh` | 回滚到上一个备份版本 |
| `deploy/nginx.conf` | 已经调好的 Nginx 模板，改个域名就能用 |

---

## ⚠️ 重点提醒

1. **先看 `DEPLOY_NGINX.md`** - 踩过的坑都写在里面了
2. **Service Worker 不要缓存** - nginx.conf 已经配好，别乱改
3. **一定要 HTTPS** - PWA 才能正常工作
4. **先备份再部署** - 脚本自动帮你做了

祝部署顺利！ 🎉

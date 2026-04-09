# TeamFlow Manager 详细设计文档（完整版 v2.1）

> **文档版本**：v2.1  
> **更新日期**：2026-04-09  
> **文档用途**：供 AI 编码助手 / 开发团队直接参考实施  
> **项目定位**：面向团队管理者的个人自动化办公 PWA，纯前端实现，无后端依赖，支持可选 AI 增强模块，具备数据封闭安全与多设备启用控制能力

---

## 一、项目概述

### 1.1 产品定义
**TeamFlow Manager** 是一款**本地优先、离线可用、数据封闭安全**的团队管理 PWA 工具，帮助团队管理者 / HR / 小组长完成：
- 人员信息档案管理
- 人员资料（简历、证件、社保）整理归档
- 加班/请假/调休记录与邮件日报确认跟踪
- 智能日历、法定节假日与综合工时计算
- 周报/月报/考勤 Excel 收集与归档
- 绩效与结算报表自动生成
- 发票 OCR 识别与分类整理
- 个人待办任务（含农历周期）
- **可选 AI 增强模块**（智能分类、自然语言查询、数据校验）

### 1.2 目标用户
- **唯一使用者**：团队管理者（小组长 / HR），拥有所有数据的完全读写权限。
- **管理规模**：建议管理 5~200 人团队，历史数据量约 5 万条记录以内。

### 1.3 核心价值
- 将分散在文件夹、Excel、邮件中的重复劳动**结构化、自动化**。
- 数据 100% 存于本地设备，保障隐私与离线可用。
- 拖拽式智能上传，双维度快速归类文件。
- **可选 AI 增强**在不牺牲性能与隐私的前提下提升操作效率。
- **多设备启用控制**与加密备份确保数据封闭安全。

### 1.4 平台与交付形式
- **PWA**：支持桌面/移动端安装，离线访问。
- **浏览器兼容**：现代浏览器（Chrome 90+、Edge 90+、Firefox 88+、Safari 15+）。

---

## 二、技术架构

### 2.1 技术栈清单（修订版）

| 领域 | 选型 | 版本/说明 |
|------|------|----------|
| 框架 | Vue 3 + TypeScript | Composition API + `<script setup>` |
| 构建工具 | Vite | 5.x |
| UI 框架 | Element Plus | 2.x（Vue 3 官方版） |
| 样式 | Tailwind CSS | 3.x |
| 状态管理 | Pinia | 2.x |
| 路由 | Vue Router | 4.x |
| 本地数据库 | Dexie.js（IndexedDB 封装） | 3.x |
| 日期处理 | dayjs | 1.x |
| 农历/节假日 | lunar-typescript | 1.x |
| 日历 UI | vue-cal | 支持 Vue 3 |
| Excel 处理 | SheetJS (xlsx) | 0.20.x |
| PDF 预览 | pdf.js | 3.x |
| OCR 识别 | tesseract.js | 4.x（离线中文） |
| 工具库 | lodash-es | 4.x |
| PWA | vite-plugin-pwa | 最新 |
| 加密（备份） | crypto-js | 4.x（AES 加密） |
| 设备指纹 | @fingerprintjs/fingerprintjs | 3.x |

### 2.2 架构分层

```text
┌─────────────────────────────────────────────────────────────┐
│                    Vue 3 视图层                              │
│   ┌──────────┬──────────┬──────────┬──────────┬─────────┐  │
│   │ 仪表盘   │ 人员管理 │ 文件管理 │ 日历工时 │ 待办    │  │
│   │ 报表中心 │ 发票识别 │ 设置     │ 快速上传 │ AI助手  │  │
│   └──────────┴──────────┴──────────┴──────────┴─────────┘  │
├─────────────────────────────────────────────────────────────┤
│                       Pinia Store                            │
│   - useEmployeeStore    - useDocumentStore                   │
│   - useAttendanceStore  - useTodoStore                       │
│   - useAppSettingsStore - useUploadContextStore              │
│   - useAIModuleStore    (AI功能开关与状态)                   │
├─────────────────────────────────────────────────────────────┤
│                      Service Layer                           │
│   - employeeService    - workHourCalculator                  │
│   - fileService        - reportGenerator                     │
│   - ocrService         - todoScheduler                       │
│   - holidayService     - notificationService                 │
│   - intelligenceService (AI增强：分类/查询/校验)             │
│   - encryptionService  (备份加密/解密)                       │
│   - deviceAuthService  (多设备启用控制)                      │
│   - auditService       (操作日志记录)                        │
├─────────────────────────────────────────────────────────────┤
│                   Data Access Layer (抽象)                    │
│   - BaseRepository<T> 定义统一接口（CRUD）                    │
│   - DexieEmployeeRepo / DexieDocumentRepo / ...  实现        │
├─────────────────────────────────────────────────────────────┤
│                      Dexie.js (IndexedDB)                     │
│   - 结构化数据表     - 文件 Blob 存储（作为二进制字段）        │
├─────────────────────────────────────────────────────────────┤
│                   Web Worker (文件处理)                       │
│   - 大文件读写、Excel 解析、OCR 识别置于 Worker 防阻塞 UI    │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 数据存储设计原则
- **单库方案**：使用 IndexedDB 存储全部数据，包括文件 Blob。
- **表设计**：通过 Dexie.js 定义 Schema，支持索引、复合主键、级联。
- **版本升级**：遵循 Dexie 版本链式升级语法，每次表结构变更增加版本号并提供迁移逻辑。
- **文件存储**：Blob 字段直接存储于 `documents` 表，大文件读写操作放入 Web Worker 以避免主线程阻塞。
- **备份恢复**：提供一键导出为加密 ZIP（含 JSON 数据 + 文件附件），导入前校验数据完整性（哈希校验）。
- **多设备启用控制**：通过设备指纹 + 本地授权种子 + 主密码实现，确保数据仅允许在用户授权的设备上访问。

---

## 三、功能模块详细规格

### 3.1 仪表盘（Dashboard）
**目的**：聚合关键信息，作为应用首页。

**卡片内容**：
| 卡片 | 数据来源 | 交互 |
|------|----------|------|
| 今日待办 | `todos` 表中截止今日且未完成 | 点击跳转待办列表 |
| 本周待收周报 | 上周五至本周四应提交周报的人员（根据团队列表与已上传记录比对，自动排除请假/离职人员） | 点击跳转周报上传页 |
| 待确认加班记录 | `attendance` 表中 `email_confirmed=false` | 点击批量确认 |
| 本月出勤异常 | 考勤记录中缺卡/迟到标记 | 跳转考勤详情 |
| 最近上传文件 | `documents` 表按创建时间倒序 5 条 | 预览或下载 |
| **AI 快捷入口**（若启用） | 自然语言查询框 | 输入“显示张三上个月加班记录”直接跳转结果 |

**优化点**：支持用户自定义显示哪些卡片及顺序。

---

### 3.2 人员信息管理
**表**：`employees`

| 字段名 | 类型 | 必填 | 加密 | 说明 |
|--------|------|------|------|------|
| id | string (UUID) | 是 | 否 | 主键 |
| name | string | 是 | 否 | 姓名 |
| gender | 'male' \| 'female' | 是 | 否 | 性别 |
| phone | string | 是 | 是 | 手机号 |
| id_card | string | 否 | 是 | 身份证号 |
| id_card_hash | string | 否 | 否 | 身份证号 SHA-256 哈希（用于搜索） |
| is_active | boolean | 是 | 否 | 是否在职 |
| entry_date | string (YYYY-MM-DD) | 是 | 否 | 入职时间 |
| leave_date | string | 否 | 否 | 离职时间 |
| domain_account | string | 否 | 否 | 域账号 |
| employee_no | string | 是 | 否 | 工号（唯一） |
| manager_name | string | 否 | 否 | 上级汇报人员姓名 |
| job_level | string | 否 | 否 | 职级 |
| regular_date | string | 否 | 否 | 转正日期 |
| billing_rate | number | 否 | 否 | 结算单价 |
| probation_rate | number | 否 | 否 | 试用期单价 |
| custom_fields | Record<string, any> | 否 | 否 | 自定义扩展字段（JSON） |

**功能**：
- 增删改查、按条件筛选（在职状态、职级等）。
- 支持 Excel 导入/导出（模板包含所有标准字段）。
- 列表支持虚拟滚动，字段显示可配置。
- 身份证号搜索：通过匹配 `id_card_hash` 实现密文搜索。

---

### 3.3 文件管理模块（含智能拖拽上传）

#### 3.3.1 文件元数据表：`documents`
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string | 主键 UUID |
| employee_id | string | 关联 `employees.id` |
| category | enum | 见下方分类枚举 |
| file_name | string | 原始文件名 |
| stored_name | string | 系统重命名后的存储名（规则：`{category}_{date}_{employee}_{seq}.ext`） |
| file_blob | Blob | 文件二进制数据 |
| size | number | 字节数 |
| upload_at | timestamp | 上传时间 |
| tags | string[] | 可选标签 |

**分类枚举（category）**：
- `resume` - 简历
- `social_insurance` - 社保信息
- `id_photo` - 身份证照片/复印件
- `diploma` - 学历证件
- `weekly_report` - 周报
- `monthly_report` - 月报
- `attendance_record` - 考勤打卡记录
- `invoice` - 发票
- `other` - 其他

#### 3.3.2 传统上传
- 选择人员 → 选择分类 → 上传文件（可多选）。
- 支持预览（图片/PDF/Excel 在线预览）。
- 文件读写操作通过 Web Worker 执行，避免 UI 卡顿。

#### 3.3.3 智能拖拽上传面板

**触发入口**：
- 导航栏常驻「快速上传」按钮。
- 仪表盘快捷操作区。

**交互流程**：
1. 点击按钮打开**全屏抽屉（Drawer）**。
2. 左侧显示维度选择器（两个 Tab）：
   - **按人员**：人员列表（带头像缩写、在职状态标识）。
   - **按文件类型**：分类网格（图标 + 文字）。
3. 右侧为**动态拖拽目标区域**：
   - 若左侧选择「人员」Tab 并选中「张三」，右侧显示该人员可接收的文件类型卡片，用户将文件拖拽至「周报」卡片即完成上传。
   - 若左侧选择「文件类型」Tab 并选中「周报」，右侧显示所有在职人员卡片，用户将文件拖拽至「李四」卡片即完成上传。
4. 拖拽时目标卡片高亮，松开后显示上传进度条（支持多文件）。
5. **AI 分类建议**（若启用）：拖拽文件时，系统根据文件名自动预选推荐分类，用户可一键确认。
6. 自动命名与归档：
   - 文件名自动按规则生成，避免覆盖。
   - 若上传 Excel 周报且模板校验不通过，提示但仍允许上传。
7. 上传完成后刷新相关列表，并在右上角提示成功。
8. 面板支持「上传后自动关闭」开关（默认关闭），或在上传队列清空后 3 秒自动收缩为悬浮小窗。

**状态管理**：使用 Pinia 的 `useUploadContextStore` 管理当前激活维度与选中项。

**移动端适配**：移动端禁用拖拽操作，提供「选择文件」按钮 + 手动指定人员/分类的上传方式。

---

### 3.4 加班/请假/调休管理

**表**：`attendance_records`
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string | UUID |
| employee_id | string | 关联人员 |
| type | 'overtime' \| 'leave' \| 'lieu' | 类型 |
| start_datetime | timestamp | 开始时间 |
| end_datetime | timestamp | 结束时间 |
| hours | number | 计算所得时长 |
| email_confirmed | boolean | 邮件是否确认 |
| daily_report_submitted | boolean | 日报是否提交 |
| notes | string | 备注 |

**邮件模板管理**：单独表 `email_templates`，支持变量替换，一键复制内容或生成 `mailto:` 链接。

**功能**：
- 记录增删改查。
- 批量勾选确认状态。
- 工时自动计算（结合规则配置，请假按工作日历扣除）。

---

### 3.5 智能日历与工时计算

#### 3.5.1 日历视图
- 基于 `vue-cal`，显示公历+农历。
- 标注国家法定节假日（通过 `lunar-typescript` 内置数据或调用免费 API 更新）。
- 支持用户添加**自定义节假日/调休日**（存储于 `custom_holidays` 表）。
- 日历上展示每日的请假/加班事件条。

#### 3.5.2 工时计算引擎（核心纯函数）
**输入参数**：
- 年份、月份
- 该月所有法定节假日与调休配置
- 该月员工请假、加班、调休记录
- 工时规则配置（标准日工时、是否大小周等）

**输出**：
- 应出勤天数
- 实际出勤工时
- 加班工时（区分工作日/休息日/节假日）
- 调休抵扣工时

**设计**：封装为 `WorkHourCalculator` 类，策略模式处理大小周规则。

**配置表**：`work_hour_settings`（存于 IndexedDB 的 settings 表）
```json
{
  "daily_hours": 8,
  "work_days": [1,2,3,4,5], // 周一至周五
  "alternate_saturday": false, // 是否大小周（若 true 则需进一步配置）
  "overtime_multiplier": { "workday": 1.5, "weekend": 2.0, "holiday": 3.0 }
}
```

---

### 3.6 周报/月报/考勤收集

**实现方式**：
- 复用文件管理模块，category 分别为 `weekly_report`、`monthly_report`、`attendance_record`。
- 上传时系统自动校验文件名规范（可选：可配置命名规则）。
- 提供**收集看板**：以表格展示每位员工当月/当周是否已提交，支持批量下载。
- 智能标记：若员工请假（当月有 `leave` 记录且覆盖整个周期）或离职，系统自动标记为“无需提交”，并支持管理者手动覆盖。

**Excel 预览**：使用 SheetJS 在 Web Worker 中解析前 10 行数据，前端表格展示。

---

### 3.7 绩效与结算数据生成

**模板管理**：
- **表**：`templates`（存储模板 Base64 及占位符映射）
- 提供「模板管理」页面，用户可上传自定义 Excel 模板，系统解析并保存占位符字段。
- 预置一个默认模板，支持在线编辑占位符映射关系。

**生成流程**：
1. 选择月份与人员范围。
2. 系统从数据库提取出勤工时、单价等数据。
3. 使用 SheetJS 加载模板，替换占位符。
4. 生成预览（前端表格显示关键行）。
5. 下载最终 Excel 文件。

---

### 3.8 发票识别与整理

**表**：`invoices`
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string | UUID |
| image_doc_id | string | 关联 `documents.id`（发票图片） |
| invoice_no | string | 发票号码 |
| amount | number | 金额 |
| category | string | 类型（餐饮、交通、办公等） |
| issue_date | string | 开票日期 |
| verified | boolean | 人工确认标志 |

**OCR 流程**：
- 上传图片（拍照或粘贴），在 Web Worker 中运行 tesseract.js 识别。
- 利用规则提取金额、号码。
- **AI 智能校验**（若启用）：校验发票号码长度、金额格式、税号逻辑，标记可疑项并提供修正建议。
- **模板选择**：提供「模板选择」下拉，如“电子发票-增值税普通发票”，系统按预设区域裁剪后识别，提高准确率。
- 识别结果回填表单，用户校正后保存。
- 支持手动录入模式。

---

### 3.9 个人待办任务

**表**：`todos`
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string | UUID |
| title | string | 标题 |
| description | string | 描述 |
| priority | 1\|2\|3 | 优先级 |
| status | 'pending'\|'done' | 状态 |
| due_date | string | 截止日期 |
| created_at | timestamp | |
| recurrence_id | string | 关联周期规则（可空） |

**表**：`task_recurrences`
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string | |
| type | 'daily'\|'weekly'\|'monthly'\|'lunar' | |
| interval | number | 间隔（如每 2 周） |
| end_condition | {type:'never'\|'date'\|'count', value} | JSON |
| lunar_month | number | 农历月（仅 lunar 类型） |
| lunar_day | number | 农历日（仅 lunar 类型） |

**调度逻辑**：
- 应用启动及每日首次激活时，扫描 `task_recurrences`，计算下一次应生成的日期，若 <= 今日且不存在相同 `recurrence_id` 的未完成任务，则创建新任务。
- 农历计算使用 `lunar-typescript`。

**提醒**：
- 使用 PWA Notification API 在截止时间前 30 分钟提醒。
- 应用内红点 + 仪表盘卡片显示。

---

### 3.10 设置模块

**功能项**：
- **工时规则配置**（见 3.5.2）。
- **文件命名规则**：自定义占位符组合。
- **数据备份与恢复**：
  - 导出加密 ZIP（包含 JSON 数据文件 + 所有文档 Blob），同时计算并存储 SHA-256 哈希值。
  - 导入前先校验哈希，通过后使用临时数据库写入，成功后再替换主数据库；失败则保留原库并提示。
  - 支持设置密码。
- **演示数据**：一键生成示例团队与记录。
- **OCR 偏好**：选择使用本地引擎或第三方 API（预留接口）。
- **通知设置**：是否开启桌面通知、每日提醒时间。
- **AI 模块开关**（详见 3.11）。
- **多设备启用控制**（详见 3.12）。
- **主密码与恢复助记词**（详见 3.12.4）。

---

### 3.11 AI 增强模块（可选功能）

#### 3.11.1 设计原则
- **纯前端运行**：不依赖任何云端 API，所有计算在浏览器内完成。
- **轻量无模型**：不使用大型语言模型，采用规则引擎 + 本地统计算法。
- **用户可控**：在设置中提供开关，默认关闭，用户可按需启用。
- **隐私优先**：AI 分析仅基于本地数据，绝不上传。

#### 3.11.2 功能清单

| 功能 | 描述 | 触发场景 |
|------|------|----------|
| **智能分类建议** | 根据文件名关键词自动推断文档分类，规则可由用户在设置中自定义维护 | 文件上传前 |
| **自然语言查询** | 解析用户输入的自然语言，转换为结构化查询条件，置信度低时提供备选选项 | 仪表盘快捷框 / AI 助手页面 |
| **发票数据校验** | OCR 识别后，自动校验发票号码长度、金额合理性、税号格式，标记可疑项 | 发票录入保存前 |
| **邮件内容辅助** | 根据加班记录自动生成邮件正文草稿，包含姓名、日期、时长，支持一键复制 | 加班记录详情页 |
| **异常提醒** | 分析考勤数据，自动标记缺卡、迟到、加班过长等异常 | 考勤看板、仪表盘 |

#### 3.11.3 技术实现

**核心 Service**：`IntelligenceService`（纯 TypeScript 类）

```typescript
interface ParseResult {
  confidence: number;           // 0-1
  filters: QueryFilter | null;  // 解析出的查询条件
  suggestions?: string[];       // 置信度低时的备选解析文案
}

interface IntelligenceService {
  // 根据文件名推断文档分类（支持自定义规则）
  inferCategoryFromFileName(fileName: string): DocumentCategory | null;
  
  // 解析自然语言查询，返回解析结果（含置信度与备选）
  parseNaturalQuery(input: string): ParseResult;
  
  // 校验发票数据合理性
  validateInvoice(data: InvoiceData): ValidationResult;
  
  // 生成邮件草稿
  generateEmailDraft(record: AttendanceRecord, template: EmailTemplate): string;
  
  // 检测考勤异常
  detectAttendanceAnomalies(records: AttendanceRecord[]): Anomaly[];
  
  // 获取/更新分类规则（存储于 settings）
  getClassificationRules(): Map<string, DocumentCategory>;
  updateClassificationRules(rules: Map<string, DocumentCategory>): void;
}
```

**自然语言解析示例规则**：
- 匹配人员姓名 → 从 `employees` 表模糊搜索。
- 匹配时间范围（“上个月”“本周”“2025年3月”） → 转为日期区间。
- 匹配动作关键词（“加班”“请假”“周报未交”） → 确定查询类型。
- 组合生成 Dexie 查询条件。
- 若存在多个匹配项（如“张三”有重名或动作词歧义），`confidence` 降低，`suggestions` 返回可能的澄清选项。

#### 3.11.4 用户界面
- **设置页**：提供「启用 AI 辅助功能」开关，默认关闭。
- **设置页**：提供「分类关键词管理」界面，允许用户自定义文件名关键词到分类的映射。
- **仪表盘**：若启用，显示自然语言查询输入框。
- **导航菜单**：若启用，增加「AI 助手」菜单项，提供查询历史与功能引导。

---

### 3.12 多设备启用控制与数据安全

#### 3.12.1 背景与目标
用户希望数据仅在**授权的设备**上可访问，防止数据文件被拷贝到其他电脑后直接打开使用，实现**数据封闭安全管理**。

#### 3.12.2 设备指纹与授权机制

**设备指纹生成**：使用 `@fingerprintjs/fingerprintjs` 生成唯一标识 `deviceFingerprint`。

**授权流程**：
1. **首次安装**：生成设备指纹 → 用户设置主密码 → 系统生成 `deviceSeed`（UUID）存入 localStorage → 将 `deviceFingerprint` 与 `deviceSeed` 绑定并加密存储于 IndexedDB 的 `device_auth` 表。
2. **日常启动校验**：
   - 获取当前指纹与本地 `deviceSeed`。
   - 与授权记录比对：
     - 若指纹匹配且 `deviceSeed` 匹配 → 通过。
     - 若指纹不匹配但 `deviceSeed` 存在且匹配 → 视为同一设备的不同浏览器会话（如 Chrome 换 Edge），弹出确认框询问用户是否信任此环境，确认后授权。
     - 若两者均不匹配 → 要求输入主密码以授权新设备。
3. **授权记录存储**：`device_auth` 表可存储多条记录，支持多设备（每台设备一条授权记录）。

#### 3.12.3 数据加密策略

- **密钥派生**：使用 PBKDF2（crypto-js）从主密码派生 AES-256 密钥。
- **加密范围**：
  - `employees` 表中的 `phone`、`id_card` 字段。
  - `id_card_hash` 字段存储身份证号 SHA-256 哈希值，用于搜索（无需解密）。
  - 文件 Blob 可选加密（默认不加密以保障性能，可在设置中开启）。
- **索引处理**：加密字段不建索引，搜索通过哈希字段实现。

#### 3.12.4 主密码恢复机制（助记词）

- **初始化**：用户设置主密码时，系统生成 12 个英文单词的 BIP39 助记词，提示用户**必须抄写保存**。
- **恢复流程**：
  - 在密码输入界面提供「忘记密码？使用助记词恢复」入口。
  - 用户输入助记词，系统验证通过后允许重置主密码。
  - 助记词本身不存储于设备，仅用于恢复场景。
- **安全警告**：明确告知用户助记词是唯一恢复途径，丢失则数据无法找回。

#### 3.12.5 用户体验流程

1. **首次启动**：
   - 欢迎页 → 设置主密码（确认密码） → 显示助记词并强制用户确认已抄写 → 完成初始化。

2. **日常使用**：
   - 打开 PWA → 自动校验设备授权。
   - 若通过，直接进入仪表盘。
   - 若需授权，弹出密码输入框或新设备确认框。

3. **导入备份**：
   - 选择加密备份文件 → 输入主密码解密 → 校验数据哈希 → 通过后恢复。

---

### 3.13 操作日志与审计

**表**：`audit_logs`
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string | UUID |
| action | string | 操作类型（如 `delete_employee`, `export_backup`, `change_settings`） |
| target_type | string | 受影响实体类型 |
| target_id | string | 受影响实体 ID |
| details | string | 操作摘要 JSON |
| timestamp | timestamp | 操作时间 |

**记录规则**：
- 删除人员、删除文件、导出数据、修改工时规则、授权新设备等关键操作自动记录。
- 日志不可手动删除，仅随数据清空而清空。
- 在设置中提供「查看操作日志」入口。

---

## 四、数据模型总览（IndexedDB Schema）

### 4.1 初始版本 Schema（v1）
```typescript
db.version(1).stores({
  employees: 'id, employee_no, is_active, name',
  documents: 'id, employee_id, category, upload_at',
  attendance_records: 'id, employee_id, start_datetime, end_datetime, type',
  todos: 'id, status, due_date, recurrence_id',
  task_recurrences: 'id',
  invoices: 'id, invoice_no',
  email_templates: 'id',
  custom_holidays: 'id, date',
  settings: 'key',
  device_auth: 'id',
  audit_logs: 'id, timestamp'
});
```

### 4.2 版本升级策略（示例）
当需要新增字段或索引时，采用 Dexie 版本链式升级：

```typescript
// v2: 为 employees 增加 id_card_hash 字段
db.version(2).stores({
  employees: 'id, employee_no, is_active, name, id_card_hash'
}).upgrade(tx => {
  return tx.table('employees').toCollection().modify(employee => {
    if (employee.id_card) {
      employee.id_card_hash = sha256(employee.id_card);
    }
  });
});
```

---

## 五、交互与视觉规范

### 5.1 设计风格
- **整体**：企业级稳重风格，以 Element Plus 默认主题为基础，Tailwind 用于间距、颜色微调。
- **配色**：主色 `#409EFF`（Element 蓝），辅助色灰色系。
- **图标**：使用 Element Plus 内置图标集（`@element-plus/icons-vue`）。

### 5.2 布局
- 经典后台管理布局：顶部导航 + 侧边菜单 + 内容区。
- 支持折叠侧边栏。
- 移动端适配：侧边菜单自动转为底部导航栏，拖拽上传降级为按钮选择。

### 5.3 拖拽上传视觉反馈
- 拖拽悬停时：卡片边框变蓝、阴影加深、显示虚线框。
- 拖拽离开时恢复。
- 放置后：显示圆形进度条（若多文件则聚合进度）。

### 5.4 AI 模块界面元素
- 仪表盘查询框：类似搜索引擎输入框，带“✨ AI”角标。
- AI 助手页面：展示查询历史、使用示例、语法帮助。

---

## 六、非功能性需求

### 6.1 性能指标
| 指标 | 目标值 |
|------|--------|
| 首屏加载（含 IndexedDB 初始化） | < 2.5s |
| 人员列表（200 条）滚动帧率 | 50fps+ |
| Excel 解析（1MB 文件，Worker 中） | < 3s |
| OCR 识别（单张发票，Worker 中） | < 5s |
| AI 自然语言解析 | < 100ms |

### 6.2 安全与隐私
- 所有数据存于本地，不上传任何服务器。
- 敏感字段使用 AES-256 加密存储。
- 备份文件支持密码加密与哈希校验。
- 多设备启用控制防止未授权访问。
- 主密码支持助记词恢复。

### 6.3 离线能力
- Service Worker 预缓存核心静态资源。
- 数据读写全部本地，无网络依赖（除第三方节假日 API 可配置离线降级）。

---

## 七、扩展预留设计

### 7.1 数据层抽象
所有数据操作通过 `BaseRepository` 接口，未来可替换为 HTTP 实现。

### 7.2 用户身份预留
`employees` 表中保留 `user_id` 字段，当前版本填充固定值 `'local_user'`。

### 7.3 OCR 策略模式
支持本地 tesseract 与远程 API 切换。

### 7.4 AI 模块扩展接口
`IntelligenceService` 设计为可插拔，未来可接入更强大的本地模型（如 Transformers.js）而不影响现有逻辑。

### 7.5 国际化预留
使用 `vue-i18n` 管理文案，初期仅支持中文，代码中所有用户可见字符串均从语言文件引用。

---

## 八、开发任务拆解与里程碑

| 阶段 | 内容 | 预计产出 | 优先级 |
|------|------|----------|--------|
| **P0 基础框架** | 项目初始化、PWA 配置、Dexie Schema v1、版本升级策略、Pinia、路由布局 | 可运行空壳 | 🔴 最高 |
| **P1 人员档案** | 人员管理 CRUD、导入导出、加密字段处理、哈希搜索 | 人员模块完成 | 🔴 |
| **P2 文件与智能上传** | 文件表实现、Worker 文件读写、传统上传、拖拽面板、移动端降级 | 文件模块 + 核心交互 | 🔴 |
| **P3 考勤与日历** | 加班/请假记录、日历视图、工时计算引擎、规则配置 | 工时计算可用 | 🟡 |
| **P4 报表收集与生成** | 周报/月报/考勤收集看板（含智能跳过）、模板管理、绩效/结算生成 | Excel 生成闭环 | 🟡 |
| **P5 发票与待办** | 发票 OCR（Worker 中）、手动管理、待办任务及周期调度 | 效率工具集成 | 🟢 |
| **P6 安全与多设备控制** | 设备指纹、主密码+助记词、数据加密、备份校验、设备授权流程 | 数据封闭安全 | 🔴 |
| **P7 AI 增强模块** | 智能分类、自然语言查询（含歧义处理）、发票校验、邮件辅助、规则自定义 | AI 功能可选启用 | 🟢 |
| **P8 仪表盘与设置** | 首页卡片聚合、设置整合、演示数据、通知、操作日志查看 | 产品整体完善 | 🟢 |
| **P9 测试与优化** | 性能调优、PWA 安装测试、移动端适配验证、文档补全 | Beta 版本 | 🟡 |

---

## 九、附录

### 9.1 关键 Service 接口定义示例

```typescript
// 工时计算
interface WorkHourCalculator {
  calculateMonthly(year: number, month: number, employeeId: string, 
    customHolidays: Holiday[], settings: WorkHourSettings): MonthlyWorkSummary;
}

// 文件上传
interface FileService {
  uploadWithContext(files: File[], context: { employeeId: string; category: DocumentCategory }): Promise<Document[]>;
  generateStoredName(originalName: string, context: ...): string;
}

// 待办调度
interface TodoScheduler {
  generatePendingTasks(): Promise<void>;
  getNextOccurrence(recurrence: TaskRecurrence, afterDate: Date): Date | null;
}

// AI 智能服务
interface ParseResult { confidence: number; filters: QueryFilter | null; suggestions?: string[]; }
interface IntelligenceService {
  inferCategoryFromFileName(fileName: string): DocumentCategory | null;
  parseNaturalQuery(input: string): ParseResult;
  validateInvoice(data: InvoiceData): ValidationResult;
  generateEmailDraft(record: AttendanceRecord, template: EmailTemplate): string;
  detectAttendanceAnomalies(records: AttendanceRecord[]): Anomaly[];
}

// 加密与设备控制
interface EncryptionService {
  setMasterPassword(password: string): Promise<{ mnemonic: string }>;
  verifyMasterPassword(password: string): Promise<boolean>;
  recoverWithMnemonic(mnemonic: string, newPassword: string): Promise<boolean>;
  encryptData(data: string): string;
  decryptData(encrypted: string): string;
  exportEncryptedBackup(): Promise<Blob>;
  importEncryptedBackup(file: File, password: string): Promise<void>;
}

interface DeviceAuthService {
  initializeDevice(password: string): Promise<{ mnemonic: string }>;
  isDeviceAuthorized(): Promise<boolean>;
  authorizeDevice(password: string): Promise<boolean>;
}
```

### 9.2 第三方依赖与许可证

| 依赖 | 版本 | 许可证 | 用途 |
|------|------|--------|------|
| Vue 3 | 3.x | MIT | 前端框架 |
| Vite | 5.x | MIT | 构建工具 |
| Element Plus | 2.x | MIT | UI 组件库 |
| Tailwind CSS | 3.x | MIT | 样式框架 |
| Pinia | 2.x | MIT | 状态管理 |
| Vue Router | 4.x | MIT | 路由 |
| Dexie.js | 3.x | Apache-2.0 | IndexedDB 封装 |
| dayjs | 1.x | MIT | 日期处理 |
| lunar-typescript | 1.x | MIT | 农历/节假日 |
| vue-cal | latest | MIT | 日历组件 |
| SheetJS (xlsx) | 0.20.x | Apache-2.0 | Excel 处理 |
| pdf.js | 3.x | Apache-2.0 | PDF 预览 |
| tesseract.js | 4.x | Apache-2.0 | OCR 识别 |
| lodash-es | 4.x | MIT | 工具函数 |
| crypto-js | 4.x | MIT | 加密算法 |
| @fingerprintjs/fingerprintjs | 3.x | MIT | 设备指纹 |

### 9.3 文档维护说明
本文档将随项目迭代持续更新。AI 编码时可依据上述模块划分、数据模型、接口定义逐一实现功能，遵循架构分层与命名规范。后续若有需求变更或补充，请以本版为基线进行调整。

**文档结束**
# Web Demo

设置 → 登录 → AI 流式对话 完整演示前端。

## 启动

```bash
# 终端 1：启动后端（项目根目录）
make dev

# 终端 2：启动前端
cd demo/web-demo
npm install
npm run dev
```

浏览器打开 http://localhost:3000

## 使用流程

1. **注册/登录** — 创建账号并登录
2. **系统设置** — 配置 `ai_api_key`、`ai_base_url`、`ai_model` 等
3. **AI 对话** — 选择产品，支持 SSE / WebSocket 两种流式模式

## 配置

| 文件 | 说明 |
|------|------|
| `.env`（项目根目录） | `WEB_JWT_SECRET_KEY`、数据库等后端配置 |
| `demo/web-demo/.env` | 可选，`VITE_WS_BASE_URL` 指定 WebSocket 地址 |

后端 API 通过 Vite 代理到 `http://localhost:8080`。

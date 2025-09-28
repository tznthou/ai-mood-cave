# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 開發指令

### 環境設置
```bash
# 安裝依賴
npm install

# 設定環境變數
cp env.example .env
# 編輯 .env 文件，填入 DeepBricks API key
```

### 常用指令
```bash
# 啟動開發服務器（使用 nodemon 自動重啟）
npm run dev

# 啟動生產服務器
npm start

# 檢查安全漏洞
npm audit

# 修復安全漏洞
npm audit fix
```

## 架構概述

### 前後端分離架構
本專案採用前後端分離設計，保護 API 金鑰安全：
- **前端**：純靜態 HTML/JS，使用模組化設計
- **後端**：Node.js Express 代理服務器，處理所有 AI API 調用
- **安全層**：API 金鑰僅存於後端，前端通過代理 API 通訊

### 關鍵技術決策
1. **AI API 代理**：所有 DeepBricks AI 調用必須經過 `server.js` 代理，確保 API 金鑰安全
2. **模組化前端**：使用 ES6 模組，每個功能獨立文件（state、storage、ai、ui、chart、events）
3. **本地儲存優先**：心情記錄存於 localStorage，24小時自動刪除保護隱私
4. **CORS 配置**：開發時支援 3000/3001 雙端口，生產環境自動偵測

### 模組職責分工

#### 後端模組
- `server.js`：Express 服務器，處理 AI API 代理、安全中間件、靜態文件服務

#### 前端模組 (js/modules/)
- `config.js`：全域配置、API URL 動態偵測、AI 回應模板
- `state.js`：應用狀態管理（當前心情、強度、風格、記錄列表）
- `storage.js`：localStorage 操作、24小時自動清理機制
- `ai.js`：情感分析邏輯、整合 AI 回應與備用模板
- `aiService.js`：與後端 AI 代理 API 通訊
- `ui.js`：UI 更新、動畫、通知、模態框管理
- `chart.js`：Chart.js 圖表繪製、深色模式自適應
- `events.js`：所有用戶互動事件綁定與處理

### API 調用流程
1. 用戶輸入心情 → `events.js` 處理
2. 調用 `ai.js` 分析情感 → 使用 `aiService.js` 
3. `aiService.js` → POST 到 `/api/ai/chat`（後端代理）
4. `server.js` → 轉發到 DeepBricks API（帶 API key）
5. 回應返回 → `ui.js` 顯示結果

### 輸入驗證注意事項
- 中文輸入驗證使用 Unicode 範圍：`[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]`
- 避免使用 `\W` 會誤判中文為非單詞字符
- 參考 `js/modules/events.js` 第 24-27 行的正確實作

### 部署配置
- 環境變數通過 `.env` 管理（不提交到 Git）
- 生產環境會自動偵測域名，無需修改代碼
- 支援 Zeabur、Vercel 等平台部署

## 重要原則

### 安全原則
- **永不**在前端代碼暴露 API 金鑰
- 所有 AI API 調用必須經過後端代理
- 用戶輸入需前後端雙重驗證

### 代碼修改原則（來自 .cursorrules）
- 充分理解現有邏輯後才修改
- 一次只改一個功能點
- 保留所有運作中的邏輯分支
- 修改後立即測試驗證

### UI/UX 原則
- 保持溫暖療癒的視覺風格（參考 Tailwind 設計風格指南）
- 深色模式需同步調整圖表顏色
- 動畫效果使用 CSS transition 保持流暢
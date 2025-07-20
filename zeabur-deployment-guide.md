# Zeabur 部署操作手冊 - AI心情樹洞

## 部署方式選擇

### 方式一：使用 Zeabur Extension（推薦）
- **Zeabur CLI**：命令行工具，適合開發者
- **Zeabur VS Code Extension**：圖形化界面，適合初學者
- **優勢**：更便捷的部署體驗，自動化程度高

### 方式二：直接通過 Zeabur 網站
- 通過 Zeabur 控制台手動部署
- 適合一次性部署或測試

### 重要說明
無論使用哪種方式，**建議先將代碼推送到 GitHub**，這樣可以：
- 享受版本控制的好處
- 啟用自動部署功能
- 方便後續更新和維護

## 1. 前置準備

### 必要條件
- GitHub 帳號
- Zeabur 帳號 (https://zeabur.com)
- 專案程式碼已上傳至 GitHub 倉庫

### 必要檔案
- `package.json`（含相關依賴）
- `server.js`（後端服務）
- `.env.example`（環境變數範例）
- 靜態檔案（HTML、CSS、JS）

## 2. Zeabur 註冊與設定

1. 前往 https://zeabur.com 註冊帳號
2. 登入後點擊「Create Project」建立新專案
3. 為專案命名（例如：「AI心情樹洞」）

## 3. 部署步驟

### 方式一：使用 Zeabur Extension

#### 安裝 Zeabur CLI
```bash
npm install -g @zeabur/cli
```

#### 使用 CLI 部署
```bash
# 登入 Zeabur
zeabur login

# 部署專案
zeabur deploy

# 或指定專案路徑
zeabur deploy ./path/to/your/project
```

#### 使用 VS Code Extension
1. 在 VS Code 中安裝 "Zeabur" 擴展
2. 登入你的 Zeabur 帳號
3. 在專案資料夾中右鍵選擇 "Deploy to Zeabur"
4. 選擇目標專案和設定

### 方式二：傳統網站部署

#### 步驟一：連結 GitHub 倉庫
1. 點擊「Deploy Service」
2. 選擇「GitHub」作為部署來源
3. 授權 Zeabur 存取你的 GitHub
4. 選擇「AI心情樹洞」專案倉庫
5. 選擇要部署的分支（通常是 `main`）

### 步驟二：設定環境變數
1. 部署開始後，點擊左側的「Environment Variables」
2. 點擊「Add Variable」添加以下變數：
   - `DEEPBRICKS_API_KEY`：你的 DeepBricks API 金鑰
   - `NODE_ENV`：`production`
   - `AI_MODEL`：`gpt-4o`（或其他模型）
   - `AI_MAX_TOKENS`：`1000`
   - `AI_TEMPERATURE`：`0.7`

### 步驟三：設定啟動指令
1. 點擊左側的「Settings」
2. 在「Start Command」欄位輸入：`node server.js`
3. 點擊「Save」儲存設定

### 步驟四：設定網域
1. 部署完成後，點擊「Domains」標籤
2. 使用 Zeabur 提供的預設域名，或點擊「Add Domain」添加自訂域名
3. 若使用自訂域名，請依照指示設定 DNS 記錄

## 4. 部署確認

### 檢查部署狀態
1. 點擊「Overview」查看部署狀態
2. 確認狀態為「Running」（綠色圖標）

### 檢查日誌
1. 點擊「Logs」查看運行日誌
2. 確認是否有以下訊息：
   ```
   🚀 AI心情樹洞後端服務器運行在 http://0.0.0.0:8080
   🔒 API安全代理已啟用
   🌐 環境：production
   🔑 API Key 已配置：✅
   ```

### 測試應用
1. 點擊 Zeabur 提供的域名連結
2. 確認網頁正常載入
3. 測試 AI 聊天功能是否正常運作

## 5. 常見問題與解決方案

### 502 Bad Gateway
- **問題原因**：服務未正確啟動或 port 衝突
- **解決方案**：
  1. 確認 `server.js` 使用 `process.env.PORT || 8080`
  2. 確認監聽地址為 `0.0.0.0`
  3. 檢查日誌中的錯誤訊息

### API 金鑰問題
- **問題原因**：環境變數未正確設定
- **解決方案**：
  1. 檢查環境變數設定
  2. 確認日誌中顯示「API Key 已配置：✅」

### 靜態資源無法載入
- **問題原因**：CSP 或 CORS 設定問題
- **解決方案**：
  1. 確認 `server.js` 中的 CSP 設定包含所有需要的資源
  2. 確認 CORS 設定包含你的域名

## 6. 更新與重新部署

### 程式碼更新
1. 將更新推送到 GitHub 倉庫
   ```bash
   git add .
   git commit -m "更新描述"
   git push
   ```

### 手動重新部署
1. 在 Zeabur 專案頁面點擊「Redeploy」按鈕
2. 等待部署完成

### 設定自動部署
1. 點擊「Settings」
2. 開啟「Auto Deploy」選項
3. 每次推送到 GitHub 後，Zeabur 將自動重新部署

## 7. 監控與維護

### 性能監控
1. 定期檢查 Zeabur 提供的性能指標
2. 關注 CPU 和記憶體使用情況

### 日誌監控
1. 定期檢查日誌，關注錯誤訊息
2. 設定日誌警報（若 Zeabur 支援）

## 8. 故障排除步驟

### 步驟一：檢查日誌
1. 點擊 Zeabur 控制台中的「Logs」
2. 查找錯誤訊息，特別是以下類型：
   - `Error: listen EADDRINUSE`（端口衝突）
   - `Error: Cannot find module`（模組缺失）
   - `API key not configured`（API 金鑰問題）

### 步驟二：檢查環境變數
1. 確認所有必要的環境變數已正確設定
2. 檢查變數名稱是否有拼寫錯誤

### 步驟三：檢查網絡設定
1. 確認 Zeabur 提供的域名是否正確
2. 測試應用的健康檢查端點：`/health`

### 步驟四：重新部署
1. 修正任何發現的問題
2. 推送更新到 GitHub
3. 在 Zeabur 中重新部署應用

## 9. 安全性考量

### API 金鑰保護
- 永遠不要在前端代碼中暴露 API 金鑰
- 使用環境變數存儲敏感信息
- 定期輪換 API 金鑰

### 速率限制
- 確認 `server.js` 中的速率限制設定適當
- 監控異常流量模式

### HTTPS 設定
- 確保 Zeabur 提供的域名使用 HTTPS
- 對自訂域名設定 SSL 證書

---

希望這份部署指南能幫助你順利將 AI 心情樹洞部署到 Zeabur！如有任何問題，請參考 Zeabur 官方文檔或聯繫他們的支援團隊。 
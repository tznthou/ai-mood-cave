# 部署指南

## Zeabur 部署設定

### 環境變數配置

在 Zeabur 控制台中，需要設定以下環境變數：

**必要變數：**
```bash
DEEPBRICKS_API_KEY=sk-GSZy4l4Qgl1Kf70JdV6dYW1chPQLd1pr7834pp51qDP99tG0
AI_MODEL=claude-sonnet-4
AI_MAX_TOKENS=1000
AI_TEMPERATURE=0.7
NODE_ENV=production
```

**重要提醒：**
- ⚠️ **不要設定 PORT 變數** - Zeabur 會自動分配端口
- ⚠️ 確保所有變數值沒有多餘空格
- ⚠️ API key 必須完全正確，不能有額外字符

**可選變數：**
```bash
FRONTEND_URL=https://mood-cave-api.zeabur.app
```

### 設定步驟

1. **登入 Zeabur 控制台**
   - 前往你的專案 `mood-cave-api`

2. **設定環境變數**
   - 點擊專案設定
   - 進入「Environment Variables」頁面
   - 逐一新增上述環境變數

3. **重新部署**
   - 設定完成後，Zeabur 會自動重新部署
   - 等待部署完成

### 驗證部署

部署完成後，可以通過以下方式驗證：

1. **健康檢查**
   ```
   https://mood-cave-api.zeabur.app/health
   ```

2. **AI 連線測試**
   - 訪問主頁：`https://mood-cave-api.zeabur.app`
   - 應該會看到 "AI 服務連線成功！" 的通知

### 常見問題與解決方案

**502 錯誤 - "SERVICE_UNAVAILABLE"**
這是最常見的部署問題，解決步驟：

1. **檢查環境變數設定**：
   - 確保沒有設定 `PORT` 變數（Zeabur 自動分配）
   - 確認 `DEEPBRICKS_API_KEY` 沒有多餘字符
   - 設定 `NODE_ENV=production`

2. **重新部署步驟**：
   - 在 Zeabur 控制台刪除錯誤的環境變數
   - 重新設定正確的環境變數
   - 觸發重新部署（可以推送一個小更新到 Git）

3. **檢查部署日誌**：
   - 在 Zeabur 控制台查看「Deployments」
   - 查看啟動日誌是否有錯誤訊息
   - 確認看到 "API Key 已配置：✅" 訊息

**500 錯誤 - "Server configuration error"**
- 檢查 `DEEPBRICKS_API_KEY` 是否正確設定
- 確認 API key 沒有多餘的空格或字符

**AI 連線失敗**
- 檢查 DeepBricks API key 是否有效
- 確認模型名稱 `claude-sonnet-4` 是否正確

**CORS 錯誤**
- 確認 `FRONTEND_URL` 設定正確
- 檢查伺服器的 CORS 設定

### 除錯

如果遇到問題，可以檢查 Zeabur 的部署日誌：
1. 進入專案頁面
2. 點擊「Deployments」
3. 查看最新部署的日誌輸出

修復後的伺服器會輸出更詳細的錯誤資訊來幫助除錯。
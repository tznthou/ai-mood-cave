# Zeabur 502 錯誤解決檢查清單

## 🚨 502 錯誤急救步驟

### 1. 檢查環境變數 (最重要！)

前往 Zeabur 控制台 → 你的專案 → Environment Variables

**必須設定的變數：**
- ✅ `DEEPBRICKS_API_KEY` = `sk-GSZy4l4Qgl1Kf70JdV6dYW1chPQLd1pr7834pp51qDP99tG0`
- ✅ `AI_MODEL` = `claude-sonnet-4`
- ✅ `NODE_ENV` = `production`
- ✅ `AI_MAX_TOKENS` = `1000`
- ✅ `AI_TEMPERATURE` = `0.7`

**不要設定的變數：**
- ❌ 不要設定 `PORT` (Zeabur 自動分配)

### 2. 重新部署

設定完環境變數後：
1. 等待 Zeabur 自動重新部署
2. 或者推送一個小更新到 Git 觸發部署

### 3. 檢查部署日誌

在 Zeabur 控制台查看 Deployments → 最新部署的日誌

**正常啟動應該看到：**
```
 AI心情樹洞後端服務器運行在 http://0.0.0.0:XXXX
 API安全代理已啟用
 環境：production
 API Key 已配置：✅
📡 生產環境診斷：
   - Port: XXXX (來自環境變數)
   - Model: claude-sonnet-4
   - 伺服器啟動完成 ✅
```

### 4. 測試部署

部署成功後測試：
1. 健康檢查：`https://mood-cave-api.zeabur.app/health`
2. 主頁測試：`https://mood-cave-api.zeabur.app`

## 🔧 常見錯誤解決

**如果仍然 502：**
1. 確認所有環境變數正確無誤
2. 刪除任何多餘的環境變數（特別是 PORT）
3. 重新部署
4. 查看日誌中是否有啟動錯誤

**如果 500 錯誤：**
- API key 格式錯誤，重新檢查沒有多餘字符

**如果啟動但 AI 無回應：**
- 檢查 DeepBricks API key 是否有效
- 確認模型名稱正確

## 📞 需要幫助？

如果按照清單仍無法解決，請提供：
1. Zeabur 部署日誌截圖
2. 環境變數設定截圖（遮掩 API key）
3. 錯誤頁面截圖
/**
 * AI心情樹洞 - 後端代理服務器
 * 作者：TznThou
 * 日期：2025-07-13
 * 版本：1.0.0
 * 
 * 安全功能：
 * - API 金鑰保護
 * - 速率限制
 * - CORS 配置
 * - 錯誤處理
 * - 請求日誌
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// 靜態文件服務（優先處理，避免 CORS 影響）
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, path) => {
        // 設置正確的 MIME 類型和 CORS 頭
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
            res.setHeader('Access-Control-Allow-Origin', '*');
        } else if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Access-Control-Allow-Origin', '*');
        }
    }
}));

// 安全中間件（配置 CSP 允許外部資源）
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: [
                "'self'", 
                "'unsafe-inline'",
                "https://cdn.tailwindcss.com",
                "https://cdnjs.cloudflare.com",
                "https://fonts.googleapis.com"
            ],
            scriptSrc: [
                "'self'",
                "https://cdn.tailwindcss.com",
                "https://cdn.jsdelivr.net"
                // 移除 'unsafe-eval' 和 'unsafe-inline' 提升安全性
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com",
                "https://cdnjs.cloudflare.com"
            ],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: [
                "'self'", 
                "http://localhost:3001", 
                "http://localhost:8080",
                "https://mood-cave-api.zeabur.app"
            ]
        }
    }
}));

// CORS 配置（僅對 API 端點生效）
app.use('/api', cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://localhost:8080',
        process.env.FRONTEND_URL,
        'https://ai-mood-cave.zeabur.app'
    ].filter(Boolean),
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// 速率限制
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分鐘
    max: 100, // 每個IP最多100次請求
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});

// AI API 專用限制（更嚴格）
const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1分鐘
    max: 10, // 每分鐘最多10次AI請求
    message: {
        error: 'AI requests limit exceeded, please wait a moment.'
    }
});

app.use(limiter);

// 健康檢查端點
app.get('/health', (req, res) => {
    const apiKeyConfigured = !!process.env.DEEPBRICKS_API_KEY;
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        apiKeyConfigured: apiKeyConfigured,
        environment: process.env.NODE_ENV || 'development'
    });
});

// AI API 代理端點
app.post('/api/ai/chat', aiLimiter, async (req, res) => {
    try {
        const { messages, style = 'warm' } = req.body;

        // 輸入驗證
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                error: 'Invalid request: messages array is required'
            });
        }

        // 驗證 style 參數
        const validStyles = ['warm', 'professional', 'friend', 'mentor', 'meditation'];
        if (!validStyles.includes(style)) {
            return res.status(400).json({
                error: 'Invalid style parameter'
            });
        }

        // 驗證每個訊息的格式和長度
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            if (!message.role || !message.content) {
                return res.status(400).json({
                    error: `Invalid message format at index ${i}`
                });
            }
            
            // 限制訊息長度
            if (message.content.length > 2000) {
                return res.status(400).json({
                    error: `Message content too long at index ${i}`
                });
            }
            
            // 基本內容驗證
            if (typeof message.content !== 'string' || message.content.trim().length === 0) {
                return res.status(400).json({
                    error: `Empty or invalid message content at index ${i}`
                });
            }
        }

        // 檢查 API 金鑰
        const apiKey = process.env.DEEPBRICKS_API_KEY;
        if (!apiKey) {
            console.error('[ERROR] DEEPBRICKS_API_KEY not configured in environment variables');
            console.error('[DEBUG] Available env vars:', Object.keys(process.env).filter(key => key.includes('API')));
            return res.status(500).json({
                error: 'Server configuration error: API key not found',
                details: process.env.NODE_ENV === 'development' ? 'DEEPBRICKS_API_KEY environment variable is missing' : undefined
            });
        }

        // 生成系統提示詞
        const systemPrompt = generateSystemPrompt(style);
        
        // 構建請求
        const requestBody = {
            model: process.env.AI_MODEL || 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            max_tokens: parseInt(process.env.AI_MAX_TOKENS) || 1000,
            temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7
        };

        console.log(`[${new Date().toISOString()}] AI Request - Style: ${style}, Messages: ${messages.length}`);

        // 調用 DeepBricks API
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://api.deepbricks.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody),
            timeout: 30000
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[ERROR] DeepBricks API Error: ${response.status} - ${errorText}`);

            // 嘗試解析錯誤詳情
            let errorDetails = '';
            try {
                const errorData = JSON.parse(errorText);
                errorDetails = errorData.error?.message || errorData.message || errorText;
            } catch {
                errorDetails = errorText;
            }

            // 根據不同的錯誤狀態碼提供具體錯誤資訊
            if (response.status === 401) {
                throw new Error('API key authentication failed - please check your DeepBricks API key');
            } else if (response.status === 429) {
                throw new Error('API rate limit exceeded - please try again later');
            } else if (response.status === 400) {
                throw new Error(`Invalid request to API: ${errorDetails}`);
            } else {
                throw new Error(`API request failed (${response.status}): ${errorDetails}`);
            }
        }

        const data = await response.json();
        
        // 返回 AI 回應
        res.json({
            success: true,
            response: data.choices[0].message.content,
            style: style,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('AI API Error:', error);
        
        // 返回錯誤響應
        res.status(500).json({
            error: 'AI service temporarily unavailable',
            fallback: true,
            timestamp: new Date().toISOString()
        });
    }
});

// 系統提示詞生成函數
function generateSystemPrompt(style) {
    const prompts = {
        warm: `你是一個溫暖、關懷的心理支持助手。請用溫柔、理解的語氣回應用戶，就像一個關心的朋友。回應要：
- 表達同理心和理解
- 提供情感支持和安慰
- 使用溫暖、親切的語言
- 適度使用溫暖的emoji（如💙❤️😊🤗），但每段回應最多2-3個
- 回應長度控制在100-200字
- 避免過於專業的術語`,

        professional: `你是一個專業的心理健康顧問。請從心理學角度分析用戶的情緒狀態，提供專業見解。回應要：
- 使用心理學理論和概念
- 提供建設性的分析和建議
- 保持專業但不冷漠的語調
- 回應長度控制在150-250字
- 適當時建議尋求專業幫助
- 維持專業形象，不使用emoji`,

        friend: `你是用戶的好朋友，用輕鬆、親近的方式與用戶對話。回應要：
- 使用朋友間的自然語調
- 適當使用口語化表達
- 表現出關心和支持
- 自然地使用常見emoji來表達情感（如😊😂🤔💪😇），但要適度
- 回應長度控制在80-150字
- 可以分享相似經歷或感受`,

        mentor: `你是一位人生導師，專注於啟發用戶思考和成長。回應要：
- 提供深刻的洞察和啟發
- 引導用戶自我反思
- 提供建設性的建議和方向
- 在鼓勵時適度使用正面emoji（如💪🌟✨🎯），但要謹慎使用
- 回應長度控制在120-200字
- 鼓勵積極的行動和改變`,

        meditation: `你是一位冥想和正念指導師，幫助用戶找到內心的平靜。回應要：
- 使用平和、寧靜的語調
- 提供冥想或正念練習建議
- 引導用戶關注當下
- 適度使用平靜相關emoji（如🌸🙏✨🌿🕯️），營造寧靜氛圍
- 回應長度控制在100-180字
- 包含具體的放鬆技巧`
    };

    return prompts[style] || prompts.warm;
}

// 錯誤處理中間件
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// 404 處理
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        timestamp: new Date().toISOString()
    });
});

// 啟動服務器
app.listen(PORT, '0.0.0.0', () => {
    console.log(` AI心情樹洞後端服務器運行在 http://0.0.0.0:${PORT}`);
    console.log(` 前端地址：http://localhost:${PORT}`);
    console.log(` API安全代理已啟用`);
    console.log(`[啟動時間] ${new Date().toISOString()}`);
    console.log(` 環境：${process.env.NODE_ENV || 'development'}`);

    // API 配置狀態 (開發和生產都顯示)
    const apiKeyConfigured = !!process.env.DEEPBRICKS_API_KEY;
    console.log(` API Key 已配置：${apiKeyConfigured ? '[OK]' : '[ERROR]'}`);

    // Zeabur 部署診斷資訊 (生產環境)
    if (process.env.NODE_ENV === 'production') {
        console.log(`[生產環境診斷]`);
        console.log(`   - Port: ${PORT} (${process.env.PORT ? '來自環境變數' : '使用預設值 8080'})`);
        console.log(`   - Model: ${process.env.AI_MODEL || 'claude-sonnet-4'}`);
        console.log(`   - 伺服器啟動完成 [OK]`);
    }
});

// 優雅關閉
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信號，正在優雅關閉...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('收到 SIGINT 信號，正在優雅關閉...');
    process.exit(0);
}); 
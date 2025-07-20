/**
 * AI心情樹洞 - AI 服務模組
 * 專門處理與 DeepBricks AI API 的通訊
 * 作者：TznThou
 * 日期：2025-07-13
 * 版本：2.1.0
 */

import { AI_CONFIG } from './config.js';

/**
 * 調用後端 AI API 代理
 * @param {string} userMessage - 用戶訊息
 * @param {string} style - 回應風格
 * @returns {Promise<string>} AI 回應
 */
export async function callDeepBricksAI(userMessage, style = 'warm') {
    try {
        console.log('🤖 開始調用後端 AI API 代理...');
        console.log('📝 用戶訊息:', userMessage);
        console.log('🎨 回應風格:', style);

        const requestBody = {
            messages: [
                { role: 'user', content: userMessage }
            ],
            style: style
        };

        console.log('📤 發送請求到後端代理...');
        console.log('🔗 API URL:', AI_CONFIG.API_URL);

        const response = await fetch(AI_CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('📥 收到後端響應:', response.status, response.statusText);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ 後端錯誤響應:', errorData);
            
            // 檢查是否是速率限制錯誤
            if (response.status === 429) {
                throw new Error('請求過於頻繁，請稍後再試');
            }
            
            throw new Error(errorData.error || `後端請求失敗: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ 後端響應成功');
        console.log('📊 響應數據:', data);
        
        if (data.success && data.response) {
            console.log('🎯 AI 回應內容:', data.response);
            return data.response;
        } else if (data.fallback) {
            // 後端指示應該使用備用回應
            console.log('🔄 後端建議使用備用回應');
            throw new Error('AI service unavailable, using fallback');
        } else {
            console.error('❌ 後端響應格式異常:', data);
            throw new Error('Invalid backend response format');
        }
    } catch (error) {
        console.error('❌ 後端 AI API 調用失敗:', error);
        throw error;
    }
}

/**
 * 測試 AI API 連線
 * @returns {Promise<boolean>} 是否連線成功
 */
export async function testAIConnection() {
    try {
        const testResponse = await callDeepBricksAI(
            "你好，請回應一個簡單的問候。",
            "warm"
        );
        console.log('🔗 後端 AI 連線測試成功:', testResponse);
        return true;
    } catch (error) {
        console.error('❌ 後端 AI 連線測試失敗:', error);
        return false;
    }
}

/**
 * 生成系統提示詞
 * @param {string} style - 回應風格
 * @param {string} mood - 用戶心情
 * @param {number} intensity - 心情強度
 * @returns {string} 系統提示詞
 */
export function generateSystemPrompt(style, mood, intensity) {
    const basePrompt = `你是一個專業且溫暖的心理支持 AI 助手，名叫「心情樹洞」。你的任務是為用戶提供情感支持和陪伴。

用戶當前心情：${mood}
心情強度：${intensity}/10

請遵循以下原則：
1. 保持溫暖、理解和同理心
2. 不提供醫療建議或診斷
3. 鼓勵用戶在需要時尋求專業幫助
4. 回應長度控制在 150-300 字之間
5. 使用繁體中文回應
6. 如果用戶表達自傷或自殺念頭，立即建議尋求專業幫助
7. 回應要自然、溫暖，避免過於機械化`;

    const stylePrompts = {
        warm: `${basePrompt}\n\n回應風格：溫暖陪伴型 - 像一個關心的朋友，提供溫暖的陪伴和理解。使用溫柔的語氣，表達同理心，多用一些溫暖的詞彙和表情符號。`,
        professional: `${basePrompt}\n\n回應風格：專業分析型 - 以心理學角度分析情況，提供專業但易懂的見解。保持客觀但不失溫暖，可以引用一些心理學概念但要用簡單的語言解釋。`,
        friend: `${basePrompt}\n\n回應風格：朋友聊天型 - 像好朋友一樣聊天，輕鬆自然，偶爾使用一些口語化表達。可以分享一些生活感悟，讓對話更有親近感。`,
        mentor: `${basePrompt}\n\n回應風格：導師指導型 - 像人生導師一樣，提供建設性的建議和引導。重點在於啟發和成長，幫助用戶從不同角度看待問題。`,
        meditation: `${basePrompt}\n\n回應風格：冥想靜心型 - 引導用戶進行冥想或放鬆練習，提供平靜和內在平衡的建議。語氣要平和、寧靜，可以包含一些冥想指導。`
    };

    return stylePrompts[style] || stylePrompts.warm;
} 
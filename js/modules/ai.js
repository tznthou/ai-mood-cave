/**
 * AI心情樹洞 - AI 服務模組
 * 作者：TznThou
 * 日期：2025-07-13 (AI 串接)
 * 版本：2.1.0
 */

import { emotionKeywords, responseTemplates } from './config.js';
import { showNotification } from './ui.js';
import { callDeepBricksAI, generateSystemPrompt } from './aiService.js';

/**
 * 生成 AI 回應
 * @param {string} userInput - 用戶輸入
 * @param {string} mood - 選擇的心情
 * @param {number} intensity - 心情強度
 * @param {string} style - 回應風格
 * @returns {Promise<string>} AI 回應
 */
export async function generateAIResponse(userInput, mood, intensity, style) {
    try {
        // 顯示載入狀態
        showNotification('AI 正在思考中...', 'info');

        // 調用真實 AI API（通過後端代理）
        const aiResponse = await callDeepBricksAI(userInput, style);

        // 隱藏載入狀態
        showNotification('AI 回應已生成', 'success');

        return aiResponse;
    } catch (error) {
        console.error('AI 回應生成失敗:', error);
        
        // 顯示錯誤訊息
        showNotification('AI 服務暫時無法使用，將使用備用回應', 'warning');

        // 回退到本地回應模板
        return generateFallbackResponse(userInput, mood, intensity, style);
    }
}

/**
 * 生成備用回應（當 AI API 無法使用時）
 * @param {string} userInput - 用戶輸入
 * @param {string} mood - 選擇的心情
 * @param {number} intensity - 心情強度
 * @param {string} style - 回應風格
 * @returns {string} 備用回應
 */
function generateFallbackResponse(userInput, mood, intensity, style) {
    const templates = responseTemplates[style] || responseTemplates.warm;
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return template.replace('{mood}', mood).replace('{intensity}', intensity);
}

/**
 * 本地情感分析（備用功能）
 * @param {string} text - 要分析的文字
 * @returns {Object} 分析結果
 */
export function analyzeEmotion(text) {
    const emotions = {
        positive: 0,
        negative: 0,
        neutral: 0
    };

    // 簡單的關鍵字匹配
    for (const [category, keywords] of Object.entries(emotionKeywords)) {
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                if (category === 'positive') emotions.positive++;
                else if (category === 'negative') emotions.negative++;
                else emotions.neutral++;
            }
        }
    }

    const total = emotions.positive + emotions.negative + emotions.neutral;
    if (total === 0) return { dominant: 'neutral', confidence: 0.5 };

    const dominant = Object.keys(emotions).reduce((a, b) => 
        emotions[a] > emotions[b] ? a : b
    );

    return {
        dominant,
        confidence: emotions[dominant] / total,
        scores: emotions
    };
} 
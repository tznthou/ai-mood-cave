/**
 * AI心情樹洞 - 應用程式主入口
 * 作者：TznThou
 * 日期：2025-07-12 (重構)
 * 版本：2.0.0
 */

import { loadMoodRecords, startAutoCleanup } from './modules/storage.js';
import { applySettings, initAnimations, showWelcomeGreeting, showNotification } from './modules/ui.js';
import { bindEventListeners, handleFirstVisit } from './modules/events.js';
import { testAIConnection } from './modules/aiService.js';

class MoodTreeApp {
    constructor() {
        this.init();
    }

    /**
     * 初始化應用程式
     */
    init() {
        // 1. 應用設定
        applySettings();
        
        // 2. 載入資料
        loadMoodRecords();
        
        // 3. 綁定事件
        bindEventListeners();
        
        // 4. 啟動背景任務
        startAutoCleanup();

        // 5. 初始化動畫
        initAnimations();

        // 6. 處理首次訪問
        handleFirstVisit();
        
        // 7. 測試 AI 連線
        this.testAIConnection();
        
        // 8. 註冊 Service Worker (為未來 PWA 準備)
        this.registerServiceWorker();
    }
    
    /**
     * 測試 AI 連線
     */
    async testAIConnection() {
        try {
            const isConnected = await testAIConnection();
            if (isConnected) {
                showNotification('AI 服務連線成功！', 'success');
            } else {
                showNotification('AI 服務連線失敗，將使用備用回應', 'warning');
            }
        } catch (error) {
            console.error('AI 連線測試錯誤:', error);
            showNotification('AI 服務測試過程中發生錯誤', 'error');
        }
    }
    
    /**
     * 註冊 Service Worker
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }
}

// DOM 載入完成後啟動應用
document.addEventListener('DOMContentLoaded', () => {
    new MoodTreeApp();
    setTimeout(() => showWelcomeGreeting(), 600);
}); 
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
        this.setupErrorHandling();
        this.init();
    }

    /**
     * 設置全域錯誤處理
     */
    setupErrorHandling() {
        // 處理未捕獲的錯誤
        window.addEventListener('error', (event) => {
            console.error('全域錯誤:', event.error);
            showNotification('應用程式發生未預期錯誤，請重新整理頁面', 'error');
        });

        // 處理未處理的 Promise 拒絕
        window.addEventListener('unhandledrejection', (event) => {
            console.error('未處理的 Promise 拒絕:', event.reason);
            showNotification('操作過程中發生錯誤，請稍後再試', 'error');
            event.preventDefault(); // 阻止控制台顯示錯誤
        });

        // 監聽網路狀態變化
        window.addEventListener('online', () => {
            showNotification('網路連線已恢復', 'success');
        });

        window.addEventListener('offline', () => {
            showNotification('目前處於離線模式，部分功能可能無法使用', 'warning');
        });
    }

    /**
     * 初始化應用程式
     */
    init() {
        try {
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
        } catch (error) {
            console.error('應用程式初始化失敗:', error);
            showNotification('應用程式初始化失敗，請重新整理頁面', 'error');
        }
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
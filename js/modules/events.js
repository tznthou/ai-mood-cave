import { state } from './state.js';
import { saveMoodRecord, clearAllData, saveSettings } from './storage.js';
import { analyzeEmotion, generateAIResponse } from './ai.js';
import { CONSTANTS } from './config.js';
import {
    selectMoodTag, showHelpModal, showRecordsModal, showSettingsModal, hideModal,
    showDisclaimerModal, toggleDarkMode, showNotification, resetMoodSelection,
    displayAIResponse, displaySuggestions, showLoadingIndicator
} from './ui.js';

/**
 * 安全的輸入驗證函數
 * @param {string} text 待驗證的文字
 * @returns {string} 清理後的文字
 */
function sanitizeInput(text) {
    // 移除HTML標籤
    const htmlStripped = text.replace(/<[^>]*>/g, '');

    // 檢查是否包含可疑腳本
    if (/<script|javascript:|data:|vbscript:|onload|onerror/i.test(text)) {
        throw new Error('輸入內容包含不允許的字符');
    }

    // 過濾危險的特殊字符但保留基本標點
    const cleaned = htmlStripped.replace(/[<>]/g, '');

    return cleaned.trim();
}

/**
 * 處理心情提交
 */
async function submitMood() {
    const moodInput = document.getElementById('moodInput');
    let moodText = moodInput.value.trim();

    // 輸入驗證
    if (!moodText) {
        showNotification('請輸入你的心情想法', 'warning');
        return;
    }

    // 安全驗證和清理
    try {
        moodText = sanitizeInput(moodText);
    } catch (error) {
        showNotification('輸入內容不符合安全要求，請重新輸入', 'warning');
        return;
    }

    // 長度限制 (防止過長輸入)
    if (moodText.length > 1000) {
        showNotification('輸入內容過長，請控制在1000字以內', 'warning');
        return;
    }

    // 基本內容驗證 (確保包含中文字符或英文字母)
    if (!/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaffa-zA-Z]/.test(moodText)) {
        showNotification('請輸入有意義的文字內容', 'warning');
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    showLoadingIndicator(true);

    try {
        const emotionAnalysis = analyzeEmotion(moodText);
        const aiResponse = await generateAIResponse(
            moodText, 
            state.currentMood, 
            state.currentIntensity, 
            state.currentStyle
        );
        
        saveMoodRecord({
            timestamp: new Date().toISOString(),
            mood: state.currentMood,
            intensity: state.currentIntensity,
            text: moodText,
            emotion: emotionAnalysis,
            style: state.currentStyle,
            response: aiResponse
        });

        displayAIResponse(aiResponse);
        
        resetMoodSelection();
        state.currentMood = null;
        state.currentIntensity = 5;
        
    } catch (error) {
        console.error('提交心情時發生錯誤:', error);
        showNotification('處理過程中發生錯誤，請稍後再試', 'error');
    } finally {
        submitBtn.disabled = false;
        showLoadingIndicator(false);
    }
}

/**
 * 處理使用者回饋
 * @param {string} feedback 
 */
function handleFeedback(feedback) {
    console.log('用戶反饋:', feedback);
    const message = feedback === 'helpful' ? '謝謝你的反饋！' : '我們會繼續改進回應品質';
    showNotification(message, 'info');
}

/**
 * 處理首次訪問
 */
export function handleFirstVisit() {
    const isFirstTime = !localStorage.getItem('hasVisited');
    if (isFirstTime) {
        setTimeout(() => {
            showDisclaimerModal(true);
        }, 500);
    }
}

/**
 * 綁定所有事件監聽器
 */
export function bindEventListeners() {
    // 情緒標籤選擇
    document.querySelectorAll('.mood-tag').forEach(tag => {
        tag.addEventListener('click', (e) => selectMoodTag(e.currentTarget, e));
    });

    // 心情強度滑桿
    const intensitySlider = document.getElementById('moodIntensity');
    const intensityValue = document.getElementById('intensityValue');
    intensitySlider.addEventListener('input', (e) => {
        state.currentIntensity = parseInt(e.target.value);
        intensityValue.textContent = state.currentIntensity;
    });

    // 回應風格選擇
    document.getElementById('responseStyle').addEventListener('change', (e) => {
        state.currentStyle = e.target.value;
    });

    // 提交按鈕
    document.getElementById('submitBtn').addEventListener('click', submitMood);

    // 導航按鈕
    document.getElementById('helpBtn').addEventListener('click', showHelpModal);
    document.getElementById('recordsBtn').addEventListener('click', showRecordsModal);
    document.getElementById('settingsBtn').addEventListener('click', showSettingsModal);
    document.getElementById('disclaimerBtn').addEventListener('click', (e) => {
        e.preventDefault();
        showDisclaimerModal();
    });

    // 彈出視窗關閉按鈕
    document.getElementById('closeRecordsModal').addEventListener('click', () => hideModal('recordsModal'));
    document.getElementById('closeSettingsModal').addEventListener('click', () => hideModal('settingsModal'));
    document.getElementById('closeDisclaimerModal').addEventListener('click', () => hideModal('disclaimerModal'));
    document.getElementById('closeHelpModal').addEventListener('click', () => hideModal('helpModal'));

    // 聲明確認按鈕
    document.getElementById('iUnderstandDisclaimerBtn').addEventListener('click', () => {
        localStorage.setItem('hasVisited', 'true');
        hideModal('disclaimerModal');
        showNotification('歡迎使用！很高興見到你', 'info');
    });

    // 設定頁面
    document.getElementById('darkModeToggle').addEventListener('change', (e) => {
        toggleDarkMode(e.target.checked);
        saveSettings(); // 保存設定
    });

    document.getElementById('clearDataBtn').addEventListener('click', () => {
        if (clearAllData()) {
            showNotification('除了外觀設定，所有數據已清除', 'success');
            hideModal('settingsModal');
        }
    });

    // 設定選項變更時自動儲存
    document.getElementById('autoDelete').addEventListener('change', saveSettings);
    document.getElementById('localOnly').addEventListener('change', saveSettings);
    document.getElementById('dailyReminder').addEventListener('change', saveSettings);

    // 數據保留期限變更時提供即時反饋
    document.getElementById('dataRetentionDays').addEventListener('change', (e) => {
        const retentionOptions = {
            '1': '24小時',
            '7': '一週',
            '30': '一個月',
            '90': '三個月'
        };
        const selectedValue = e.target.value;
        const displayText = retentionOptions[selectedValue] || `${selectedValue}天`;
        showNotification(`數據保留期限已設為 ${displayText}`, 'info');
        saveSettings();
    });

    // 回應評價
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('feedback-btn')) {
            handleFeedback(e.target.dataset.feedback);
        }
    });

    // 鍵盤快捷鍵 (Ctrl + Enter 提交)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            // 防止在文本區換行
            if (document.activeElement === document.getElementById('moodInput')) {
                e.preventDefault();
            }
            submitMood();
        }
    });
} 
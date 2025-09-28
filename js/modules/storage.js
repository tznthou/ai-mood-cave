import { state } from './state.js';

/**
 * 從 localStorage 獲取設定
 * @returns {object} 設定對象
 */
export function getSettings() {
    try {
        const stored = localStorage.getItem('appSettings');
        const defaultSettings = {
            autoDelete: true,
            localOnly: true,
            dailyReminder: false,
            darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
            dataRetentionDays: 1 // 預設24小時（1天）保持向下相容
        };

        if (!stored) return defaultSettings;

        const parsedSettings = JSON.parse(stored);
        // 驗證並修正 dataRetentionDays
        if (parsedSettings.dataRetentionDays !== undefined) {
            parsedSettings.dataRetentionDays = validateRetentionDays(parsedSettings.dataRetentionDays);
        }

        return { ...defaultSettings, ...parsedSettings };
    } catch (error) {
        console.error('載入設定時發生錯誤:', error);
        return {
            autoDelete: true,
            localOnly: true,
            dailyReminder: false,
            darkMode: false,
            dataRetentionDays: 1 // 預設24小時（1天）
        };
    }
}

/**
 * 驗證保留天數的有效性
 * @param {any} value - 要驗證的值
 * @returns {number} 有效的保留天數（1-365天）
 */
function validateRetentionDays(value) {
    const days = parseInt(value);
    return isNaN(days) ? 1 : Math.max(1, Math.min(365, days));
}

/**
 * 保存設定到 localStorage
 */
export function saveSettings() {
    const retentionSelect = document.getElementById('dataRetentionDays');
    const settings = {
        autoDelete: document.getElementById('autoDelete').checked,
        localOnly: document.getElementById('localOnly').checked,
        dailyReminder: document.getElementById('dailyReminder').checked,
        darkMode: document.getElementById('darkModeToggle').checked,
        dataRetentionDays: retentionSelect ? validateRetentionDays(retentionSelect.value) : 1 // 預設1天
    };

    try {
        localStorage.setItem('appSettings', JSON.stringify(settings));
        console.log('設定已保存:', settings);
    } catch (error) {
        console.error('保存設定時發生錯誤:', error);
        if (error.name === 'QuotaExceededError') {
            console.warn('localStorage 容量不足');
        }
    }
}


/**
 * 加載心情記錄
 */
export function loadMoodRecords() {
    try {
        const stored = localStorage.getItem('moodRecords');
        state.moodRecords = stored ? JSON.parse(stored) : [];
        
        // 清理過期記錄（24小時自動刪除）
        if (getSettings().autoDelete) {
            cleanupExpiredRecords();
        }
    } catch (error) {
        console.error('載入心情記錄時發生錯誤:', error);
        state.moodRecords = [];
    }
}

/**
 * 保存單條心情記錄
 * @param {object} record 
 */
export function saveMoodRecord(record) {
    // 添加唯一ID
    record.id = Date.now().toString();
    
    // 將新記錄添加到最前面
    state.moodRecords.unshift(record);
    
    // 限制記錄數量（最多保存100條）
    if (state.moodRecords.length > 100) {
        state.moodRecords = state.moodRecords.slice(0, 100);
    }
    
    // 保存到本地存儲
    localStorage.setItem('moodRecords', JSON.stringify(state.moodRecords));
    
    console.log('心情記錄已保存:', record);
}

/**
 * 檢查日期字串是否有效
 * @param {any} dateString - 要檢查的日期字串
 * @returns {boolean} 是否為有效日期
 */
function isValidDate(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && dateString.toString().trim() !== '';
}

/**
 * 清理過期記錄（根據用戶設定的保留天數）
 */
export function cleanupExpiredRecords() {
    const settings = getSettings();
    const retentionDays = validateRetentionDays(settings.dataRetentionDays || 1); // 使用驗證函數

    const now = new Date();
    const cutoffTime = retentionDays * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(now.getTime() - cutoffTime);

    // 檢查 cutoffDate 是否有效
    if (!isValidDate(cutoffDate.toISOString())) {
        console.error('清理記錄時日期計算錯誤');
        return;
    }

    const originalCount = state.moodRecords.length;
    state.moodRecords = state.moodRecords.filter(record => {
        // 驗證記錄結構
        if (!record || !record.timestamp) {
            console.warn('發現無效記錄，已移除:', record);
            return false;
        }

        const recordDate = new Date(record.timestamp);

        // 檢查記錄日期有效性
        if (!isValidDate(record.timestamp)) {
            console.warn('發現無效時間戳記錄，已移除:', record.timestamp);
            return false;
        }

        return recordDate > cutoffDate;
    });

    if (state.moodRecords.length < originalCount) {
        try {
            localStorage.setItem('moodRecords', JSON.stringify(state.moodRecords));
            console.log(`已清理 ${originalCount - state.moodRecords.length} 條過期記錄（保留 ${retentionDays} 天）。`);
        } catch (error) {
            console.error('清理記錄時發生錯誤:', error);
            if (error.name === 'QuotaExceededError') {
                console.warn('localStorage 容量不足，嘗試清理更多記錄');
                // 如果容量不足，保留最近的50條記錄
                state.moodRecords = state.moodRecords.slice(0, 50);
                try {
                    localStorage.setItem('moodRecords', JSON.stringify(state.moodRecords));
                } catch (secondError) {
                    console.error('緊急清理也失敗:', secondError);
                }
            }
        }
    }
}

// 存儲清理間隔ID，避免記憶體洩漏
let cleanupInterval = null;

/**
 * 啟動自動清理任務
 */
export function startAutoCleanup() {
    // 清除之前的間隔（如果存在）
    if (cleanupInterval) {
        clearInterval(cleanupInterval);
    }

    // 每小時檢查一次過期記錄
    cleanupInterval = setInterval(() => {
        if (getSettings().autoDelete) {
            cleanupExpiredRecords();
        }
    }, 60 * 60 * 1000);
}

/**
 * 停止自動清理機制
 */
export function stopAutoCleanup() {
    if (cleanupInterval) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
    }
}

/**
 * 清除所有應用數據
 * @returns {boolean} 是否成功清除
 */
export function clearAllData() {
    if (confirm('確定要清除所有數據嗎？此操作無法復原。')) {
        // 保留深色模式設定
        const darkModeSetting = getSettings().darkMode;
        
        localStorage.removeItem('moodRecords');
        localStorage.removeItem('appSettings');
        
        // 重新設定深色模式
        let settings = getSettings();
        settings.darkMode = darkModeSetting;
        localStorage.setItem('appSettings', JSON.stringify(settings));

        state.moodRecords = [];
        return true;
    }
    return false;
} 
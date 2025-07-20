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
            darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        };
        return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch (error) {
        console.error('載入設定時發生錯誤:', error);
        return {
            autoDelete: true,
            localOnly: true,
            dailyReminder: false,
            darkMode: false
        };
    }
}

/**
 * 保存設定到 localStorage
 */
export function saveSettings() {
    const settings = {
        autoDelete: document.getElementById('autoDelete').checked,
        localOnly: document.getElementById('localOnly').checked,
        dailyReminder: document.getElementById('dailyReminder').checked,
        darkMode: document.getElementById('darkModeToggle').checked
    };
    
    localStorage.setItem('appSettings', JSON.stringify(settings));
    console.log('設定已保存:', settings);
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
 * 清理過期記錄 (24小時前)
 */
export function cleanupExpiredRecords() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const originalCount = state.moodRecords.length;
    state.moodRecords = state.moodRecords.filter(record => {
        const recordDate = new Date(record.timestamp);
        return recordDate > oneDayAgo;
    });
    
    if (state.moodRecords.length < originalCount) {
        localStorage.setItem('moodRecords', JSON.stringify(state.moodRecords));
        console.log(`已清理 ${originalCount - state.moodRecords.length} 條過期記錄。`);
    }
}

/**
 * 啟動自動清理任務
 */
export function startAutoCleanup() {
    // 每小時檢查一次過期記錄
    setInterval(() => {
        if (getSettings().autoDelete) {
            cleanupExpiredRecords();
        }
    }, 60 * 60 * 1000);
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
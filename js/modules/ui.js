import { state } from './state.js';
import { styleNames } from './config.js';
import { drawMoodChart } from './chart.js';
import { getSettings, saveSettings } from './storage.js';

/**
 * 根據 ID 隱藏彈出視窗
 * @param {string} modalId 
 */
export function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

/**
 * 根據 ID 顯示彈出視窗
 * @param {string} modalId 
 */
function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

/**
 * 處理使用者選擇心情標籤的 UI
 * @param {HTMLElement} tag 
 * @param {MouseEvent} [event]
 */
export function selectMoodTag(tag, event) {
    // 移除其他標籤的選中狀態
    document.querySelectorAll('.mood-tag').forEach(t => {
        t.classList.remove('active');
    });
    // 選中當前標籤
    tag.classList.add('active');
    state.currentMood = tag.dataset.mood;

    // 波紋動畫
    if (event) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const rect = tag.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (event.offsetX - size / 2) + 'px';
        ripple.style.top = (event.offsetY - size / 2) + 'px';
        tag.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
    }
}

/**
 * 重設心情選擇區的 UI
 */
export function resetMoodSelection() {
    document.querySelectorAll('.mood-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    document.getElementById('moodInput').value = '';
    document.getElementById('moodIntensity').value = 5;
    document.getElementById('intensityValue').textContent = '5';
}

/**
 * 顯示 AI 回應
 * @param {string} response 
 */
export function displayAIResponse(response) {
    const aiResponseArea = document.getElementById('aiResponseArea');
    const aiResponse = document.getElementById('aiResponse');
    
    aiResponse.innerHTML = response;
    aiResponseArea.classList.remove('hidden');
    
    // 觸發動畫
    const card = aiResponseArea.querySelector('.card-appear');
    if (card) {
        setTimeout(() => {
            card.classList.add('active');
        }, 100);
    }
    
    // 平滑滾動到回應區域
    setTimeout(() => {
        aiResponseArea.scrollIntoView({ behavior: 'smooth' });
    }, 300);
}

/**
 * 顯示個人化建議
 * @param {Array<object>} suggestions 
 */
export function displaySuggestions(suggestions) {
    const suggestionsArea = document.getElementById('suggestionsArea');
    const suggestionsContainer = document.getElementById('suggestions');
    
    suggestionsContainer.innerHTML = '';
    
    suggestions.forEach(suggestion => {
        const suggestionElement = document.createElement('div');
        suggestionElement.className = 'flex items-center p-4 bg-stone-50 dark:bg-stone-800/60 border-2 border-stone-200 dark:border-stone-700 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700/80 hover:border-stone-300 dark:hover:border-stone-600 transition-all cursor-pointer';
        suggestionElement.innerHTML = `
            <span class="text-2xl mr-4">${suggestion.icon}</span>
            <span class="text-stone-700 dark:text-stone-300 font-medium">${suggestion.text}</span>
        `;
        suggestionsContainer.appendChild(suggestionElement);
    });
    
    suggestionsArea.classList.remove('hidden');
    
    // 觸發動畫
    const card = suggestionsArea.querySelector('.card-appear');
    if (card) {
        setTimeout(() => {
            card.classList.add('active');
        }, 200);
    }
}


/**
 * 顯示法律聲明彈出視窗
 * @param {boolean} isFirstVisit 
 */
export function showDisclaimerModal(isFirstVisit = false) {
    const closeButton = document.getElementById('closeDisclaimerModal');
    
    if (isFirstVisit) {
        closeButton.classList.add('hidden');
    } else {
        closeButton.classList.remove('hidden');
    }
    
    showModal('disclaimerModal');
}

/**
 * 顯示幫助彈出視窗 (動態載入內容)
 */
export async function showHelpModal() {
    const content = document.getElementById('helpContent');
    
    if (content.innerHTML.trim().includes('動態載入')) {
        try {
            const response = await fetch('USER_MANUAL.md');
            if (!response.ok) {
                throw new Error('無法載入使用說明');
            }
            const markdown = await response.text();
            content.innerHTML = marked.parse(markdown);
        } catch (error) {
            console.error('載入使用說明時發生錯誤:', error);
            content.innerHTML = '<p class="text-red-500">抱歉，載入說明時發生錯誤。</p>';
        }
    }
    
    showModal('helpModal');
}

/**
 * 根據風格代碼獲取風格名稱
 * @param {string} style 
 * @returns {string}
 */
function getStyleName(style) {
    return styleNames[style] || '未知';
}

/**
 * 產生心情記錄的 HTML
 * @returns {string}
 */
function generateRecordsHTML() {
    // 從最近的記錄開始顯示
    return state.moodRecords.map(record => {
        const date = new Date(record.timestamp);
        const formattedDate = date.toLocaleDateString('zh-TW', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const emotionColor = {
            positive: 'text-green-600 dark:text-green-400',
            negative: 'text-red-600 dark:text-red-400',
            neutral: 'text-gray-600 dark:text-gray-400'
        };
        
        return `
            <div class="border-l-4 border-blue-500 pl-4 py-3 mb-4 bg-gray-50 dark:bg-stone-700/30 rounded-r-lg">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-sm text-gray-500 dark:text-gray-400">${formattedDate}</span>
                    <span class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">
                        ${record.mood || '未分類'}
                    </span>
                </div>
                <p class="text-gray-700 dark:text-stone-300 mb-2">${record.text}</p>
                <div class="flex items-center space-x-4 text-sm">
                    <span class="${emotionColor[record.emotion?.primary] || 'text-gray-600 dark:text-gray-400'}">
                        情緒: ${record.emotion?.primary || '未知'}
                    </span>
                    <span class="text-gray-500 dark:text-gray-400">
                        強度: ${record.intensity}/10
                    </span>
                    <span class="text-gray-500 dark:text-gray-400">
                        風格: ${getStyleName(record.style)}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}


/**
 * 顯示心情記錄彈出視窗
 */
export function showRecordsModal() {
    const content = document.getElementById('recordsContent');
    
    if (state.moodRecords.length === 0) {
        content.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-chart-line text-gray-300 dark:text-gray-600 text-4xl mb-4"></i>
                <p class="text-gray-500 dark:text-gray-400">還沒有心情記錄呢！</p>
                <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">開始分享你的心情，就可以看到心情趨勢圖囉</p>
            </div>
        `;
        document.getElementById('moodChartCanvas').style.display = 'none';
    } else {
        document.getElementById('moodChartCanvas').style.display = 'block';
        drawMoodChart();
        content.innerHTML = generateRecordsHTML();
    }
    
    showModal('recordsModal');
}

/**
 * 顯示設定彈出視窗
 */
export function showSettingsModal() {
    // 載入當前設定到 UI
    const settings = getSettings();
    document.getElementById('autoDelete').checked = settings.autoDelete;
    document.getElementById('localOnly').checked = settings.localOnly;
    document.getElementById('dailyReminder').checked = settings.dailyReminder;
    document.getElementById('darkModeToggle').checked = settings.darkMode;
    
    showModal('settingsModal');
}

/**
 * 切換深色模式
 * @param {boolean} isDark 
 */
export function toggleDarkMode(isDark) {
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // 重繪圖表以適應新主題
    if (!document.getElementById('recordsModal').classList.contains('hidden')) {
        drawMoodChart();
    }
}


/**
 * 載入設定到 UI
 */
export function applySettings() {
    const settings = getSettings();
    document.getElementById('autoDelete').checked = settings.autoDelete;
    document.getElementById('localOnly').checked = settings.localOnly;
    document.getElementById('dailyReminder').checked = settings.dailyReminder;
    document.getElementById('darkModeToggle').checked = settings.darkMode;

    toggleDarkMode(settings.darkMode);
}

/**
 * 顯示通知訊息
 * @param {string} message 
 * @param {'info'|'success'|'warning'|'error'} type 
 */
export function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white'
    };
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all transform translate-x-full ${colors[type]}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 顯示動畫
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // 自動隱藏
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * 顯示/隱藏載入中指示器
 * @param {boolean} show 
 */
export function showLoadingIndicator(show) {
    document.getElementById('loadingIndicator').classList.toggle('hidden', !show);
}

/**
 * 初始化頁面動畫
 */
export function initAnimations() {
    // 確保所有卡片都是可見的
    document.querySelectorAll('.card-appear').forEach(card => {
        card.classList.add('active');
    });

    // 可選：如果需要動畫效果，可以使用 Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1
    });

    // 如果有新的卡片動態添加，可以觀察它們
    document.querySelectorAll('.card-appear:not(.active)').forEach(card => {
        observer.observe(card);
    });
} 

/**
 * 隨機顯示溫暖問候語（從 greeting.json 載入）
 */
export async function showWelcomeGreeting() {
    let greetings = [];
    try {
        const res = await fetch('js/modules/greeting.json');
        if (res.ok) {
            greetings = await res.json();
        } else {
            throw new Error('載入問候語失敗');
        }
    } catch (e) {
        // fallback: 若載入失敗，顯示預設訊息
        greetings = ['嗨，今天的你還好嗎？記得，你的感受很重要。'];
    }
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    let el = document.getElementById('welcomeGreeting');
    if (!el) {
        el = document.createElement('div');
        el.id = 'welcomeGreeting';
        el.className = 'fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/90 dark:bg-stone-800/90 text-stone-700 dark:text-stone-100 px-6 py-3 rounded-2xl shadow-lg text-lg font-medium opacity-0 pointer-events-none transition-all duration-700';
        document.body.appendChild(el);
    }
    el.textContent = greeting;
    el.style.opacity = '0';
    el.style.transform = 'translate(-50%, -24px)';
    setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translate(-50%, 0)';
    }, 100);
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translate(-50%, -24px)';
    }, 4200);
} 
# AI心情樹洞 - Tailwind 設計風格指南

## 設計理念

**核心概念：** 溫暖、安全、包容、平靜  
**情感目標：** 讓用戶感受到被理解、被接納、被保護  
**視覺語言：** 柔和圓潤、自然有機、溫暖親近

## 色彩系統

### 主色調 - 溫暖中性色
```css
/* 主背景 - 溫暖米白 */
bg-stone-50, bg-warm-gray-50

/* 卡片背景 - 柔和白色 */
bg-white, bg-stone-25

/* 文字主色 - 溫暖深灰 */
text-stone-700, text-gray-800
```

### 輔助色彩 - 療癒色系
```css
/* 寧靜藍 - 平靜放鬆 */
bg-blue-100, text-blue-700, border-blue-200

/* 溫暖綠 - 成長希望 */
bg-emerald-100, text-emerald-700, border-emerald-200

/* 舒緩紫 - 心靈安撫 */
bg-purple-100, text-purple-700, border-purple-200

/* 柔和粉 - 溫暖關懷 */
bg-rose-100, text-rose-700, border-rose-200
```

### 情緒狀態色彩
```css
/* 快樂 - 陽光黃 */
bg-amber-100, text-amber-800

/* 平靜 - 天空藍 */
bg-sky-100, text-sky-800

/* 焦慮 - 溫和橙 */
bg-orange-100, text-orange-800

/* 憂鬱 - 深度藍 */
bg-indigo-100, text-indigo-800

/* 憤怒 - 柔和紅 */
bg-red-100, text-red-800
```

## 字體系統

### 字體選擇
```css
/* 主要字體 - 溫暖易讀 */
font-family: 'Inter', 'Noto Sans TC', sans-serif;

/* 標題 */
text-2xl, text-3xl, font-medium, text-stone-800

/* 內文 */
text-base, text-lg, font-normal, text-stone-700, leading-relaxed

/* 小字 */
text-sm, text-stone-600, leading-normal
```

### 字重與間距
```css
/* 標題 */
font-medium (500)

/* 內文 */
font-normal (400)

/* 重點文字 */
font-semibold (600)

/* 行高 */
leading-relaxed (1.625)
leading-loose (2)
```

## 間距系統

### 布局間距
```css
/* 大區塊間距 */
space-y-8, space-y-12

/* 中等間距 */
space-y-4, space-y-6

/* 小間距 */
space-y-2, space-y-3

/* 內邊距 */
p-6, p-8, px-6, py-4
```

### 響應式間距
```css
/* 手機 */
p-4, space-y-4

/* 平板 */
md:p-6, md:space-y-6

/* 桌面 */
lg:p-8, lg:space-y-8
```

## 圓角與陰影

### 圓角設計
```css
/* 卡片圓角 */
rounded-2xl, rounded-3xl

/* 按鈕圓角 */
rounded-xl, rounded-full

/* 輸入框圓角 */
rounded-lg
```

### 陰影效果
```css
/* 輕柔陰影 */
shadow-sm, shadow-md

/* 浮起效果 */
shadow-lg, shadow-xl

/* 互動陰影 */
hover:shadow-lg, focus:shadow-md
```

## 組件設計

### 主要輸入區域
```css
/* 文字輸入框 */
.emotion-input {
  @apply w-full p-6 text-lg leading-relaxed;
  @apply bg-white border-2 border-stone-200;
  @apply rounded-2xl shadow-sm;
  @apply focus:border-blue-300 focus:ring-4 focus:ring-blue-100;
  @apply placeholder-stone-400;
  @apply transition-all duration-300;
}
```

### 情緒按鈕
```css
/* 情緒選擇器 */
.emotion-button {
  @apply px-4 py-3 rounded-full text-sm font-medium;
  @apply border-2 transition-all duration-200;
  @apply hover:scale-105 active:scale-95;
}

.emotion-happy {
  @apply bg-amber-100 border-amber-200 text-amber-800;
  @apply hover:bg-amber-200 hover:border-amber-300;
}

.emotion-calm {
  @apply bg-sky-100 border-sky-200 text-sky-800;
  @apply hover:bg-sky-200 hover:border-sky-300;
}
```

### AI 回應區域
```css
/* AI 回應卡片 */
.ai-response {
  @apply bg-gradient-to-br from-blue-50 to-purple-50;
  @apply border border-blue-100 rounded-2xl p-6;
  @apply shadow-md;
}

/* AI 頭像 */
.ai-avatar {
  @apply w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400;
  @apply rounded-full flex items-center justify-center;
  @apply text-white text-sm font-medium;
}
```

### 按鈕設計
```css
/* 主要按鈕 */
.btn-primary {
  @apply px-6 py-3 bg-blue-500 hover:bg-blue-600;
  @apply text-white font-medium rounded-xl;
  @apply shadow-md hover:shadow-lg;
  @apply transition-all duration-200;
  @apply hover:scale-105 active:scale-95;
}

/* 次要按鈕 */
.btn-secondary {
  @apply px-6 py-3 bg-stone-100 hover:bg-stone-200;
  @apply text-stone-700 font-medium rounded-xl;
  @apply border border-stone-200;
  @apply transition-all duration-200;
}

/* 危險按鈕 */
.btn-danger {
  @apply px-6 py-3 bg-rose-500 hover:bg-rose-600;
  @apply text-white font-medium rounded-xl;
  @apply shadow-md hover:shadow-lg;
}
```

## 布局系統

### 主容器
```css
/* 主要容器 */
.main-container {
  @apply min-h-screen bg-gradient-to-br from-stone-50 to-blue-50;
  @apply flex flex-col items-center;
  @apply px-4 py-8;
}

/* 內容卡片 */
.content-card {
  @apply w-full max-w-2xl bg-white;
  @apply rounded-3xl shadow-xl;
  @apply p-8;
}
```

### 響應式設計
```css
/* 手機優先 */
.responsive-layout {
  @apply w-full px-4;
  @apply md:px-6 md:max-w-3xl;
  @apply lg:px-8 lg:max-w-4xl;
  @apply xl:max-w-5xl;
}
```

## 動畫效果

### 轉場動畫
```css
/* 頁面轉場 */
.page-transition {
  @apply transition-all duration-500 ease-in-out;
}

/* 卡片出現 */
.card-appear {
  @apply transform transition-all duration-300;
  @apply translate-y-4 opacity-0;
}

.card-appear.active {
  @apply translate-y-0 opacity-100;
}
```

### 微互動
```css
/* 按鈕點擊 */
.btn-click {
  @apply transform active:scale-95;
  @apply transition-transform duration-150;
}

/* 輸入框焦點 */
.input-focus {
  @apply focus:ring-4 focus:ring-blue-100;
  @apply focus:border-blue-300;
  @apply transition-all duration-200;
}
```

## 特殊元素

### 分隔線
```css
.divider {
  @apply border-t border-stone-200;
  @apply my-6;
}

/* 裝飾性分隔線 */
.decorative-divider {
  @apply h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent;
  @apply my-8;
}
```

### 警語提示
```css
.warning-banner {
  @apply bg-amber-50 border border-amber-200;
  @apply rounded-xl p-4;
  @apply text-amber-800 text-sm;
}

.important-notice {
  @apply bg-rose-50 border border-rose-200;
  @apply rounded-xl p-4;
  @apply text-rose-800 text-sm font-medium;
}
```

### 載入狀態
```css
.loading-spinner {
  @apply animate-spin rounded-full h-6 w-6;
  @apply border-2 border-blue-200 border-t-blue-600;
}

.loading-dots {
  @apply flex space-x-1;
}

.loading-dot {
  @apply w-2 h-2 bg-blue-400 rounded-full;
  @apply animate-bounce;
}
```

## 設計原則

### 1. 情感優先
- 每個元素都考慮情感體驗
- 避免尖銳的線條和刺眼的顏色
- 使用圓潤的形狀增加親和力

### 2. 層次清晰
- 明確的視覺層級
- 重要信息突出顯示
- 次要信息適度淡化

### 3. 易於操作
- 大尺寸的可點擊區域
- 清楚的互動反饋
- 直觀的操作流程

### 4. 無障礙設計
- 足夠的對比度
- 清晰的焦點指示
- 語意化的HTML結構

### 5. 響應式友好
- 移動設備優先
- 流暢的尺寸變化
- 一致的使用體驗

## 使用指南

### 顏色使用建議
1. **背景**：始終使用溫暖的中性色
2. **強調**：使用療癒色系，避免過於鮮豔
3. **文字**：確保足夠的對比度
4. **情緒**：使用對應的情緒色彩

### 間距使用建議
1. **外邊距**：保持足夠的呼吸空間
2. **內邊距**：營造舒適的閱讀體驗
3. **行高**：使用較寬鬆的行距
4. **字間距**：保持良好的可讀性

### 動畫使用建議
1. **時長**：保持在 200-500ms 之間
2. **緩動**：使用自然的 ease 函數
3. **頻率**：避免過度動畫干擾
4. **目的**：每個動畫都有明確目的

這套設計系統旨在創造一個溫暖、安全、易用的情感支持環境，讓用戶能夠放心地分享內心感受。
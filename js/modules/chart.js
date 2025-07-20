import { state } from './state.js';

/**
 * 繪製心情趨勢圖
 */
export function drawMoodChart() {
    if (state.moodChart) {
        state.moodChart.destroy();
    }

    const ctx = document.getElementById('moodChartCanvas').getContext('2d');
    
    // 為了讓圖表從左到右是時間順序，我們需要反轉記錄
    const chartRecords = [...state.moodRecords].reverse();

    const labels = chartRecords.map(record => {
        const date = new Date(record.timestamp);
        return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    });

    const data = chartRecords.map(record => record.intensity);

    const isDarkMode = document.documentElement.classList.contains('dark');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.4)');
    gradient.addColorStop(1, isDarkMode ? 'rgba(139, 92, 246, 0.05)' : 'rgba(139, 92, 246, 0.1)');
    
    const borderColor = isDarkMode ? '#60a5fa' : '#4f46e5';
    const pointBgColor = isDarkMode ? '#60a5fa' : '#4f46e5';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const ticksColor = isDarkMode ? '#9ca3af' : '#6b7280';

    state.moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '心情強度',
                data: data,
                backgroundColor: gradient,
                borderColor: borderColor,
                borderWidth: 2,
                pointBackgroundColor: pointBgColor,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        stepSize: 1,
                        color: ticksColor
                    },
                    grid: {
                        color: gridColor
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: ticksColor
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 12
                    },
                    padding: 10,
                    boxPadding: 4
                }
            }
        }
    });
} 
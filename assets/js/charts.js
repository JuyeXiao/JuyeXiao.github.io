// 图表管理
class ChartManager {
    constructor() {
        this.charts = new Map();
        this.init();
    }

    init() {
        // 监听主题变化，重新渲染图表
        window.addEventListener('themechange', (e) => {
            this.updateChartsTheme(e.detail.theme);
        });
    }

    // 创建简单图表
    createSimpleChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const defaultOptions = {
            type: 'line',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: false
                    }
                },
                y: {
                    display: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            }
        };

        const config = {
            type: data.type || 'line',
            data: {
                labels: data.labels || [],
                datasets: [{
                    label: data.label || '',
                    data: data.data || [],
                    borderColor: '#0066CC',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                }]
            },
            options: { ...defaultOptions, ...options }
        };

        const ctx = container.getContext('2d');
        const chart = new Chart(ctx, config);
        this.charts.set(containerId, chart);

        return chart;
    }

    // 创建Plotly图表
    createPlotlyChart(containerId, data, layout = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const defaultLayout = {
            autosize: true,
            margin: { l: 50, r: 50, t: 50, b: 50 },
            font: {
                family: 'Arial, sans-serif',
                size: 12
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)'
        };

        const finalLayout = { ...defaultLayout, ...layout };
        
        // 根据主题调整颜色
        const theme = window.themeManager?.getCurrentTheme() || 'light';
        if (theme === 'dark') {
            finalLayout.font.color = '#FFFFFF';
            finalLayout.xaxis = { ...finalLayout.xaxis, color: '#FFFFFF' };
            finalLayout.yaxis = { ...finalLayout.yaxis, color: '#FFFFFF' };
        }

        const config = {
            responsive: true,
            displayModeBar: false
        };

        const chart = Plotly.newPlot(containerId, data, finalLayout, config);
        this.charts.set(containerId, chart);

        return chart;
    }

    // 更新图表主题
    updateChartsTheme(theme) {
        this.charts.forEach((chart, containerId) => {
            if (chart && typeof chart.update === 'function') {
                // Chart.js 图表
                const newOptions = {
                    scales: {
                        x: {
                            ticks: {
                                color: theme === 'dark' ? '#FFFFFF' : '#333333'
                            },
                            grid: {
                                color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                            }
                        },
                        y: {
                            ticks: {
                                color: theme === 'dark' ? '#FFFFFF' : '#333333'
                            },
                            grid: {
                                color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                            }
                        }
                    }
                };
                chart.update('none', newOptions);
            } else if (chart && typeof Plotly !== 'undefined') {
                // Plotly 图表
                const update = {
                    font: { color: theme === 'dark' ? '#FFFFFF' : '#333333' },
                    xaxis: { color: theme === 'dark' ? '#FFFFFF' : '#333333' },
                    yaxis: { color: theme === 'dark' ? '#FFFFFF' : '#333333' }
                };
                Plotly.relayout(containerId, update);
            }
        });
    }

    // 销毁图表
    destroyChart(containerId) {
        const chart = this.charts.get(containerId);
        if (chart) {
            if (typeof chart.destroy === 'function') {
                chart.destroy();
            }
            this.charts.delete(containerId);
        }
    }

    // 销毁所有图表
    destroyAllCharts() {
        this.charts.forEach((chart, containerId) => {
            this.destroyChart(containerId);
        });
    }

    // 创建项目预览图表
    createProjectPreviewChart(containerId, chartData) {
        if (!chartData) return;

        switch (chartData.type) {
            case 'line':
                return this.createSimpleChart(containerId, {
                    type: 'line',
                    labels: chartData.data.x,
                    data: chartData.data.y,
                    label: chartData.data.name
                });
            
            case 'bar':
                return this.createSimpleChart(containerId, {
                    type: 'bar',
                    labels: chartData.data.x,
                    data: chartData.data.y,
                    label: chartData.data.name
                });
            
            case 'scatter':
                return this.createPlotlyChart(containerId, [{
                    x: chartData.data.x,
                    y: chartData.data.y,
                    mode: 'markers',
                    type: 'scatter',
                    marker: {
                        color: '#0066CC',
                        size: 8
                    },
                    name: chartData.data.name
                }]);
            
            default:
                console.warn('Unknown chart type:', chartData.type);
        }
    }
}

// 创建全局实例
window.chartManager = new ChartManager();

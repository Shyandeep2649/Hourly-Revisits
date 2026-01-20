import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Plugin
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { DataRow, DashboardMode } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// ----------------------------------------------------------------------
// Custom Plugin: Dotted Average Line with Floating Label
// ----------------------------------------------------------------------
const averageLinePlugin: Plugin = {
  id: 'averageLine',
  afterDatasetsDraw(chart, args, options: any) {
    const { ctx, chartArea: { top, bottom, left, right, width }, scales: { y } } = chart;
    const value = options.value;
    
    // Validation: Don't draw if no value, or if value is 0 (optional constraint)
    if (value === undefined || value === null || isNaN(value) || value === 0) return;

    const yPixel = y.getPixelForValue(value);
    
    // Bounds Check: Ensure line is within the chart area
    if (yPixel < top || yPixel > bottom) return;

    ctx.save();
    
    // 1. Draw Dotted Line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)'; // Brand Amber
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]); // Dashed pattern
    ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
    ctx.shadowBlur = 4;
    ctx.moveTo(left, yPixel);
    ctx.lineTo(right, yPixel);
    ctx.stroke();

    // Reset styles for label
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    // 2. Draw Label
    const text = `Avg: ${Math.round(value)}`;
    const fontSize = 11;
    ctx.font = `bold ${fontSize}px "Exo 2", sans-serif`;
    
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const paddingX = 10;
    const paddingY = 5;
    const boxHeight = fontSize + (paddingY * 2);
    const boxWidth = textWidth + (paddingX * 2);
    
    // Position: Right aligned, slightly offset from edge, centered vertically on line
    // Mobile Check: chart.width < 500 ? position slightly differently if needed
    const boxX = right - boxWidth - 10; 
    const boxY = yPixel - (boxHeight / 2);

    // Pill Background (Glassmorphism)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'; // Dark Blue/Slate
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)'; // Amber Border
    ctx.lineWidth = 1;
    
    // Draw Round Rect (Pill)
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 10);
    } else {
        // Fallback for older browsers
        ctx.rect(boxX, boxY, boxWidth, boxHeight);
    }
    ctx.fill();
    ctx.stroke();

    // Label Text
    ctx.fillStyle = '#ffffff'; // White text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Adjust y slightly for visual center
    ctx.fillText(text, boxX + (boxWidth / 2), boxY + (boxHeight / 2) + 1);

    ctx.restore();
  }
};

interface ChartsProps {
    data: DataRow[];
    mode: DashboardMode;
    chartView: 'HOURLY' | 'DAILY';
}

const Charts: React.FC<ChartsProps> = ({ data, mode, chartView }) => {
    // Local Filters
    const [localManager, setLocalManager] = useState<string>('');
    const [localEmployee, setLocalEmployee] = useState<string>('');

    // Unique Managers (Normalized)
    const uniqueManagers = useMemo(() => {
        return Array.from(new Set(data.map(d => d.manager))).filter(Boolean).sort();
    }, [data]);

    // Unique Employees (Filtered by Manager)
    const uniqueEmployees = useMemo(() => {
        return Array.from(new Set(
            data.filter(d => !localManager || d.manager === localManager)
                .map(d => d.employee)
        )).filter(Boolean).sort();
    }, [data, localManager]);

    // Filter Data Based on Local Selection
    const filteredData = useMemo(() => {
        return data.filter(row => {
            if (localManager && row.manager !== localManager) return false;
            if (localEmployee && row.employee !== localEmployee) return false;
            return true;
        });
    }, [data, localManager, localEmployee]);

    // Process Data for Chart
    let labels: string[] = [];
    let values: number[] = [];

    if (chartView === 'HOURLY') {
        const stats = new Map<string, number>();
        const startMinutes = 9 * 60 + 30; // 09:30 AM in minutes

        // Filter valid rows for this chart: Status WON and Activity RV (Process)
        const relevantRows = filteredData.filter(row => 
            row.status.includes('WON') && 
            row.activityType === 'RV' && 
            row.timestampMinutes > 0
        );

        // Find max time to determine end of range
        const times = relevantRows.map(r => r.timestampMinutes);
        const maxTime = times.length > 0 ? Math.max(...times) : startMinutes;

        // Bucket max time to the nearest 30-min slot
        const endBucket = Math.floor(maxTime / 30) * 30;
        
        // Ensure endBucket is at least startMinutes
        const effectiveEnd = Math.max(startMinutes, endBucket);

        // Generate Continuous Time Slots (09:30 AM -> Last Available Time)
        for (let t = startMinutes; t <= effectiveEnd; t += 30) {
            const h = Math.floor(t / 60);
            const m = t % 60;
            const ampm = h >= 12 ? 'PM' : 'AM';
            const displayH = h % 12 || 12;
            const displayM = m < 10 ? `0${m}` : m;
            const label = `${displayH}:${displayM} ${ampm}`;
            stats.set(label, 0);
        }

        // Fill Data
        relevantRows.forEach(row => {
            if (row.timestampMinutes < startMinutes) return;

            // Quantize to 30-min bucket
            const bucket = Math.floor(row.timestampMinutes / 30) * 30;
            
            const h = Math.floor(bucket / 60);
            const m = bucket % 60;
            const ampm = h >= 12 ? 'PM' : 'AM';
            const displayH = h % 12 || 12;
            const displayM = m < 10 ? `0${m}` : m;
            const label = `${displayH}:${displayM} ${ampm}`;

            if (stats.has(label)) {
                stats.set(label, (stats.get(label) || 0) + 1);
            }
        });

        labels = Array.from(stats.keys());
        values = Array.from(stats.values());

    } else {
        // DAILY View
        const stats = new Map<string, number>();
        
        filteredData.forEach(row => {
            if (!row.status.includes('WON')) return;
            const key = row.date;
            if (key) {
                stats.set(key, (stats.get(key) || 0) + 1);
            }
        });

        labels = Array.from(stats.keys()).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        values = labels.map(l => stats.get(l) || 0);
    }

    const maxValue = Math.max(...values, 0);
    
    // Calculate Average
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    const average = values.length > 0 ? sum / values.length : 0;

    // Chart Data Config
    const chartData = {
        labels,
        datasets: [
            {
                label: 'Activity Count',
                data: values,
                backgroundColor: (context: any) => {
                    const value = context.raw;
                    if (value === maxValue && value > 0) return '#10b981'; // Emerald for peak
                    return '#3b82f6'; // Blue for normal
                },
                borderRadius: 4,
                borderSkipped: false,
                barThickness: 'flex',
                maxBarThickness: 30,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: { family: 'Orbitron', size: 14 },
                bodyFont: { family: 'Exo 2', size: 14 },
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: (context: any) => {
                        const val = context.raw;
                        return `${val} ${val === maxValue ? '🔥 (PEAK)' : ''}`;
                    }
                }
            },
            // Custom Plugin Options
            averageLine: {
                value: average
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#94a3b8', font: { family: 'Exo 2' } }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8', font: { family: 'Exo 2' }, autoSkip: true, maxRotation: 0 }
            }
        },
        animation: {
            duration: 1000,
            easing: 'easeOutElastic' as const
        }
    };

    // Calculate Insights (Trend)
    const mid = Math.floor(values.length / 2);
    const firstHalfAvg = values.slice(0, mid).reduce((a,b)=>a+b,0) / (mid || 1);
    const secondHalfAvg = values.slice(mid).reduce((a,b)=>a+b,0) / (values.length - mid || 1);
    const trend = secondHalfAvg > firstHalfAvg * 1.15 ? 'Rising' : secondHalfAvg < firstHalfAvg * 0.85 ? 'Falling' : 'Stable';

    // Shared style for filters
    const selectStyle = "bg-[#0a0a0a]/80 backdrop-blur-md text-white border border-amber-500/30 rounded px-3 py-1.5 text-xs font-bold font-exo focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all hover:bg-black/60 hover:border-amber-500/50 cursor-pointer shadow-inner";
    const optionStyle = "bg-[#0f172a] text-white";

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-orbitron font-bold text-white flex items-center gap-2">
                        Activity Analysis <span className="text-xs text-brand-blue font-exo px-2 py-1 bg-brand-blue/10 rounded">{chartView}</span>
                    </h3>
                    
                    {/* Local Filters */}
                    <div className="flex flex-wrap gap-2">
                         <select 
                            className={selectStyle}
                            value={localManager}
                            onChange={(e) => {
                                setLocalManager(e.target.value);
                                setLocalEmployee(''); // Reset employee on manager change
                            }}
                        >
                            <option value="" className={optionStyle}>All Managers</option>
                            {uniqueManagers.map(m => <option key={m} value={m} className={optionStyle}>{m}</option>)}
                        </select>

                        <select 
                            className={selectStyle}
                            value={localEmployee}
                            onChange={(e) => setLocalEmployee(e.target.value)}
                        >
                            <option value="" className={optionStyle}>All Employees</option>
                            {uniqueEmployees.map(e => <option key={e} value={e} className={optionStyle}>{e}</option>)}
                        </select>
                    </div>
                </div>
                
                {/* Statistics Row */}
                <div className="flex flex-wrap gap-4 text-sm font-exo">
                     <div className="px-3 py-1 rounded bg-white/5 border border-white/10">
                        <span className="text-gray-400">Total:</span> <span className="text-white font-bold">{sum}</span>
                     </div>
                     <div className="px-3 py-1 rounded bg-white/5 border border-white/10">
                        <span className="text-gray-400">Avg:</span> <span className="text-brand-amber font-bold">{average.toFixed(1)}</span>
                     </div>
                     <div className="px-3 py-1 rounded bg-white/5 border border-white/10">
                        <span className="text-gray-400">Peak:</span> <span className="text-brand-emerald font-bold">{maxValue}</span>
                     </div>
                     <div className="px-3 py-1 rounded bg-white/5 border border-white/10 flex items-center gap-2">
                        <span className="text-gray-400">Trend:</span> 
                        <span className={`font-bold ${trend === 'Rising' ? 'text-green-400' : trend === 'Falling' ? 'text-brand-red' : 'text-brand-blue'}`}>
                           {trend === 'Rising' ? '↗ Rising' : trend === 'Falling' ? '↘ Falling' : '≈ Stable'}
                        </span>
                     </div>
                </div>
             </div>

            <div className="h-[300px] w-full">
                <Bar 
                    data={chartData} 
                    options={options} 
                    plugins={[averageLinePlugin]} 
                />
            </div>
        </div>
    );
};

export default Charts;
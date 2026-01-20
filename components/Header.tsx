import React, { useState, useEffect, useRef } from 'react';
import { FilterState, DashboardMode } from '../types';
import { playSound } from '../constants';

interface HeaderProps {
    mode: DashboardMode;
    setMode: (m: DashboardMode) => void;
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    uniqueValues: {
        pipelines: string[];
        dates: string[];
        zones: string[];
        managers: string[];
        employees: string[];
    };
    onRefresh: () => void;
    onExport: () => void;
    setChartView: (v: 'HOURLY' | 'DAILY') => void;
    chartView: 'HOURLY' | 'DAILY';
}

const Header: React.FC<HeaderProps> = ({ 
    mode, setMode, filters, setFilters, uniqueValues, onRefresh, onExport,
    setChartView, chartView
}) => {
    const handleFilterChange = (key: keyof FilterState, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        playSound('success');
    };

    const clearFilters = () => {
        setFilters({
            pipeline: '',
            timestamp: null,
            date: '',
            manager: '',
            employee: '',
            zone: ''
        });
        playSound('clear');
    };

    const toggleMode = () => {
        const newMode = mode === 'FTD' ? 'MTD' : 'FTD';
        setMode(newMode);
        playSound('switch');
        if (newMode === 'FTD') setChartView('HOURLY');
    };

    // ---------------------------------------------------------------------------
    // Mobile Smart Scroll Logic
    // ---------------------------------------------------------------------------
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const threshold = 10; // Jitter threshold

            // Desktop: Always visible (Logic guard, though CSS handles this too)
            if (window.innerWidth >= 768) {
                setIsVisible(true);
                return;
            }

            // Ignore tiny scrolls (jitter)
            if (Math.abs(currentScrollY - lastScrollY.current) < threshold) return;

            // Logic: Hide on Scroll Down (> 50px offset), Show on Scroll Up
            if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Shared Select Style Class - Premium Dark Neutral with Amber Focus
    const selectStyle = "w-full bg-[#0a0a0a]/80 backdrop-blur-md text-white border border-amber-500/30 rounded-lg px-4 py-3 text-sm font-exo focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all hover:bg-black/60 hover:border-amber-500/50 cursor-pointer shadow-inner placeholder-gray-400";
    const optionStyle = "bg-[#0f172a] text-white py-2";

    return (
        <header className={`
            fixed top-0 left-0 right-0 z-50 
            bg-gradient-to-r from-[#2c0b0e] via-[#7c2d12] to-[#2c0b0e] 
            backdrop-blur-xl border-b border-amber-500/30 
            shadow-[0_10px_40px_-10px_rgba(124,45,18,0.5)]
            transition-all duration-300 ease-in-out
            ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-90 pointer-events-none'}
            md:translate-y-0 md:opacity-100 md:pointer-events-auto
        `}>
            {/* Subtle Noise/Grain Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_70%)] pointer-events-none"></div>

            <div className="container mx-auto px-4 py-4 relative z-10">
                {/* Top Row: Branding & Controls */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
                    {/* Logo & Title */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-red to-red-900 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.6)] ring-2 ring-white/10">
                            <div className="w-6 h-6 rounded-full border-2 border-white/50"></div>
                        </div>
                        <div>
                            <h1 className="text-xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-white drop-shadow-sm">
                                Business Development Analytics
                            </h1>
                            <p className="text-xs text-orange-200/70 font-exo uppercase tracking-widest">Real-time Insights</p>
                        </div>
                    </div>

                    {/* Mode Switch & Global Actions */}
                    <div className="flex items-center gap-3">
                        {/* Mode Toggle */}
                        <div className="bg-black/30 rounded-full p-1 flex items-center relative border border-white/5 backdrop-blur-sm">
                             <div className={`absolute w-[50%] h-[80%] bg-gradient-to-r from-brand-red to-orange-600 rounded-full transition-all duration-300 shadow-lg ${mode === 'MTD' ? 'translate-x-[90%]' : 'translate-x-1'}`}></div>
                             <button onClick={toggleMode} className={`relative z-10 px-4 py-1 text-xs font-bold font-exo transition-colors ${mode === 'FTD' ? 'text-white' : 'text-gray-400'}`}>FTD</button>
                             <button onClick={toggleMode} className={`relative z-10 px-4 py-1 text-xs font-bold font-exo transition-colors ${mode === 'MTD' ? 'text-white' : 'text-gray-400'}`}>MTD</button>
                        </div>

                        {/* Chart View Toggle (MTD Only) */}
                        {mode === 'MTD' && (
                             <div className="bg-black/30 rounded-full p-1 flex items-center border border-white/5 backdrop-blur-sm">
                                <button onClick={() => setChartView('HOURLY')} className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${chartView === 'HOURLY' ? 'bg-brand-purple text-white shadow-lg' : 'text-gray-400'}`}>Time</button>
                                <button onClick={() => setChartView('DAILY')} className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${chartView === 'DAILY' ? 'bg-brand-purple text-white shadow-lg' : 'text-gray-400'}`}>Date</button>
                            </div>
                        )}

                        <button onClick={onRefresh} className="p-2 rounded-full bg-black/30 border border-white/5 hover:bg-brand-purple hover:border-brand-purple hover:text-white transition-all shadow-lg text-orange-100/80">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>

                        <button onClick={onExport} className="p-2 rounded-full bg-black/30 border border-white/5 hover:bg-brand-emerald hover:border-brand-emerald hover:text-white transition-all shadow-lg text-orange-100/80">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                    </div>
                </div>

                {/* Bottom Row: Full Width Filters - Premium Orange Glass */}
                <div className="w-full bg-gradient-to-r from-orange-950/30 via-amber-900/20 to-orange-950/30 p-4 rounded-2xl backdrop-blur-md border border-amber-500/30 flex flex-col lg:flex-row items-stretch gap-4 shadow-[inset_0_0_20px_rgba(251,191,36,0.05)]">
                    {/* Pipeline */}
                    <div className="flex-1 min-w-0">
                        <select 
                            className={selectStyle}
                            value={filters.pipeline}
                            onChange={(e) => handleFilterChange('pipeline', e.target.value)}
                        >
                            <option value="" className={optionStyle}>All Pipelines</option>
                            {uniqueValues.pipelines.map(p => <option key={p} value={p} className={optionStyle}>{p}</option>)}
                        </select>
                    </div>

                    {/* Zone */}
                    <div className="flex-1 min-w-0">
                        <select 
                            className={selectStyle}
                            value={filters.zone}
                            onChange={(e) => handleFilterChange('zone', e.target.value)}
                        >
                            <option value="" className={optionStyle}>All Zones</option>
                            {uniqueValues.zones.map(z => <option key={z} value={z} className={optionStyle}>{z}</option>)}
                        </select>
                    </div>

                    {/* Timestamp (Cumulative) */}
                    <div className="flex-1 min-w-0">
                        <select
                             className={selectStyle}
                             value={filters.timestamp || ''}
                             onChange={(e) => handleFilterChange('timestamp', e.target.value ? Number(e.target.value) : null)}
                        >
                            <option value="" className={optionStyle}>Entire Day</option>
                            <option value={720} className={optionStyle}>Until 12:00 PM</option>
                            <option value={840} className={optionStyle}>Until 2:00 PM</option>
                            <option value={960} className={optionStyle}>Until 4:00 PM</option>
                            <option value={1080} className={optionStyle}>Until 6:00 PM</option>
                            <option value={1200} className={optionStyle}>Until 8:00 PM</option>
                        </select>
                    </div>

                    {/* Date */}
                    <div className="flex-1 min-w-0">
                         <select 
                            className={selectStyle}
                            value={filters.date}
                            onChange={(e) => handleFilterChange('date', e.target.value)}
                        >
                            <option value="" className={optionStyle}>All Dates</option>
                            {uniqueValues.dates.map(d => <option key={d} value={d} className={optionStyle}>{d}</option>)}
                        </select>
                    </div>

                    {/* Clear Button */}
                    <button 
                        onClick={clearFilters}
                        className="lg:w-auto w-full px-6 py-3 rounded-lg border border-amber-500/50 bg-amber-900/20 text-brand-amber hover:bg-amber-500 hover:text-black font-bold text-sm transition-all duration-300 uppercase tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.1)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] whitespace-nowrap flex items-center justify-center gap-2"
                    >
                        <span>✕</span> Clear
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
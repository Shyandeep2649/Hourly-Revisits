import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import KPICards from './components/KPICards';
import Charts from './components/Charts';
import Tables from './components/Tables';
import Footer from './components/Footer';
import BackgroundEffects from './components/BackgroundEffects';
import Toast from './components/Toast';
import { DataRow, FilterState, DashboardMode, ToastMessage } from './types';
import { processCSV, filterData, calculateMetrics, aggregateByField } from './utils/dataProcessor';
import { FTD_URL, MTD_URL, playSound } from './constants';

const App: React.FC = () => {
    // State
    const [mode, setMode] = useState<DashboardMode>('MTD');
    const [rawData, setRawData] = useState<DataRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    
    // Filters
    const [filters, setFilters] = useState<FilterState>({
        pipeline: '',
        timestamp: null,
        date: '',
        manager: '',
        employee: '',
        zone: ''
    });

    const [chartView, setChartView] = useState<'HOURLY' | 'DAILY'>('DAILY');

    // Toast Helpers
    const addToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, type, message }]);
        if(type === 'error') playSound('error');
    };
    const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

    // Data Fetching
    const fetchData = async () => {
        setLoading(true);
        try {
            const url = mode === 'FTD' ? FTD_URL : MTD_URL;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const text = await response.text();
            
            const processed = processCSV(text);
            if (processed.length === 0) throw new Error('No valid data found in CSV');
            
            setRawData(processed);
            addToast('success', `${mode} Data Loaded Successfully`);
            playSound('success');
        } catch (error) {
            console.error(error);
            addToast('error', 'Failed to load data. Please check connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Reset filters on mode switch
        setFilters({ pipeline: '', timestamp: null, date: '', manager: '', employee: '', zone: '' });
    }, [mode]);

    // Computed Data
    const filteredData = useMemo(() => filterData(rawData, filters), [rawData, filters]);
    const metrics = useMemo(() => calculateMetrics(filteredData), [filteredData]);

    // Aggregations for Tables & Filters
    const managerStats = useMemo(() => aggregateByField(filteredData, 'manager'), [filteredData]);
    const zoneStats = useMemo(() => aggregateByField(filteredData, 'zone'), [filteredData]);
    const cityStats = useMemo(() => aggregateByField(filteredData, 'city'), [filteredData]);
    const employeeStats = useMemo(() => aggregateByField(filteredData, 'employee'), [filteredData]);
    const clusterHeadStats = useMemo(() => aggregateByField(filteredData, 'clusterHead'), [filteredData]);

    // Unique values for dropdowns (from raw data to allow clearing)
    const uniqueValues = useMemo(() => {
        const pipelines = Array.from(new Set(rawData.map(r => r.pipeline))).filter(Boolean).sort();
        const dates = Array.from(new Set(rawData.map(r => r.date))).filter(Boolean).sort();
        const zones = Array.from(new Set(rawData.map(r => r.zone))).filter(Boolean).sort();
        const managers = Array.from(new Set(rawData.map(r => r.manager))).filter(Boolean).sort();
        const employees = Array.from(new Set(rawData.map(r => r.employee))).filter(Boolean).sort();
        return { pipelines, dates, zones, managers, employees };
    }, [rawData]);

    // Export Handler
    const handleExport = () => {
        const headers = ['Employee', 'Manager', 'Zone', 'City', 'Pipeline', 'Activity Type', 'Status', 'Date', 'Time'];
        const csvContent = [
            headers.join(','),
            ...filteredData.map(r => [
                r.employee, r.manager, r.zone, r.city, r.pipeline, r.activityType, r.status, r.date, r.timestampStr
            ].map(f => `"${f}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `analytics_export_${mode}_${new Date().toISOString()}.csv`;
        link.click();
        addToast('info', 'Export started...');
    };

    return (
        <div className="relative min-h-screen font-exo">
            <BackgroundEffects />
            
            <Toast toasts={toasts} removeToast={removeToast} />

            <Header 
                mode={mode} 
                setMode={setMode} 
                filters={filters} 
                setFilters={setFilters}
                uniqueValues={uniqueValues}
                onRefresh={fetchData}
                onExport={handleExport}
                setChartView={setChartView}
                chartView={chartView}
            />

            <main className="container mx-auto px-4 pt-48 relative z-10 pb-20">
                {loading ? (
                     <div className="flex flex-col items-center justify-center h-64">
                        <div className="w-16 h-16 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-brand-purple animate-pulse font-orbitron">Initializing Core Systems...</p>
                     </div>
                ) : (
                    <>
                        {/* Welcome Message */}
                        <div className="mb-8">
                            <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-white mb-2">
                                Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-blue">Commander</span>
                            </h2>
                            <p className="text-gray-400">System Status: <span className="text-brand-emerald">ONLINE</span> // Data Source: {mode}</p>
                        </div>

                        {/* KPI Cards */}
                        <KPICards metrics={metrics} />

                        {/* Chart Section */}
                        <Charts data={filteredData} mode={mode} chartView={chartView} />

                        {/* Performance Tables */}
                        <Tables 
                            managerStats={managerStats} 
                            cityStats={cityStats} 
                            zoneStats={zoneStats} 
                            employeeStats={employeeStats}
                            clusterHeadStats={clusterHeadStats}
                        />
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default App;
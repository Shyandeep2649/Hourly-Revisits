import React, { useState, useMemo } from 'react';
import { AggregatedStats } from '../types';

interface TablesProps {
    managerStats: AggregatedStats[];
    cityStats: AggregatedStats[];
    zoneStats: AggregatedStats[];
    employeeStats: AggregatedStats[];
    clusterHeadStats: AggregatedStats[];
}

const MedalIcon: React.FC<{ rank: number }> = ({ rank }) => {
    if (rank === 1) return <span className="text-xl">🥇</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return <span className="text-brand-purple">★</span>;
};

const TableCard: React.FC<{ 
    title: string, 
    data: AggregatedStats[], 
    limit?: number, 
    showManager?: boolean,
    controls?: React.ReactNode 
}> = ({ title, data, limit, showManager, controls }) => {
    const displayData = limit ? data.slice(0, limit) : data;
    
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full backdrop-blur-sm">
            {/* 
                Header: Card Title 
                Theme: Molten Glass / Orange Water Gradient
            */}
            <div className="p-4 bg-gradient-to-r from-[#2c0b0e] via-[#431407] to-[#2c0b0e] border-b border-amber-500/30 sticky top-0 z-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shadow-[inset_0_1px_20px_rgba(245,158,11,0.05)]">
                <h3 className="font-orbitron font-bold text-lg text-orange-50 drop-shadow-md tracking-wide">{title}</h3>
                {controls && <div className="flex gap-2">{controls}</div>}
            </div>
            
            <div className="overflow-auto custom-scrollbar flex-1 max-h-[400px]">
                <table className="w-full text-left border-collapse">
                    {/* 
                        Header: Columns 
                        Theme: Deep Warm Brown with Amber Glow Border 
                    */}
                    <thead className="bg-[#1a0500] border-b border-amber-500/20 text-xs uppercase text-orange-200/60 font-exo sticky top-0 z-10 shadow-lg">
                        <tr>
                            <th className="p-3">Rank</th>
                            <th className="p-3">Name</th>
                            {showManager && <th className="p-3">Manager</th>}
                            <th className="p-3 text-right text-brand-blue">OB</th>
                            <th className="p-3 text-right text-brand-cyan">RV</th>
                            <th className="p-3 text-right text-brand-emerald">Total</th>
                        </tr>
                    </thead>
                    <tbody className="font-exo text-sm divide-y divide-white/5">
                        {displayData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-amber-900/10 transition-colors">
                                <td className="p-3 flex items-center gap-2 text-gray-400">
                                    <MedalIcon rank={idx + 1} /> 
                                    <span className="opacity-50">#{idx + 1}</span>
                                </td>
                                <td className="p-3 font-medium text-white">{row.name}</td>
                                {showManager && <td className="p-3 text-white">{row.manager}</td>}
                                <td className="p-3 text-right text-brand-blue font-semibold">{row.ob}</td>
                                <td className="p-3 text-right text-brand-cyan font-semibold">{row.rv}</td>
                                <td className="p-3 text-right font-bold text-brand-emerald bg-white/5 shadow-[inset_0_0_10px_rgba(16,185,129,0.05)]">{row.total}</td>
                            </tr>
                        ))}
                        {displayData.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">No Data Available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const EmployeeTableWithFilters: React.FC<{ data: AggregatedStats[] }> = ({ data }) => {
    const [zoneFilter, setZoneFilter] = useState('');
    const [managerFilter, setManagerFilter] = useState('');

    const uniqueZones = useMemo(() => Array.from(new Set(data.map(d => d.zone).filter(Boolean))).sort(), [data]);
    
    // Managers depend on selected Zone
    const uniqueManagers = useMemo(() => {
        const filtered = zoneFilter ? data.filter(d => d.zone === zoneFilter) : data;
        return Array.from(new Set(filtered.map(d => d.manager).filter(Boolean))).sort();
    }, [data, zoneFilter]);

    const filteredData = useMemo(() => {
        return data.filter(d => {
            if (zoneFilter && d.zone !== zoneFilter) return false;
            if (managerFilter && d.manager !== managerFilter) return false;
            return true;
        });
    }, [data, zoneFilter, managerFilter]);

    // Shared style for filters (matching Header theme)
    const selectStyle = "bg-[#0a0a0a]/80 backdrop-blur-md text-white border border-amber-500/30 rounded px-3 py-1.5 text-xs font-bold font-exo focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all hover:bg-black/60 hover:border-amber-500/50 cursor-pointer shadow-inner";
    const optionStyle = "bg-[#0f172a] text-white";

    const controls = (
        <>
            <select 
                className={selectStyle}
                value={zoneFilter}
                onChange={(e) => {
                    setZoneFilter(e.target.value);
                    setManagerFilter(''); // Reset manager on zone change
                }}
            >
                <option value="" className={optionStyle}>All Zones</option>
                {uniqueZones.map(z => <option key={z} value={z} className={optionStyle}>{z}</option>)}
            </select>
            <select 
                className={selectStyle}
                value={managerFilter}
                onChange={(e) => setManagerFilter(e.target.value)}
            >
                <option value="" className={optionStyle}>All Managers</option>
                {uniqueManagers.map(m => <option key={m} value={m} className={optionStyle}>{m}</option>)}
            </select>
        </>
    );

    return (
        <TableCard 
            title="Employee Performance" 
            data={filteredData} 
            showManager={true} 
            controls={controls}
        />
    );
};

const Tables: React.FC<TablesProps> = ({ managerStats, cityStats, zoneStats, employeeStats, clusterHeadStats }) => {
    return (
        <div className="space-y-8 mb-8">
            {/* Top 5 Section */}
            <div>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-6 pl-2 border-l-4 border-brand-red">Top Performers</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <TableCard title="Top Managers (RV)" data={managerStats} limit={5} />
                    <TableCard title="Top Cities (RV)" data={cityStats} limit={5} />
                    <TableCard title="Top Zones (RV)" data={zoneStats} limit={5} />
                </div>
            </div>

            {/* Detailed Section */}
            <div>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-6 pl-2 border-l-4 border-brand-purple">Detailed Breakdown</h2>
                
                {/* 2x2 Grid for Managers, Zones, Cities, Cluster Heads */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <TableCard title="Manager Performance" data={managerStats} />
                    <TableCard title="Zone Performance" data={zoneStats} />
                    <TableCard title="City Performance" data={cityStats} />
                    <TableCard title="Cluster Head Performance" data={clusterHeadStats} />
                </div>

                {/* Employee Performance at the bottom */}
                <div className="w-full">
                    <EmployeeTableWithFilters data={employeeStats} />
                </div>
            </div>
        </div>
    );
};

export default Tables;
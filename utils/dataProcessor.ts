import { DataRow, Metrics, FilterState, AggregatedStats } from '../types';
import { parseCSVLine, parseTime } from '../constants';

// Helper to normalize text (Title Case, trim, handle special chars)
const normalizeText = (text: string): string => {
    if (!text) return '';
    // Remove extra spaces and special chars, then Title Case
    const clean = text.replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    return clean.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const processCSV = (csvText: string): DataRow[] => {
    const lines = csvText.split(/\r?\n/);
    const data: DataRow[] = [];
    
    // Skip header (index 0)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        const cols = parseCSVLine(line);
        if (cols.length < 13) continue;

        const row: DataRow = {
            empId: cols[0]?.trim() || '',
            employee: normalizeText(cols[1]),
            manager: normalizeText(cols[2]),
            zone: normalizeText(cols[3]),
            city: normalizeText(cols[4]),
            clusterHead: normalizeText(cols[5]),
            pipeline: cols[6]?.trim() || '',
            activityDate: cols[7]?.trim() || '',
            status: cols[8]?.trim().toUpperCase() || '',
            hiPo: cols[9]?.trim().toLowerCase() || '',
            timestampStr: cols[11]?.trim() || '',
            activityType: cols[12]?.trim().toUpperCase() || '',
            date: cols[13]?.trim() || '',
            timestampMinutes: 0 // calculated below
        };

        row.timestampMinutes = parseTime(row.timestampStr);
        data.push(row);
    }
    return data;
};

export const filterData = (data: DataRow[], filters: FilterState): DataRow[] => {
    return data.filter(row => {
        // Pipeline Filter (Exact)
        if (filters.pipeline && row.pipeline !== filters.pipeline) return false;
        
        // Date Filter (Exact)
        if (filters.date && row.date !== filters.date) return false;
        
        // Timestamp Filter (Cumulative)
        if (filters.timestamp !== null && row.timestampMinutes > filters.timestamp) return false;
        
        // Hierarchy Filters
        if (filters.zone && row.zone !== filters.zone) return false;
        if (filters.manager && row.manager !== filters.manager) return false;
        if (filters.employee && row.employee !== filters.employee) return false;

        return true;
    });
};

export const calculateMetrics = (data: DataRow[]): Metrics => {
    let ob = 0;
    let rv = 0;
    let sp = 0;
    let hipo = 0;
    const cities = new Set<string>();

    data.forEach(row => {
        const isWon = row.status.includes('WON');
        
        if (isWon) {
            if (row.activityType === 'OB') ob++;
            if (row.activityType === 'RV') rv++;
            if (row.activityType === 'SP') sp++;
            if (row.city) cities.add(row.city.toLowerCase());
        }

        if (row.hiPo.includes('hipo_inactive')) {
            hipo++;
        }
    });

    return {
        totalOB: ob,
        totalRV: rv,
        totalLeads: ob + rv + sp,
        totalCities: cities.size,
        hiPoInactive: hipo
    };
};

export const aggregateByField = (data: DataRow[], field: keyof DataRow): AggregatedStats[] => {
    const map = new Map<string, AggregatedStats>();

    data.forEach(row => {
        const key = String(row[field]);
        if (!key) return;

        if (!map.has(key)) {
            // Initialize with metadata from the first occurrence
            map.set(key, { 
                name: key, 
                rv: 0, 
                ob: 0, 
                sp: 0, 
                hipo: 0, 
                total: 0, 
                manager: row.manager,
                zone: row.zone
            });
        }

        const stats = map.get(key)!;
        const isWon = row.status.includes('WON');

        if (isWon) {
            if (row.activityType === 'RV') stats.rv++;
            if (row.activityType === 'OB') stats.ob++;
            if (row.activityType === 'SP') stats.sp++;
        }
        if (row.hiPo.includes('hipo_inactive')) stats.hipo++;
        
        // Update Total (OB+RV+SP)
        stats.total = stats.rv + stats.ob + stats.sp;
    });

    return Array.from(map.values()).sort((a, b) => b.rv - a.rv); // Default sort by RV descending
};
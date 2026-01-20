export type DashboardMode = 'FTD' | 'MTD';

export interface DataRow {
  empId: string;
  employee: string;
  manager: string;
  zone: string;
  city: string;
  clusterHead: string;
  pipeline: string;
  activityDate: string;
  status: string;
  hiPo: string;
  timestampStr: string;
  activityType: string; // OB, RV, SP
  date: string;
  
  // Computed
  timestampMinutes: number; // For filtering
}

export interface FilterState {
  pipeline: string;
  timestamp: number | null; // Minutes since midnight
  date: string;
  manager: string;
  employee: string;
  zone: string;
}

export interface Metrics {
  totalOB: number;
  totalRV: number;
  totalLeads: number; // OB + RV + SP
  totalCities: number;
  hiPoInactive: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface AggregatedStats {
    name: string;
    rv: number;
    ob: number;
    sp: number;
    hipo: number;
    total: number;
    manager?: string; // For employee view
    zone?: string; // For filtering
}
import { DashboardMode } from './types';

export const FTD_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTq0Rt35r6tqCpDaW6Lt9DRg_8ITAESpCXfJ17lt-_zttMiY6f4s70c0daX2jVgb2vwE62eb_MWb3ES/pub?output=csv';
export const MTD_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSyhksQK6NJNYpqvsfudqavFAB9qhTT4DqFOfFyIGjzB47zR_CVFhS0ZhbevYOsQ9iUAnw7h9yfHvLE/pub?output=csv';

export const COLORS = {
    red: '#dc2626',
    blue: '#3b82f6',
    cyan: '#06b6d4',
    purple: '#8b5cf6',
    emerald: '#10b981',
    amber: '#f59e0b',
    dark: '#0f172a'
};

// Sound utility using Web Audio API
export const playSound = (type: 'success' | 'clear' | 'switch' | 'error') => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        const now = ctx.currentTime;
        
        if (type === 'success' || type === 'switch') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(680, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'clear') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(680, now);
            osc.frequency.exponentialRampToValueAtTime(520, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'error') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, now);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        }
    } catch (e) {
        console.warn('Audio play failed', e);
    }
};

// CSV Parser Helper (Handles quoted strings)
export const parseCSVLine = (text: string): string[] => {
    const result: string[] = [];
    let start = 0;
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '"') {
            inQuotes = !inQuotes;
        } else if (text[i] === ',' && !inQuotes) {
            let field = text.substring(start, i);
            if (field.startsWith('"') && field.endsWith('"')) {
                field = field.slice(1, -1);
            }
            result.push(field);
            start = i + 1;
        }
    }
    let lastField = text.substring(start);
    if (lastField.startsWith('"') && lastField.endsWith('"')) {
        lastField = lastField.slice(1, -1);
    }
    result.push(lastField);
    return result;
};

export const parseTime = (timeStr: string): number => {
    if (!timeStr) return 0;
    try {
        const clean = timeStr.toUpperCase().trim();
        const isPM = clean.includes('PM');
        const [time, _] = clean.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        if (isPM && hours !== 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
        
        return (hours * 60) + (minutes || 0);
    } catch {
        return 0;
    }
};
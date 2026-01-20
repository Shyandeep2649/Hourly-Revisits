import React, { useEffect } from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
    toasts: ToastMessage[];
    removeToast: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
            ))}
        </div>
    );
};

const ToastItem: React.FC<{ toast: ToastMessage, removeToast: (id: string) => void }> = ({ toast, removeToast }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            removeToast(toast.id);
        }, 3000);
        return () => clearTimeout(timer);
    }, [toast.id, removeToast]);

    const colors = {
        success: 'from-green-900/90 to-emerald-900/90 border-emerald-500',
        error: 'from-red-900/90 to-rose-900/90 border-red-500',
        info: 'from-blue-900/90 to-cyan-900/90 border-blue-500',
        warning: 'from-amber-900/90 to-yellow-900/90 border-amber-500',
    };

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠',
    };

    return (
        <div className={`
            min-w-[300px] p-4 rounded-lg shadow-lg backdrop-blur-md bg-gradient-to-r ${colors[toast.type]}
            border-l-4 text-white transform transition-all duration-300 animate-slide-in flex items-center gap-3
        `}>
            <span className="font-bold text-lg">{icons[toast.type]}</span>
            <span className="font-exo text-sm font-medium">{toast.message}</span>
        </div>
    );
};

export default Toast;
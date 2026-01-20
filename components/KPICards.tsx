import React, { useEffect, useState, useRef } from 'react';
import { Metrics } from '../types';
import CountUp from 'react-countup';

interface KPICardsProps {
    metrics: Metrics;
}

// ----------------------------------------------------------------------
// Reusable Components & Styles
// ----------------------------------------------------------------------

const NoiseTexture = () => (
    <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none z-0 mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
    />
);

const CardWrapper: React.FC<{ 
    children: React.ReactNode; 
    className?: string; 
    gradient: string; 
    shadowColor: string; 
    delay: number;
}> = ({ children, className, gradient, shadowColor, delay }) => {
    return (
        <div 
            className={`
                relative overflow-hidden rounded-2xl ${gradient} ${className}
                transform transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]
                animate-[fadeInUp_0.6s_ease-out_forwards] opacity-0
                shadow-lg hover:shadow-2xl
            `}
            style={{ 
                animationDelay: `${delay}ms`,
                boxShadow: `0 10px 30px -10px ${shadowColor}`
            }}
        >
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            
            <NoiseTexture />
            
            {/* Glass Shine Effect */}
            <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-white/20 via-transparent to-transparent rotate-45 pointer-events-none" />
            
            {/* Inner Content */}
            <div className="relative z-10 h-full w-full">
                {children}
            </div>
        </div>
    );
};

const ValueDisplay: React.FC<{ value: number; size?: string }> = ({ value, size = "text-4xl" }) => (
    <span className={`font-orbitron font-bold text-white drop-shadow-md ${size} tracking-tight`}>
        <CountUp end={value} separator="," duration={2.5} preserveValue={true} />
    </span>
);

const LabelDisplay: React.FC<{ label: string; className?: string }> = ({ label, className }) => (
    <span className={`font-exo font-bold text-white/80 uppercase tracking-widest text-[10px] ${className}`}>
        {label}
    </span>
);

// ----------------------------------------------------------------------
// Specific Card Layouts
// ----------------------------------------------------------------------

// 1. Onboardings (Blue) - Icon Top Right, Content Bottom Left
const OnboardingCard: React.FC<{ value: number }> = ({ value }) => (
    <CardWrapper 
        gradient="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600"
        shadowColor="rgba(59, 130, 246, 0.5)"
        delay={0}
        className="h-[160px] p-6 flex flex-col justify-end group"
    >
        <div className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner group-hover:scale-110 transition-transform duration-300">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
        </div>
        <div>
            <LabelDisplay label="Total Onboardings" className="block mb-1 opacity-90" />
            <ValueDisplay value={value} size="text-5xl" />
        </div>
    </CardWrapper>
);

// 2. Revisits (Cyan/Teal) - Split Layout (Icon Left, Text Right)
const RevisitCard: React.FC<{ value: number }> = ({ value }) => (
    <CardWrapper 
        gradient="bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-600"
        shadowColor="rgba(6, 182, 212, 0.5)"
        delay={100}
        className="h-[160px] p-6 flex items-center gap-5 group"
    >
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg ring-4 ring-white/10 group-hover:rotate-180 transition-transform duration-700">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        </div>
        <div className="flex flex-col">
            <ValueDisplay value={value} size="text-4xl" />
            <LabelDisplay label="Total Revisits" className="mt-1" />
        </div>
    </CardWrapper>
);

// 3. Cities (Purple) - Centered Layout
const CityCard: React.FC<{ value: number }> = ({ value }) => (
    <CardWrapper 
        gradient="bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600"
        shadowColor="rgba(147, 51, 234, 0.5)"
        delay={200}
        className="h-[160px] p-4 flex flex-col items-center justify-center text-center group"
    >
        <div className="mb-2 p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        </div>
        <ValueDisplay value={value} size="text-4xl" />
        <LabelDisplay label="Total Cities" className="mt-2 text-white/90" />
    </CardWrapper>
);

// 4. Leads (Green) - Watermark Icon Layout
const LeadsCard: React.FC<{ value: number }> = ({ value }) => (
    <CardWrapper 
        gradient="bg-gradient-to-br from-emerald-500 via-green-600 to-lime-600"
        shadowColor="rgba(16, 185, 129, 0.5)"
        delay={300}
        className="h-[160px] p-6 relative group"
    >
        {/* Background Watermark Icon */}
        <div className="absolute -bottom-4 -right-4 text-black/10 transform rotate-[-15deg] group-hover:scale-110 group-hover:rotate-0 transition-all duration-500">
             <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        </div>
        
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                <LabelDisplay label="Active Leads" />
            </div>
            <ValueDisplay value={value} size="text-5xl" />
        </div>
    </CardWrapper>
);

// 5. HiPo (Amber/Orange) - Alert/Warning Layout
const HiPoCard: React.FC<{ value: number }> = ({ value }) => (
    <CardWrapper 
        gradient="bg-gradient-to-br from-amber-500 via-orange-600 to-red-600"
        shadowColor="rgba(245, 158, 11, 0.5)"
        delay={400}
        className="h-[160px] p-0 flex relative group"
    >
        {/* Decorative Warning Stripe */}
        <div className="absolute top-0 right-0 w-24 h-full bg-white/5 skew-x-[-20deg] translate-x-10"></div>
        
        <div className="w-1/3 bg-black/10 flex items-center justify-center backdrop-blur-sm border-r border-white/10">
            <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-full animate-ping opacity-75"></div>
                <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
        </div>
        
        <div className="flex-1 p-4 flex flex-col justify-center items-center text-center">
            <ValueDisplay value={value} size="text-4xl" />
            <div className="w-full h-px bg-white/20 my-2"></div>
            <LabelDisplay label="HiPo Inactive" className="text-white/90" />
        </div>
    </CardWrapper>
);

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

const KPICards: React.FC<KPICardsProps> = ({ metrics }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12 mt-4 px-1">
            <OnboardingCard value={metrics.totalOB} />
            <RevisitCard value={metrics.totalRV} />
            <CityCard value={metrics.totalCities} />
            <LeadsCard value={metrics.totalLeads} />
            <HiPoCard value={metrics.hiPoInactive} />
        </div>
    );
};

export default KPICards;
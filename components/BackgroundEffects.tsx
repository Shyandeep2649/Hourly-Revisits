import React from 'react';

const BackgroundEffects: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black">
      {/* Deep Molten Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-950 via-[#1a0500] to-black opacity-90"></div>
      
      {/* Liquid Light / Plasma Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-900/20 via-red-900/10 to-amber-900/20 opacity-60 mix-blend-screen animate-pulse-glow"></div>
      
      {/* Fluid Distortion Effect (Simulated with rotating gradient) */}
      <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600/5 via-transparent to-transparent animate-spin-slow opacity-30"></div>

      {/* Grid Pattern (Subtle Tech Feel) */}
      <div className="absolute inset-0 opacity-[0.05]" style={{ 
        backgroundImage: 'linear-gradient(rgba(245, 158, 11, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      {/* Layer 1: Distant Stars (Small, Slow, Dense) */}
      {Array.from({ length: 150 }).map((_, i) => (
        <div 
            key={`star-dist-${i}`}
            className="absolute rounded-full bg-orange-100/40 animate-drift-slow"
            style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 1.5 + 0.5}px`,
                height: `${Math.random() * 1.5 + 0.5}px`,
                animationDelay: `${Math.random() * -60}s`,
                opacity: Math.random() * 0.5
            }}
        />
      ))}

      {/* Layer 2: Mid-Range Stars (Brighter, Twinkling) */}
      {Array.from({ length: 80 }).map((_, i) => (
        <div 
            key={`star-mid-${i}`}
            className="absolute rounded-full bg-amber-50 animate-twinkle"
            style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.7 + 0.3
            }}
        />
      ))}

      {/* Layer 3: Foreground Particles (Faster Drift, Glowing) */}
      {Array.from({ length: 30 }).map((_, i) => (
        <div 
            key={`particle-${i}`}
            className="absolute rounded-full bg-brand-gold blur-[1px] animate-drift-medium shadow-[0_0_5px_rgba(245,158,11,0.5)]"
            style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                animationDelay: `${Math.random() * -40}s`,
            }}
        />
      ))}

      {/* Swimming Fish (Orange Tinted) */}
      <div className="absolute inset-0 opacity-20">
         <svg className="w-full h-full">
            {Array.from({length: 8}).map((_, i) => (
               <circle key={i} r="3" fill="#f59e0b" className="fish-path" style={{ animationDelay: `-${i * 3}s`, animationDuration: `${20 + i * 2}s` }} />
            ))}
         </svg>
      </div>
    </div>
  );
};

export default BackgroundEffects;
import { useEffect, useRef, useState } from 'react';

const colorMap = {
    indigo: {
        bg: 'from-indigo-500/10 to-indigo-600/5',
        border: 'border-indigo-500/15',
        text: 'text-indigo-400',
        icon: 'from-indigo-500/20 to-indigo-600/10',
        glow: 'shadow-indigo-500/5',
    },
    green: {
        bg: 'from-emerald-500/10 to-emerald-600/5',
        border: 'border-emerald-500/15',
        text: 'text-emerald-400',
        icon: 'from-emerald-500/20 to-emerald-600/10',
        glow: 'shadow-emerald-500/5',
    },
    amber: {
        bg: 'from-amber-500/10 to-amber-600/5',
        border: 'border-amber-500/15',
        text: 'text-amber-400',
        icon: 'from-amber-500/20 to-amber-600/10',
        glow: 'shadow-amber-500/5',
    },
    sky: {
        bg: 'from-sky-500/10 to-sky-600/5',
        border: 'border-sky-500/15',
        text: 'text-sky-400',
        icon: 'from-sky-500/20 to-sky-600/10',
        glow: 'shadow-sky-500/5',
    },
    purple: {
        bg: 'from-purple-500/10 to-purple-600/5',
        border: 'border-purple-500/15',
        text: 'text-purple-400',
        icon: 'from-purple-500/20 to-purple-600/10',
        glow: 'shadow-purple-500/5',
    },
    rose: {
        bg: 'from-rose-500/10 to-rose-600/5',
        border: 'border-rose-500/15',
        text: 'text-rose-400',
        icon: 'from-rose-500/20 to-rose-600/10',
        glow: 'shadow-rose-500/5',
    },
};

export default function StatsCard({ icon, label, value, color = 'indigo', delay = 0, subtitle }) {
    const c = colorMap[color] || colorMap.indigo;
    const [visible, setVisible] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div
            ref={ref}
            className={`
        bg-gradient-to-br ${c.bg} ${c.border} border rounded-xl p-5
        transition-all duration-500 hover:shadow-lg ${c.glow}
        ${visible ? 'animate-fade-in-up' : 'opacity-0'}
      `}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.icon} flex items-center justify-center`}>
                    <span className="text-base">{icon}</span>
                </div>
            </div>
            <p className={`text-2xl font-extrabold ${c.text} animate-count-up tracking-tight`}>
                {value}
            </p>
            {subtitle && (
                <p className="text-[11px] text-slate-600 mt-1 font-medium">{subtitle}</p>
            )}
        </div>
    );
}

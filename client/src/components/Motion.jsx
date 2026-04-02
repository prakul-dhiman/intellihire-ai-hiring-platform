import { motion } from 'framer-motion';

/* Page transition wrapper */
export function PageTransition({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            {children}
        </motion.div>
    );
}

/* Staggered children container */
export function StaggerContainer({ children, className = '', delay = 0 }) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            animate="visible"
            variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.05, delayChildren: delay } },
            }}
        >
            {children}
        </motion.div>
    );
}

/* Individual stagger item */
export function StaggerItem({ children, className = '' }) {
    return (
        <motion.div
            className={className}
            variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
            }}
        >
            {children}
        </motion.div>
    );
}

/* Glass card with optional hover */
export function GlassCard({ children, className = '', hover = true, style = {}, onClick }) {
    return (
        <motion.div
            className={className}
            style={{
                background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.55), rgba(20, 16, 55, 0.45))',
                border: '1px solid rgba(99, 102, 241, 0.12)',
                borderRadius: '1rem',
                backdropFilter: 'blur(16px)',
                ...style,
            }}
            whileHover={hover ? {
                borderColor: 'rgba(99, 102, 241, 0.25)',
                y: -2,
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.08)',
                transition: { duration: 0.2 },
            } : {}}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
}

/* Radial score ring */
export function ScoreRing({ score = 0, size = 120, strokeWidth = 8, color, label }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(Math.max(score, 0), 100);
    const offset = circumference - (progress / 100) * circumference;
    const scoreColor = color || (score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171');

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(99,102,241,0.08)" strokeWidth={strokeWidth} />
                    <motion.circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke={scoreColor} strokeWidth={strokeWidth} strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
                        style={{ filter: `drop-shadow(0 0 6px ${scoreColor}40)` }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                        className="text-2xl font-extrabold text-white"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                    >
                        {score}
                    </motion.span>
                </div>
            </div>
            {label && <span className="text-[11px] font-medium" style={{ color: '#64748b' }}>{label}</span>}
        </div>
    );
}

/* Skeleton loader */
export function Skeleton({ className = '', width, height }) {
    return (
        <div
            className={`rounded-lg ${className}`}
            style={{
                width, height,
                background: 'linear-gradient(90deg, rgba(99,102,241,0.05), rgba(99,102,241,0.1), rgba(99,102,241,0.05))',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
            }}
        />
    );
}

/* Floating gradient blob */
export function FloatingBlob({ color = 'indigo', size = 500, top, left, right, bottom, delay = 0 }) {
    const colors = {
        indigo: 'rgba(99,102,241,0.06)',
        purple: 'rgba(139,92,246,0.06)',
        sky: 'rgba(14,165,233,0.05)',
    };
    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
                width: size, height: size, top, left, right, bottom,
                background: colors[color] || colors.indigo,
                filter: 'blur(120px)',
            }}
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay }}
        />
    );
}

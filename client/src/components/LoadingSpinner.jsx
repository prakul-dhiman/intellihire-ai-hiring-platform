import { motion } from 'framer-motion';

export default function LoadingSpinner({ message = 'Loading...' }) {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-16 h-16 mb-6">
                {/* Outermost Ring */}
                <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-indigo-500/20"
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Moving Pulse */}
                <motion.div
                    className="absolute inset-1 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                    animate={{ 
                        rotate: -360,
                        borderRadius: ["20%", "50%", "20%"]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                {/* Inner Glow */}
                <div className="absolute inset-4 rounded-full bg-[#07090f] flex items-center justify-center">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                </div>
            </div>
            
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-1.5"
            >
                <p className="text-sm font-bold tracking-tight text-white/90">{message}</p>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-indigo-400/60 animate-pulse">Processing Request</p>
            </motion.div>
        </div>
    );
}

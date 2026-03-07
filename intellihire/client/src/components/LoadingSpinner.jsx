import { motion } from 'framer-motion';

export default function LoadingSpinner({ message = 'Loading...' }) {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <motion.div
                className="w-10 h-10 rounded-xl"
                style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-sm font-medium mt-4" style={{ color: '#64748b' }}>{message}</p>
        </div>
    );
}

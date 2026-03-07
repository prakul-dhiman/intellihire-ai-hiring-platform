import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineUser } from 'react-icons/hi';
import { PageTransition } from '../components/Motion';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'candidate' });
    const [showPassword, setShowPassword] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Password strength calculation
    const getPasswordRequirements = (pw) => {
        return [
            { id: 'length', label: 'At least 8 characters', met: pw.length >= 8 },
            { id: 'upper', label: 'One uppercase letter', met: /[A-Z]/.test(pw) },
            { id: 'lower', label: 'One lowercase letter', met: /[a-z]/.test(pw) },
            { id: 'number', label: 'One number', met: /[0-9]/.test(pw) },
            { id: 'special', label: 'One special character', met: /[^A-Za-z0-9]/.test(pw) },
        ];
    };

    const reqs = getPasswordRequirements(form.password);
    const strengthScore = reqs.filter(r => r.met).length;

    const strengthConfig = [
        { label: 'Weak', color: '#f87171' },
        { label: 'Fair', color: '#fbbf24' },
        { label: 'Good', color: '#fbbf24' },
        { label: 'Strong', color: '#34d399' },
        { label: 'Excellent', color: '#22c55e' }
    ];
    const currentStrength = strengthConfig[Math.max(0, strengthScore - 1)];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (strengthScore < 4) {
            return setError('Please use a stronger password meeting the requirements.');
        }
        setLoading(true);
        try {
            const data = await register(form.name, form.email, form.password, form.role);
            if (data.success) {
                const navPath = data.user.role === 'admin' ? '/admin/dashboard' : data.user.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard';
                navigate(navPath);
            }
            else setError(data.message || 'Registration failed');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>

                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '18px', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(99,102,241,0.25)' }}>IH</div>
                        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Create your account</h1>
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Join IntelliHire and get started</p>
                    </div>

                    <div style={{ backgroundColor: 'rgba(30,27,75,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px', padding: '32px' }}>
                        {error && (
                            <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            {/* Role */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>I am a</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                    {[{ value: 'candidate', emoji: '👤', label: 'Candidate' }, { value: 'recruiter', emoji: '🏢', label: 'Recruiter' }, { value: 'admin', emoji: '🛡️', label: 'Admin' }].map(({ value, emoji, label }) => (
                                        <button key={value} type="button" onClick={() => setForm({ ...form, role: value })}
                                            style={{
                                                padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                backgroundColor: form.role === value ? 'rgba(99,102,241,0.12)' : 'transparent',
                                                border: `1px solid ${form.role === value ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.1)'}`,
                                                color: form.role === value ? '#fff' : '#64748b',
                                            }}
                                        >{emoji} {label}</button>
                                    ))}
                                </div>
                            </div>
                            {/* Name */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <HiOutlineUser size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                    <input id="register-name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" style={{ paddingLeft: '42px' }} placeholder="John Doe" required />
                                </div>
                            </div>
                            {/* Email */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Email</label>
                                <div style={{ position: 'relative' }}>
                                    <HiOutlineMail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                    <input id="register-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" style={{ paddingLeft: '42px' }} placeholder="you@example.com" required />
                                </div>
                            </div>
                            {/* Password */}
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>Password</label>
                                    {form.password && (
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: currentStrength?.color }}>
                                            {currentStrength?.label}
                                        </span>
                                    )}
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <HiOutlineLockClosed size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                    <input
                                        id="register-password" type={showPassword ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        onFocus={() => setPasswordFocused(true)}
                                        onBlur={() => setPasswordFocused(false)}
                                        className="input-field" style={{ paddingLeft: '42px', paddingRight: '42px' }}
                                        placeholder="Create a strong password" required minLength={8}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                                    </button>
                                </div>

                                {/* Password Strength Meter (Animated Tooltip) */}
                                <AnimatePresence>
                                    {(passwordFocused || form.password.length > 0) && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            style={{ overflow: 'hidden', marginTop: '12px' }}
                                        >
                                            <div style={{ padding: '12px', background: 'rgba(10,6,30,0.5)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.1)' }}>
                                                {/* Progress Bar */}
                                                <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <div key={i} style={{
                                                            height: '4px', flex: 1, borderRadius: '2px',
                                                            background: i < strengthScore ? currentStrength.color : 'rgba(255,255,255,0.1)',
                                                            transition: 'background 0.3s ease'
                                                        }} />
                                                    ))}
                                                </div>

                                                {/* Requirements List */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                    {reqs.map((req) => (
                                                        <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            {req.met ? (
                                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                                </div>
                                                            ) : (
                                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px solid #64748b' }} />
                                                            )}
                                                            <span style={{ fontSize: '11px', color: req.met ? '#e2e8f0' : '#64748b', transition: 'color 0.2s' }}>{req.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <motion.span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                                        Creating account...
                                    </span>
                                ) : 'Create Account'}
                            </button>
                        </form>
                    </div>

                    <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginTop: '24px' }}>
                        Already have an account?{' '}<Link to="/login" style={{ fontWeight: 600, color: '#818cf8' }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </PageTransition>
    );
}

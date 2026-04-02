import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { PageTransition } from '../components/Motion';
import LogoSVG from '../components/LogoSVG';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(form.email, form.password);
            if (data.success) {
                const navPath = data.user.role === 'admin'
                    ? '/admin/dashboard'
                    : data.user.role === 'recruiter'
                    ? '/recruiter/dashboard'
                    : '/candidate/dashboard';
                navigate(navPath, { replace: true });
            } else {
                const msg = data.message || 'Login failed';
                console.error('[Login] Server rejected login:', msg);
                setError(msg);
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Login failed';
            console.error('[Login] Unexpected error:', msg, err);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <PageTransition>
            <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}><LogoSVG size={54} /></div>
                        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Welcome back</h1>
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Sign in to your IntelliHire account</p>
                    </div>

                    {/* Card */}
                    <div style={{ backgroundColor: 'rgba(30,27,75,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px', padding: '32px' }}>
                        {error && (
                            <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label htmlFor="login-email" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Email</label>
                                <div style={{ position: 'relative' }}>
                                    <HiOutlineMail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                    <input id="login-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="input-field" style={{ paddingLeft: '42px' }} placeholder="you@example.com" required />
                                </div>
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label htmlFor="login-password" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <HiOutlineLockClosed size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                    <input id="login-password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        className="input-field" style={{ paddingLeft: '42px', paddingRight: '42px' }} placeholder="Enter password" required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                                    </button>
                                </div>
                                <div style={{ textAlign: 'right', marginTop: '8px' }}>
                                    <Link to="/forgot-password" style={{ fontSize: '13px', color: '#818cf8', textDecoration: 'none', fontWeight: 500 }}>
                                        Forgot Password?
                                    </Link>
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <motion.span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                                        Signing in...
                                    </span>
                                ) : 'Sign In'}
                            </button>
                        </form>
                    </div>

                    <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginTop: '24px' }}>
                        Don't have an account?{' '}<Link to="/register" style={{ fontWeight: 600, color: '#818cf8' }}>Create one</Link>
                    </p>
                </div>
            </div>
        </PageTransition>
    );
}

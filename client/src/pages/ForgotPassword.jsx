import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { HiOutlineMail, HiOutlineArrowLeft } from 'react-icons/hi';
import { PageTransition } from '../components/Motion';
import LogoSVG from '../components/LogoSVG';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/forgotpassword', { email });
            setMessage(data.message || 'If an account exists with that email, a reset link has been sent.');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}><LogoSVG size={54} /></div>
                        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Reset Password</h1>
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Enter your email to receive a reset link</p>
                    </div>

                    <div style={{ backgroundColor: 'rgba(30,27,75,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px', padding: '32px' }}>
                        {error && (
                            <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                                {error}
                            </div>
                        )}
                        {message && (
                            <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '24px' }}>
                                <label htmlFor="forgot-email" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <HiOutlineMail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                    <input id="forgot-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="input-field" style={{ paddingLeft: '42px' }} placeholder="you@example.com" required />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <motion.span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                                        Sending link...
                                    </span>
                                ) : 'Send Reset Link'}
                            </button>
                        </form>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                        <Link to="/login" style={{ fontSize: '14px', color: '#818cf8', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontWeight: 500 }}>
                            <HiOutlineArrowLeft size={16} /> Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

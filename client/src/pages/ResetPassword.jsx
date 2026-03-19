import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { PageTransition } from '../components/Motion';
import LogoSVG from '../components/LogoSVG';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const getPasswordRequirements = (pw) => {
        return [
            { id: 'length', label: '8+ chars', met: pw.length >= 8 },
            { id: 'upper', label: 'Uppercase', met: /[A-Z]/.test(pw) },
            { id: 'lower', label: 'Lowercase', met: /[a-z]/.test(pw) },
            { id: 'number', label: 'Number', met: /[0-9]/.test(pw) },
            { id: 'special', label: 'Special', met: /[^A-Za-z0-9]/.test(pw) },
        ];
    };

    const reqs = getPasswordRequirements(password);
    const strengthScore = reqs.filter(r => r.met).length;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }
        if (strengthScore < 4) {
            return setError('Please use a stronger password');
        }
        setLoading(true);
        try {
            await api.put(`/auth/resetpassword/${token}`, { password });
            alert('Password reset successfully! Please login with your new password.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Token is invalid or has expired');
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
                        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Set New Password</h1>
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Choose a strong password for your account</p>
                    </div>

                    <div style={{ backgroundColor: 'rgba(30,27,75,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px', padding: '32px' }}>
                        {error && (
                            <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <HiOutlineLockClosed size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)}
                                        className="input-field" style={{ paddingLeft: '42px', paddingRight: '42px' }} placeholder="Min 8 characters" required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {(passwordFocused || password.length > 0) && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginTop: '12px' }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                                {reqs.map(req => (
                                                    <span key={req.id} style={{ fontSize: '11px', color: req.met ? '#4ade80' : '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        {req.met ? '✓' : '○'} {req.label}
                                                    </span>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <HiOutlineLockClosed size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="input-field" style={{ paddingLeft: '42px' }} placeholder="Repeat password" required />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineBell, HiOutlineMoon, HiOutlineDesktopComputer } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { PageTransition } from '../../components/Motion';

export default function CandidateSettings() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    // Form states
    const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '', bio: '' });
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
    const [notifications, setNotifications] = useState({ email: true, push: false, updates: true });

    return (
        <PageTransition>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>Settings</h1>
                    <p style={{ color: '#94a3b8', fontSize: '15px' }}>Manage your account settings and preferences.</p>
                </div>

                <div style={{ display: 'flex', gap: '32px', flexDirection: 'column', '@media(min-width: 768px)': { flexDirection: 'row' } }}>

                    {/* Sidebar Tabs */}
                    <div style={{ width: '240px', flexShrink: 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                { id: 'profile', label: 'Profile Settings', icon: HiOutlineUser },
                                { id: 'security', label: 'Password & Security', icon: HiOutlineLockClosed },
                                { id: 'notifications', label: 'Notifications', icon: HiOutlineBell },
                                { id: 'appearance', label: 'Appearance', icon: HiOutlineDesktopComputer }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '12px 16px', borderRadius: '10px',
                                        fontSize: '14px', fontWeight: 600,
                                        cursor: 'pointer', transition: 'all 0.2s',
                                        border: 'none', textAlign: 'left',
                                        background: activeTab === tab.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                                        color: activeTab === tab.id ? '#818cf8' : '#94a3b8',
                                    }}
                                    onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.color = '#e2e8f0' }}
                                    onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.color = '#94a3b8' }}
                                >
                                    <tab.icon size={20} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div style={{ flex: 1 }}>
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                background: 'rgba(30,27,75,0.4)',
                                border: '1px solid rgba(99,102,241,0.15)',
                                borderRadius: '16px', padding: '32px'
                            }}
                        >
                            {activeTab === 'profile' && (
                                <div>
                                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: '24px' }}>Profile Information</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Full Name</label>
                                            <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="input-field" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Email Address</label>
                                            <input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} className="input-field" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Short Bio</label>
                                            <textarea value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} className="input-field" style={{ minHeight: '100px', resize: 'vertical' }} placeholder="Write a short bio about yourself..." />
                                        </div>
                                        <div style={{ marginTop: '16px' }}>
                                            <button className="btn-primary" onClick={() => alert('Profile updated!')} style={{ padding: '10px 24px' }}>Save Changes</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div>
                                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: '24px' }}>Change Password</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Current Password</label>
                                            <input type="password" value={passwordForm.current} onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} className="input-field" placeholder="Enter current password" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>New Password</label>
                                            <input type="password" value={passwordForm.new} onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })} className="input-field" placeholder="Enter new password" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Confirm New Password</label>
                                            <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="input-field" placeholder="Confirm new password" />
                                        </div>
                                        <div style={{ marginTop: '16px' }}>
                                            <button className="btn-primary" onClick={() => alert('Password updated!')} style={{ padding: '10px 24px' }}>Update Password</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div>
                                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: '24px' }}>Notification Preferences</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {[
                                            { id: 'email', title: 'Email Notifications', desc: 'Receive updates about your interview process via email.' },
                                            { id: 'push', title: 'Push Notifications', desc: 'Receive push notifications on this device.' },
                                            { id: 'updates', title: 'Product Updates', desc: 'Receive news about new features and improvements.' }
                                        ].map(item => (
                                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div>
                                                    <p style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0' }}>{item.title}</p>
                                                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{item.desc}</p>
                                                </div>
                                                <button
                                                    onClick={() => setNotifications({ ...notifications, [item.id]: !notifications[item.id] })}
                                                    style={{
                                                        width: '44px', height: '24px', borderRadius: '12px',
                                                        background: notifications[item.id] ? '#6366f1' : 'rgba(255,255,255,0.1)',
                                                        border: 'none', cursor: 'pointer', position: 'relative',
                                                        transition: 'background 0.3s'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                                                        position: 'absolute', top: '3px',
                                                        left: notifications[item.id] ? '23px' : '3px',
                                                        transition: 'left 0.3s'
                                                    }} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'appearance' && (
                                <div>
                                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: '24px' }}>Appearance</h2>
                                    <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>Customize how IntelliHire looks on your device.</p>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                        <div style={{ border: '2px solid #6366f1', borderRadius: '12px', padding: '16px', background: '#07090f', cursor: 'pointer' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                <HiOutlineMoon size={20} color="#818cf8" />
                                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Dark Mode</span>
                                            </div>
                                            <div style={{ width: '100%', height: '60px', borderRadius: '6px', background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)' }} />
                                            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '12px', textAlign: 'center' }}>Active</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>

                </div>
            </div>
        </PageTransition>
    );
}

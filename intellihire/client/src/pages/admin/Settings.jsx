import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineBell, HiOutlineMoon, HiOutlineDesktopComputer, HiOutlineOfficeBuilding } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { PageTransition } from '../../components/Motion';

export default function AdminSettings() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    // Form states
    const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '', company: 'IntelliHire Inc.' });
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
    const [notifications, setNotifications] = useState({ newCandidates: true, interviewAlerts: true, weeklyReports: false });

    return (
        <PageTransition>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '12px 0px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>Admin Settings</h1>
                    <p style={{ color: '#94a3b8', fontSize: '15px' }}>Manage recruiter account and platform preferences.</p>
                </div>

                <div style={{ display: 'flex', gap: '32px', flexDirection: 'column', '@media(min-width: 768px)': { flexDirection: 'row' } }}>

                    {/* Sidebar Tabs */}
                    <div style={{ width: '240px', flexShrink: 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                { id: 'profile', label: 'Admin Profile', icon: HiOutlineUser },
                                { id: 'company', label: 'Company Details', icon: HiOutlineOfficeBuilding },
                                { id: 'security', label: 'Security', icon: HiOutlineLockClosed },
                                { id: 'notifications', label: 'Alerts & Reports', icon: HiOutlineBell },
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
                                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: '24px' }}>Recruiter Information</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Full Name</label>
                                            <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="input-field" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Email Address</label>
                                            <input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} className="input-field" />
                                        </div>
                                        <div style={{ marginTop: '16px' }}>
                                            <button className="btn-primary" onClick={() => alert('Profile updated!')} style={{ padding: '10px 24px' }}>Save Changes</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'company' && (
                                <div>
                                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: '24px' }}>Company Details</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Company Name</label>
                                            <input type="text" value={profileForm.company} onChange={e => setProfileForm({ ...profileForm, company: e.target.value })} className="input-field" />
                                        </div>
                                        <div style={{ marginTop: '16px' }}>
                                            <button className="btn-primary" onClick={() => alert('Company updated!')} style={{ padding: '10px 24px' }}>Update Company</button>
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
                                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: '24px' }}>Recruitment Alerts</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {[
                                            { id: 'newCandidates', title: 'New Candidate Signups', desc: 'Get alerted when a candidate registers for an interview.' },
                                            { id: 'interviewAlerts', title: 'Interview Completion', desc: 'Notify me when an AI proctored interview is finished.' },
                                            { id: 'weeklyReports', title: 'Weekly Screening Reports', desc: 'Receive a digest of top candidates.' }
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
                        </motion.div>
                    </div>

                </div>
            </div>
        </PageTransition>
    );
}

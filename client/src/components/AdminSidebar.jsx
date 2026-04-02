import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineViewGrid, HiOutlineChartBar, HiOutlineStar, HiOutlineLogout, HiOutlineDocumentSearch, HiOutlineCog } from 'react-icons/hi';
import LogoSVG from './LogoSVG';

const navItems = [
    { to: '/admin/dashboard', icon: HiOutlineViewGrid, label: 'Dashboard' },
    { to: '/admin/bulk-screening', icon: HiOutlineDocumentSearch, label: 'Bulk CV Analyzer' },
    { to: '/admin/analytics', icon: HiOutlineChartBar, label: 'Analytics' },
    { to: '/admin/leaderboard', icon: HiOutlineStar, label: 'Leaderboard' },
    { to: '/admin/settings', icon: HiOutlineCog, label: 'Settings' },
];

export default function AdminSidebar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <aside style={{
            position: 'fixed', top: 0, left: 0, height: '100vh', width: '256px',
            display: 'flex', flexDirection: 'column',
            backgroundColor: '#0d0a1f', borderRight: '1px solid rgba(99,102,241,0.1)',
            zIndex: 40,
        }}>
            {/* Logo */}
            <div style={{ padding: '24px 20px 16px' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                    <LogoSVG size={36} />
                    <div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>IntelliHire</div>
                        <div style={{ fontSize: '11px', fontWeight: 500, color: '#475569', marginTop: '-2px' }}>Admin Panel</div>
                    </div>
                </Link>
            </div>

            <div style={{ margin: '0 20px 16px', borderTop: '1px solid rgba(99,102,241,0.08)' }}></div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '0 12px' }}>
                <p style={{ padding: '0 12px', marginBottom: '8px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#475569' }}>Menu</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.to || (item.to === '/admin/dashboard' && location.pathname.startsWith('/admin/candidate/'));
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '12px 16px', borderRadius: '10px',
                                    fontSize: '14px', fontWeight: 500,
                                    color: isActive ? '#fff' : '#94a3b8',
                                    backgroundColor: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                                    border: isActive ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                                    transition: 'all 0.15s',
                                    textDecoration: 'none',
                                }}
                            >
                                <item.icon size={20} style={{ color: isActive ? '#818cf8' : 'inherit' }} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* User */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(99,102,241,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '13px', fontWeight: 700,
                    }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
                        <p style={{ fontSize: '12px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 12px', borderRadius: '8px',
                        fontSize: '13px', fontWeight: 500, color: '#94a3b8',
                        backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                        transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <HiOutlineLogout size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}

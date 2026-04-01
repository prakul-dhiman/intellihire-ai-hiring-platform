import AdminSidebar from './AdminSidebar';
import LogoSVG from './LogoSVG';

export default function AdminLayout({ children }) {
    return (
        <div className="flex min-h-screen admin-layout-wrapper">
            <style>{`
                .admin-layout-wrapper .admin-sidebar-container { display: none; }
                .admin-layout-wrapper .admin-main-content { margin-left: 0; }
                @media (min-width: 1024px) {
                    .admin-layout-wrapper .admin-sidebar-container { display: block; }
                    .admin-layout-wrapper .admin-main-content { margin-left: 256px; }
                }
            `}</style>

            {/* Sidebar — hidden on mobile */}
            <div className="admin-sidebar-container">
                <AdminSidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 min-h-screen admin-main-content">
                {/* Mobile Header */}
                <div
                    className="lg:hidden sticky top-0 z-30"
                    style={{
                        padding: '10px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        backgroundColor: '#0d0a1f',
                        borderBottom: '1px solid rgba(99,102,241,0.1)',
                    }}
                >
                    <LogoSVG size={28} />
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>IntelliHire</span>
                </div>

                <div style={{ padding: '24px' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}

import RecruiterSidebar from './RecruiterSidebar';

export default function RecruiterLayout({ children }) {
    return (
        <div className="flex min-h-screen" style={{ backgroundColor: '#05030f', color: '#e2e8f0' }}>
            <style>{`
                .recruiter-layout-wrapper .recruiter-sidebar-container { display: none; }
                .recruiter-layout-wrapper .recruiter-main-content { margin-left: 0; }
                @media (min-width: 1024px) {
                    .recruiter-layout-wrapper .recruiter-sidebar-container { display: block; }
                    .recruiter-layout-wrapper .recruiter-main-content { margin-left: 256px; }
                }
            `}</style>

            <div className="recruiter-sidebar-container lg:block hidden fixed top-0 left-0 h-screen w-64 bg-slate-900 z-40 border-r border-indigo-500/10">
                <RecruiterSidebar />
            </div>

            <main className="flex-1 min-h-screen lg:ml-64 relative z-10 w-full" style={{ background: '#07090f' }}>
                {/* Mobile Header */}
                <div
                    className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-6 py-4"
                    style={{
                        backgroundColor: '#0d0a1f',
                        borderBottom: '1px solid rgba(99,102,241,0.1)',
                    }}
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-500/20">
                        IH
                    </div>
                    <span className="font-bold text-white tracking-wide">IntelliHire</span>
                </div>

                <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}

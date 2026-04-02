import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { PageTransition, Skeleton } from '../../components/Motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    AreaChart, Area,
} from 'recharts';

const COLORS = { indigo: '#818cf8', purple: '#a78bfa', sky: '#38bdf8', emerald: '#34d399', amber: '#fbbf24', rose: '#fb7185', pink: '#f472b6', teal: '#2dd4bf', orange: '#fb923c', lime: '#a3e635' };
const PIE_COLORS = [COLORS.indigo, COLORS.sky, COLORS.emerald, COLORS.amber, COLORS.rose, COLORS.purple, COLORS.pink, COLORS.teal, COLORS.orange, COLORS.lime];
const DIST_COLORS = [COLORS.rose, COLORS.amber, COLORS.sky, COLORS.emerald, COLORS.indigo];
const card = { backgroundColor: 'rgba(30,27,75,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px' };

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'rgba(10,6,30,0.95)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px', padding: '10px 14px' }}>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>{label}</p>
            {payload.map((p, i) => <p key={i} style={{ fontSize: '14px', fontWeight: 600, color: p.color }}>{p.name}: {p.value}</p>)}
        </div>
    );
};

const PieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'rgba(10,6,30,0.95)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px', padding: '10px 14px' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{payload[0].name}</p>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>{payload[0].value} candidates</p>
        </div>
    );
};

const PieLegend = ({ payload }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginTop: '8px' }}>
        {payload?.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: e.color }}></div>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{e.value}</span>
            </div>
        ))}
    </div>
);

export default function Analytics() {
    const [overview, setOverview] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [skills, setSkills] = useState([]);
    const [distribution, setDistribution] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeScoreTab, setActiveScoreTab] = useState('final');

    useEffect(() => {
        Promise.all([
            api.get('/admin/analytics/overview'),
            api.get('/admin/analytics/monthly-registrations'),
            api.get('/admin/analytics/top-skills'),
            api.get('/admin/analytics/score-distribution'),
        ]).then(([ovRes, regRes, skillRes, distRes]) => {
            setOverview(ovRes.data.data.overview);
            setRegistrations(regRes.data.data.registrations);
            setSkills(skillRes.data.data.skills);
            setDistribution(distRes.data.data.distribution);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
            <Skeleton height="32px" className="w-48 mb-6" />
            <div className="grid grid-cols-6 gap-4 mb-6">{[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} height="100px" />)}</div>
            <Skeleton height="300px" className="w-full" />
        </div>
    );

    const ov = overview || {};
    const distData = distribution?.[activeScoreTab] || [];
    const scoreTabs = [{ key: 'final', label: 'Final' }, { key: 'resume', label: 'Resume' }, { key: 'coding', label: 'Coding' }, { key: 'interview', label: 'Interview' }];

    return (
        <PageTransition>
            <div style={{ maxWidth: '100%', padding: '0' }}>
                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Analytics</h1>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>Platform-wide performance insights and trends</p>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6" style={{ gap: '16px', marginBottom: '24px' }}>
                    {[
                        { icon: '👥', label: 'Total', value: ov.totalCandidates ?? 0, color: '#818cf8' },
                        { icon: '📄', label: 'Avg Resume', value: ov.avgResumeScore ?? 0, color: '#34d399' },
                        { icon: '💻', label: 'Avg Coding', value: ov.avgCodingScore ?? 0, color: '#38bdf8' },
                        { icon: '🎤', label: 'Avg Interview', value: ov.avgInterviewScore ?? 0, color: '#fbbf24' },
                        { icon: '🏆', label: 'Avg Final', value: ov.avgFinalScore ?? 0, color: '#a78bfa' },
                        { icon: '✅', label: 'Pass Rate', value: `${ov.passRate ?? 0}%`, color: '#fb7185' },
                    ].map(({ icon, label, value, color }, i) => (
                        <motion.div key={label} style={{ ...card, padding: '20px' }}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '20px' }}>{icon}</span>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}></div>
                            </div>
                            <p style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>{value}</p>
                            <p style={{ fontSize: '12px', fontWeight: 500, color: '#64748b', marginTop: '2px' }}>{label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr]" style={{ gap: '20px', marginBottom: '20px' }}>
                    <div style={{ ...card, padding: '24px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>Monthly Registrations</h3>
                        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Candidate sign-ups over 12 months</p>
                        <div style={{ height: '256px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={registrations} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
                                    <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'rgba(99,102,241,0.12)' }} tickFormatter={v => v.split(' ')[0]} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'rgba(99,102,241,0.12)' }} allowDecimals={false} />
                                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                                    <Bar dataKey="count" name="Registrations" radius={[6, 6, 0, 0]} maxBarSize={36}>
                                        {registrations.map((_, i) => <Cell key={i} fill="url(#barG)" />)}
                                    </Bar>
                                    <defs>
                                        <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={COLORS.indigo} stopOpacity={1} />
                                            <stop offset="100%" stopColor={COLORS.purple} stopOpacity={0.6} />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div style={{ ...card, padding: '24px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>Skill Distribution</h3>
                        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Most common skills</p>
                        <div style={{ height: '256px' }}>
                            {skills.length === 0 ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '14px', color: '#64748b' }}>No skills data</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={skills.slice(0, 8)} dataKey="count" nameKey="skill" cx="50%" cy="45%" outerRadius={80} innerRadius={42} paddingAngle={3} stroke="none">
                                            {skills.slice(0, 8).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip content={<PieTooltip />} />
                                        <Legend content={<PieLegend />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                {/* Score Distribution */}
                <div style={{ ...card, padding: '24px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div>
                            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>Score Distribution</h3>
                            <p style={{ fontSize: '12px', color: '#64748b' }}>Candidates across score ranges</p>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '12px', backgroundColor: 'rgba(30,27,75,0.6)' }}>
                            {scoreTabs.map(t => (
                                <button key={t.key} onClick={() => setActiveScoreTab(t.key)}
                                    style={{
                                        padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                        color: activeScoreTab === t.key ? '#fff' : '#64748b',
                                        backgroundColor: activeScoreTab === t.key ? 'rgba(99,102,241,0.15)' : 'transparent',
                                        border: activeScoreTab === t.key ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                                        transition: 'all 0.15s',
                                    }}>{t.label}</button>
                            ))}
                        </div>
                    </div>
                    <div style={{ height: '256px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={distData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="aG" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={COLORS.indigo} stopOpacity={0.4} />
                                        <stop offset="100%" stopColor={COLORS.indigo} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
                                <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'rgba(99,102,241,0.12)' }} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'rgba(99,102,241,0.12)' }} allowDecimals={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Area type="monotone" dataKey="count" name="Candidates" stroke={COLORS.indigo} strokeWidth={2.5} fill="url(#aG)" dot={{ r: 5, fill: COLORS.indigo, stroke: '#1e1b4b', strokeWidth: 2 }} activeDot={{ r: 7, fill: COLORS.indigo, stroke: '#fff', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-5" style={{ gap: '8px', marginTop: '16px' }}>
                        {distData.map((d, i) => (
                            <div key={d.range} style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', backgroundColor: `${DIST_COLORS[i]}10` }}>
                                <p style={{ fontSize: '12px', color: '#64748b' }}>{d.range}</p>
                                <p style={{ fontSize: '20px', fontWeight: 700, color: DIST_COLORS[i] }}>{d.count}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '16px' }}>
                    {[
                        { icon: '🎯', label: 'Evaluated', value: ov.evaluatedCount ?? 0, color: '#34d399', pct: ov.totalCandidates ? ((ov.evaluatedCount / ov.totalCandidates) * 100).toFixed(0) : 0, sub: 'of candidates evaluated' },
                        { icon: '🏅', label: 'Passed (≥70)', value: ov.passCount ?? 0, color: '#fbbf24', pct: ov.passRate ?? 0, sub: 'pass rate' },
                        { icon: '🧮', label: 'Formula', value: null, color: '#818cf8', sub: 'Resume + Coding + Interview = Final', formula: true },
                    ].map(({ icon, label, value, color, pct, sub, formula }, i) => (
                        <motion.div key={label} style={{ ...card, padding: '20px' }}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b' }}>{label}</p>
                                    {formula ? (
                                        <p style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: 700, marginTop: '4px' }}>
                                            <span style={{ color: '#34d399' }}>R×.3</span> + <span style={{ color: '#38bdf8' }}>C×.5</span> + <span style={{ color: '#fbbf24' }}>I×.2</span>
                                        </p>
                                    ) : (
                                        <p style={{ fontSize: '24px', fontWeight: 700, color, marginTop: '4px' }}>{value}</p>
                                    )}
                                </div>
                                <span style={{ fontSize: '24px' }}>{icon}</span>
                            </div>
                            {!formula && (
                                <div style={{ marginTop: '10px' }}>
                                    <div style={{ width: '100%', height: '6px', borderRadius: '99px', backgroundColor: 'rgba(30,27,75,0.6)' }}>
                                        <div style={{ height: '6px', borderRadius: '99px', width: `${pct}%`, background: `linear-gradient(90deg, ${color}cc, ${color})` }}></div>
                                    </div>
                                </div>
                            )}
                            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>{formula ? sub : `${pct}% ${sub}`}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </PageTransition>
    );
}

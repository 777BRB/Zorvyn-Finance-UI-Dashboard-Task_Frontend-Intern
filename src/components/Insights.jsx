import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useApp } from '../context/AppContext';

const CAT_COLORS = {
  Salary: '#f59e0b', Freelance: '#10b981', Food: '#ef4444',
  Shopping: '#8b5cf6', Travel: '#06b6d4', Bills: '#f97316',
  Health: '#ec4899', Other: '#6b7280',
};

const fmt = n => '₹' + Number(n).toLocaleString('en-IN');

const tooltipStyle = {
  background: '#0a0a0a', border: '1px solid #27272a',
  borderRadius: 10, color: '#e5e7eb', fontSize: 12,
};

const Insights = () => {
  const { transactions, summary, loading } = useApp();

  const savingsRate = summary.income > 0
    ? ((summary.balance / summary.income) * 100).toFixed(1)
    : '0.0';

  // Category breakdown (expenses)
  const catBreakdown = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Weekly aggregation (Mar 2026: 4+ weeks)
  const weeklyData = useMemo(() => {
    const weeks = [
      { week: 'W1 (1–7)',   income: 0, expenses: 0 },
      { week: 'W2 (8–14)',  income: 0, expenses: 0 },
      { week: 'W3 (15–21)', income: 0, expenses: 0 },
      { week: 'W4 (22–31)', income: 0, expenses: 0 },
    ];
    transactions.forEach(t => {
      const day = parseInt(t.date.slice(8));
      const wi = day <= 7 ? 0 : day <= 14 ? 1 : day <= 21 ? 2 : 3;
      if (t.type === 'income') weeks[wi].income   += t.amount;
      else                     weeks[wi].expenses += t.amount;
    });
    return weeks.map(w => ({ ...w, net: w.income - w.expenses }));
  }, [transactions]);

  // Top spending day
  const topDay = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.date] = (map[t.date] || 0) + t.amount;
    });
    const [date, amt] = Object.entries(map).sort((a, b) => b[1] - a[1])[0] || ['–', 0];
    return { date, amt };
  }, [transactions]);

  // Avg daily spend
  const avgDailySpend = useMemo(() => {
    const days = new Set(transactions.filter(t => t.type === 'expense').map(t => t.date)).size;
    return days > 0 ? (summary.expenses / days).toFixed(0) : 0;
  }, [transactions, summary.expenses]);

  // MoM placeholder (single month data — show week-over-week instead)
  const wow = weeklyData.length >= 2
    ? (((weeklyData[3].expenses - weeklyData[0].expenses) / (weeklyData[0].expenses || 1)) * 100).toFixed(1)
    : null;

  const observations = [
    catBreakdown[0] && {
      icon: '🔥', type: 'warn',
      text: `Top spending category: <b>${catBreakdown[0].name}</b> — ${fmt(catBreakdown[0].value)} (${((catBreakdown[0].value / summary.expenses) * 100).toFixed(1)}% of expenses)`,
    },
    {
      icon: parseFloat(savingsRate) >= 20 ? '🎯' : '⚠️',
      type: parseFloat(savingsRate) >= 20 ? 'good' : 'warn',
      text: parseFloat(savingsRate) >= 20
        ? `Savings rate <b>${savingsRate}%</b> — above the recommended 20% threshold. Solid discipline.`
        : `Savings rate <b>${savingsRate}%</b> — below 20%. Consider trimming ${catBreakdown[0]?.name || 'discretionary'} spend.`,
    },
    wow !== null && {
      icon: wow > 0 ? '📈' : '📉', type: wow > 0 ? 'warn' : 'good',
      text: `Week 1 vs Week 4 spending ${wow > 0 ? 'increased' : 'decreased'} by <b>${Math.abs(wow)}%</b> — month ${wow > 0 ? 'ended heavier' : 'improved over time'}.`,
    },
    {
      icon: '💡', type: 'info',
      text: `Average daily expenditure: <b>${fmt(avgDailySpend)}</b>. Highest-spend day: <b>${topDay.date}</b> at ${fmt(topDay.amt)}.`,
    },
  ].filter(Boolean);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col gap-4 sm:gap-6">

      {/*KPI*/}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Savings Rate',    value: savingsRate + '%',   color: parseFloat(savingsRate) >= 20 ? '#10b981' : '#f59e0b' },
          { label: 'Top Category',    value: catBreakdown[0]?.name || '–',   color: CAT_COLORS[catBreakdown[0]?.name] || '#6b7280' },
          { label: 'Avg Daily Spend', value: fmt(avgDailySpend), color: '#ef4444' },
          { label: 'Highest Spend Day', value: topDay.date.slice(5),  color: '#8b5cf6' },
        ].map(k => (
          <div key={k.label} className="bg-gray-950 border border-gray-800 rounded-xl p-4 sm:p-5 flex flex-col gap-2 hover:border-gray-700 transition-colors">
            <div className="text-xs text-gray-600 uppercase tracking-widest font-medium">{k.label}</div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/*Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Category horizontal bars */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-white mb-0.5">Expense Breakdown</h3>
          <p className="text-xs text-gray-500 mb-5">Ranked by spend amount</p>
          <div className="flex flex-col gap-3.5">
            {catBreakdown.map(d => (
              <div key={d.name} className="flex items-center gap-3">
                <div className="w-20 sm:w-24 text-xs font-medium "
                  style={{ color: CAT_COLORS[d.name] || '#6b7280' }}>
                  {d.name}
                </div>
                <div className="flex-1 h-2 bg-gray-900 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(d.value / catBreakdown[0].value) * 100}%`,
                      background: CAT_COLORS[d.name] || '#6b7280',
                    }} />
                </div>
                <div className="flex items-center gap-2 w-24 justify-end">
                  <span className="text-xs text-gray-500">{fmt(d.value)}</span>
                  <span className="text-xs text-gray-700 w-8 text-right">
                    {((d.value / summary.expenses) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly savings rate */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-white mb-0.5">Weekly Comparison</h3>
          <p className="text-xs text-gray-500 mb-4">Income vs expenses by week</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => '₹' + v / 1000 + 'k'} tick={{ fill: '#4b5563', fontSize: 11 }}
                axisLine={false} tickLine={false} width={46} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => ['₹' + Number(v).toLocaleString('en-IN')]} />
              <Bar dataKey="income"   fill="#f59e0b" radius={[3,3,0,0]} maxBarSize={18} />
              <Bar dataKey="expenses" fill="#ef4444" radius={[3,3,0,0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 text-xs text-gray-600 mt-2">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Income</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Expenses</span>
          </div>
        </div>
      </div>

      {/*Weekly net table */}
      <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden overflow-x-auto">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-white">Weekly Net Summary</h3>
          <p className="text-xs text-gray-500 mt-0.5">Income, expenses & net per week</p>
        </div>
        <table className="w-full min-w-105">
          <thead className="border-b border-gray-800">
            <tr>
              {['Week','Income','Expenses','Net'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 sm:px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-900">
            {weeklyData.map(w => (
              <tr key={w.week} className="hover:bg-gray-900/40 transition-colors">
                <td className="px-4 sm:px-5 py-3 text-xs text-gray-400 font-medium">{w.week}</td>
                <td className="px-4 sm:px-5 py-3 text-sm font-semibold text-amber-400">{fmt(w.income)}</td>
                <td className="px-4 sm:px-5 py-3 text-sm font-semibold text-red-400">{fmt(w.expenses)}</td>
                <td className={`px-4 sm:px-5 py-3 text-sm font-bold ${w.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {w.net >= 0 ? '+' : ''}{fmt(w.net)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Observations */}
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Key Observations</h3>
        <div className="flex flex-col gap-3">
          {observations.map((obs, i) => (
            <div key={i} className={`flex gap-3 p-3 sm:p-4 rounded-xl border text-sm ${
              obs.type === 'good' ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-300'
              : obs.type === 'warn' ? 'bg-amber-500/5 border-amber-500/15 text-amber-300'
              : 'bg-blue-500/5 border-blue-500/15 text-blue-300'
            }`}>
              <span className="text-base">{obs.icon}</span>
              <span className="leading-relaxed text-gray-300 text-sm"
                dangerouslySetInnerHTML={{ __html: obs.text }} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Insights;
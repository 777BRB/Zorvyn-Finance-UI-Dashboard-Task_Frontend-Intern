import React, { useMemo } from 'react';
import {
  MdAccountBalanceWallet,
  MdArrowUpward,
  MdArrowDownward,
  MdSavings
} from "react-icons/md";

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useApp } from '../context/AppContext';

const CAT_COLORS = {
  Salary: '#f59e0b', Freelance: '#10b981', Food: '#ef4444',
  Shopping: '#8b5cf6', Travel: '#06b6d4', Bills: '#f97316',
  Health: '#ec4899', Other: '#6b7280',
};

const fmt = n => '₹' + Number(n).toLocaleString('en-IN');

const StatCard = ({ label, value, sub, icon }) => (
  <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 sm:p-5 flex flex-col gap-3 hover:border-gray-700 transition-colors">
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">{label}</span>
      <span className="text-base">{icon}</span>
    </div>
    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">{value}</div>
    {sub && <div className="text-xs text-gray-500">{sub}</div>}
  </div>
);

const tooltipStyle = {
  background: '#0a0a0a', border: '1px solid #27272a',
  borderRadius: 10, color: '#e5e7eb', fontSize: 12,
};

const Dashboard = () => {
  const { transactions, summary, loading, setCurrentPage } = useApp();

  const savingsRate = summary.income > 0
    ? ((summary.balance / summary.income) * 100).toFixed(1)
    : '0.0';

  // Daily aggregation
  const dailyData = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      const day = t.date.slice(8);
      if (!map[day]) map[day] = { day: parseInt(day), income: 0, expenses: 0 };
      if (t.type === 'income') map[day].income   += t.amount;
      else                     map[day].expenses += t.amount;
    });
    return Object.values(map).sort((a, b) => a.day - b.day);
  }, [transactions]);

  // Category pie (expenses only)
  const pieData = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Recents
  const recent = useMemo(() =>
    [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [transactions]
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading data…</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-4">
        <StatCard label="Net Balance"    value={fmt(summary.balance)}  icon={<MdAccountBalanceWallet className='text-indigo-500 text-xl'/>}
          sub={summary.balance >= 0 ? 'Net positive ↑' : 'In deficit ↓'} />
        <StatCard label="Total Income"   value={fmt(summary.income)}   icon={<MdArrowUpward className='text-green-500 text-xl'/>}
          sub={`${transactions.filter(t => t.type === 'income').length} entries`} />
        <StatCard label="Total Expenses" value={fmt(summary.expenses)} icon={<MdArrowDownward className='text-red-500 text-xl'/>}
          sub={`${transactions.filter(t => t.type === 'expense').length} entries`} />
        <StatCard label="Savings Rate"   value={savingsRate + '%'}     icon={<MdSavings className='text-yellow-500 text-xl'/>}
          sub={parseFloat(savingsRate) >= 20 ? 'Above 20% target ✓' : 'Below 20% target'} />
      </div>

      {/* Bar + Pie*/}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Bar chart */}
        <div className="lg:col-span-2 bg-gray-950 border border-gray-800 rounded-xl p-4 sm:p-5">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-semibold text-white">Daily Income vs Expenses</h3>
              <p className="text-xs text-gray-500 mt-0.5">March 2026</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Income
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Expenses
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => (v % 5 === 0 || v === 1) ? v : ''} />
              <YAxis tickFormatter={v => '₹' + v / 1000 + 'k'} tick={{ fill: '#4b5563', fontSize: 11 }}
                axisLine={false} tickLine={false} width={46} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => ['₹' + Number(v).toLocaleString('en-IN')]} />
              <Bar dataKey="income"   fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={14} />
              <Bar dataKey="expenses" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-white mb-0.5">Spending Breakdown</h3>
          <p className="text-xs text-gray-500 mb-3">By category</p>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={75} dataKey="value" paddingAngle={2}>
                {pieData.map(e => <Cell key={e.name} fill={CAT_COLORS[e.name] || '#6b7280'} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={v => ['₹' + Number(v).toLocaleString('en-IN')]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-1">
            {pieData.slice(0, 5).map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="w-2 h-2 rounded-full"
                    style={{ background: CAT_COLORS[d.name] || '#6b7280' }} />
                  {d.name}
                </div>
                <span className="text-gray-500">
                  {((d.value / summary.expenses) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/*Net balance */}
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-white mb-0.5">Net Balance Trend</h3>
        <p className="text-xs text-gray-500 mb-4">Daily net (income − expenses)</p>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={dailyData.map(d => ({ ...d, net: d.income - d.expenses }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={v => (v % 5 === 0 || v === 1) ? v : ''} />
            <YAxis tickFormatter={v => '₹' + v / 1000 + 'k'} tick={{ fill: '#4b5563', fontSize: 11 }}
              axisLine={false} tickLine={false} width={46} />
            <Tooltip contentStyle={tooltipStyle} formatter={v => ['₹' + Number(v).toLocaleString('en-IN'), 'Net']} />
            <Line type="monotone" dataKey="net" stroke="#f59e0b" strokeWidth={2}
              dot={false} activeDot={{ r: 5, fill: '#f59e0b', stroke: '#000', strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/*Recent transactions*/}
      <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-800">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
            <p className="text-xs text-gray-500 mt-0.5">Latest 5 entries</p>
          </div>
          <button onClick={() => setCurrentPage('transactions')}
            className="text-xs text-amber-500 hover:text-amber-400 transition-colors font-medium">
            View all →
          </button>
        </div>
        <div className="divide-y divide-gray-900">
          {recent.map(t => (
            <div key={t.id}
              className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 hover:bg-gray-900/50 transition-colors">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ background: (CAT_COLORS[t.category] || '#6b7280') + '22', color: CAT_COLORS[t.category] || '#6b7280' }}>
                {t.category[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-200 truncate">{t.category}</div>
                <div className="text-xs text-gray-600">{t.date}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}>{t.type}</span>
              <div className={`text-sm font-semibold  ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                {t.type === 'income' ? '+' : '−'}{fmt(t.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
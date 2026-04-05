import React from 'react';
import { useApp } from '../context/AppContext';
import Navbar      from '../components/Navbar';
import Dashboard   from '../components/Dashboard';
import Transaction from '../components/Transaction';
import Insights    from '../Components/Insights';

import { RiAdminFill } from "react-icons/ri";
import { CiUser } from "react-icons/ci";

const PAGE_META = {
  dashboard:    { title: 'Dashboard',    sub: 'Your financial overview at a glance' },
  transactions: { title: 'Transactions', sub: 'Browse, filter and manage your entries' },
  insights:     { title: 'Insights',     sub: 'Patterns and observations from your data' },
};

const Home = ({ onLogout }) => {
  const { currentPage, role } = useApp();
  const meta = PAGE_META[currentPage];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':    return <Dashboard />;
      case 'transactions': return <Transaction />;
      case 'insights':     return <Insights />;
      default:            return <div className="text-center text-gray-500 py-20">Page not found</div>;}
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar onLogout={onLogout} />

      <main className=" max-w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">

        {meta && (
          <div className="flex items-start justify-between mb-6 sm:mb-8 flex-wrap gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{meta.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{meta.sub}</p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
              role === 'admin'
                ? 'border-amber-500/30 bg-amber-500/5 text-amber-400'
                : 'border-blue-500/30 bg-blue-500/5 text-blue-400'
            }`}>
              <span>{role === 'admin' ? <RiAdminFill /> : <CiUser />}</span>
              <span className="uppercase tracking-wider">{role}</span>
            </div>
          </div>
        )}

        {renderPage()}
      </main>
    </div>
  );
};

export default Home;
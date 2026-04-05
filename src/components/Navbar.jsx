import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RiAdminFill } from "react-icons/ri";
import { CiUser } from "react-icons/ci";
import { RxDashboard } from "react-icons/rx";
import { GrTransaction } from "react-icons/gr";
import { MdInsights } from "react-icons/md";


const Navbar = ({ onLogout }) => {
  const { currentPage, setCurrentPage, role } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const navItems = [
    { id: 'dashboard',    label: 'Dashboard',    icon: <RxDashboard /> },
    { id: 'transactions', label: 'Transactions', icon: <GrTransaction /> },
    { id: 'insights',     label: 'Insights',     icon: <MdInsights /> },
  ];

  const go = id => { setCurrentPage(id); setMenuOpen(false); };

  return (
    <nav className="border-b-4 border-gray-700 bg-black sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3 gap-4">

        {/* Brand */}
        <div className="flex items-center gap-3 ">
          <img src="/zorvynlogo.png" alt="zorvyn-logo" className="w-10 sm:w-12" />
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white">Zorvyn</h1>
            <h3 className="text-xs text-gray-400 tracking-wide hidden sm:block">Finance Dashboard</h3>
          </div>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(n => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                currentPage === n.id
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900'
              }`}
            >
              <span className="text-xs">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Date*/}
          <p className="text-xs font-medium text-gray-400 hidden lg:block">{today}</p>

          {/* Role badge */}
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wide ${
            role === 'admin'
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
              : 'border-blue-500/40 bg-blue-500/10 text-blue-400'
          }`}>
            <span>{role === 'admin' ? <RiAdminFill /> : <CiUser />}</span>
            <span className="uppercase">{role}</span>
          </div>

          

          {/* Sign out */}
          <button
            onClick={onLogout}
            className="hidden sm:block text-xs text-red-400 border border-red-500/40  hover:bg-red-100/15 px-3 py-1.5 rounded-lg transition-all"
          >
            Sign out
          </button>

          {/* Hamburger*/}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden flex flex-col gap-1.5 px-2 py-3 border border-dashed border-gray-400 rounded-lg"
            aria-label="Menu"
          >
            <span className={`block w-7 h-0.5 bg-gray-400 transition-all duration-300 ${menuOpen ? 'rotate-45 mb-1.5  translate-y-2' : ''}`} />
            <span className={`block w-7 h-0.5 bg-gray-400 transition-all duration-300 ${menuOpen ? '-rotate-45 mt-0.5 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>







      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 py-4 flex flex-col gap-2">
          {navItems.map(n => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all ${
                currentPage === n.id
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900'
              }`}
            >
              <span>{n.icon}</span> {n.label}
            </button>
          ))}
          <div className="border-t border-gray-800 pt-3 mt-1 flex flex-col gap-2">
            <button
              onClick={() => { onLogout(); setMenuOpen(false); }}
              className="text-sm text-red-400 border border-red-500/20 rounded-xl py-2.5 hover:bg-red-500/5 transition-all"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
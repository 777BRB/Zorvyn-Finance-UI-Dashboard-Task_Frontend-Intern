import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RiAdminFill } from "react-icons/ri";
import { CiUser } from "react-icons/ci";
import { IoChevronForwardOutline } from "react-icons/io5";


const Login = ({ onLogin }) => {
  const { setRole } = useApp();
  const [selected, setSelected] = useState('admin');

  const roles = [
    {
      id: 'admin',
      label: 'Admin',
      icon: <RiAdminFill />,
      description: 'Full access — add, edit & delete transactions',
      perms: ['View all data', 'Export CSV', 'Add transactions', 'Edit & delete'],
    },
    {
      id: 'viewer',
      label: 'Viewer',
      icon: <CiUser />,
      description: 'Read-only access — view reports and insights',
      perms: ['View all data', 'Export CSV', 'No add access', 'No edit/delete'],
    },
  ];

  const handleEnter = () => {
    setRole(selected);
    onLogin();
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">

      <div className="relative z-10 w-full max-w-105">

        <div className="border border-gray-800 rounded-2xl bg-gray-950 px-5 sm:px-7 py-6 sm:py-8">
        
        <div className="flex items-center gap-3 mb-8">
          <img src="/zorvynlogo.png" alt="Zorvyn" className="w-10 h-10 sm:w-12 sm:h-12" onError={e => { e.target.style.display = 'none'; }} />
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Zorvyn</h1>
            <p className="text-xs text-gray-600 tracking-widest uppercase">Finance Dashboard</p>
          </div>
        </div>
         
         <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 tracking-tight">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-7">Select your access role to continue</p>
         </div>

          {/* Roles*/}
          <div className="flex flex-col gap-3 mb-7">
            {roles.map(r => (
              <button
                key={r.id}
                onClick={() => setSelected(r.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  selected === r.id
                    ? 'border-emerald-500/60 bg-emerald-500/5'
                    : 'border-gray-800 bg-gray-900/40 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-none transition-colors ${
                      selected === r.id ? 'bg-emerald-500/15 text-emerald-400' : 'bg-gray-800 text-gray-500'
                    }`}>{r.icon}</div>
                    <div className="min-w-0">
                      <div className={`font-semibold text-sm ${selected === r.id ? 'text-white' : 'text-gray-300'}`}>{r.label}</div>
                      <div className="text-xs text-gray-600 mt-0.5 truncate">{r.description}</div>
                    </div>
                  </div>
                  {/* Radio */}
                  <div className={`w-4 h-4 rounded-full border-2  transition-all ${
                    selected === r.id ? 'border-emerald-500 bg-emerald-500' : 'border-gray-700 bg-transparent'
                  }`} />
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleEnter}
            className="flex items-center justify-center w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-white font-bold text-sm tracking-wider transition-all duration-150"
          >
            Enter as {selected === 'admin' ? 'Admin' : 'Viewer'} <span><IoChevronForwardOutline /></span>
          </button>

        </div>

        <p className="text-center text-xs text-gray-400 mt-5 tracking-widest uppercase">
          Zorvyn Fintech © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Login;
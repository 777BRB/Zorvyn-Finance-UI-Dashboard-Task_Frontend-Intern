import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FaFileCsv } from "react-icons/fa";
import { IoSearchCircle } from "react-icons/io5";
import { IoArrowForwardCircle } from "react-icons/io5";


const CAT_COLORS = {
  Salary: '#f59e0b', Freelance: '#10b981', Food: '#ef4444',
  Shopping: '#8b5cf6', Travel: '#06b6d4', Bills: '#f97316',
  Health: '#ec4899', Other: '#6b7280',
};

const ALL_CATEGORIES = ['Salary', 'Freelance', 'Food', 'Shopping', 'Travel', 'Bills', 'Health', 'Other'];
const fmt = n => '₹' + Number(n).toLocaleString('en-IN');
const EMPTY = { date: '', category: 'Food', type: 'expense', amount: '' };
const PER_PAGE = 10;

const Transaction = () => {
  const {
    filtered, categories, role, loading, exportCSV,
    search, setSearch, filterType, setFilterType,
    filterCategory, setFilterCategory, sortBy, setSortBy,
    addTransaction, updateTransaction, deleteTransaction,
  } = useApp();

  const [page, setPage]       = useState(1);
  const [modal, setModal]     = useState(false);
  const [editId, setEditId]   = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [delId, setDelId]     = useState(null);
  const [formErr, setFormErr] = useState('');

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setFormErr(''); setModal(true); };
  const openEdit = t => {
    setForm({ date: t.date, category: t.category, type: t.type, amount: t.amount });
    setEditId(t.id); setFormErr(''); setModal(true);
  };

  const save = () => {
    const amt = parseFloat(form.amount);
    if (!form.date) return setFormErr('Date is required.');
    if (isNaN(amt) || amt <= 0) return setFormErr('Enter a valid amount.');
    const payload = { ...form, amount: amt };
    editId ? updateTransaction(editId, payload) : addTransaction(payload);
    setModal(false); setPage(1);
  };

  const f = (key, val) => { setForm(p => ({ ...p, [key]: val })); setFormErr(''); };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col gap-4 ">

      <div className="flex flex-wrap gap-2 sm:gap-3 items-center">

        {/* Search */}
        <div className="relative flex-1 min-w-0" style={{ minWidth: 160 }}>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 "><IoSearchCircle className='text-md' /></span>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search category, date, amount…"
            className="w-full bg-gray-950 border border-gray-800 text-gray-200 text-sm rounded-lg pl-8 pr-3 py-2 placeholder-gray-700 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 text-xs">✕</button>
          )}
        </div>

        {/* Filters */}
        {[
          { val: filterType, set: v => { setFilterType(v); setPage(1); },
            opts: [['all','All types'],['income','Income'],['expense','Expense']] },
          { val: filterCategory, set: v => { setFilterCategory(v); setPage(1); },
            opts: [['all','All categories'], ...categories.map(c => [c, c])] },
          { val: sortBy, set: setSortBy,
            opts: [['date-desc','Newest'],['date-asc','Oldest'],['amount-desc','Highest'],['amount-asc','Lowest']] },
        ].map((s, i) => (
          <select key={i} value={s.val} onChange={e => s.set(e.target.value)}
            className="bg-gray-950 border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500/50 cursor-pointer transition-colors ">
            {s.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={exportCSV}
            className="flex items-center gap-2 text-sm text-gray-400 border border-gray-800 hover:border-gray-600 px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
            <span><FaFileCsv /></span>CSV
          </button>
          {role === 'admin' && (
            <button onClick={openAdd}
              className="text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
              + Add
            </button>
          )}
        </div>
      </div>

      {/* Count */}
      <div className="text-xs text-gray-600">
        {filtered.length === 0 ? 'No results' : `${filtered.length} transaction${filtered.length !== 1 ? 's' : ''} · page ${page} of ${totalPages}`}
      </div>

      {/* Desktop*/}
      {filtered.length === 0 ? (
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-12 flex flex-col items-center gap-3 text-center">
          <div className="text-3xl opacity-30">◎</div>
          <p className="text-gray-500 font-medium">No transactions found</p>
          <p className="text-gray-700 text-sm">Adjust filters or add a new entry</p>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden sm:block bg-gray-950 border border-gray-800 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full min-w-125">
              <thead className="border-b border-gray-800">
                <tr>
                  {['Date','Category','Type','Amount', role === 'admin' ? 'Actions' : ''].filter(Boolean).map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 sm:px-5 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900">
                {paginated.map(t => (
                  <tr key={t.id} className="hover:bg-gray-900/40 transition-colors group">
                    <td className="px-4 sm:px-5 py-3 text-xs text-gray-500 whitespace-nowrap">{t.date}</td>
                    <td className="px-4 sm:px-5 py-3">
                      <span className="inline-flex items-center gap-2 text-sm font-medium"
                        style={{ color: CAT_COLORS[t.category] || '#6b7280' }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-none"
                          style={{ background: CAT_COLORS[t.category] || '#6b7280' }} />
                        {t.category}
                      </span>
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>{t.type}</span>
                    </td>
                    <td className={`px-4 sm:px-5 py-3 text-sm font-bold ${
                      t.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {t.type === 'income' ? '+' : '−'}{fmt(t.amount)}
                    </td>
                    {role === 'admin' && (
                      <td className="px-4 sm:px-5 py-3">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(t)}
                            className="text-xs text-gray-500 hover:text-amber-400 border border-gray-800 hover:border-amber-500/30 px-2.5 py-1 rounded-lg transition-all">
                            Edit
                          </button>
                          <button onClick={() => setDelId(t.id)}
                            className="text-xs text-gray-500 hover:text-red-400 border border-gray-800 hover:border-red-500/30 px-2.5 py-1 rounded-lg transition-all">
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-2 sm:hidden">
            {paginated.map(t => (
              <div key={t.id} className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-none"
                  style={{ background: (CAT_COLORS[t.category] || '#6b7280') + '22', color: CAT_COLORS[t.category] || '#6b7280' }}>
                  {t.category[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-200">{t.category}</span>
                    {/* <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>{t.type}</span> */}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">{t.date}</div>
                </div>

                <div className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {t.type === 'income' ? '+' : '−'}{fmt(t.amount)}
                </div>
                
                {role === 'admin' && (
                  <div className="flex gap-1.5 ">
                    <button onClick={() => openEdit(t)} className="text-gray-600 hover:text-amber-400 text-xs px-2 py-1 border border-gray-800 rounded-lg transition-colors">Edit</button>
                    <button onClick={() => setDelId(t.id)} className="text-gray-600 hover:text-red-400 text-xs px-2 py-1 border border-gray-800 rounded-lg transition-colors">✕</button>
                  </div>
                )}
                
              </div>
              
            ))}
            
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs border border-gray-800 rounded-lg text-gray-500 hover:text-white hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce((acc, n, i, arr) => { if (i > 0 && n - arr[i-1] > 1) acc.push('…'); acc.push(n); return acc; }, [])
                .map((n, i) => n === '…'
                  ? <span key={'e'+i} className="text-gray-700 text-xs px-1">…</span>
                  : <button key={n} onClick={() => setPage(n)}
                      className={`w-8 h-8 text-xs rounded-lg transition-all border ${
                        page === n ? 'bg-amber-500 text-black border-amber-500 font-bold' : 'border-gray-800 text-gray-500 hover:border-gray-600 hover:text-white'
                      }`}>{n}</button>
                )}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-800 rounded-lg text-gray-500 hover:text-white hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                Next <span><IoArrowForwardCircle className='text-base' /></span>
              </button>
            </div>
          )}
        </>
      )}

      {/*Add/Edit*/}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setModal(false)}>
          <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-800">
              <h3 className="text-base font-semibold text-white">
                {editId ? 'Edit Transaction' : 'New Transaction'}
              </h3>
              <button onClick={() => setModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-500 text-sm transition-colors">
                ✕
              </button>
            </div>
            <div className="px-5 sm:px-6 py-5 flex flex-col gap-4">
              {[{ label: 'Date', key: 'date', type: 'date' }, { label: 'Amount (₹)', key: 'amount', type: 'number' }].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1.5">{label}</label>
                  <input type={type} value={form[key]} onChange={e => f(key, e.target.value)} min={type === 'number' ? 0 : undefined}
                    className="w-full bg-gray-900 border border-gray-800 text-gray-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500/50 transition-colors" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1.5">Category</label>
                  <select value={form.category} onChange={e => f('category', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 text-gray-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500/50 cursor-pointer transition-colors">
                    {ALL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1.5">Type</label>
                  <select value={form.type} onChange={e => f('type', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 text-gray-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500/50 cursor-pointer transition-colors">
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
              </div>
              {formErr && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{formErr}</p>}
            </div>
            <div className="flex gap-2 px-5 sm:px-6 py-4 border-t border-gray-800">
              <button onClick={() => setModal(false)}
                className="flex-1 py-2.5 text-sm text-gray-500 border border-gray-800 rounded-xl hover:border-gray-600 hover:text-gray-300 transition-all">
                Cancel
              </button>
              <button onClick={save}
                className="flex-1 py-2.5 text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-black rounded-xl transition-all">
                {editId ? 'Save changes' : 'Add transaction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/*Delete */}
      {delId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setDelId(null)}>
          <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="text-base font-semibold text-white mb-2">Delete transaction?</div>
            <div className="text-sm text-gray-500 mb-6">This action cannot be undone.</div>
            <div className="flex gap-2">
              <button onClick={() => setDelId(null)}
                className="flex-1 py-2.5 text-sm border border-gray-800 rounded-xl text-gray-500 hover:border-gray-600 hover:text-gray-300 transition-all">
                Cancel
              </button>
              <button onClick={() => { deleteTransaction(delId); setDelId(null); }}
                className="flex-1 py-2.5 text-sm font-semibold bg-red-500 hover:bg-red-400 text-white rounded-xl transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transaction;
import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(() => localStorage.getItem('zv_role') || 'admin');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Load from localStorage or fetch JSON
 useEffect(() => {
  const loadData = async () => {
    try {
      const res = await fetch('/data/Transactions.json');
      const jsonData = await res.json();

      const saved = localStorage.getItem('zv_transactions');

      if (saved) {
        const localData = JSON.parse(saved);

        //Merging json data + local data, removing duplicates by ID
        const merged = [...jsonData, ...localData].reduce((acc, curr) => {
          const exists = acc.find(item => item.id === curr.id);
          if (!exists) acc.push(curr);
          return acc;
        }, []);

        setTransactions(merged);
      } else {
        setTransactions(jsonData);
      }

    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);

  // It will store in the localStorage
  useEffect(() => {
    if (!loading) localStorage.setItem('zv_transactions', JSON.stringify(transactions));
  }, [transactions, loading]);

  useEffect(() => { localStorage.setItem('zv_role', role); }, [role]);

  // Summary stats - memoized the values
  const summary = useMemo(() => {
    const income   = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  // All unique categories will show here
  const categories = useMemo(() => {
    return [...new Set(transactions.map(t => t.category))].sort();
  }, [transactions]);

  // Filtered + sorted list - done
  const filtered = useMemo(() => {
    let r = [...transactions];
    if (search) r = r.filter(t =>
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.type.toLowerCase().includes(search.toLowerCase()) ||
      t.amount.toString().includes(search) ||
      t.date.includes(search)
    );
    if (filterType !== 'all') r = r.filter(t => t.type === filterType);
    if (filterCategory !== 'all') r = r.filter(t => t.category === filterCategory);
    switch (sortBy) {
      case 'date-desc':    r.sort((a, b) => b.date.localeCompare(a.date)); break;
      case 'date-asc':     r.sort((a, b) => a.date.localeCompare(b.date)); break;
      case 'amount-desc':  r.sort((a, b) => b.amount - a.amount); break;
      case 'amount-asc':   r.sort((a, b) => a.amount - b.amount); break;
      default: break;
    }
    return r;
  }, [transactions, search, filterType, filterCategory, sortBy]);

  // CRUD Opeartions Done
  const addTransaction = t =>
    setTransactions(prev => [{ ...t, id: Date.now() }, ...prev]);

  const updateTransaction = (id, t) =>
    setTransactions(prev => prev.map(x => x.id === id ? { ...x, ...t } : x));

  const deleteTransaction = id =>
    setTransactions(prev => prev.filter(x => x.id !== id));

  const resetData = () => {
    localStorage.removeItem('zv_transactions');
    setLoading(true);
    fetch('/data/Transactions.json')
      .then(r => r.json())
      .then(data => { setTransactions(data); setLoading(false); });
  };

  const exportCSV = () => {
    const rows = ['Date,Category,Type,Amount', ...transactions.map(t => `${t.date},${t.category},${t.type},${t.amount}`)];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'zorvyn-transactions.csv';
    a.click();
  };

  return (
    <AppContext.Provider value={{
      transactions, loading, summary, filtered, categories,
      role, setRole,
      search, setSearch,
      filterType, setFilterType,
      filterCategory, setFilterCategory,
      sortBy, setSortBy,
      currentPage, setCurrentPage,
      addTransaction, updateTransaction, deleteTransaction,
      resetData, exportCSV,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Home from './pages/Home'
import Calendar from './pages/Calendar'
import AddTransaction from './pages/AddTransaction'
import BottomNav from './components/BottomNav'
import './App.css'

export default function App() {
  const { user, loading, signOut } = useAuth()
  const [currentPage, setCurrentPage] = useState('home')
  const [showAddTransaction, setShowAddTransaction] = useState(false)

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  const handleAddTransactionSuccess = () => {
    setShowAddTransaction(false)
    setCurrentPage('home')
  }

  return (
    <div className="app">
      <div className="app-header">
        <div className="header-left">
          <h2 className="app-title">MoneyFlow</h2>
        </div>
        <button onClick={signOut} className="logout-button">
          Se déconnecter
        </button>
      </div>

      <main className="app-main">
        {showAddTransaction ? (
          <AddTransaction
            onClose={() => setShowAddTransaction(false)}
            onSuccess={handleAddTransactionSuccess}
          />
        ) : (
          <>
            {currentPage === 'home' && <Home />}
            {currentPage === 'calendar' && <Calendar />}
          </>
        )}
      </main>

      {!showAddTransaction && (
        <BottomNav
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onAddTransaction={() => setShowAddTransaction(true)}
        />
      )}
    </div>
  )
}

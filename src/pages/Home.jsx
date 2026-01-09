import { useMemo } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useAuth } from '../hooks/useAuth'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import './Home.css'

export default function Home() {
  const { user } = useAuth()
  const { transactions, loading } = useTransactions(user?.id)

  // Calculer le solde total
  const balance = useMemo(() => {
    return transactions.reduce((sum, t) => sum - t.amount, 0)
  }, [transactions])

  // Obtenir les 3 dernières transactions
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 3)
  }, [transactions])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Alimentation': '#FF9500',
      'Transport': '#007AEF',
      'Loisirs': '#5856D6',
      'Logement': '#FF3B30',
      'Santé': '#30D158',
      'Autres': '#8E8E93',
    }
    return colors[category] || colors['Autres']
  }

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Accueil</h1>
      </header>

      <div className="balance-card">
        <p className="balance-label">Solde restant</p>
        <h2 className="balance-amount">{formatCurrency(balance)}</h2>
        <p className="balance-subtitle">Basé sur vos transactions</p>
      </div>

      <div className="recent-section">
        <h3 className="section-title">Dernières transactions</h3>

        {recentTransactions.length === 0 ? (
          <div className="empty-state">
            <p>Aucune transaction</p>
            <p className="empty-subtitle">Commencez par ajouter une transaction</p>
          </div>
        ) : (
          <div className="transactions-list">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-icon" style={{ background: getCategoryColor(transaction.category) }}>
                  {transaction.category?.[0] || 'T'}
                </div>
                <div className="transaction-info">
                  <p className="transaction-name">{transaction.name}</p>
                  <p className="transaction-details">
                    {transaction.category} • {format(new Date(transaction.date), 'dd MMM', { locale: fr })}
                  </p>
                </div>
                <div className="transaction-amount">
                  -{formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

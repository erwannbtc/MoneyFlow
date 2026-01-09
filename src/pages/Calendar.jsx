import { useState, useMemo } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useAuth } from '../hooks/useAuth'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import './Calendar.css'

export default function Calendar() {
  const { user } = useAuth()
  const { transactions, loading } = useTransactions(user?.id)
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Filtrer les transactions du mois actuel
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return isSameMonth(transactionDate, currentDate)
    })
  }, [transactions, currentDate])

  // Données pour le graphique camembert
  const chartData = useMemo(() => {
    const categoryTotals = {}
    monthTransactions.forEach(t => {
      const category = t.category || 'Autres'
      categoryTotals[category] = (categoryTotals[category] || 0) + t.amount
    })

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }))
  }, [monthTransactions])

  const COLORS = {
    'Alimentation': '#FF9500',
    'Transport': '#007AEF',
    'Loisirs': '#5856D6',
    'Logement': '#FF3B30',
    'Santé': '#30D158',
    'Autres': '#8E8E93',
  }

  const getCategoryColor = (category) => COLORS[category] || COLORS['Autres']

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const getTransactionsForDay = (day) => {
    return monthTransactions.filter(t => isSameDay(new Date(t.date), day))
  }

  const getTotalForDay = (day) => {
    return getTransactionsForDay(day).reduce((sum, t) => sum + t.amount, 0)
  }

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  if (loading) {
    return (
      <div className="calendar-container">
        <div className="loading">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="calendar-container">
      <header className="calendar-header">
        <h1>Calendrier</h1>
      </header>

      <div className="month-navigator">
        <button onClick={handlePrevMonth} className="nav-button">‹</button>
        <h2 className="month-title">
          {format(currentDate, 'MMMM yyyy', { locale: fr })}
        </h2>
        <button onClick={handleNextMonth} className="nav-button">›</button>
      </div>

      <div className="calendar-grid">
        <div className="weekday-header">Lun</div>
        <div className="weekday-header">Mar</div>
        <div className="weekday-header">Mer</div>
        <div className="weekday-header">Jeu</div>
        <div className="weekday-header">Ven</div>
        <div className="weekday-header">Sam</div>
        <div className="weekday-header">Dim</div>

        {Array.from({ length: daysInMonth[0].getDay() === 0 ? 6 : daysInMonth[0].getDay() - 1 }).map((_, i) => (
          <div key={`empty-${i}`} className="calendar-day empty"></div>
        ))}

        {daysInMonth.map(day => {
          const dayTotal = getTotalForDay(day)
          const hasTransactions = dayTotal > 0

          return (
            <div key={day.toString()} className={`calendar-day ${hasTransactions ? 'has-transactions' : ''}`}>
              <span className="day-number">{format(day, 'd')}</span>
              {hasTransactions && (
                <span className="day-amount">{formatCurrency(dayTotal)}</span>
              )}
            </div>
          )
        })}
      </div>

      {chartData.length > 0 && (
        <div className="chart-section">
          <h3 className="section-title">Répartition par catégorie</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="transactions-section">
        <h3 className="section-title">Transactions du mois</h3>
        {monthTransactions.length === 0 ? (
          <div className="empty-state">
            <p>Aucune transaction ce mois-ci</p>
          </div>
        ) : (
          <div className="transactions-list">
            {monthTransactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-icon" style={{ background: getCategoryColor(transaction.category) }}>
                  {transaction.category?.[0] || 'T'}
                </div>
                <div className="transaction-info">
                  <p className="transaction-name">{transaction.name}</p>
                  <p className="transaction-details">
                    {transaction.category} • {format(new Date(transaction.date), 'dd MMM yyyy', { locale: fr })}
                  </p>
                  {transaction.description && (
                    <p className="transaction-description">{transaction.description}</p>
                  )}
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

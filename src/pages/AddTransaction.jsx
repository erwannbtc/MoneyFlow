import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useAuth } from '../hooks/useAuth'
import { format } from 'date-fns'
import './AddTransaction.css'

const CATEGORIES = [
  'Alimentation',
  'Transport',
  'Loisirs',
  'Logement',
  'Santé',
  'Autres',
]

export default function AddTransaction({ onClose, onSuccess }) {
  const { user } = useAuth()
  const { addTransaction } = useTransactions(user?.id)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    description: '',
    category: 'Alimentation',
    date: format(new Date(), 'yyyy-MM-dd'),
    is_recurring: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await addTransaction({
        name: formData.name,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        date: formData.date,
        is_recurring: formData.is_recurring,
      })

      if (onSuccess) onSuccess()
      if (onClose) onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-transaction-container">
      <header className="add-transaction-header">
        <button onClick={onClose} className="close-button">Annuler</button>
        <h1>Nouvelle transaction</h1>
        <div style={{ width: '60px' }}></div>
      </header>

      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="form-group">
          <label>Nom</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Courses du mois"
            required
          />
        </div>

        <div className="form-group">
          <label>Montant</label>
          <div className="amount-input-wrapper">
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
            <span className="currency">€</span>
          </div>
        </div>

        <div className="form-group">
          <label>Description (optionnel)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Ajouter une note..."
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Catégorie</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_recurring"
              checked={formData.is_recurring}
              onChange={handleChange}
            />
            <span>Transaction récurrente (abonnement)</span>
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Ajout en cours...' : 'Ajouter la transaction'}
        </button>
      </form>
    </div>
  )
}

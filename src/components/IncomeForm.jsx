import { useState } from 'react'
import { TrendingUp, Plus } from 'lucide-react'
import { format } from 'date-fns'
import './IncomeForm.css'

function IncomeForm({ onAddIncome }) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [source, setSource] = useState('') // Fuente del ingreso: salario, freelance, etc.

  const handleSubmit = (e) => {
    e.preventDefault()
    if (amount && description) {
      onAddIncome({
        amount: parseFloat(amount),
        description,
        date,
        source: source || 'Otros',
      })
      setAmount('')
      setDescription('')
      setSource('')
      setDate(format(new Date(), 'yyyy-MM-dd'))
    }
  }

  return (
    <div className="income-form-card">
      <div className="card-header">
        <TrendingUp size={20} />
        <h3>Agregar Ingreso</h3>
      </div>
      <form onSubmit={handleSubmit} className="income-form">
        <div className="form-group">
          <label htmlFor="income-amount">Cantidad</label>
          <input
            id="income-amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="income-description">Descripción</label>
          <input
            id="income-description"
            type="text"
            placeholder="Ej: Salario, Freelance, Venta..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="income-source">Fuente</label>
          <input
            id="income-source"
            type="text"
            placeholder="Ej: Trabajo, Negocio, Inversión..."
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="income-date">Fecha</label>
          <input
            id="income-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-button">
          Agregar Ingreso
        </button>
      </form>
    </div>
  )
}

export default IncomeForm


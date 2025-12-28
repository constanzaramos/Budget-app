import { Trash2, TrendingUp } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import './ExpenseList.css'

function ExpenseList({ expenses, incomes, categories, onDeleteExpense, onDeleteIncome, currency, exchangeRate, currentMonth, title }) {
  const formatCurrency = (value) => {
    let amount = value
    if (currency === 'USD' && exchangeRate) {
      amount = value / exchangeRate
    }
    
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'CLP' ? 0 : 2,
      maximumFractionDigits: currency === 'CLP' ? 0 : 2,
    }).format(amount)
  }

  const getCategory = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || {
      name: 'Desconocida',
      color: '#64748b',
      icon: '📦'
    }
  }

  // Combinar gastos e ingresos y ordenar por fecha
  const allTransactions = [
    ...expenses.map(exp => ({ ...exp, isIncome: false })),
    ...incomes.map(inc => ({ ...inc, isIncome: true }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  const displayTitle = title || `Transacciones del Mes${allTransactions.length > 0 ? ` (${allTransactions.length})` : ''}`

  if (allTransactions.length === 0) {
    return (
      <div className="expense-list-card">
        <h3>{title || 'Transacciones del Mes'}</h3>
        <div className="empty-expenses">
          <p>No hay transacciones registradas para este mes</p>
        </div>
      </div>
    )
  }

  return (
    <div className="expense-list-card">
      <div className="expense-list-header">
        <h3>{displayTitle}</h3>
      </div>
      <div className="expense-list">
        {allTransactions.map(transaction => {
          if (transaction.isIncome) {
            return (
              <div key={transaction.id} className="expense-item income-item">
                <div className="expense-icon" style={{ backgroundColor: '#B0E0E620' }}>
                  <TrendingUp size={20} style={{ color: '#87CEEB' }} />
                </div>
                <div className="expense-details">
                  <p className="expense-description">{transaction.description}</p>
                  <div className="expense-meta">
                    <span className="expense-category" style={{ color: '#87CEEB' }}>
                      {transaction.source || 'Ingreso'}
                    </span>
                    <span className="expense-date">
                      {format(parseISO(transaction.date), "dd 'de' MMMM", { locale: es })}
                    </span>
                  </div>
                </div>
                <div className="expense-amount income-amount">
                  +{formatCurrency(transaction.amount)}
                </div>
                <button
                  className="delete-button"
                  onClick={() => onDeleteIncome(transaction.id)}
                  aria-label="Eliminar ingreso"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )
          } else {
            const category = getCategory(transaction.categoryId)
            return (
              <div key={transaction.id} className="expense-item">
                <div className="expense-icon" style={{ backgroundColor: category.color + '20' }}>
                  <span style={{ color: category.color }}>{category.icon}</span>
                </div>
                <div className="expense-details">
                  <p className="expense-description">{transaction.description}</p>
                  <div className="expense-meta">
                    <span className="expense-category" style={{ color: category.color }}>
                      {category.name}
                    </span>
                    <span className="expense-date">
                      {format(parseISO(transaction.date), "dd 'de' MMMM", { locale: es })}
                    </span>
                  </div>
                </div>
                <div className="expense-amount">
                  -{formatCurrency(transaction.amount)}
                </div>
                <button
                  className="delete-button"
                  onClick={() => onDeleteExpense(transaction.id)}
                  aria-label="Eliminar gasto"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )
          }
        })}
      </div>
    </div>
  )
}

export default ExpenseList


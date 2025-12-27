import { Trash2, TrendingUp, Download } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import './ExpenseList.css'

function ExpenseList({ expenses, incomes, categories, onDeleteExpense, onDeleteIncome, currency, exchangeRate, currentMonth }) {
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

  const formatAmountForCSV = (value) => {
    let amount = value
    if (currency === 'USD' && exchangeRate) {
      amount = value / exchangeRate
    }
    return amount.toFixed(currency === 'CLP' ? 0 : 2)
  }

  const downloadCSV = () => {
    // Preparar datos para CSV
    const csvRows = []
    
    // Encabezados
    csvRows.push(['Fecha', 'Tipo', 'Descripción', 'Categoría/Fuente', `Monto (${currency})`])
    
    // Agregar gastos
    expenses
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach(expense => {
        const category = getCategory(expense.categoryId)
        csvRows.push([
          format(parseISO(expense.date), 'dd/MM/yyyy'),
          'Gasto',
          expense.description,
          category.name,
          formatAmountForCSV(expense.amount)
        ])
      })
    
    // Agregar ingresos
    incomes
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach(income => {
        csvRows.push([
          format(parseISO(income.date), 'dd/MM/yyyy'),
          'Ingreso',
          income.description,
          income.source || 'Ingreso',
          formatAmountForCSV(income.amount)
        ])
      })
    
    // Convertir a CSV
    const csvContent = csvRows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n')
    
    // Agregar BOM para Excel
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    
    // Crear enlace de descarga
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    
    // Nombre del archivo con el mes
    const monthName = format(currentMonth, 'MMMM-yyyy', { locale: es })
    link.setAttribute('download', `gastos-${monthName}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Combinar gastos e ingresos y ordenar por fecha
  const allTransactions = [
    ...expenses.map(exp => ({ ...exp, isIncome: false })),
    ...incomes.map(inc => ({ ...inc, isIncome: true }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  if (allTransactions.length === 0) {
    return (
      <div className="expense-list-card">
        <h3>Transacciones del Mes</h3>
        <div className="empty-expenses">
          <p>No hay transacciones registradas para este mes</p>
        </div>
      </div>
    )
  }

  return (
    <div className="expense-list-card">
      <div className="expense-list-header">
        <h3>Transacciones del Mes ({allTransactions.length})</h3>
        <button
          className="download-button"
          onClick={downloadCSV}
          title="Descargar planilla CSV"
        >
          <Download size={18} />
          Descargar CSV
        </button>
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


import ExpenseForm from './ExpenseForm'
import ExpenseList from './ExpenseList'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './Section.css'

function ExpensesSection({ expenses, categories, onAddExpense, onAddCategory, onDeleteExpense, currency, exchangeRate, currentMonth }) {
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

  // Datos para gráfica de barras (gastos por categoría)
  const categoryData = categories.map(category => {
    const categoryExpenses = expenses.filter(exp => {
      if (!exp.categoryId || !category.id) return false
      return exp.categoryId === category.id
    })
    const total = categoryExpenses.reduce((sum, exp) => {
      const amount = parseFloat(exp.amount) || 0
      return sum + amount
    }, 0)
    return {
      name: category.name,
      amount: total,
      icon: category.icon,
      color: category.color
    }
  }).filter(item => item.amount > 0)

  return (
    <div className="section-container">
      <ExpenseForm 
        categories={categories}
        onAddExpense={onAddExpense}
        onAddCategory={onAddCategory}
      />

      {categoryData.length > 0 && (
        <div className="chart-card">
          <h3>Gastos por Categoría</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5E6E6" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: '#4A4A4A', fontFamily: 'Poppins, sans-serif' }}
                angle={-45}
                textAnchor="end"
                height={80}
                stroke="#F5E6E6"
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#4A4A4A', fontFamily: 'Poppins, sans-serif' }}
                stroke="#F5E6E6"
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #F5E6E6', 
                  boxShadow: '0 4px 12px rgba(255, 182, 193, 0.2)',
                  backgroundColor: '#FFFFFF',
                  padding: '0.75rem'
                }}
                labelStyle={{ color: '#4A4A4A', fontFamily: 'Poppins, sans-serif' }}
              />
              <Legend 
                wrapperStyle={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem' }}
              />
              <Bar dataKey="amount" fill="#FFB6C1" radius={[8, 8, 0, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || "#FFB6C1"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <ExpenseList
          expenses={expenses}
          incomes={[]}
          categories={categories}
          onDeleteExpense={onDeleteExpense}
          onDeleteIncome={() => {}}
          currency={currency}
          exchangeRate={exchangeRate}
          currentMonth={currentMonth}
          title={`Gastos del Mes${expenses.length > 0 ? ` (${expenses.length})` : ''}`}
        />
      </div>
    </div>
  )
}

export default ExpensesSection


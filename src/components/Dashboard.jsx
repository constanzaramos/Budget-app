import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import './Dashboard.css'

function Dashboard({ budget, totalExpenses, totalIncomes, balance, remaining, percentage, expenses, incomes, categories, categoryBudgets, currency, exchangeRate }) {
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
      icon: category.icon
    }
  }).filter(item => item.amount > 0)

  // Datos para gráfica de pastel (presupuesto estimado)
  const pieBudgetData = categories
    .filter(cat => categoryBudgets[cat.id] && categoryBudgets[cat.id] > 0)
    .map(category => ({
      name: category.name,
      value: categoryBudgets[category.id] || 0,
      color: category.color,
      icon: category.icon
    }))

  // Datos para gráfica de pastel (gastos reales)
  const pieExpenseData = categoryData.map(item => ({
    name: item.name,
    value: item.amount,
    color: categories.find(c => c.name === item.name)?.color || '#FFB6C1'
  }))

  // Datos comparativos para gráfico circular
  const comparisonData = categories.map(category => {
    const budgetAmount = parseFloat(categoryBudgets[category.id]) || 0
    const expenseAmount = expenses
      .filter(exp => exp.categoryId === category.id)
      .reduce((sum, exp) => {
        const amount = parseFloat(exp.amount) || 0
        return sum + amount
      }, 0)
    
    return {
      name: category.name,
      presupuesto: budgetAmount,
      gastos: expenseAmount,
      color: category.color,
      icon: category.icon
    }
  }).filter(item => item.presupuesto > 0 || item.gastos > 0)

  // Colores para la gráfica de pastel
  const COLORS = categories
    .filter(cat => expenses.some(exp => exp.categoryId === cat.id))
    .map(cat => cat.color)

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

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon budget">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Presupuesto</p>
            <p className="stat-value">{formatCurrency(budget)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon income">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Ingresos</p>
            <p className="stat-value">{formatCurrency(totalIncomes)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon expenses">
            <TrendingDown size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Gastos</p>
            <p className="stat-value">{formatCurrency(totalExpenses)}</p>
            {budget > 0 && (
              <p className="stat-percentage">{percentage.toFixed(1)}%</p>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className={`stat-icon ${balance >= 0 ? 'remaining' : 'negative'}`}>
            {balance >= 0 ? <TrendingUp size={24} /> : <AlertCircle size={24} />}
          </div>
          <div className="stat-content">
            <p className="stat-label">Balance</p>
            <p className={`stat-value ${balance < 0 ? 'negative' : ''}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>
      </div>

      {expenses.length > 0 && (
        <div className="charts-grid">
          {categoryData.length > 0 && (
          <div className="chart-card">
            <h3>Gastos por Categoría</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow)' }}
                />
                <Legend />
                <Bar dataKey="amount" fill="#FFB6C1" radius={[8, 8, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categories.find(c => c.name === entry.name)?.color || "#FFB6C1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          )}

          {pieBudgetData.length > 0 ? (
            <div className="chart-card">
              <h3>Presupuesto Estimado por Categoría</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieBudgetData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#FFB6C1"
                    dataKey="value"
                  >
                    {pieBudgetData.map((entry, index) => (
                      <Cell key={`cell-budget-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : null}

          {comparisonData.length > 0 && (
            <div className="chart-card">
              <h3>Comparación: Presupuesto vs Gastos Reales</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow)' }}
                  />
                  <Legend />
                  <Bar dataKey="presupuesto" name="Presupuesto Estimado" fill="#B0E0E6" radius={[8, 8, 0, 0]}>
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-presupuesto-${index}`} fill={entry.color} opacity={0.6} />
                    ))}
                  </Bar>
                  <Bar dataKey="gastos" name="Gastos Reales" fill="#FFB6C1" radius={[8, 8, 0, 0]}>
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-gastos-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {expenses.length === 0 && (
        <div className="empty-state">
          <p>No hay gastos registrados para este mes</p>
          <p className="empty-hint">Agrega un gasto para comenzar a ver tus estadísticas</p>
        </div>
      )}
    </div>
  )
}

export default Dashboard


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

  // Datos para gráfico donut de presupuesto restante
  const remainingBudgetData = [
    { name: 'Gastado', value: totalExpenses, color: '#FFB6C1' },
    { name: 'Restante', value: Math.max(0, remaining), color: '#E6E6FA' }
  ].filter(item => item.value > 0)

  // Datos para gráfico de comparación horizontal (Presupuesto vs Real)
  const horizontalComparisonData = comparisonData.map(item => ({
    name: item.name,
    presupuesto: item.presupuesto,
    real: item.gastos
  })).filter(item => item.presupuesto > 0 || item.real > 0)

  return (
    <div className="dashboard">
      {/* Gráficos superiores - Siempre en fila horizontal de 3 */}
      <div className="top-charts-grid">
        {/* Presupuesto Restante (Donut) */}
        <div className="chart-card donut-chart">
          <h3>Presupuesto Restante</h3>
          {remainingBudgetData.length > 0 ? (
            <div style={{ position: 'relative', width: '100%', height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={remainingBudgetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {remainingBudgetData.map((entry, index) => (
                      <Cell key={`cell-remaining-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
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
                </PieChart>
              </ResponsiveContainer>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none'
              }}>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#4A4A4A',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  {formatCurrency(remaining)}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-light)', fontFamily: 'Poppins, sans-serif' }}>No hay datos</p>
            </div>
          )}
        </div>

        {/* Presupuesto vs Real (Barras horizontales) */}
        <div className="chart-card">
          <h3>Presupuesto vs. Real</h3>
          {horizontalComparisonData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart 
                data={horizontalComparisonData} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F5E6E6" />
                <XAxis 
                  type="number"
                  tick={{ fontSize: 11, fill: '#4A4A4A', fontFamily: 'Poppins, sans-serif' }}
                  stroke="#F5E6E6"
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#4A4A4A', fontFamily: 'Poppins, sans-serif' }}
                  width={100}
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
                <Bar dataKey="presupuesto" name="Presupuesto Estimado" fill="#B0E0E6" radius={[0, 8, 8, 0]}>
                  {horizontalComparisonData.map((entry, index) => {
                    const category = categories.find(c => c.name === entry.name)
                    return (
                      <Cell key={`cell-presupuesto-h-${index}`} fill={category?.color || '#B0E0E6'} opacity={0.6} />
                    )
                  })}
                </Bar>
                <Bar dataKey="real" name="Gastos Reales" fill="#FFB6C1" radius={[0, 8, 8, 0]}>
                  {horizontalComparisonData.map((entry, index) => {
                    const category = categories.find(c => c.name === entry.name)
                    return (
                      <Cell key={`cell-real-h-${index}`} fill={category?.color || '#FFB6C1'} />
                    )
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-light)', fontFamily: 'Poppins, sans-serif' }}>No hay datos</p>
            </div>
          )}
        </div>

        {/* Distribución del Presupuesto (Pie) */}
        <div className="chart-card">
          <h3>Distribución del Presupuesto</h3>
          {pieBudgetData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieBudgetData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => {
                    // Solo mostrar etiquetas si el porcentaje es mayor a 4% para evitar superposición
                    if (percent > 0.04) {
                      return `${(percent * 100).toFixed(0)}%`
                    }
                    return ''
                  }}
                  outerRadius={85}
                  fill="#FFB6C1"
                  dataKey="value"
                  labelLine={{ strokeWidth: 1, stroke: '#F5E6E6' }}
                >
                  {pieBudgetData.map((entry, index) => (
                    <Cell key={`cell-budget-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [formatCurrency(value), name]}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #F5E6E6', 
                    boxShadow: '0 4px 12px rgba(255, 182, 193, 0.2)',
                    backgroundColor: '#FFFFFF',
                    padding: '0.75rem',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                  labelStyle={{ color: '#4A4A4A', fontFamily: 'Poppins, sans-serif', fontWeight: '600' }}
                />
                <Legend 
                  wrapperStyle={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem', paddingTop: '1rem' }}
                  iconType="circle"
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  formatter={(value) => value}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-light)', fontFamily: 'Poppins, sans-serif' }}>No hay datos</p>
            </div>
          )}
        </div>
      </div>

      {/* Grid principal de 4 columnas */}
      <div className="main-grid">
        {/* Columna 1: Resumen de Flujo de Efectivo + Resumen de Ingresos */}
        <div className="grid-column">
          <div className="summary-section">
            <h3>Resumen de Flujo de Efectivo</h3>
            <div className="summary-table">
              <div className="summary-row">
                <span className="summary-label">Remanente</span>
                <span className="summary-value">{formatCurrency(balance)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Ingresos</span>
                <span className="summary-value">{formatCurrency(totalIncomes)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Gastos</span>
                <span className="summary-value">{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="summary-row highlight">
                <span className="summary-label">RESTANTE</span>
                <span className="summary-value">{formatCurrency(remaining)}</span>
              </div>
            </div>
          </div>

          <div className="summary-section">
            <h3>Resumen de Ingresos</h3>
            <div className="summary-table">
              {incomes.length > 0 ? (
                <>
                  {incomes.map((income, index) => (
                    <div key={income.id} className="summary-row">
                      <span className="summary-label">{income.source || `Ingreso #${index + 1}`}</span>
                      <span className="summary-value">{formatCurrency(income.amount)}</span>
                    </div>
                  ))}
                  <div className="summary-row highlight">
                    <span className="summary-label">TOTAL</span>
                    <span className="summary-value">{formatCurrency(totalIncomes)}</span>
                  </div>
                </>
              ) : (
                <div className="summary-row">
                  <span className="summary-label">No hay ingresos registrados</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna 2: Gastos por Categoría */}
        <div className="grid-column">
          <div className="summary-section">
            <h3>Gastos por Categoría</h3>
            <div className="summary-table">
              {categoryData.length > 0 ? (
                <>
                  {categoryData.map((item) => {
                    const category = categories.find(c => c.name === item.name)
                    const categoryPercentage = totalExpenses > 0 
                      ? ((item.amount / totalExpenses) * 100).toFixed(2) 
                      : '0.00'
                    return (
                      <div key={item.name} className="summary-row">
                        <div className="summary-category-info">
                          <span className="category-icon" style={{ color: category?.color || '#FFB6C1' }}>
                            {category?.icon || '📦'}
                          </span>
                          <span className="summary-label">{item.name}</span>
                        </div>
                        <div className="summary-category-amounts">
                          <span className="summary-value">{formatCurrency(item.amount)}</span>
                          <span className="summary-percentage">{categoryPercentage}%</span>
                        </div>
                      </div>
                    )
                  })}
                  <div className="summary-row highlight">
                    <span className="summary-label">TOTAL</span>
                    <span className="summary-value">{formatCurrency(totalExpenses)}</span>
                  </div>
                </>
              ) : (
                <div className="summary-row">
                  <span className="summary-label">No hay gastos registrados</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna 3: Presupuesto por Categoría */}
        <div className="grid-column">
          <div className="summary-section">
            <h3>Presupuesto por Categoría</h3>
            <div className="summary-table">
              {pieBudgetData.length > 0 ? (
                <>
                  {pieBudgetData.map((item) => {
                    const category = categories.find(c => c.name === item.name)
                    const totalCategoryBudget = Object.values(categoryBudgets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
                    const categoryPercentage = totalCategoryBudget > 0 
                      ? ((item.value / totalCategoryBudget) * 100).toFixed(2) 
                      : '0.00'
                    return (
                      <div key={item.name} className="summary-row">
                        <div className="summary-category-info">
                          <span className="category-icon" style={{ color: category?.color || '#FFB6C1' }}>
                            {category?.icon || '📦'}
                          </span>
                          <span className="summary-label">{item.name}</span>
                        </div>
                        <div className="summary-category-amounts">
                          <span className="summary-value">{formatCurrency(item.value)}</span>
                          <span className="summary-percentage">{categoryPercentage}%</span>
                        </div>
                      </div>
                    )
                  })}
                  <div className="summary-row highlight">
                    <span className="summary-label">TOTAL</span>
                    <span className="summary-value">{formatCurrency(Object.values(categoryBudgets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0))}</span>
                  </div>
                </>
              ) : (
                <div className="summary-row">
                  <span className="summary-label">No hay presupuestos por categoría</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna 4: Comparación Presupuesto vs Real */}
        <div className="grid-column">
          <div className="summary-section">
            <h3>Comparación Presupuesto vs Real</h3>
            <div className="summary-table">
              {comparisonData.length > 0 ? (
                <>
                  {comparisonData.map((item) => {
                    const category = categories.find(c => c.name === item.name)
                    const difference = item.presupuesto - item.gastos
                    const percentage = item.presupuesto > 0 
                      ? ((item.gastos / item.presupuesto) * 100).toFixed(1) 
                      : '0.0'
                    return (
                      <div key={item.name} className="summary-row">
                        <div className="summary-category-info">
                          <span className="category-icon" style={{ color: category?.color || '#FFB6C1' }}>
                            {category?.icon || '📦'}
                          </span>
                          <span className="summary-label">{item.name}</span>
                        </div>
                        <div className="summary-comparison">
                          <div className="comparison-amounts">
                            <span className="comparison-label">Presu:</span>
                            <span className="summary-value">{formatCurrency(item.presupuesto)}</span>
                          </div>
                          <div className="comparison-amounts">
                            <span className="comparison-label">Real:</span>
                            <span className="summary-value">{formatCurrency(item.gastos)}</span>
                          </div>
                          <span className={`summary-percentage ${difference < 0 ? 'negative' : ''}`}>
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </>
              ) : (
                <div className="summary-row">
                  <span className="summary-label">No hay datos para comparar</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard


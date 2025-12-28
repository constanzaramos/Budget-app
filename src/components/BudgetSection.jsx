import BudgetForm from './BudgetForm'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './Section.css'

function BudgetSection({ budget, onSetBudget, categories, categoryBudgets, onSetCategoryBudget, currency, exchangeRate }) {
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '-'
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

  // Datos para gráfica de pastel (presupuesto estimado)
  const pieBudgetData = categories
    .filter(cat => categoryBudgets[cat.id] && categoryBudgets[cat.id] > 0)
    .map(category => ({
      name: category.name,
      value: categoryBudgets[category.id] || 0,
      color: category.color,
      icon: category.icon
    }))

  return (
    <div className="section-container">
      <BudgetForm 
        budget={budget} 
        onSetBudget={onSetBudget}
        categories={categories}
        categoryBudgets={categoryBudgets}
        onSetCategoryBudget={onSetCategoryBudget}
        currency={currency}
        exchangeRate={exchangeRate}
      />
      
      {pieBudgetData.length > 0 && (
        <div className="chart-card">
          <h3>Distribución del Presupuesto</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
                <Pie
                  data={pieBudgetData}
                  cx="50%"
                  cy="50%"
                  labelLine={{ strokeWidth: 1, stroke: '#F5E6E6' }}
                  label={({ name, percent }) => {
                    if (percent > 0.04) {
                      return `${(percent * 100).toFixed(0)}%`
                    }
                    return ''
                  }}
                  outerRadius={120}
                  fill="#FFB6C1"
                  dataKey="value"
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
                wrapperStyle={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', paddingTop: '1rem' }}
                iconType="circle"
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default BudgetSection


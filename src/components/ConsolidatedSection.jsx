import { useRef } from 'react'
import { Download } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './Section.css'
import './ConsolidatedSection.css'

// Lazy load de las librerías de PDF
let jsPDF, html2canvas

const loadPDFLibraries = async () => {
  if (!jsPDF) {
    jsPDF = (await import('jspdf')).default
  }
  if (!html2canvas) {
    html2canvas = (await import('html2canvas')).default
  }
  return { jsPDF, html2canvas }
}

function ConsolidatedSection({ 
  budget, 
  totalExpenses, 
  totalIncomes, 
  balance, 
  remaining, 
  expenses, 
  incomes, 
  categories, 
  categoryBudgets, 
  currency, 
  exchangeRate, 
  currentMonth 
}) {
  const contentRef = useRef(null)

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

  const getCategory = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || {
      name: 'Desconocida',
      color: '#64748b',
      icon: '📦'
    }
  }

  const downloadPDF = async () => {
    if (!contentRef.current) return

    try {
      // Cargar librerías
      const { jsPDF: jsPDFLib, html2canvas: html2canvasLib } = await loadPDFLibraries()

      // Crear canvas del contenido
      const canvas = await html2canvasLib(contentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFF5F5',
        logging: false
      })

      const imgData = canvas.toDataURL('image/png')
      
      // Crear PDF
      const pdf = new jsPDFLib('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgScaledWidth = imgWidth * ratio
      const imgScaledHeight = imgHeight * ratio

      // Si el contenido es más alto que una página, dividirlo en múltiples páginas
      let heightLeft = imgScaledHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgScaledWidth, imgScaledHeight)
      heightLeft -= pdfHeight

      while (heightLeft > 0) {
        position = heightLeft - imgScaledHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgScaledWidth, imgScaledHeight)
        heightLeft -= pdfHeight
      }

      // Descargar PDF
      const monthName = format(currentMonth, 'MMMM-yyyy', { locale: es })
      pdf.save(`consolidado-${monthName}.pdf`)
    } catch (error) {
      console.error('Error al generar PDF:', error)
      alert('Error al generar el PDF. Por favor, intenta de nuevo.')
    }
  }

  // Preparar datos para las gráficas
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

  // Datos para gráfica de pastel (presupuesto estimado)
  const pieBudgetData = categories
    .filter(cat => categoryBudgets[cat.id] && categoryBudgets[cat.id] > 0)
    .map(category => ({
      name: category.name,
      value: categoryBudgets[category.id] || 0,
      color: category.color,
      icon: category.icon
    }))

  // Función para aclarar colores (hacer más pastel)
  const lightenColor = (color, amount = 0.3) => {
    // Si es un color hex, convertirlo a RGB y aclararlo
    if (color.startsWith('#')) {
      const hex = color.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16)
      const g = parseInt(hex.substr(2, 2), 16)
      const b = parseInt(hex.substr(4, 2), 16)
      
      const newR = Math.min(255, Math.round(r + (255 - r) * amount))
      const newG = Math.min(255, Math.round(g + (255 - g) * amount))
      const newB = Math.min(255, Math.round(b + (255 - b) * amount))
      
      return `rgb(${newR}, ${newG}, ${newB})`
    }
    return color
  }

  // Datos para gráfico donut de presupuesto restante
  const remainingBudgetData = [
    { name: 'Gastado', value: totalExpenses, color: '#FFD1DC' }, // Rosa más claro
    { name: 'Restante', value: Math.max(0, remaining), color: '#F0F0FF' } // Lavanda más claro
  ].filter(item => item.value > 0)

  // Datos comparativos para gráfico horizontal (Presupuesto vs Real)
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
      real: expenseAmount,
      color: category.color,
      icon: category.icon
    }
  }).filter(item => item.presupuesto > 0 || item.real > 0)

  const horizontalComparisonData = comparisonData.map(item => ({
    name: item.name,
    presupuesto: item.presupuesto,
    real: item.real
  })).filter(item => item.presupuesto > 0 || item.real > 0)

  // Calcular totales por categoría para la tabla
  const categoryTotals = categories.map(category => {
    const categoryExpenses = expenses.filter(exp => exp.categoryId === category.id)
    const total = categoryExpenses.reduce((sum, exp) => {
      const amount = parseFloat(exp.amount) || 0
      return sum + amount
    }, 0)
    const budgetAmount = parseFloat(categoryBudgets[category.id]) || 0
    
    return {
      category,
      expenses: total,
      budget: budgetAmount,
      difference: budgetAmount - total
    }
  }).filter(item => item.expenses > 0 || item.budget > 0)

  return (
    <div className="section-container">
      <div className="consolidated-header">
        <div>
          <h2 style={{ fontFamily: "'Dancing Script', cursive", fontStyle: 'italic', marginBottom: '0.5rem' }}>
            Consolidado Mensual
          </h2>
          <p style={{ color: 'var(--text-light)', fontFamily: 'Poppins, sans-serif' }}>
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </p>
        </div>
        <button 
          className="download-pdf-button"
          onClick={downloadPDF}
        >
          <Download size={20} />
          Descargar PDF
        </button>
      </div>

      <div ref={contentRef} className="consolidated-content">
        {/* Resumen General */}
        <div className="consolidated-section">
          <h3>Resumen General</h3>
          <div className="summary-grid">
            <div className="summary-card">
              <p className="summary-label">Presupuesto Mensual</p>
              <p className="summary-value-large">{formatCurrency(budget)}</p>
            </div>
            <div className="summary-card">
              <p className="summary-label">Ingresos Totales</p>
              <p className="summary-value-large">{formatCurrency(totalIncomes)}</p>
            </div>
            <div className="summary-card">
              <p className="summary-label">Gastos Totales</p>
              <p className="summary-value-large">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="summary-card highlight">
              <p className="summary-label">Balance</p>
              <p className={`summary-value-large ${balance < 0 ? 'negative' : ''}`}>
                {formatCurrency(balance)}
              </p>
            </div>
          </div>
        </div>

        {/* Gráficas de Análisis */}
        <div className="consolidated-charts-grid">
          {/* Presupuesto Restante (Donut) */}
          <div className="chart-card" style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '1.5rem', border: '1px solid var(--border)' }}>
            <h4 style={{ fontFamily: "'Dancing Script', cursive", fontStyle: 'italic', marginBottom: '1rem', color: 'var(--text)', fontSize: '1.25rem' }}>
              Presupuesto Restante
            </h4>
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
                        border: '1px solid #FFDAB9', 
                        boxShadow: '0 4px 12px rgba(255, 182, 193, 0.2)',
                        backgroundColor: '#FFFFFF',
                        padding: '0.75rem',
                        fontFamily: 'Poppins, sans-serif'
                      }}
                      labelStyle={{ color: '#8B7D8B', fontFamily: 'Poppins, sans-serif' }}
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
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#8B7D8B',
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
          <div className="chart-card" style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '1.5rem', border: '1px solid var(--border)' }}>
            <h4 style={{ fontFamily: "'Dancing Script', cursive", fontStyle: 'italic', marginBottom: '1rem', color: 'var(--text)', fontSize: '1.25rem' }}>
              Presupuesto vs. Real
            </h4>
            {horizontalComparisonData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart 
                  data={horizontalComparisonData} 
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#FFE4E1" opacity={0.3} />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 10, fill: 'var(--text-light)', fontFamily: 'Poppins, sans-serif' }}
                    stroke="#FFE4E1"
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: 'var(--text-light)', fontFamily: 'Poppins, sans-serif' }}
                    width={80}
                    stroke="#FFE4E1"
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: '1px solid #FFE4E1', 
                      boxShadow: '0 4px 12px rgba(255, 209, 220, 0.2)',
                      backgroundColor: '#FFFFFF',
                      padding: '0.75rem',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                    labelStyle={{ color: '#8B7D8B', fontFamily: 'Poppins, sans-serif' }}
                  />
                  <Legend 
                    wrapperStyle={{ fontFamily: 'Poppins', fontSize: '0.75rem', paddingTop: '0.5rem' }}
                    iconType="circle"
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                  <Bar dataKey="presupuesto" name="Presupuesto Estimado" fill="#D4F1F4" radius={[0, 8, 8, 0]}>
                    {horizontalComparisonData.map((entry, index) => {
                      const category = categories.find(c => c.name === entry.name)
                      // Usar tono pastel más claro para presupuesto
                      const pastelColor = category?.color ? lightenColor(category.color, 0.4) : '#D4F1F4'
                      return (
                        <Cell key={`cell-presupuesto-h-${index}`} fill={pastelColor} opacity={0.8} />
                      )
                    })}
                  </Bar>
                  <Bar dataKey="real" name="Gastos Reales" fill="#FFD1DC" radius={[0, 8, 8, 0]}>
                    {horizontalComparisonData.map((entry, index) => {
                      const category = categories.find(c => c.name === entry.name)
                      // Usar tono pastel más claro para gastos reales
                      const pastelColor = category?.color ? lightenColor(category.color, 0.3) : '#FFD1DC'
                      return (
                        <Cell key={`cell-real-h-${index}`} fill={pastelColor} />
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
          <div className="chart-card" style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '1.5rem', border: '1px solid var(--border)' }}>
            <h4 style={{ fontFamily: "'Dancing Script', cursive", fontStyle: 'italic', marginBottom: '1rem', color: 'var(--text)', fontSize: '1.25rem' }}>
              Distribución del Presupuesto
            </h4>
            {pieBudgetData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                          <Pie
                            data={pieBudgetData}
                            cx="50%"
                            cy="50%"
                            label={({ name, percent }) => {
                              if (percent > 0.04) {
                                return `${(percent * 100).toFixed(0)}%`
                              }
                              return ''
                            }}
                            outerRadius={85}
                            fill="#FFD1DC"
                            dataKey="value"
                            labelLine={{ strokeWidth: 1, stroke: '#FFE4E1' }}
                          >
                            {pieBudgetData.map((entry, index) => (
                              <Cell key={`cell-budget-${index}`} fill={lightenColor(entry.color, 0.3)} />
                            ))}
                          </Pie>
                  <Tooltip 
                    formatter={(value, name) => [formatCurrency(value), name]}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: '1px solid #FFE4E1', 
                      boxShadow: '0 4px 12px rgba(255, 209, 220, 0.2)',
                      backgroundColor: '#FFFFFF',
                      padding: '0.75rem',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                    labelStyle={{ color: '#8B7D8B', fontFamily: 'Poppins, sans-serif', fontWeight: '600' }}
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

        {/* Gráfica de Gastos por Categoría (Barras verticales) */}
        <div className="consolidated-section">
          {categoryData.length > 0 && (
            <div className="chart-card" style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '1.5rem', border: '1px solid var(--border)' }}>
              <h4 style={{ fontFamily: "'Dancing Script', cursive", fontStyle: 'italic', marginBottom: '1rem', color: 'var(--text)', fontSize: '1.25rem' }}>
                Gastos por Categoría
              </h4>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FFE4E1" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: 'var(--text-light)', fontFamily: 'Poppins, sans-serif' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    stroke="#FFE4E1"
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: 'var(--text-light)', fontFamily: 'Poppins, sans-serif' }}
                    stroke="#FFE4E1"
                  />
                  <Tooltip 
                    formatter={(value, name, props) => [formatCurrency(value), props.payload.name]}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: '1px solid #FFE4E1', 
                      boxShadow: '0 4px 12px rgba(255, 209, 220, 0.2)',
                      backgroundColor: '#FFFFFF',
                      padding: '0.75rem',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                    labelStyle={{ color: '#8B7D8B', fontFamily: 'Poppins, sans-serif' }}
                  />
                  <Legend 
                    wrapperStyle={{ fontFamily: 'Poppins', fontSize: '0.875rem' }}
                    payload={[{ value: 'Gastos por Categoría', type: 'rect', color: '#FFD1DC' }]}
                  />
                  <Bar dataKey="amount" name="Gastos" fill="#FFD1DC" radius={[8, 8, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-expense-${index}`} fill={entry.color ? lightenColor(entry.color, 0.3) : "#FFD1DC"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Presupuesto por Categoría */}
        {categoryTotals.length > 0 && (
          <div className="consolidated-section">
            <h3>Presupuesto vs Gastos por Categoría</h3>
            <div className="category-table">
              <div className="table-header">
                <div className="table-cell">Categoría</div>
                <div className="table-cell">Presupuesto</div>
                <div className="table-cell">Gastos</div>
                <div className="table-cell">Diferencia</div>
              </div>
              {categoryTotals.map((item, index) => (
                <div key={item.category.id} className="table-row">
                  <div className="table-cell category-name-cell">
                    <span className="category-icon-small" style={{ color: item.category.color }}>
                      {item.category.icon}
                    </span>
                    {item.category.name}
                  </div>
                  <div className="table-cell">{formatCurrency(item.budget)}</div>
                  <div className="table-cell">{formatCurrency(item.expenses)}</div>
                  <div className={`table-cell ${item.difference < 0 ? 'negative' : 'positive'}`}>
                    {formatCurrency(item.difference)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Ingresos */}
        {incomes.length > 0 && (
          <div className="consolidated-section">
            <h3>Ingresos Detallados</h3>
            <div className="transaction-table">
              <div className="table-header">
                <div className="table-cell">Fecha</div>
                <div className="table-cell">Fuente</div>
                <div className="table-cell">Descripción</div>
                <div className="table-cell">Monto</div>
              </div>
              {incomes
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((income) => (
                  <div key={income.id} className="table-row">
                    <div className="table-cell">
                      {format(parseISO(income.date), 'dd/MM/yyyy', { locale: es })}
                    </div>
                    <div className="table-cell">{income.source || 'Ingreso'}</div>
                    <div className="table-cell">{income.description}</div>
                    <div className="table-cell">{formatCurrency(income.amount)}</div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConsolidatedSection


import { useRef } from 'react'
import { Download } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
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

  // Calcular totales por categoría
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

        {/* Lista de Gastos */}
        {expenses.length > 0 && (
          <div className="consolidated-section">
            <h3>Gastos Detallados</h3>
            <div className="transaction-table">
              <div className="table-header">
                <div className="table-cell">Fecha</div>
                <div className="table-cell">Categoría</div>
                <div className="table-cell">Descripción</div>
                <div className="table-cell">Monto</div>
              </div>
              {expenses
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((expense) => {
                  const category = getCategory(expense.categoryId)
                  return (
                    <div key={expense.id} className="table-row">
                      <div className="table-cell">
                        {format(parseISO(expense.date), 'dd/MM/yyyy', { locale: es })}
                      </div>
                      <div className="table-cell">
                        <span className="category-icon-small" style={{ color: category.color }}>
                          {category.icon}
                        </span>
                        {category.name}
                      </div>
                      <div className="table-cell">{expense.description}</div>
                      <div className="table-cell">{formatCurrency(expense.amount)}</div>
                    </div>
                  )
                })}
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


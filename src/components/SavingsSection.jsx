import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, PiggyBank, Edit2, Check, X, Target } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import './Section.css'
import './FormValidations.css'

function SavingsSection({ totalIncomes, totalExpenses, balance, currency, exchangeRate, categories, onAddExpense, currentMonth }) {
  // Obtener clave del mes para localStorage
  const getMonthKey = (date) => {
    return format(date, 'yyyy-MM')
  }
  
  const monthKey = getMonthKey(currentMonth)
  const savingsKey = `budget-savings-${monthKey}`
  const savingsPercentageKey = `budget-savings-percentage-${monthKey}`
  
  // Cargar porcentaje de ahorro guardado (por defecto 15%)
  const [savingsPercentage, setSavingsPercentage] = useState(() => {
    const saved = localStorage.getItem(savingsPercentageKey)
    return saved ? parseFloat(saved) : 15
  })
  
  // Calcular sugerencia de ahorro basada en el porcentaje
  const suggestedSavings = Math.floor(totalIncomes * (savingsPercentage / 100))
  
  // Cargar ahorro guardado del mes actual
  const [savingsAmount, setSavingsAmount] = useState(() => {
    const saved = localStorage.getItem(savingsKey)
    return saved ? parseFloat(saved) : suggestedSavings
  })
  
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingPercentage, setIsEditingPercentage] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [percentageInputValue, setPercentageInputValue] = useState('')
  const [errors, setErrors] = useState({})
  
  // Actualizar sugerencia cuando cambian los ingresos o el porcentaje
  useEffect(() => {
    const newSuggested = Math.floor(totalIncomes * (savingsPercentage / 100))
    if (!localStorage.getItem(savingsKey)) {
      setSavingsAmount(newSuggested)
    }
  }, [totalIncomes, savingsPercentage, monthKey, savingsKey])
  
  // Cargar ahorro del mes cuando cambia el mes
  useEffect(() => {
    const saved = localStorage.getItem(savingsKey)
    const savedPercentage = localStorage.getItem(savingsPercentageKey)
    if (savedPercentage) {
      setSavingsPercentage(parseFloat(savedPercentage))
    }
    if (saved) {
      setSavingsAmount(parseFloat(saved))
    } else {
      const newSuggested = Math.floor(totalIncomes * (parseFloat(savedPercentage || 15) / 100))
      setSavingsAmount(newSuggested)
    }
  }, [currentMonth, savingsKey, savingsPercentageKey, totalIncomes])

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

  // Función para formatear números con separadores de miles (solo enteros)
  const formatNumber = (value) => {
    const cleanValue = value.replace(/[^\d]/g, '')
    if (!cleanValue) return ''
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  // Función para parsear el número formateado
  const parseFormattedNumber = (value) => {
    return parseInt(value.replace(/\./g, ''), 10) || 0
  }

  // Buscar o crear categoría de Ahorros
  const getSavingsCategory = () => {
    let savingsCategory = categories.find(cat => cat.name.toLowerCase() === 'ahorros')
    if (!savingsCategory) {
      // Si no existe, usar la categoría "Otros" o crear una temporal
      savingsCategory = categories.find(cat => cat.name === 'Otros') || categories[0]
    }
    return savingsCategory
  }

  const handleSaveSavings = () => {
    if (!inputValue || inputValue.trim() === '') {
      setErrors({ amount: 'El monto de ahorro es obligatorio' })
      return
    }
    
    const value = parseFormattedNumber(inputValue)
    
    if (value <= 0) {
      setErrors({ amount: 'El monto debe ser mayor a cero' })
      return
    }
    
    if (value > 999999999) {
      setErrors({ amount: 'El monto no puede ser mayor a 999.999.999' })
      return
    }
    
    // Guardar en localStorage
    localStorage.setItem(savingsKey, value.toString())
    setSavingsAmount(value)
    
    // Agregar como gasto
    const savingsCategory = getSavingsCategory()
    const monthStart = startOfMonth(currentMonth)
    const today = format(new Date(), 'yyyy-MM-dd')
    const expenseDate = format(monthStart, 'yyyy-MM-dd')
    
    onAddExpense({
      amount: value,
      description: 'Ahorro mensual',
      categoryId: savingsCategory.id,
      date: expenseDate,
    })
    
    setIsEditing(false)
    setInputValue('')
    setErrors({})
  }

  const handleEdit = () => {
    const formatted = formatNumber(savingsAmount.toString())
    setInputValue(formatted)
    setIsEditing(true)
    setErrors({})
  }

  const handleCancel = () => {
    setIsEditing(false)
    setInputValue('')
    setErrors({})
  }

  const handleEditPercentage = () => {
    setPercentageInputValue(savingsPercentage.toString())
    setIsEditingPercentage(true)
    setErrors({})
  }

  const handleSavePercentage = () => {
    if (!percentageInputValue || percentageInputValue.trim() === '') {
      setErrors({ percentage: 'El porcentaje es obligatorio' })
      return
    }
    
    const value = parseFloat(percentageInputValue)
    
    if (isNaN(value) || value <= 0) {
      setErrors({ percentage: 'El porcentaje debe ser mayor a cero' })
      return
    }
    
    if (value > 100) {
      setErrors({ percentage: 'El porcentaje no puede ser mayor a 100%' })
      return
    }
    
    // Guardar porcentaje en localStorage
    localStorage.setItem(savingsPercentageKey, value.toString())
    setSavingsPercentage(value)
    
    // Recalcular sugerencia
    const newSuggested = Math.floor(totalIncomes * (value / 100))
    if (!localStorage.getItem(savingsKey)) {
      setSavingsAmount(newSuggested)
    }
    
    setIsEditingPercentage(false)
    setPercentageInputValue('')
    setErrors({})
  }

  const handleCancelPercentage = () => {
    setIsEditingPercentage(false)
    setPercentageInputValue('')
    setErrors({})
  }

  const savings = Math.max(0, balance)
  const actualSavingsPercentage = totalIncomes > 0 ? ((savings / totalIncomes) * 100).toFixed(1) : 0

  return (
    <div className="section-container">
      {/* Sección de Meta de Ahorro */}
      <div className="savings-goal-card" style={{ 
        background: 'var(--bg-card)', 
        borderRadius: '20px', 
        padding: '2rem', 
        border: '1px solid var(--border)',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Target size={24} style={{ color: 'var(--primary)' }} />
          <h3 style={{ 
            fontFamily: "'Dancing Script', cursive", 
            fontStyle: 'italic', 
            margin: 0, 
            color: 'var(--text)',
            fontSize: '1.75rem'
          }}>
            Meta de Ahorro Mensual
          </h3>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          {!isEditingPercentage ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <p style={{ 
                fontFamily: 'Poppins, sans-serif', 
                color: 'var(--text-light)', 
                fontSize: '0.875rem',
                margin: 0
              }}>
                Sugerencia: {formatCurrency(suggestedSavings)} ({savingsPercentage}% de tus ingresos)
              </p>
              <button
                onClick={handleEditPercentage}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.5rem 0.75rem',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-light)',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Editar porcentaje"
              >
                <Edit2 size={14} />
              </button>
            </div>
          ) : (
            <div>
              <label style={{ 
                display: 'block',
                fontFamily: 'Poppins, sans-serif', 
                color: 'var(--text)', 
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Porcentaje de Ahorro (%)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="15"
                  value={percentageInputValue}
                  onChange={(e) => {
                    setPercentageInputValue(e.target.value)
                    if (errors.percentage) {
                      setErrors({ ...errors, percentage: '' })
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: `2px solid ${errors.percentage ? 'var(--danger)' : 'var(--border)'}`,
                    borderRadius: '8px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '0.875rem',
                    color: 'var(--text)',
                    background: 'var(--bg)'
                  }}
                  className={errors.percentage ? 'input-error' : ''}
                  min="0"
                  max="100"
                  step="0.1"
                  autoFocus
                />
                <button
                  onClick={handleSavePercentage}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'linear-gradient(135deg, #FFB6C1 0%, #E6E6FA 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#4A4A4A',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={handleCancelPercentage}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    fontFamily: 'Poppins, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
              {errors.percentage && (
                <span className="error-message" style={{ display: 'block', marginTop: '0.25rem' }}>
                  {errors.percentage}
                </span>
              )}
            </div>
          )}
        </div>
        
        {!isEditing ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <p style={{ 
                fontFamily: 'Poppins, sans-serif', 
                color: 'var(--text-light)', 
                fontSize: '0.875rem',
                marginBottom: '0.25rem'
              }}>
                Monto de Ahorro
              </p>
              <p style={{ 
                fontFamily: 'Poppins, sans-serif', 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: 'var(--text)',
                margin: 0
              }}>
                {formatCurrency(savingsAmount)}
              </p>
            </div>
            <button
              onClick={handleEdit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #FFB6C1 0%, #E6E6FA 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#4A4A4A',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: 'var(--shadow)'
              }}
            >
              <Edit2 size={18} />
              Editar
            </button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block',
                fontFamily: 'Poppins, sans-serif', 
                color: 'var(--text)', 
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Monto de Ahorro
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={inputValue}
                onChange={(e) => {
                  const formatted = formatNumber(e.target.value)
                  setInputValue(formatted)
                  if (errors.amount) {
                    setErrors({ ...errors, amount: '' })
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `2px solid ${errors.amount ? 'var(--danger)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '1rem',
                  color: 'var(--text)',
                  background: 'var(--bg)'
                }}
                className={errors.amount ? 'input-error' : ''}
                autoFocus
              />
              {errors.amount && (
                <span className="error-message" style={{ display: 'block', marginTop: '0.25rem' }}>
                  {errors.amount}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancel}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'var(--bg)',
                  border: '2px solid var(--border)',
                  borderRadius: '12px',
                  color: 'var(--text)',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <X size={18} />
                Cancelar
              </button>
              <button
                onClick={handleSaveSavings}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #FFB6C1 0%, #E6E6FA 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#4A4A4A',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: 'var(--shadow)'
                }}
              >
                <Check size={18} />
                Guardar como Gasto
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="savings-stats">
        <div className="stat-card savings-card">
          <div className="stat-icon savings">
            <PiggyBank size={32} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Ahorros Totales</p>
            <p className="stat-value">{formatCurrency(savings)}</p>
            <p className="stat-percentage">{actualSavingsPercentage}% de ingresos</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon income">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Ingresos Totales</p>
            <p className="stat-value">{formatCurrency(totalIncomes)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon expenses">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Gastos Totales</p>
            <p className="stat-value">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>
      </div>

      <div className="savings-info" style={{ marginTop: '2rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border)' }}>
        <h3 style={{ fontFamily: "'Dancing Script', cursive", fontStyle: 'italic', marginBottom: '1rem', color: 'var(--text)' }}>
          Consejos para Ahorrar
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, fontFamily: 'Poppins, sans-serif', color: 'var(--text-light)' }}>
          <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0 }}>💡</span>
            Establece un objetivo de ahorro mensual
          </li>
          <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0 }}>📊</span>
            Revisa tus gastos regularmente para identificar oportunidades
          </li>
          <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0 }}>🎯</span>
            Prioriza tus gastos esenciales antes que los opcionales
          </li>
          <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0 }}>💰</span>
            Automatiza tus ahorros para que sea más fácil cumplir tus metas
          </li>
        </ul>
      </div>
    </div>
  )
}

export default SavingsSection


import { useState } from 'react'
import { DollarSign, Target, Edit2, Check, X } from 'lucide-react'
import './BudgetForm.css'
import './FormValidations.css'

function BudgetForm({ budget, onSetBudget, categories, categoryBudgets, onSetCategoryBudget, currency, exchangeRate }) {
  const [inputValue, setInputValue] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryInputValue, setCategoryInputValue] = useState('')
  const [errors, setErrors] = useState({})

  // Función para formatear números con separadores de miles (solo enteros)
  const formatNumber = (value) => {
    // Remover todo excepto números
    const cleanValue = value.replace(/[^\d]/g, '')
    
    // Si está vacío, retornar vacío
    if (!cleanValue) return ''
    
    // Agregar puntos cada 3 dígitos desde la derecha
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  // Función para parsear el número formateado
  const parseFormattedNumber = (value) => {
    return parseFloat(value.replace(/\./g, '')) || 0
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setInputValue(formatNumber(value))
  }

  const handleCategoryInputChange = (e) => {
    const value = e.target.value
    setCategoryInputValue(formatNumber(value))
  }

  const validateBudget = (value) => {
    if (isNaN(value)) {
      return 'Debe ingresar un número válido'
    }
    if (value < 0) {
      return 'El presupuesto no puede ser negativo'
    }
    if (value > 999999999) {
      return 'El presupuesto no puede ser mayor a 999.999.999'
    }
    return ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const value = parseFormattedNumber(inputValue)
    const error = validateBudget(value)
    
    if (error) {
      setErrors({ budget: error })
      return
    }
    
    onSetBudget(value)
    setInputValue('')
    setIsEditing(false)
    setErrors({})
  }

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

  const handleCategoryEdit = (categoryId, currentBudget) => {
    setEditingCategory(categoryId)
    if (currentBudget) {
      // Formatear el valor actual al mostrar
      const formatted = formatNumber(currentBudget.toString())
      setCategoryInputValue(formatted)
    } else {
      setCategoryInputValue('')
    }
  }

  const handleCategorySave = (categoryId) => {
    const value = parseFormattedNumber(categoryInputValue)
    const error = validateBudget(value)
    
    if (error) {
      setErrors({ [`category-${categoryId}`]: error })
      return
    }
    
    onSetCategoryBudget(categoryId, value)
    setEditingCategory(null)
    setCategoryInputValue('')
    setErrors({ ...errors, [`category-${categoryId}`]: '' })
  }

  const handleCategoryCancel = () => {
    setEditingCategory(null)
    setCategoryInputValue('')
  }

  return (
    <div className="budget-form-card">
      <div className="card-header">
        <DollarSign size={20} />
        <h3>Presupuesto Mensual</h3>
      </div>
      <div className="card-content">
        {!isEditing ? (
          <div className="budget-display">
            <p className="budget-amount">{formatCurrency(budget)}</p>
            <button 
              className="edit-button"
              onClick={() => setIsEditing(true)}
            >
              {budget === 0 ? 'Establecer presupuesto' : 'Editar'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="budget-form">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ingresa el presupuesto"
              value={inputValue}
              onChange={(e) => {
                handleInputChange(e)
                if (errors.budget) {
                  setErrors({ ...errors, budget: '' })
                }
              }}
              className={`budget-input ${errors.budget ? 'input-error' : ''}`}
              autoFocus
            />
            {errors.budget && <span className="error-message">{errors.budget}</span>}
            <div className="form-actions">
              <button type="submit" className="submit-button">
                Guardar
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => {
                  setIsEditing(false)
                  setInputValue('')
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="category-budgets-section">
        <div className="category-budgets-header">
          <Target size={18} />
          <h4>Presupuestos por Categoría</h4>
        </div>
        <div className="category-budgets-list">
          {categories.map(category => {
            const categoryBudget = categoryBudgets[category.id] || 0
            const isEditingCategory = editingCategory === category.id

            return (
              <div key={category.id} className="category-budget-item">
                <div className="category-info">
                  <span className="category-icon" style={{ color: category.color }}>
                    {category.icon}
                  </span>
                  <span className="category-name">{category.name}</span>
                </div>
                <div className="category-budget-input">
                  {isEditingCategory ? (
                    <div className="budget-edit-form">
                      <div style={{ flex: 1 }}>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={categoryInputValue}
                          onChange={(e) => {
                            handleCategoryInputChange(e)
                            if (errors[`category-${category.id}`]) {
                              setErrors({ ...errors, [`category-${category.id}`]: '' })
                            }
                          }}
                          className={`budget-edit-input ${errors[`category-${category.id}`] ? 'input-error' : ''}`}
                          autoFocus
                        />
                        {errors[`category-${category.id}`] && (
                          <span className="error-message" style={{ display: 'block', marginTop: '0.25rem' }}>
                            {errors[`category-${category.id}`]}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="save-budget-button"
                        onClick={() => handleCategorySave(category.id)}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type="button"
                        className="cancel-budget-button"
                        onClick={handleCategoryCancel}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="budget-display-row">
                      <span className="budget-amount-display">{formatCurrency(categoryBudget)}</span>
                      <button
                        type="button"
                        className="edit-budget-button"
                        onClick={() => handleCategoryEdit(category.id, categoryBudget)}
                        title="Editar presupuesto"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BudgetForm


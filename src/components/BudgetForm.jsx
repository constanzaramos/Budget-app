import { useState } from 'react'
import { DollarSign, Target, Edit2, Check, X } from 'lucide-react'
import './BudgetForm.css'

function BudgetForm({ budget, onSetBudget, categories, categoryBudgets, onSetCategoryBudget, currency, exchangeRate }) {
  const [inputValue, setInputValue] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryInputValue, setCategoryInputValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const value = parseFloat(inputValue)
    if (!isNaN(value) && value >= 0) {
      onSetBudget(value)
      setInputValue('')
      setIsEditing(false)
    }
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
    setCategoryInputValue(currentBudget ? currentBudget.toString() : '')
  }

  const handleCategorySave = (categoryId) => {
    const value = parseFloat(categoryInputValue)
    if (!isNaN(value) && value >= 0) {
      onSetCategoryBudget(categoryId, value)
    }
    setEditingCategory(null)
    setCategoryInputValue('')
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
              type="number"
              step="0.01"
              min="0"
              placeholder="Ingresa el presupuesto"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="budget-input"
              autoFocus
            />
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
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0"
                        value={categoryInputValue}
                        onChange={(e) => setCategoryInputValue(e.target.value)}
                        className="budget-edit-input"
                        autoFocus
                      />
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


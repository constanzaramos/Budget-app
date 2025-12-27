import { useState } from 'react'
import { Target, Edit2, Check, X } from 'lucide-react'
import './CategoryBudgetForm.css'

function CategoryBudgetForm({ categories, categoryBudgets, onSetCategoryBudget, currency, exchangeRate }) {
  const [editingCategory, setEditingCategory] = useState(null)
  const [inputValue, setInputValue] = useState('')

  const formatCurrency = (value) => {
    if (!value || value === 0) return '-'
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

  const handleEdit = (categoryId, currentBudget) => {
    setEditingCategory(categoryId)
    setInputValue(currentBudget ? currentBudget.toString() : '')
  }

  const handleSave = (categoryId) => {
    const value = parseFloat(inputValue)
    if (!isNaN(value) && value >= 0) {
      onSetCategoryBudget(categoryId, value)
    }
    setEditingCategory(null)
    setInputValue('')
  }

  const handleCancel = () => {
    setEditingCategory(null)
    setInputValue('')
  }

  return (
    <div className="category-budget-form-card">
      <div className="card-header">
        <Target size={20} />
        <h3>Presupuestos por Categoría</h3>
      </div>
      <div className="category-budgets-list">
        {categories.map(category => {
          const budget = categoryBudgets[category.id] || 0
          const isEditing = editingCategory === category.id

          return (
            <div key={category.id} className="category-budget-item">
              <div className="category-info">
                <span className="category-icon" style={{ color: category.color }}>
                  {category.icon}
                </span>
                <span className="category-name">{category.name}</span>
              </div>
              <div className="category-budget-input">
                {isEditing ? (
                  <div className="budget-edit-form">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="budget-edit-input"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="save-budget-button"
                      onClick={() => handleSave(category.id)}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      type="button"
                      className="cancel-budget-button"
                      onClick={handleCancel}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="budget-display-row">
                    <span className="budget-amount-display">{formatCurrency(budget)}</span>
                    <button
                      type="button"
                      className="edit-budget-button"
                      onClick={() => handleEdit(category.id, budget)}
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
  )
}

export default CategoryBudgetForm


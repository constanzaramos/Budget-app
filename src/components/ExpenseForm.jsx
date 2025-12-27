import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { format } from 'date-fns'
import './ExpenseForm.css'

function ExpenseForm({ categories, onAddExpense, onAddCategory }) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#FFB6C1')
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (amount && description && categoryId) {
      onAddExpense({
        amount: parseFloat(amount),
        description,
        categoryId,
        date,
      })
      setAmount('')
      setDescription('')
      setCategoryId(categories[0]?.id || '')
      setDate(format(new Date(), 'yyyy-MM-dd'))
    }
  }

  const handleAddCategory = (e) => {
    e.preventDefault()
    if (newCategoryName.trim()) {
      onAddCategory({
        name: newCategoryName.trim(),
        color: newCategoryColor,
        icon: newCategoryIcon,
      })
      setNewCategoryName('')
      setNewCategoryColor('#6366f1')
      setNewCategoryIcon('📦')
      setShowCategoryForm(false)
    }
  }

  const colors = [
    '#FFB6C1', '#B0E0E6', '#E6E6FA', '#DDA0DD', '#FFDAB9', '#FFC0CB',
    '#F0E68C', '#FFE4E1', '#FFF0F5', '#FFFACD'
  ]

  const icons = ['🍔', '🚗', '🎬', '💊', '📚', '📦', '🏠', '👕', '🎮', '✈️', '💻', '🎵']

  return (
    <div className="expense-form-card">
      <div className="card-header">
        <Plus size={20} />
        <h3>Agregar Gasto</h3>
      </div>
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label htmlFor="amount">Cantidad</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <input
            id="description"
            type="text"
            placeholder="Ej: Comida, Transporte..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Categoría</label>
          <div className="category-select-wrapper">
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="add-category-button"
              onClick={() => setShowCategoryForm(!showCategoryForm)}
              title="Agregar categoría"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="date">Fecha</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-button">
          Agregar Gasto
        </button>
      </form>

      {showCategoryForm && (
        <div className="category-form-overlay">
          <div className="category-form-card">
            <div className="category-form-header">
              <h4>Nueva Categoría</h4>
              <button
                type="button"
                className="close-button"
                onClick={() => setShowCategoryForm(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="category-form">
              <div className="form-group">
                <label htmlFor="category-name">Nombre</label>
                <input
                  id="category-name"
                  type="text"
                  placeholder="Nombre de la categoría"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category-icon">Icono</label>
                <div className="icon-selector">
                  {icons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      className={`icon-option ${newCategoryIcon === icon ? 'selected' : ''}`}
                      onClick={() => setNewCategoryIcon(icon)}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="category-color">Color</label>
                <div className="color-selector">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${newCategoryColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewCategoryColor(color)}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="submit-button">
                Agregar Categoría
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpenseForm


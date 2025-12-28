import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { format } from 'date-fns'
import './ExpenseForm.css'
import './FormValidations.css'

function ExpenseForm({ categories, onAddExpense, onAddCategory }) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#FFB6C1')
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦')
  
  // Estados para validaciones
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

  const handleAmountChange = (e) => {
    const value = e.target.value
    setAmount(formatNumber(value))
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Validar cantidad
    const amountValue = parseFormattedNumber(amount)
    if (!amount || amount.trim() === '') {
      newErrors.amount = 'La cantidad es obligatoria'
    } else if (amountValue <= 0) {
      newErrors.amount = 'La cantidad debe ser mayor a cero'
    } else if (amountValue > 999999999) {
      newErrors.amount = 'La cantidad no puede ser mayor a 999.999.999'
    }
    
    // Validar descripción
    if (!description || description.trim() === '') {
      newErrors.description = 'La descripción es obligatoria'
    } else if (description.trim().length < 3) {
      newErrors.description = 'La descripción debe tener al menos 3 caracteres'
    } else if (description.trim().length > 100) {
      newErrors.description = 'La descripción no puede tener más de 100 caracteres'
    }
    
    // Validar categoría
    if (!categoryId) {
      newErrors.categoryId = 'Debes seleccionar una categoría'
    }
    
    // Validar fecha
    if (!date) {
      newErrors.date = 'La fecha es obligatoria'
    } else {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      if (selectedDate > today) {
        newErrors.date = 'La fecha no puede ser futura'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onAddExpense({
        amount: parseFormattedNumber(amount),
        description: description.trim(),
        categoryId,
        date,
      })
      setAmount('')
      setDescription('')
      setCategoryId(categories[0]?.id || '')
      setDate(format(new Date(), 'yyyy-MM-dd'))
      setErrors({})
    }
  }

  const handleAddCategory = (e) => {
    e.preventDefault()
    const categoryName = newCategoryName.trim()
    if (!categoryName) {
      setErrors({ ...errors, newCategoryName: 'El nombre de la categoría es obligatorio' })
      return
    }
    if (categoryName.length < 2) {
      setErrors({ ...errors, newCategoryName: 'El nombre debe tener al menos 2 caracteres' })
      return
    }
    if (categoryName.length > 30) {
      setErrors({ ...errors, newCategoryName: 'El nombre no puede tener más de 30 caracteres' })
      return
    }
    
    onAddCategory({
      name: categoryName,
      color: newCategoryColor,
      icon: newCategoryIcon,
    })
    setNewCategoryName('')
    setNewCategoryColor('#FFB6C1')
    setNewCategoryIcon('📦')
    setShowCategoryForm(false)
    setErrors({ ...errors, newCategoryName: '' })
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
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={(e) => {
              handleAmountChange(e)
              if (errors.amount) {
                setErrors({ ...errors, amount: '' })
              }
            }}
            className={errors.amount ? 'input-error' : ''}
            required
          />
          {errors.amount && <span className="error-message">{errors.amount}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <input
            id="description"
            type="text"
            placeholder="Ej: Comida, Transporte..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              if (errors.description) {
                setErrors({ ...errors, description: '' })
              }
            }}
            className={errors.description ? 'input-error' : ''}
            required
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="category">Categoría</label>
          <div className="category-select-wrapper">
            <select
              id="category"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value)
                if (errors.categoryId) {
                  setErrors({ ...errors, categoryId: '' })
                }
              }}
              className={errors.categoryId ? 'input-error' : ''}
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
          {errors.categoryId && <span className="error-message">{errors.categoryId}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="date">Fecha</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              if (errors.date) {
                setErrors({ ...errors, date: '' })
              }
            }}
            className={errors.date ? 'input-error' : ''}
            max={format(new Date(), 'yyyy-MM-dd')}
            required
          />
          {errors.date && <span className="error-message">{errors.date}</span>}
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
                  onChange={(e) => {
                    setNewCategoryName(e.target.value)
                    if (errors.newCategoryName) {
                      setErrors({ ...errors, newCategoryName: '' })
                    }
                  }}
                  className={errors.newCategoryName ? 'input-error' : ''}
                  required
                />
                {errors.newCategoryName && <span className="error-message">{errors.newCategoryName}</span>}
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


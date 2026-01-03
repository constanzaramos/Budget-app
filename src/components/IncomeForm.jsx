import { useState } from 'react'
import { TrendingUp, Plus } from 'lucide-react'
import { format } from 'date-fns'
import './IncomeForm.css'
import './FormValidations.css'

function IncomeForm({ onAddIncome }) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [source, setSource] = useState('') // Fuente del ingreso: salario, freelance, etc.
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
    const cleanAmount = amount ? amount.replace(/\./g, '').trim() : ''
    const amountValue = parseFormattedNumber(amount)
    if (!cleanAmount || cleanAmount === '') {
      newErrors.amount = 'La cantidad es obligatoria'
    } else if (isNaN(amountValue) || amountValue <= 0) {
      newErrors.amount = 'La cantidad debe ser mayor a cero'
    } else if (amountValue > 999999999) {
      newErrors.amount = 'La cantidad no puede ser mayor a 999.999.999'
    }
    
    // Validar descripción
    const cleanDescription = description ? description.trim() : ''
    if (!cleanDescription || cleanDescription === '') {
      newErrors.description = 'La descripción es obligatoria'
    } else if (cleanDescription.length < 3) {
      newErrors.description = 'La descripción debe tener al menos 3 caracteres'
    } else if (cleanDescription.length > 100) {
      newErrors.description = 'La descripción no puede tener más de 100 caracteres'
    }
    
    // Validar fecha
    if (!date) {
      newErrors.date = 'La fecha es obligatoria'
    } else {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      if (isNaN(selectedDate.getTime())) {
        newErrors.date = 'La fecha no es válida'
      } else if (selectedDate > today) {
        newErrors.date = 'La fecha no puede ser futura'
      }
    }
    
    // Validar fuente (opcional pero si se ingresa, debe tener formato válido)
    if (source && source.trim().length > 50) {
      newErrors.source = 'La fuente no puede tener más de 50 caracteres'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      const incomeData = {
        amount: parseFormattedNumber(amount),
        description: description.trim(),
        date,
        source: source.trim() || 'Otros',
      }
      
      // Verificar que onAddIncome existe y es una función
      if (typeof onAddIncome === 'function') {
        onAddIncome(incomeData)
        setAmount('')
        setDescription('')
        setSource('')
        setDate(format(new Date(), 'yyyy-MM-dd'))
        setErrors({})
      } else {
        console.error('onAddIncome no es una función válida')
        setErrors({ submit: 'Error al guardar el ingreso. Por favor, intente nuevamente.' })
      }
    }
  }

  return (
    <div className="income-form-card">
      <div className="card-header">
        <TrendingUp size={20} />
        <h3>Agregar Ingreso</h3>
      </div>
      <form onSubmit={handleSubmit} className="income-form">
        <div className="form-group">
          <label htmlFor="income-amount">Cantidad</label>
          <input
            id="income-amount"
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
          <label htmlFor="income-description">Descripción</label>
          <input
            id="income-description"
            type="text"
            placeholder="Ej: Salario, Freelance, Venta..."
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
          <label htmlFor="income-source">Fuente</label>
          <input
            id="income-source"
            type="text"
            placeholder="Ej: Trabajo, Negocio, Inversión..."
            value={source}
            onChange={(e) => {
              setSource(e.target.value)
              if (errors.source) {
                setErrors({ ...errors, source: '' })
              }
            }}
            className={errors.source ? 'input-error' : ''}
          />
          {errors.source && <span className="error-message">{errors.source}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="income-date">Fecha</label>
          <input
            id="income-date"
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

        {errors.submit && <span className="error-message" style={{ display: 'block', marginBottom: '1rem' }}>{errors.submit}</span>}
        
        <button type="submit" className="submit-button">
          Agregar Ingreso
        </button>
      </form>
    </div>
  )
}

export default IncomeForm


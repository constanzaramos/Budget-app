import { ChevronLeft, ChevronRight, Calendar, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import './Header.css'

function Header({ currentMonth, onMonthChange, currency, onCurrencyChange, exchangeRate, rateLoading }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <Calendar className="header-icon" size={28} />
          <h1>Aplicación de Presupuesto</h1>
        </div>
        <div className="header-controls">
          <div className="currency-selector">
            <DollarSign size={18} />
            <select 
              value={currency} 
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="currency-select"
              disabled={rateLoading}
            >
              <option value="CLP">CLP (Peso Chileno)</option>
              <option value="USD">USD (Dólar)</option>
            </select>
            {rateLoading && <span className="rate-loading">Cargando...</span>}
            {!rateLoading && exchangeRate && currency === 'USD' && (
              <span className="exchange-rate">1 USD = {exchangeRate.toFixed(2)} CLP</span>
            )}
          </div>
          <div className="month-navigator">
            <button 
              className="nav-button"
              onClick={() => onMonthChange(-1)}
              aria-label="Mes anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="current-month">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </div>
            <button 
              className="nav-button"
              onClick={() => onMonthChange(1)}
              aria-label="Mes siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header


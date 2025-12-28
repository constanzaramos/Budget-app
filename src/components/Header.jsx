import { ChevronLeft, ChevronRight, Calendar, DollarSign } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import './Header.css'

function Header({ currentMonth, onMonthChange, currency, onCurrencyChange, exchangeRate, rateLoading }) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="header-month-title">
            <h1 className="month-display">{format(currentMonth, 'MMMM', { locale: es })}</h1>
            <h2 className="dashboard-title">TABLERO DE PRESUPUESTO</h2>
          </div>
          <div className="header-dates">
            <div className="date-item">
              <span className="date-label">FECHA DE INICIO</span>
              <span className="date-value">{format(monthStart, 'd-MMM-yy', { locale: es })}</span>
            </div>
            <div className="date-item">
              <span className="date-label">FECHA DE FIN</span>
              <span className="date-value">{format(monthEnd, 'd-MMM-yy', { locale: es })}</span>
            </div>
          </div>
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


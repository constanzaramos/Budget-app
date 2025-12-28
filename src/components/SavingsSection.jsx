import { DollarSign, TrendingUp, PiggyBank } from 'lucide-react'
import './Section.css'

function SavingsSection({ totalIncomes, totalExpenses, balance, currency, exchangeRate }) {
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

  const savings = Math.max(0, balance)
  const savingsPercentage = totalIncomes > 0 ? ((savings / totalIncomes) * 100).toFixed(1) : 0

  return (
    <div className="section-container">
      <div className="savings-stats">
        <div className="stat-card savings-card">
          <div className="stat-icon savings">
            <PiggyBank size={32} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Ahorros Totales</p>
            <p className="stat-value">{formatCurrency(savings)}</p>
            <p className="stat-percentage">{savingsPercentage}% de ingresos</p>
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


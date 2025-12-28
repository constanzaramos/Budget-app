import IncomeForm from './IncomeForm'
import ExpenseList from './ExpenseList'
import './Section.css'

function IncomeSection({ incomes, onAddIncome, onDeleteIncome, currency, exchangeRate, currentMonth }) {
  return (
    <div className="section-container">
      <IncomeForm 
        onAddIncome={onAddIncome}
      />

      <div style={{ marginTop: '2rem' }}>
        <ExpenseList
          expenses={[]}
          incomes={incomes}
          categories={[]}
          onDeleteExpense={() => {}}
          onDeleteIncome={onDeleteIncome}
          currency={currency}
          exchangeRate={exchangeRate}
          currentMonth={currentMonth}
          title={`Ingresos del Mes${incomes.length > 0 ? ` (${incomes.length})` : ''}`}
        />
      </div>
    </div>
  )
}

export default IncomeSection


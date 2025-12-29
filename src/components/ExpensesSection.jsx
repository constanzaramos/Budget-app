import ExpenseForm from './ExpenseForm'
import ExpenseList from './ExpenseList'
import './Section.css'

function ExpensesSection({ expenses, categories, onAddExpense, onAddCategory, onDeleteExpense, currency, exchangeRate, currentMonth }) {
  return (
    <div className="section-container">
      <ExpenseForm 
        categories={categories}
        onAddExpense={onAddExpense}
        onAddCategory={onAddCategory}
      />

      <div style={{ marginTop: '2rem' }}>
        <ExpenseList
          expenses={expenses}
          incomes={[]}
          categories={categories}
          onDeleteExpense={onDeleteExpense}
          onDeleteIncome={() => {}}
          currency={currency}
          exchangeRate={exchangeRate}
          currentMonth={currentMonth}
          title={`Gastos del Mes${expenses.length > 0 ? ` (${expenses.length})` : ''}`}
        />
      </div>
    </div>
  )
}

export default ExpensesSection


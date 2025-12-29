import BudgetForm from './BudgetForm'
import './Section.css'

function BudgetSection({ budget, onSetBudget, categories, categoryBudgets, onSetCategoryBudget, currency, exchangeRate }) {
  return (
    <div className="section-container">
      <BudgetForm 
        budget={budget} 
        onSetBudget={onSetBudget}
        categories={categories}
        categoryBudgets={categoryBudgets}
        onSetCategoryBudget={onSetCategoryBudget}
        currency={currency}
        exchangeRate={exchangeRate}
      />
    </div>
  )
}

export default BudgetSection


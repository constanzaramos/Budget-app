import { useState, useEffect } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import ExpenseForm from './components/ExpenseForm'
import IncomeForm from './components/IncomeForm'
import ExpenseList from './components/ExpenseList'
import BudgetForm from './components/BudgetForm'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { useExchangeRate } from './hooks/useExchangeRate'
import './App.css'

function App() {
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('budget-expenses')
    return saved ? JSON.parse(saved) : []
  })

  const [incomes, setIncomes] = useState(() => {
    const saved = localStorage.getItem('budget-incomes')
    return saved ? JSON.parse(saved) : []
  })

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('budget-categories')
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Alimentación', color: '#FFB6C1', icon: '🍔' },
      { id: '2', name: 'Transporte', color: '#B0E0E6', icon: '🚗' },
      { id: '3', name: 'Entretenimiento', color: '#E6E6FA', icon: '🎬' },
      { id: '4', name: 'Salud', color: '#DDA0DD', icon: '💊' },
      { id: '5', name: 'Educación', color: '#FFDAB9', icon: '📚' },
      { id: '6', name: 'Ahorro', color: '#B0E0E6', icon: '💰' },
      { id: '7', name: 'Otros', color: '#FFFACD', icon: '📦' },
    ]
  })

  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem('budget-amount')
    return saved ? parseFloat(saved) : 0
  })

  const [categoryBudgets, setCategoryBudgets] = useState(() => {
    const saved = localStorage.getItem('budget-category-budgets')
    return saved ? JSON.parse(saved) : {}
  })

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('budget-currency')
    return saved || 'CLP'
  })

  const { exchangeRate, loading: rateLoading } = useExchangeRate()

  // Guardar en localStorage cuando cambian los datos
  useEffect(() => {
    localStorage.setItem('budget-expenses', JSON.stringify(expenses))
  }, [expenses])

  useEffect(() => {
    localStorage.setItem('budget-incomes', JSON.stringify(incomes))
  }, [incomes])

  useEffect(() => {
    localStorage.setItem('budget-categories', JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    localStorage.setItem('budget-amount', budget.toString())
  }, [budget])

  useEffect(() => {
    localStorage.setItem('budget-currency', currency)
  }, [currency])

  useEffect(() => {
    localStorage.setItem('budget-category-budgets', JSON.stringify(categoryBudgets))
  }, [categoryBudgets])

  // Obtener gastos del mes actual
  const getCurrentMonthExpenses = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    
    return expenses.filter(expense => {
      if (!expense.date) return false
      try {
        const expenseDate = parseISO(expense.date)
        return expenseDate >= monthStart && expenseDate <= monthEnd
      } catch (error) {
        console.error('Error parsing expense date:', expense.date, error)
        return false
      }
    })
  }

  // Obtener ingresos del mes actual
  const getCurrentMonthIncomes = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    
    return incomes.filter(income => {
      if (!income.date) return false
      try {
        const incomeDate = parseISO(income.date)
        return incomeDate >= monthStart && incomeDate <= monthEnd
      } catch (error) {
        console.error('Error parsing income date:', income.date, error)
        return false
      }
    })
  }

  const currentMonthExpenses = getCurrentMonthExpenses()
  const currentMonthIncomes = getCurrentMonthIncomes()

  // Calcular total de gastos del mes
  const totalExpenses = currentMonthExpenses.reduce((sum, expense) => {
    const amount = parseFloat(expense.amount) || 0
    return sum + amount
  }, 0)
  const totalIncomes = currentMonthIncomes.reduce((sum, income) => {
    const amount = parseFloat(income.amount) || 0
    return sum + amount
  }, 0)
  const balance = totalIncomes - totalExpenses
  const remaining = budget - totalExpenses
  const percentage = budget > 0 ? (totalExpenses / budget) * 100 : 0

  const addExpense = (expense) => {
    const newExpense = {
      id: Date.now().toString(),
      ...expense,
      date: expense.date || format(new Date(), 'yyyy-MM-dd'),
    }
    setExpenses([...expenses, newExpense])
  }

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id))
  }

  const addIncome = (income) => {
    const newIncome = {
      id: Date.now().toString(),
      ...income,
      date: income.date || format(new Date(), 'yyyy-MM-dd'),
    }
    setIncomes([...incomes, newIncome])
  }

  const deleteIncome = (id) => {
    setIncomes(incomes.filter(income => income.id !== id))
  }

  const addCategory = (category) => {
    const newCategory = {
      id: Date.now().toString(),
      ...category,
    }
    setCategories([...categories, newCategory])
  }

  const setCategoryBudget = (categoryId, amount) => {
    setCategoryBudgets({
      ...categoryBudgets,
      [categoryId]: amount
    })
  }

  const changeMonth = (direction) => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + direction)
    setCurrentMonth(newMonth)
  }

  return (
    <div className="app">
      <Header 
        currentMonth={currentMonth}
        onMonthChange={changeMonth}
        currency={currency}
        onCurrencyChange={setCurrency}
        exchangeRate={exchangeRate}
        rateLoading={rateLoading}
      />
      <div className="app-container">
        <Dashboard
          budget={budget}
          totalExpenses={totalExpenses}
          totalIncomes={totalIncomes}
          balance={balance}
          remaining={remaining}
          percentage={percentage}
          expenses={currentMonthExpenses}
          incomes={currentMonthIncomes}
          categories={categories}
          categoryBudgets={categoryBudgets}
          currency={currency}
          exchangeRate={exchangeRate}
        />
        <div className="app-actions">
          <BudgetForm 
            budget={budget} 
            onSetBudget={setBudget}
            categories={categories}
            categoryBudgets={categoryBudgets}
            onSetCategoryBudget={setCategoryBudget}
            currency={currency}
            exchangeRate={exchangeRate}
          />
          <ExpenseForm 
            categories={categories}
            onAddExpense={addExpense}
            onAddCategory={addCategory}
          />
          <IncomeForm 
            onAddIncome={addIncome}
          />
        </div>
        <ExpenseList
          expenses={currentMonthExpenses}
          incomes={currentMonthIncomes}
          categories={categories}
          onDeleteExpense={deleteExpense}
          onDeleteIncome={deleteIncome}
          currency={currency}
          exchangeRate={exchangeRate}
          currentMonth={currentMonth}
        />
      </div>
    </div>
  )
}

export default App


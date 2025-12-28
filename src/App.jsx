import { useState, useEffect } from 'react'
import Header from './components/Header'
import Tabs from './components/Tabs'
import BudgetSection from './components/BudgetSection'
import ExpensesSection from './components/ExpensesSection'
import IncomeSection from './components/IncomeSection'
import SavingsSection from './components/SavingsSection'
import ConsolidatedSection from './components/ConsolidatedSection'
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
      { id: '1', name: 'Vivienda', color: '#FFB6C1', icon: '🏠' }, // Rosa pastel
      { id: '2', name: 'Gastos básicos', color: '#E6E6FA', icon: '💡' }, // Lavanda
      { id: '3', name: 'Internet', color: '#B0E0E6', icon: '🌐' }, // Azul cielo
      { id: '4', name: 'Celular', color: '#FFDAB9', icon: '📱' }, // Melocotón
      { id: '5', name: 'Suscripciones', color: '#DDA0DD', icon: '📺' }, // Ciruela pastel
      { id: '6', name: 'Alimentación', color: '#B4E4B4', icon: '🍔' }, // Verde pastel
      { id: '7', name: 'Salud', color: '#FFC0CB', icon: '💊' }, // Rosa
      { id: '8', name: 'Mascotas', color: '#FFF0F5', icon: '🐾' }, // Lavanda rosado
      { id: '9', name: 'Entretenimiento', color: '#D8BFD8', icon: '🎬' }, // Orquídea claro
      { id: '10', name: 'Otros', color: '#FFFACD', icon: '📦' }, // Amarillo pastel
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
        <Tabs tabs={[
          { id: 'budget', label: 'Presupuesto', icon: '💰' },
          { id: 'expenses', label: 'Gastos', icon: '💸' },
          { id: 'income', label: 'Ingresos', icon: '📈' },
          { id: 'savings', label: 'Ahorros', icon: '🐷' },
          { id: 'consolidated', label: 'Consolidado', icon: '📄' },
        ]} defaultTab="budget">
          <div tabId="budget">
            <BudgetSection
              budget={budget}
              onSetBudget={setBudget}
              categories={categories}
              categoryBudgets={categoryBudgets}
              onSetCategoryBudget={setCategoryBudget}
              currency={currency}
              exchangeRate={exchangeRate}
            />
          </div>
          <div tabId="expenses">
            <ExpensesSection
              expenses={currentMonthExpenses}
              categories={categories}
              onAddExpense={addExpense}
              onAddCategory={addCategory}
              onDeleteExpense={deleteExpense}
              currency={currency}
              exchangeRate={exchangeRate}
              currentMonth={currentMonth}
            />
          </div>
          <div tabId="income">
            <IncomeSection
              incomes={currentMonthIncomes}
              onAddIncome={addIncome}
              onDeleteIncome={deleteIncome}
              currency={currency}
              exchangeRate={exchangeRate}
              currentMonth={currentMonth}
            />
          </div>
          <div tabId="savings">
            <SavingsSection
              totalIncomes={totalIncomes}
              totalExpenses={totalExpenses}
              balance={balance}
              currency={currency}
              exchangeRate={exchangeRate}
            />
          </div>
          <div tabId="consolidated">
            <ConsolidatedSection
              budget={budget}
              totalExpenses={totalExpenses}
              totalIncomes={totalIncomes}
              balance={balance}
              remaining={remaining}
              expenses={currentMonthExpenses}
              incomes={currentMonthIncomes}
              categories={categories}
              categoryBudgets={categoryBudgets}
              currency={currency}
              exchangeRate={exchangeRate}
              currentMonth={currentMonth}
            />
          </div>
        </Tabs>
      </div>
    </div>
  )
}

export default App


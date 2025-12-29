import { useState, useEffect } from 'react'
import LoginPage from './components/LoginPage'
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
  // Funciones helper para claves de localStorage (definidas primero)
  const getMonthKey = (date) => {
    return format(date, 'yyyy-MM')
  }

  // Función para cargar datos del perfil actual
  const loadProfileData = (profileId) => {
    const profileKey = (key) => `${key}-${profileId}`
    
    const defaultCategories = [
      { id: '1', name: 'Vivienda', color: '#FFB6C1', icon: '🏠' },
      { id: '2', name: 'Gastos básicos', color: '#E6E6FA', icon: '💡' },
      { id: '3', name: 'Internet', color: '#B0E0E6', icon: '🌐' },
      { id: '4', name: 'Celular', color: '#FFDAB9', icon: '📱' },
      { id: '5', name: 'Suscripciones', color: '#DDA0DD', icon: '📺' },
      { id: '6', name: 'Alimentación', color: '#B4E4B4', icon: '🍔' },
      { id: '7', name: 'Salud', color: '#FFC0CB', icon: '💊' },
      { id: '8', name: 'Mascotas', color: '#FFF0F5', icon: '🐾' },
      { id: '9', name: 'Entretenimiento', color: '#D8BFD8', icon: '🎬' },
      { id: '10', name: 'Otros', color: '#FFFACD', icon: '📦' },
    ]

    return {
      expenses: JSON.parse(localStorage.getItem(profileKey('budget-expenses')) || '[]'),
      incomes: JSON.parse(localStorage.getItem(profileKey('budget-incomes')) || '[]'),
      categories: JSON.parse(localStorage.getItem(profileKey('budget-categories')) || JSON.stringify(defaultCategories)),
      currency: localStorage.getItem(profileKey('budget-currency')) || 'CLP',
    }
  }

  // Estado de autenticación y perfiles
  const [currentProfile, setCurrentProfile] = useState(() => {
    const saved = localStorage.getItem('budget-current-profile')
    return saved || null
  })

  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('budget-profiles')
    return saved ? JSON.parse(saved) : []
  })

  // Funciones helper para claves de localStorage
  const getProfileKey = (key) => {
    return currentProfile ? `${key}-${currentProfile}` : key
  }

  const getProfileMonthKey = (key, date) => {
    const monthKey = getMonthKey(date)
    return currentProfile ? `${key}-${currentProfile}-${monthKey}` : `${key}-${monthKey}`
  }

  const [expenses, setExpenses] = useState(() => {
    const saved = currentProfile ? loadProfileData(currentProfile).expenses : []
    return saved
  })

  const [incomes, setIncomes] = useState(() => {
    const saved = currentProfile ? loadProfileData(currentProfile).incomes : []
    return saved
  })

  const [categories, setCategories] = useState(() => {
    const saved = currentProfile ? loadProfileData(currentProfile).categories : []
    return saved
  })

  const [budget, setBudget] = useState(() => {
    if (!currentProfile) return 0
    const monthKey = getMonthKey(new Date())
    const saved = localStorage.getItem(`budget-amount-${currentProfile}-${monthKey}`)
    return saved ? parseFloat(saved) : 0
  })

  const [categoryBudgets, setCategoryBudgets] = useState(() => {
    if (!currentProfile) return {}
    const monthKey = getMonthKey(new Date())
    const saved = localStorage.getItem(`budget-category-budgets-${currentProfile}-${monthKey}`)
    return saved ? JSON.parse(saved) : {}
  })

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [currency, setCurrency] = useState(() => {
    if (!currentProfile) return 'CLP'
    return loadProfileData(currentProfile).currency
  })

  // Estado para modo oscuro (global, no por perfil)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('budget-dark-mode')
    return saved === 'true'
  })

  // Aplicar tema al body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    localStorage.setItem('budget-dark-mode', isDarkMode.toString())
  }, [isDarkMode])

  const { exchangeRate, loading: rateLoading } = useExchangeRate()

  // Cargar datos cuando cambia el perfil
  useEffect(() => {
    if (currentProfile) {
      const data = loadProfileData(currentProfile)
      setExpenses(data.expenses)
      setIncomes(data.incomes)
      setCategories(data.categories)
      setCurrency(data.currency)
      
      const monthKey = getMonthKey(currentMonth)
      const savedBudget = localStorage.getItem(`budget-amount-${currentProfile}-${monthKey}`)
      const savedCategoryBudgets = localStorage.getItem(`budget-category-budgets-${currentProfile}-${monthKey}`)
      
      setBudget(savedBudget ? parseFloat(savedBudget) : 0)
      setCategoryBudgets(savedCategoryBudgets ? JSON.parse(savedCategoryBudgets) : {})
    }
  }, [currentProfile])

  // Guardar en localStorage cuando cambian los datos (solo si hay perfil activo)
  useEffect(() => {
    if (currentProfile) {
      localStorage.setItem(getProfileKey('budget-expenses'), JSON.stringify(expenses))
    }
  }, [expenses, currentProfile])

  useEffect(() => {
    if (currentProfile) {
      localStorage.setItem(getProfileKey('budget-incomes'), JSON.stringify(incomes))
    }
  }, [incomes, currentProfile])

  useEffect(() => {
    if (currentProfile) {
      localStorage.setItem(getProfileKey('budget-categories'), JSON.stringify(categories))
    }
  }, [categories, currentProfile])

  // Guardar presupuesto por mes y perfil
  useEffect(() => {
    if (currentProfile) {
      const key = getProfileMonthKey('budget-amount', currentMonth)
      localStorage.setItem(key, budget.toString())
    }
  }, [budget, currentMonth, currentProfile])

  useEffect(() => {
    if (currentProfile) {
      localStorage.setItem(getProfileKey('budget-currency'), currency)
    }
  }, [currency, currentProfile])

  // Guardar presupuestos por categoría por mes y perfil
  useEffect(() => {
    if (currentProfile) {
      const key = getProfileMonthKey('budget-category-budgets', currentMonth)
      localStorage.setItem(key, JSON.stringify(categoryBudgets))
    }
  }, [categoryBudgets, currentMonth, currentProfile])

  // Cargar presupuesto y presupuestos por categoría cuando cambia el mes
  useEffect(() => {
    if (currentProfile) {
      const key = getProfileMonthKey('budget-amount', currentMonth)
      const savedBudget = localStorage.getItem(key)
      const categoryKey = getProfileMonthKey('budget-category-budgets', currentMonth)
      const savedCategoryBudgets = localStorage.getItem(categoryKey)
      
      if (savedBudget !== null) {
        setBudget(parseFloat(savedBudget))
      } else {
        setBudget(0)
      }
      
      if (savedCategoryBudgets !== null) {
        setCategoryBudgets(JSON.parse(savedCategoryBudgets))
      } else {
        setCategoryBudgets({})
      }
    }
  }, [currentMonth, currentProfile])

  // Funciones de gestión de perfiles
  const handleLogin = (profileId) => {
    setCurrentProfile(profileId)
    localStorage.setItem('budget-current-profile', profileId)
  }

  const handleLogout = () => {
    setCurrentProfile(null)
    localStorage.removeItem('budget-current-profile')
    // Limpiar estados
    setExpenses([])
    setIncomes([])
    setCategories([])
    setBudget(0)
    setCategoryBudgets({})
  }

  const handleCreateProfile = (name) => {
    const newProfile = {
      id: Date.now().toString(),
      name: name.trim(),
      createdAt: new Date().toISOString()
    }
    const updatedProfiles = [...profiles, newProfile]
    setProfiles(updatedProfiles)
    localStorage.setItem('budget-profiles', JSON.stringify(updatedProfiles))
  }

  const handleDeleteProfile = (profileId) => {
    // Eliminar todos los datos del perfil
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.includes(`-${profileId}`)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))

    // Eliminar el perfil de la lista
    const updatedProfiles = profiles.filter(p => p.id !== profileId)
    setProfiles(updatedProfiles)
    localStorage.setItem('budget-profiles', JSON.stringify(updatedProfiles))

    // Si el perfil eliminado era el actual, cerrar sesión
    if (currentProfile === profileId) {
      handleLogout()
    }
  }

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

  // Si no hay perfil activo, mostrar página de login
  if (!currentProfile) {
    return (
      <LoginPage
        onLogin={handleLogin}
        profiles={profiles}
        onCreateProfile={handleCreateProfile}
        onDeleteProfile={handleDeleteProfile}
      />
    )
  }

  // Obtener nombre del perfil actual
  const currentProfileName = profiles.find(p => p.id === currentProfile)?.name || 'Usuario'

  return (
    <div className="app">
      <Header 
        currentMonth={currentMonth}
        onMonthChange={changeMonth}
        currency={currency}
        onCurrencyChange={setCurrency}
        exchangeRate={exchangeRate}
        rateLoading={rateLoading}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        currentProfileName={currentProfileName}
        onLogout={handleLogout}
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
              categories={categories}
              onAddExpense={addExpense}
              currentMonth={currentMonth}
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


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
import { onAuthChange, logout as firebaseLogout, getCurrentUser } from './firebase/authService'
import { 
  getUserData, 
  saveUserData, 
  getMonthlyBudget, 
  saveMonthlyBudget,
  subscribeToUserData,
  subscribeToMonthlyBudget
} from './firebase/firestoreService'
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

  // Estado de autenticación Firebase
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [useFirebase, setUseFirebase] = useState(false)

  // Estado de autenticación y perfiles (modo local)
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

  // Observar cambios en autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setIsLoadingAuth(true)
      if (user) {
        setFirebaseUser(user)
        setUseFirebase(true)
        setCurrentProfile(user.uid)
        
        // Cargar datos de Firestore
        await loadFirebaseData(user.uid)
      } else {
        setFirebaseUser(null)
        setUseFirebase(false)
        // Si no hay usuario de Firebase, usar modo local
        if (!currentProfile) {
          const saved = localStorage.getItem('budget-current-profile')
          if (saved) {
            setCurrentProfile(saved)
          }
        }
      }
      setIsLoadingAuth(false)
    })

    return () => unsubscribe()
  }, [])

  // Función para cargar datos de Firebase
  const loadFirebaseData = async (userId) => {
    try {
      // Cargar datos básicos
      const expensesResult = await getUserData(userId, 'expenses')
      const incomesResult = await getUserData(userId, 'incomes')
      const categoriesResult = await getUserData(userId, 'categories')
      
      if (expensesResult.data) setExpenses(expensesResult.data)
      if (incomesResult.data) setIncomes(incomesResult.data)
      if (categoriesResult.data) setCategories(categoriesResult.data)

      // Cargar presupuesto del mes actual
      const monthKey = getMonthKey(currentMonth)
      const budgetResult = await getMonthlyBudget(userId, monthKey)
      if (budgetResult.budget !== undefined) setBudget(budgetResult.budget)
      if (budgetResult.categoryBudgets) setCategoryBudgets(budgetResult.categoryBudgets)

      // Suscribirse a cambios en tiempo real
      subscribeToUserData(userId, 'expenses', (data) => {
        setExpenses(data || [])
      })
      
      subscribeToUserData(userId, 'incomes', (data) => {
        setIncomes(data || [])
      })
      
      subscribeToUserData(userId, 'categories', (data) => {
        if (data && data.length > 0) setCategories(data)
      })

      subscribeToMonthlyBudget(userId, monthKey, (data) => {
        setBudget(data.budget || 0)
        setCategoryBudgets(data.categoryBudgets || {})
      })
    } catch (error) {
      console.error('Error cargando datos de Firebase:', error)
    }
  }

  // Cargar datos cuando cambia el perfil (modo local)
  useEffect(() => {
    if (currentProfile && !useFirebase) {
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
  }, [currentProfile, useFirebase])

  // Guardar datos en Firebase o localStorage según el modo
  useEffect(() => {
    if (currentProfile && useFirebase && firebaseUser) {
      saveUserData(firebaseUser.uid, 'expenses', expenses)
    } else if (currentProfile && !useFirebase) {
      localStorage.setItem(getProfileKey('budget-expenses'), JSON.stringify(expenses))
    }
  }, [expenses, currentProfile, useFirebase, firebaseUser])

  useEffect(() => {
    if (currentProfile && useFirebase && firebaseUser) {
      saveUserData(firebaseUser.uid, 'incomes', incomes)
    } else if (currentProfile && !useFirebase) {
      localStorage.setItem(getProfileKey('budget-incomes'), JSON.stringify(incomes))
    }
  }, [incomes, currentProfile, useFirebase, firebaseUser])

  useEffect(() => {
    if (currentProfile && useFirebase && firebaseUser) {
      saveUserData(firebaseUser.uid, 'categories', categories)
    } else if (currentProfile && !useFirebase) {
      localStorage.setItem(getProfileKey('budget-categories'), JSON.stringify(categories))
    }
  }, [categories, currentProfile, useFirebase, firebaseUser])

  // Guardar presupuesto por mes y perfil
  useEffect(() => {
    if (currentProfile && useFirebase && firebaseUser) {
      const monthKey = getMonthKey(currentMonth)
      saveMonthlyBudget(firebaseUser.uid, monthKey, budget, categoryBudgets)
    } else if (currentProfile && !useFirebase) {
      const key = getProfileMonthKey('budget-amount', currentMonth)
      localStorage.setItem(key, budget.toString())
    }
  }, [budget, currentMonth, currentProfile, useFirebase, firebaseUser, categoryBudgets])

  useEffect(() => {
    if (currentProfile && useFirebase && firebaseUser) {
      // Guardar currency en perfil de usuario
      saveUserData(firebaseUser.uid, 'currency', currency)
    } else if (currentProfile && !useFirebase) {
      localStorage.setItem(getProfileKey('budget-currency'), currency)
    }
  }, [currency, currentProfile, useFirebase, firebaseUser])

  // Guardar presupuestos por categoría por mes y perfil
  useEffect(() => {
    if (currentProfile && useFirebase && firebaseUser) {
      const monthKey = getMonthKey(currentMonth)
      saveMonthlyBudget(firebaseUser.uid, monthKey, budget, categoryBudgets)
    } else if (currentProfile && !useFirebase) {
      const key = getProfileMonthKey('budget-category-budgets', currentMonth)
      localStorage.setItem(key, JSON.stringify(categoryBudgets))
    }
  }, [categoryBudgets, currentMonth, currentProfile, useFirebase, firebaseUser, budget])

  // Cargar presupuesto y presupuestos por categoría cuando cambia el mes
  useEffect(() => {
    if (currentProfile && useFirebase && firebaseUser) {
      const monthKey = getMonthKey(currentMonth)
      getMonthlyBudget(firebaseUser.uid, monthKey).then(result => {
        setBudget(result.budget || 0)
        setCategoryBudgets(result.categoryBudgets || {})
      })
    } else if (currentProfile && !useFirebase) {
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
  }, [currentMonth, currentProfile, useFirebase, firebaseUser])

  // Funciones de gestión de perfiles
  const handleLogin = (profileId) => {
    setCurrentProfile(profileId)
    localStorage.setItem('budget-current-profile', profileId)
  }

  const handleLogout = async () => {
    if (useFirebase && firebaseUser) {
      await firebaseLogout()
    }
    setCurrentProfile(null)
    setUseFirebase(false)
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

  // Mostrar loading mientras se verifica autenticación
  if (isLoadingAuth) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Poppins, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💰</div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no hay perfil activo, mostrar página de login
  if (!currentProfile) {
    return <LoginPage />
  }

  // Obtener nombre del perfil actual
  const currentProfileName = useFirebase && firebaseUser 
    ? (firebaseUser.displayName || firebaseUser.email || 'Usuario')
    : (profiles.find(p => p.id === currentProfile)?.name || 'Usuario')

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


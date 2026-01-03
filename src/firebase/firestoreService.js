import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc
} from 'firebase/firestore'
import { db } from './config'

// Obtener o crear documento de perfil del usuario
export const getUserProfile = async (userId) => {
  try {
    const profileRef = doc(db, 'profiles', userId)
    const profileSnap = await getDoc(profileRef)
    
    if (profileSnap.exists()) {
      return { data: profileSnap.data(), error: null }
    } else {
      // Crear perfil por defecto
      const defaultProfile = {
        name: 'Usuario',
        createdAt: new Date().toISOString(),
        currency: 'CLP'
      }
      await setDoc(profileRef, defaultProfile)
      return { data: defaultProfile, error: null }
    }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

// Guardar datos del usuario
export const saveUserData = async (userId, dataType, data) => {
  try {
    const dataRef = doc(db, 'users', userId, 'data', dataType)
    await setDoc(dataRef, { 
      [dataType]: data,
      updatedAt: new Date().toISOString()
    }, { merge: false }) // Usar merge: false para sobrescribir completamente
    return { error: null }
  } catch (error) {
    console.error('Error guardando datos:', error)
    return { error: error.message }
  }
}

// Obtener datos del usuario
export const getUserData = async (userId, dataType) => {
  try {
    const dataRef = doc(db, 'users', userId, 'data', dataType)
    const dataSnap = await getDoc(dataRef)
    
    if (dataSnap.exists()) {
      const data = dataSnap.data()
      return { data: data[dataType] || [], error: null }
    }
    return { data: [], error: null }
  } catch (error) {
    return { data: [], error: error.message }
  }
}

// Guardar presupuesto mensual
export const saveMonthlyBudget = async (userId, monthKey, budget, categoryBudgets) => {
  try {
    const budgetRef = doc(db, 'users', userId, 'budgets', monthKey)
    await setDoc(budgetRef, {
      budget,
      categoryBudgets,
      updatedAt: new Date().toISOString()
    }, { merge: true })
    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}

// Obtener presupuesto mensual
export const getMonthlyBudget = async (userId, monthKey) => {
  try {
    const budgetRef = doc(db, 'users', userId, 'budgets', monthKey)
    const budgetSnap = await getDoc(budgetRef)
    
    if (budgetSnap.exists()) {
      const data = budgetSnap.data()
      return { 
        budget: data.budget || 0, 
        categoryBudgets: data.categoryBudgets || {},
        error: null 
      }
    }
    return { budget: 0, categoryBudgets: {}, error: null }
  } catch (error) {
    return { budget: 0, categoryBudgets: {}, error: error.message }
  }
}

// Suscribirse a cambios en tiempo real de los datos del usuario
export const subscribeToUserData = (userId, dataType, callback) => {
  const dataRef = doc(db, 'users', userId, 'data', dataType)
  
  return onSnapshot(dataRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data()
      callback(data[dataType] || [])
    } else {
      callback([])
    }
  }, (error) => {
    console.error('Error en suscripción:', error)
    callback([])
  })
}

// Suscribirse a cambios en tiempo real del presupuesto mensual
export const subscribeToMonthlyBudget = (userId, monthKey, callback) => {
  const budgetRef = doc(db, 'users', userId, 'budgets', monthKey)
  
  return onSnapshot(budgetRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data()
      callback({
        budget: data.budget || 0,
        categoryBudgets: data.categoryBudgets || {}
      })
    } else {
      callback({ budget: 0, categoryBudgets: {} })
    }
  }, (error) => {
    console.error('Error en suscripción de presupuesto:', error)
    callback({ budget: 0, categoryBudgets: {} })
  })
}


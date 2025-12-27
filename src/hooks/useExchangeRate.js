import { useState, useEffect } from 'react'

export function useExchangeRate() {
  const [exchangeRate, setExchangeRate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        setLoading(true)
        // Usando exchangerate-api.com (gratis, sin API key necesario)
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
        const data = await response.json()
        
        // La API devuelve tasas basadas en USD, entonces data.rates.CLP es cuántos CLP = 1 USD
        // Necesitamos guardar esta tasa directamente (CLP por USD)
        const clpPerUsd = data.rates.CLP
        setExchangeRate(clpPerUsd)
        setError(null)
      } catch (err) {
        console.error('Error fetching exchange rate:', err)
        // Tasa de respaldo aproximada (actualizar manualmente si falla)
        setExchangeRate(950) // Tasa aproximada: 1 USD = 950 CLP
        setError('No se pudo obtener la tasa actualizada. Usando tasa aproximada.')
      } finally {
        setLoading(false)
      }
    }

    fetchExchangeRate()
    // Actualizar cada hora
    const interval = setInterval(fetchExchangeRate, 3600000)
    
    return () => clearInterval(interval)
  }, [])

  return { exchangeRate, loading, error }
}


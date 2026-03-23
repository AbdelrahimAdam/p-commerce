import type { ExchangeRate } from '@/types/currency'

const API_BASE_URL =
  (import.meta as any).env?.VITE_CURRENCY_API_URL || 'https://api.exchangerate-api.com/v4'
const API_KEY = (import.meta as any).env?.VITE_CURRENCY_API_KEY

const BASE_CURRENCY = 'EGP'
const CACHE_KEY = 'exchange_rates_cache'
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

interface CachedRates {
  timestamp: number
  rates: ExchangeRate[]
}

/**
 * Fetch exchange rates (EGP base) with localStorage caching
 */
export const getExchangeRates = async (): Promise<ExchangeRate[]> => {
  // 1️⃣ Try cache
  const cachedStr = localStorage.getItem(CACHE_KEY)
  if (cachedStr) {
    try {
      const cached: CachedRates = JSON.parse(cachedStr)
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.rates
      }
    } catch {
      // Invalid cache, ignore
    }
  }

  // 2️⃣ Fetch real API
  const response = await fetch(`${API_BASE_URL}/latest/${BASE_CURRENCY}`, {
    headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}
  })

  if (!response.ok) {
    throw new Error(`Currency API error: ${response.status}`)
  }

  const apiData = await response.json()

  const rates: ExchangeRate[] = Object.entries(apiData.rates).map(
    ([to, rate]) => ({
      from: BASE_CURRENCY,
      to,
      rate: rate as number,
      timestamp: new Date(apiData.date)
    })
  )

  // 3️⃣ Save cache
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    timestamp: Date.now(),
    rates
  }))

  return rates
}

/**
 * Get rates map (EGP only)
 */
export const getCurrencyRates = async (): Promise<Record<string, number>> => {
  const rates = await getExchangeRates()

  const result: Record<string, number> = {
    [BASE_CURRENCY]: 1
  }

  rates.forEach(rate => {
    result[rate.to] = rate.rate
  })

  return result
}

/**
 * Convert FROM EGP → TO currency
 */
export const convertCurrency = async (
  amount: number,
  to: string
): Promise<number> => {
  if (to === BASE_CURRENCY) return amount

  const rates = await getCurrencyRates()
  const rate = rates[to]

  if (!rate) {
    throw new Error(`Unsupported currency: ${to}`)
  }

  return amount * rate
}

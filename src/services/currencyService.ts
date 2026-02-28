// src/services/currencyService.ts
declare const importMeta: any; // quick fix for import.meta

import type { ExchangeRate } from '@/types/currency'
import { db } from '@/firebase/config'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'

const API_BASE_URL =
  import.meta.env.VITE_CURRENCY_API_URL || 'https://api.exchangerate-api.com/v4'
const API_KEY = import.meta.env.VITE_CURRENCY_API_KEY

const BASE_CURRENCY = 'EGP'
const CACHE_DOC_ID = 'egp-latest'
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

/**
 * Fetch exchange rates (EGP base) with Firestore caching
 */
export const getExchangeRates = async (): Promise<ExchangeRate[]> => {
  const cacheRef = doc(db, 'exchangeRates', CACHE_DOC_ID)

  // 1️⃣ Try cache
  const cachedSnap = await getDoc(cacheRef)

  if (cachedSnap.exists()) {
    const data = cachedSnap.data()

    if (
      data.timestamp instanceof Timestamp &&
      Date.now() - data.timestamp.toMillis() < CACHE_DURATION
    ) {
      return data.rates as ExchangeRate[]
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
  await setDoc(cacheRef, {
    base: BASE_CURRENCY,
    rates,
    timestamp: Timestamp.now()
  })

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
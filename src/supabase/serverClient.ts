const registerCompany = async (data: {
  email: string
  password: string
  displayName: string
  companyName: string
  domain: string
}) => {
  isLoading.value = true
  error.value = null

  try {
    const res = await fetch('/api/register-company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    const result = await res.json()
    if (!res.ok) throw new Error(result.message || 'Registration failed')

    console.log('✅ Company registered:', result)
    return result
  } catch (err: any) {
    console.error('❌ Company registration failed:', err)
    error.value = err.message
    throw err
  } finally {
    isLoading.value = false
  }
}
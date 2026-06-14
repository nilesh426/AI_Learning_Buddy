import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

export function useApi(apiFn, options = {}) {
  const { onSuccess, onError, successMessage } = options
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiFn(...args)
      setData(response.data)
      if (successMessage) toast.success(successMessage)
      if (onSuccess) onSuccess(response.data)
      return response.data
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Something went wrong'
      setError(msg)
      toast.error(msg)
      if (onError) onError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiFn, onSuccess, onError, successMessage])

  return { data, loading, error, execute }
}

export default useApi

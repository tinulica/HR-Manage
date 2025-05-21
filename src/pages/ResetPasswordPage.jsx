// src/pages/ResetPasswordPage.jsx
import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleReset = async () => {
    setMessage('')
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/update-password'
    })
    if (error) setError(error.message)
    else setMessage('Verifică emailul pentru linkul de resetare.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Resetare parolă</h1>
        <input
          className="border p-2 mb-4 w-full rounded"
          type="email"
          placeholder="Emailul tău"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          onClick={handleReset}
        >
          Trimite link de resetare
        </button>
        {message && <p className="text-green-600 mt-4 text-sm">{message}</p>}
        {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}
      </div>
    </div>
  )
}

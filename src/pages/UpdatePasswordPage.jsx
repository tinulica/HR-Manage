// src/pages/UpdatePasswordPage.jsx
import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleUpdate = async () => {
    setError('')
    setSuccess('')
    if (password.length < 6 || password !== confirm) {
      setError('Parola este invalidă sau nu se potrivește.')
      return
    }
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else {
      setSuccess('Parola a fost actualizată cu succes!')
      setTimeout(() => navigate('/'), 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Setează o parolă nouă</h1>
        <input
          type="password"
          placeholder="Parolă nouă"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mb-3 w-full rounded"
        />
        <input
          type="password"
          placeholder="Confirmă parola"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="border p-2 mb-4 w-full rounded"
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
          onClick={handleUpdate}
        >
          Salvează parola
        </button>
        {success && <p className="text-green-600 mt-4 text-sm">{success}</p>}
        {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}
      </div>
    </div>
  )
}

// src/pages/InviteRegisterPage.jsx
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function InviteRegisterPage() {
  const { orgId } = useParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleInviteRegister = async () => {
    setError('')
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) return setError(signUpError.message)

    const userId = data.user?.id
    if (userId) {
      const { error: insertError } = await supabase.from('profiles').insert({
        id: userId,
        email,
        role: 'user',
        organization_id: orgId
      })
      if (insertError) return setError(insertError.message)
      navigate('/entries')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Înregistrare Invitat</h1>
        <p className="mb-4 text-sm text-gray-500">Te-ai alăturat unei organizații prin invitație.</p>
        <input
          className="border p-2 mb-3 w-full rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border p-2 mb-4 w-full rounded"
          type="password"
          placeholder="Parolă"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          onClick={handleInviteRegister}
        >
          Creează cont
        </button>
        {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}
      </div>
    </div>
  )
}

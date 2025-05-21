// src/pages/RegisterPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './RegisterPage.css'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleRegister = async () => {
    setError('')
    if (!email || !password || password.length < 6) {
      setError('Email sau parolă invalidă (minim 6 caractere)')
      return
    }
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError('Eroare: ' + error.message)
    } else {
      navigate('/setup-org')
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">Înregistrare Admin</h1>
        <input
          className="register-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="register-input"
          type="password"
          placeholder="Parolă (minim 6 caractere)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="register-button" onClick={handleRegister}>Creează cont</button>
        {error && <p className="register-error">{error}</p>}
      </div>
    </div>
  )
}

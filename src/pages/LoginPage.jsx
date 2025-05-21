// src/pages/LoginPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './LoginPage.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Login failed: ' + error.message)
    } else {
      navigate('/dashboard')
    }
  }

  const handleRegister = async () => {
    setError('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError('Register failed: ' + error.message)
    } else {
      navigate('/setup-org')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Login Admin</h1>
        <input
          className="login-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="login-button" onClick={handleLogin}>Login</button>
        <button className="register-button" onClick={handleRegister}>Register</button>
        <button className="forgot-link" onClick={() => navigate('/reset-password')}>Ai uitat parola?</button>
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  )
}

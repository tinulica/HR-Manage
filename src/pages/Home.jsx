import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './Home.css'

export default function Home() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError('')
    if (!email || !password || password.length < 6) {
      setError('Email sau parolă invalidă (minim 6 caractere)')
      return
    }

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Login eșuat: ' + error.message)
      else navigate('/dashboard')
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/setup-org` }
      })
      if (error) setError('Înregistrare eșuată: ' + error.message)
      else alert('Verifică emailul pentru confirmare înainte de a continua.')
    }
  }

  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="home-title">{isLogin ? 'Autentificare' : 'Înregistrare Admin'}</h1>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            className="home-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@exemplu.com"
          />
        </div>

        <div className="form-group">
          <label>Parolă</label>
          <input
            type="password"
            className="home-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Minim 6 caractere"
          />
        </div>

        {error && <p className="home-error">{error}</p>}

        <button className="home-button" onClick={handleSubmit}>
          {isLogin ? 'Login' : 'Înregistrează-te'}
        </button>

        <div className="home-links">
          {isLogin && (
            <button className="link-button" onClick={() => navigate('/reset-password')}>
              Ai uitat parola?
            </button>
          )}
          <button className="link-button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Nu ai cont? Înregistrează-te' : 'Ai deja cont? Autentifică-te'}
          </button>
        </div>
      </div>
    </div>
  )
}
